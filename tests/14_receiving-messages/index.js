const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const findProcess = require('find-process')
const { execSync } = require('child_process');
const assert = require('chai').assert;

const createSoundworksServer = require('../utils/create-soundworks-server.js');
const { openPatch, closePatch, quitMax, ensureMaxIsDown, sendOsc } = require('../utils/max-orchestrator.js');
const { getLogAsString, getLogAsNumArray } = require('../utils/logs-reader.js');
const floatEqual = require('../utils/float-equal.js');

// `npm test -- tests/1_server-max-max-server-boot-test/`

let server;
let globals;

const patchFilename = path.join(__dirname, 'test.maxpat');
const patchFilenameEVENT = path.join(__dirname, 'testEVENT.maxpat');
const logFilename = path.join(__dirname, 'log.txt');
try { fs.unlinkSync(logFilename); } catch (err) {}

before(async function() {
  this.timeout(15 * 1000);

  await ensureMaxIsDown();
  // get configure and started soundworks server
  server = await createSoundworksServer()

  server.stateManager.registerSchema('globals', {
  myInt: {
    type: 'integer',
    min: -Infinity,
    max: Infinity,
    default: 0,
  },
  myBool: {
    type: 'boolean',
    default: false,
  },
  myFloat: {
    type: 'float',
    min: -Infinity,
    max: Infinity,
    step: 0.001,
    default: 0.5,
  },
  myInfFloat: {
    type: 'float',
    min: -Infinity,
    max: Infinity,
    step: 0.001,
    default: 0,
  },
  myMessage: {
    type: 'string',
    default: 'my-message',
    nullable: true,
  },
  // new options
  myEvent: {
    type: 'boolean',
    default: false,
    event: true,
  }
  });

  globals = await server.stateManager.create('globals');

  return await openPatch(patchFilename);

});

describe('receiving messages types', () => {

  it('should log some integer sent by Max', async function() {
    this.timeout(10 * 1000);
    // start max patch
    console.log("waiting for Max to sync");
    await new Promise(resolve => setTimeout(resolve, 200));
    let result = ``;
    globals.subscribe(updates => {
      if ('myInt' in updates) {
        result += `myInt ${updates.myInt}\n`;
      }
    });
    //sending command for Max to send things
    await sendOsc('/integer');

    await new Promise(resolve => setTimeout(resolve, 1000));

    //sending command for Max to send nothing
    await sendOsc('/nothing');

    await new Promise(resolve => setTimeout(resolve, 100));

    console.log("close patch");
    // close patch message
    await closePatch();

    const expected = getLogAsString(logFilename);

    assert.equal(result, expected);

  });

  it('should log some boolean sent by Max', async function() {
    this.timeout(10 * 1000);
    // start max patch
    await openPatch(patchFilename);
    console.log("waiting for Max to sync");
    await new Promise(resolve => setTimeout(resolve, 200));
    let result = ``;
    globals.subscribe(updates => {
      if ('myBool' in updates) {
        result += `myBool ${updates.myBool ? 1 : 0}\n`;
      }
    });
    //sending command for Max to send things
    await sendOsc('/bool');

    await new Promise(resolve => setTimeout(resolve, 1000));

    //sending command for Max to send nothing
    await sendOsc('/nothing');

    await new Promise(resolve => setTimeout(resolve, 100));

    console.log("close patch");
    // close patch message
    await closePatch();

    const expected = getLogAsString(logFilename);

    assert.equal(result, expected);

  });

  it('should log some floats sent by Max', async function() {
    this.timeout(10 * 1000);
    // start max patch

    await openPatch(patchFilename);

    console.log("waiting for Max to sync");

    await new Promise(resolve => setTimeout(resolve, 200));

    let result = ``;

    globals.subscribe(updates => {
      if ('myFloat' in updates) {
        result += `myFloat ${updates.myFloat}\n`;
      }
    });

    //sending command for Max to send things
    await sendOsc('/floaty');

    await new Promise(resolve => setTimeout(resolve, 1000));

    //sending command for Max to send nothing
    await sendOsc('/nothing');

    console.log("close patch");
    // close patch message
    await closePatch();

    const expected = getLogAsString(logFilename);

    assert.equal(result, expected);

  });

  it('should log some strings sent by Max', async function() {
    this.timeout(10 * 1000);
    // start max patch

    await openPatch(patchFilename);

    console.log("waiting for Max to sync");

    await new Promise(resolve => setTimeout(resolve, 200));

    let result = ``;

    globals.subscribe(updates => {
      if ('myMessage' in updates) {
        result += `myMessage ${updates.myMessage}\n`;
      }
    });

    //sending command for Max to send things
    await sendOsc('/string');

    await new Promise(resolve => setTimeout(resolve, 2500));

    //sending command for Max to send nothing
    await sendOsc('/nothing');

    console.log("close patch");
    // close patch message
    await closePatch();

    const expected = getLogAsString(logFilename);

    assert.equal(result, expected);

  });

  it('should log some events sent by Max', async function() {
    this.timeout(10 * 1000);
    // start max patch

    await openPatch(patchFilename);

    console.log("waiting for Max to sync");

    await new Promise(resolve => setTimeout(resolve, 200));

    let result = ``;

    globals.subscribe(updates => {
      if ('myEvent' in updates) {
        result += `myEvent ${updates.myEvent ? 1 : 0}\nmyEvent\n`;
      }
    });

    //sending command for Max to send things
    await sendOsc('/event');

    await new Promise(resolve => setTimeout(resolve, 1000));

    //sending command for Max to send nothing
    await sendOsc('/nothing');

    console.log("close patch");
    // close patch message
    await quitMax();
    await server.stop();

    const expected = getLogAsString(logFilename);

    assert.equal(result, expected);

  });


});
