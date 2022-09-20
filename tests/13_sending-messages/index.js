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
      min: -1000,
      max: 1000,
      default: 0,
    },
    myBool: {
      type: 'boolean',
      default: false,
    },
    myFloat: {
      type: 'float',
      min: -1000,
      max: 1000,
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
    },
  });

  globals = await server.stateManager.create('globals');
});

after(async function() {
  this.timeout(10 * 1000);
  
  await openPatch(patchFilename);
  await new Promise(resolve => setTimeout(resolve, 500));
  await quitMax();
  await server.stop();
});

describe('sending messages', () => {

  it('should log some integer sent by server', async function() {
    this.timeout(10 * 1000);

    await openPatch(patchFilename);
    // start max patch
    console.log("waiting for Max to sync");
    await new Promise(resolve => setTimeout(resolve, 500));
    let expected = ``;

    for (let i = 0; i < 10; i++) {
      let randInt = Math.floor(Math.random() * 1000);
      expected += `myInt ${randInt}\n`;

      globals.set({ myInt: randInt });
      // console.log(randInt);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    await closePatch();

    const result = getLogAsString(logFilename);
    assert.equal(result, expected);
  });

  it('should log some boolean sent by server', async function() {
    this.timeout(10 * 1000);
    // start max patch
    await openPatch(patchFilename);
    console.log("waiting for Max to sync");
    await new Promise(resolve => setTimeout(resolve, 500));

    let expected = ``;
    // false is default so trigger true to have a messsage on Max side
    let randBool = false; 

    for (let i = 0; i < 10; i++) {
      randBool = !randBool;
      // console.log(randBool);
      expected += `myBool ${randBool ? 1 : 0}\n`;
      globals.set({ myBool: randBool });

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // close patch message
    console.log('closepatch');
    await closePatch();

    const result = getLogAsString(logFilename);
    assert.equal(result, expected);
  });

  it('should log some floats sent by server', async function() {
    this.timeout(10 * 1000);
    // start max patch
    await openPatch(patchFilename);
    console.log("waiting for Max to sync");
    await new Promise(resolve => setTimeout(resolve, 500));

    let expected = [];

    for (let i = 0; i < 10; i++) {
      let randFloat = Math.random();
      expected.push(randFloat);

      globals.set({ myFloat: randFloat });
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // close patch message
    await closePatch();

    let result = getLogAsString(logFilename);
    result = result.split('\n');
    result.pop(); // remove last empty line
    result = result.map(line => line.replace('myFloat ', ''));
    result = result.map(line => parseFloat(line));

    floatEqual(result, expected, 1e-3);

  });

  it('should log some messages sent by server', async function() {
    this.timeout(10 * 1000);
    // start max patch
    await openPatch(patchFilename);
    console.log("waiting for Max to sync");
    await new Promise(resolve => setTimeout(resolve, 500));

    let expected = ``;

    for (let i = 0; i < 10; i++) {
      let randMessage = genRandonString(80);
      expected += `myMessage ${randMessage}\n`;

      globals.set({ myMessage: randMessage });
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    await closePatch();

    const result = getLogAsString(logFilename);
    assert.equal(result, expected);
  });

  it('should log some events sent by server', async function() {
    this.timeout(10 * 1000);
    // start max patch
    await openPatch(patchFilename);
    console.log("waiting for Max to sync");
    await new Promise(resolve => setTimeout(resolve, 500));

    let expected = ``;

    for (let i = 0; i < 10; i++) {
      let randBool = Boolean(Math.round(Math.random()));
      expected += `myEvent ${randBool ? 1 : 0}\nmyEvent\n`;

      globals.set({ myEvent: randBool });

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    await closePatch();
    const result = getLogAsString(logFilename);

    assert.equal(result, expected);

  });

  // it('should log infinity type sent by server', async function() {
  //   this.timeout(10 * 1000);

  //   assert.fail('...but Infinity should not translate to null');

  //   // start max patch
  //   openPatch(patchFilename);
  //   await new Promise(resolve => setTimeout(resolve, 500));

  //   let expected = ``;
  //   expected += `myInfFloat null\n`;
  //   globals.set({ myInfFloat: -Infinity });
  //   await new Promise(resolve => setTimeout(resolve, 100));

  //   expected += `myInfFloat null\n`;
  //   globals.set({ myInfFloat: Infinity });
  //   await new Promise(resolve => setTimeout(resolve, 100));

  //   await closePatch();

  //   const result = getLogAsString(logFilename);
  //   assert.equal(result, expected);
  // });

  // it('should log NAN type sent by server', async function() {
  //   this.timeout(10 * 1000);

  //   assert.fail('NaN should probably not propagate at all, should be handled by soundworks?');
  //   // start max patch
  //   openPatch(patchFilename);
  //   await new Promise(resolve => setTimeout(resolve, 500));

  //   let expected = ``;
  //   globals.set({ myInfFloat: NaN });
  //   await new Promise(resolve => setTimeout(resolve, 100));

  //   // close patch message
  //   await closePatch();

  //   const result = getLogAsString(logFilename);
  //   assert.equal(result, expected);

  // });

  // it('should log null type sent by server', async function() {
  //   this.timeout(10 * 1000);

  //   assert.fail('not sure what this test actually does');
  //   // start max patch
  //   openPatch(patchFilename);
  //   await new Promise(resolve => setTimeout(resolve, 200));

  //   let expected = ``;
  //   expected += `myInfFloat\n`;
  //   globals.set({ myInfFloat: null });
  //   await new Promise(resolve => setTimeout(resolve, 100));


  //   await new Promise(resolve => setTimeout(resolve, 1000));
  //   // close patch message
  //   await quitMax();
  //   await server.stop();

  //   const result = getLogAsString(logFilename);
  //   assert.equal(result, expected);
  // });
});
