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

const genRandonString = (() => {
    const gen = (min, max) => max++ && [...Array(max-min)].map((s, i) => String.fromCharCode(min+i));

    const sets = {
        //num: gen(48,57),
        alphaLower: gen(97,122),
        alphaUpper: gen(65,90),
        special: [...`~!@#$%^&*()_+-=[]\{}|;:'",./<>?`],
        //emoji: ["🍕","🚔","🎉","✔","🎁","💩"],
    };

    function* iter(len, set) {
        if (set.length < 1) set = Object.values(sets).flat(); 
        for (let i = 0; i < len; i++) yield set[Math.random() * set.length|0]
    }

    return Object.assign(((len, ...set) => [...iter(len, set.flat())].join('')), sets);
})();


before(async function() {
  this.timeout(15 * 1000);

  await ensureMaxIsDown();
  // get configure and started soundworks server
  server = await createSoundworksServer()

  server.stateManager.registerSchema('globals', {
  myString: {
    type: 'string',
    default: 'toto',
    nullable: true,
  },
  toto: {
    type: 'float',
    default: 0,
  },
  });

  globals = await server.stateManager.create('globals');

  return await openPatch(patchFilename);

});

describe('coherence between dict in Max', () => {

  it('[REMOVE LOADBANG] should log same value 2 times (update on server side)', async function() {
    this.timeout(10 * 1000);
    // start max patch
    console.log("waiting for Max to sync");
    await new Promise(resolve => setTimeout(resolve, 200));
    let expected = ``;

    let randStr = genRandonString(20);
    expected += `values myString toto\nvalues toto 0\nvalues myString ${randStr}\nvalues toto 0\nupdates myString ${randStr}\n`;
    globals.set({ myString: randStr });
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log("> quit Max");
    // close patch message
    await closePatch();

    globals.set({ myString: 'toto' });

    const result = getLogAsString(logFilename);

    assert.equal(result, expected);

  });


  it('[REMOVE LOADBANG] should log same value 2 times (update on Max side)', async function() {
    this.timeout(30 * 1000);
    // start max patch
    await openPatch(patchFilename);
    console.log("waiting for Max to sync");
    await new Promise(resolve => setTimeout(resolve, 200));
    let expected = ``;

    let randStr = genRandonString(20);
    sendOsc(randStr);
    await new Promise(resolve => setTimeout(resolve, 1000));
    expected += `values myString toto\nvalues toto 0\nvalues myString ${randStr}\nvalues toto 0\nupdates myString ${randStr}\n`;
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log("> quit Max");
    // close patch message
    await quitMax();
    await server.stop();

    const result = getLogAsString(logFilename);

    assert.equal(result, expected);

  });

});
