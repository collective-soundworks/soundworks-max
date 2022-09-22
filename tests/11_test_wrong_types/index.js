const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const findProcess = require('find-process')
const { execSync } = require('child_process');
const assert = require('chai').assert;

const createSoundworksServer = require('../utils/create-soundworks-server.js');
const { openPatch, closePatch, quitMax, ensureMaxIsDown, sendOsc }
  = require('../utils/max-orchestrator.js');
const { getLogAsString, getLogAsNumArray, getLogAsArray } = require('../utils/logs-reader.js');
const floatEqual = require('../utils/float-equal.js');

let server;
let globals;

const patchFilename = path.join(__dirname, 'test.maxpat');
const logFilename = path.join(__dirname, 'log.txt');
try { fs.unlinkSync(logFilename); } catch (err) {}

before(async function() {
  this.timeout(15 * 1000);

  await ensureMaxIsDown();
  // get configured and started soundworks server
  server = await createSoundworksServer();

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

  await openPatch(patchFilename);
});

after(async function() {
  this.timeout(10 * 1000);

  await closePatch();
  await server.stop();
});

describe("handle errors when sending wrong types", () => {
  it('sending wrong int', function() {
    this.timeout(30 * 1000);

    globals.set({ myInt: 0.618 });
    globals.set({ myFloat: 'coucou' });
    globals.set({ myBool: 'niap' });
    globals.set({ myString: true });

    const expected = ``;
    const result = getLogAsString(logFilename);
  });

});
