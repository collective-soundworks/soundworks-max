const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const findProcess = require('find-process')
const { execSync } = require('child_process');
const assert = require('chai').assert;

const createSoundworksServer = require('../utils/create-soundworks-server.js');
const { openPatch, quitMax, ensureMaxIsDown } = require('../utils/max-orchestrator.js');
const { getLogAsString, getLogAsNumArray } = require('../utils/logs-reader.js');

// `npm test -- tests/1_server-max-max-server-boot-test/`

let server;
let globals;

//function generate random chars
  
function genRandonString(length) {
   var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
   var charLength = chars.length;
   var result = '';
   for ( var i = 0; i < length; i++ ) {
      result += chars.charAt(Math.floor(Math.random() * charLength));
   }
   return result;
}

const patchFilename = path.join(__dirname, 'test.maxpat');
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
    default: true,
    event: true,
  },
  closeMax: {
    type: 'boolean',
    event: true,
    default: false,
  }
  });

  globals = await server.stateManager.create('globals');

  // start max patch
  return await openPatch(patchFilename);
});

describe('sending and receiving messages types', () => {

  it('should log some integer sent by server', async function() {
    this.timeout(10 * 1000);
    console.log("waiting for Max to sync");
    await new Promise(resolve => setTimeout(resolve, 1000));

    let expected = ``;

    let step = 0
    while (step < 10) {
      let randInt = Math.floor(Math.random() * 1000);
      expected += `myInt ${randInt}\n`;
      globals.set({ myInt: randInt });
      await new Promise(resolve => setTimeout(resolve, 100));
      step += 1;
    }

    // close patch message
    globals.set({ closeMax: true });
    //await new Promise(resolve => setTimeout(resolve, 1000));

    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = getLogAsString(logFilename);

    assert.equal(result, expected);

  });

  it("should log some booleans sent by server", async function() {
    this.timeout(10 * 1000);
    console.log("waiting for Max to sync");
    await new Promise(resolve => setTimeout(resolve, 1000));

    let expected = ``;

    let step = 0
    while (step < 10) {
      let randBool = Boolean(Math.round(Math.random()));
      expected += `myBool ${randInt}\n`;
      globals.set({ myBool : randBool });
      await new Promise(resolve => setTimeout(resolve, 100);
      step += 1;
    }

    // close patch message
    globals.set({ closeMax: true });
    //await new Promise(resolve => setTimeout(resolve, 1000));

    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = getLogAsString(logFilename);

    assert.equal(result, expected);

    // body...
  }

});





//  it('should log some booleans sent by server'){

//      let randFloat = Math.random()*100;
//      globals.set({ myFloat : randFloat });
//      await new Promise(resolve => setTimeout(resolve, 100);
//      let randMessage = genRandonString(80);
//      globals.set({ MyMessage : randMessage });
//      await new Promise(resolve => setTimeout(resolve, 100);
//      randBool = Boolean(Math.round(Math.random()));
//      globals.set({ MyEvent : randBool });
//      await new Promise(resolve => setTimeout(resolve, 100);
//      let specialInt = Math.floor(Math.random() * 4);
//      switch (specialInt) {
//        case 0:
//          globals.set({ myInfFloat : -Infinity });
//          break;
//        case 1:
//          globals.set({ myInfFloat : Infinity });
//          break;
//        case 2:
//          globals.set({ myInfFloat : NaN });
//          break;
//        case 3:
//          globals.set({ myInfFloat : null });
//          break;
//      }
//  }


























