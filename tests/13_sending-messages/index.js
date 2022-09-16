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

//function generate random chars
  
const genRandonString = (() => {
    const gen = (min, max) => max++ && [...Array(max-min)].map((s, i) => String.fromCharCode(min+i));

    const sets = {
        num: gen(48,57),
        alphaLower: gen(97,122),
        alphaUpper: gen(65,90),
        special: [...`~!@#$%^&*()_+-=[]\{}|;:'",./<>?`],
        emoji: ["🍕","🚔","🎉","✔","🎁","💩"],
    };

    function* iter(len, set) {
        if (set.length < 1) set = Object.values(sets).flat(); 
        for (let i = 0; i < len; i++) yield set[Math.random() * set.length|0]
    }

    return Object.assign(((len, ...set) => [...iter(len, set.flat())].join('')), sets);
})();


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
  MyMessage: {
    type: 'string',
    default: 'my-message',
    nullable: true,
  },
  // new options
  MyEvent: {
    type: 'boolean',
    default: false,
    event: true,
  },
  });

  globals = await server.stateManager.create('globals');

  return await openPatch(patchFilename);

});

describe('sending messages', () => {

  it('should log some integer sent by server', async function() {
    this.timeout(10 * 1000);
    // start max patch
    console.log("waiting for Max to sync");
    await new Promise(resolve => setTimeout(resolve, 200));
    let expected = ``;

    let step = 0
    while (step < 10) {
      let randInt = Math.floor(Math.random() * 1000);
      expected += `myInt ${randInt}\n`;
      globals.set({ myInt: randInt });
      await new Promise(resolve => setTimeout(resolve, 100));
      step += 1;
    }

    console.log("close patch");
    // close patch message
    await closePatch();
    //await new Promise(resolve => setTimeout(resolve, 1000));

    //await new Promise(resolve => setTimeout(resolve, 2000));

    const result = getLogAsString(logFilename);

    assert.equal(result, expected);

  });

  it('should log some boolean sent by server', async function() {
    this.timeout(10 * 1000);
    // start max patch
    openPatch(patchFilename);
    console.log("waiting for Max to sync");
    await new Promise(resolve => setTimeout(resolve, 200));

    let expected = ``;

    let step = 0
    while (step < 10) {
      let randBool = Boolean(Math.round(Math.random()));
      expected += `myBool ${randBool ? 1 : 0}\n`;
      globals.set({ myBool: randBool });
      console.log(randBool);
      await new Promise(resolve => setTimeout(resolve, 100));
      step += 1;
    }

    // close patch message
    await closePatch();
    //await new Promise(resolve => setTimeout(resolve, 1000));

    //await new Promise(resolve => setTimeout(resolve, 2000));

    const result = getLogAsString(logFilename);

    assert.equal(result, expected);

  });

  it('should log some floats sent by server', async function() {
    this.timeout(10 * 1000);
    // start max patch
    openPatch(patchFilename);
    console.log("waiting for Max to sync");
    await new Promise(resolve => setTimeout(resolve, 200));

    let expected = ``;

    let step = 0
    while (step < 10) {
      let randFloat = Math.random();
      expected += `myFloat ${randFloat}\n`;
      globals.set({ myFloat: randFloat });
      await new Promise(resolve => setTimeout(resolve, 100));
      step += 1;
    }

    // close patch message
    await closePatch();

    const result = getLogAsString(logFilename);

    assert.equal(result, expected);

  });

  it('should log some messages sent by server', async function() {
    this.timeout(10 * 1000);
    // start max patch
    openPatch(patchFilename);
    console.log("waiting for Max to sync");
    await new Promise(resolve => setTimeout(resolve, 200));

    let expected = ``;

    let step = 0
    while (step < 10) {
      let randMessage = genRandonString(80);
      expected += `MyMessage ${randMessage}\n`;
      globals.set({ MyMessage: randMessage });
      await new Promise(resolve => setTimeout(resolve, 100));
      step += 1;
    }

    // close patch message
    await closePatch();
    //await new Promise(resolve => setTimeout(resolve, 1000));

    //await new Promise(resolve => setTimeout(resolve, 2000));

    const result = getLogAsString(logFilename);

    assert.equal(result, expected);

  });

  it('should log some events sent by server', async function() {
    this.timeout(10 * 1000);
    // start max patch
    openPatch(patchFilename);
    console.log("waiting for Max to sync");
    await new Promise(resolve => setTimeout(resolve, 200));

    let expected = ``;

    let step = 0
    while (step < 10) {
      let randBool = Boolean(Math.round(Math.random()));
      expected += `MyEvent ${randBool ? 1 : 0}\nMyEvent\n`;
      globals.set({ MyEvent: randBool });
      await new Promise(resolve => setTimeout(resolve, 100));
      step += 1;
    }

    // close patch message
    await closePatch();
    //await new Promise(resolve => setTimeout(resolve, 1000));

    //await new Promise(resolve => setTimeout(resolve, 2000));

    const result = getLogAsString(logFilename);

    assert.equal(result, expected);

  });

  it('should log infinity type sent by server', async function() {
    this.timeout(10 * 1000);
    // start max patch
    openPatch(patchFilename);
    console.log("waiting for Max to sync");
    await new Promise(resolve => setTimeout(resolve, 200));

    let expected = ``;
    expected += `myInfFloat null\n`;
    globals.set({ myInfFloat: -Infinity });
    await new Promise(resolve => setTimeout(resolve, 100));

    expected += `myInfFloat null\n`;
    globals.set({ myInfFloat: Infinity });
    await new Promise(resolve => setTimeout(resolve, 100));

    // close patch message
    await closePatch();
    //await new Promise(resolve => setTimeout(resolve, 1000));

    //await new Promise(resolve => setTimeout(resolve, 2000));

    const result = getLogAsString(logFilename);

    assert.equal(result, expected);

  });

  it('should log NAN type sent by server', async function() {
    this.timeout(10 * 1000);
    // start max patch
    openPatch(patchFilename);
    console.log("waiting for Max to sync");
    await new Promise(resolve => setTimeout(resolve, 200));

    let expected = ``;
    globals.set({ myInfFloat: NaN });
    await new Promise(resolve => setTimeout(resolve, 100));

    // close patch message
    await closePatch();
    //await new Promise(resolve => setTimeout(resolve, 1000));

    //await new Promise(resolve => setTimeout(resolve, 2000));

    const result = getLogAsString(logFilename);

    assert.equal(result, expected);

  });

  it('should log null type sent by server', async function() {
    this.timeout(10 * 1000);
    // start max patch
    openPatch(patchFilename);
    console.log("waiting for Max to sync");
    await new Promise(resolve => setTimeout(resolve, 200));

    let expected = ``;
    expected += `myInfFloat\n`;
    globals.set({ myInfFloat: null });
    await new Promise(resolve => setTimeout(resolve, 100));


    await new Promise(resolve => setTimeout(resolve, 1000));
    // close patch message
    await quitMax();
    await server.stop();


    //await new Promise(resolve => setTimeout(resolve, 2000));

    const result = getLogAsString(logFilename);

    assert.equal(result, expected);

  });


});




















