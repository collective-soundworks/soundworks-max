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

// `npm test -- tests/0_server_start_max_quit_max-boot-test/`

let server;
let globals;

const patchFilename = path.join(__dirname, 'test.maxpat');
const logFilename = path.join(__dirname, 'log.json');
try { fs.unlinkSync(logFilename); } catch (err) {}

before(async function() {
  this.timeout(15 * 1000);
  // ensure Max is not running
  await ensureMaxIsDown();
  // get configure and started soundworks server
  server = await createSoundworksServer();


  server.stateManager.registerSchema('globals', {
    myInt: {
      type: 'float',
      min: -Infinity,
      max: Infinity,
      default: 0,
      step: 0.001,
      nullable: true,
    },
  });

  globals = await server.stateManager.create('globals');

  return await openPatch(patchFilename);
});

describe('receiving schema to Max on schema command sent', () => {
  it('[REMOVE LOADBANG] should log schema definition to log file', async function() {
    this.timeout(10 * 1000);
    // start max patch
    await openPatch(patchFilename);
    console.log("waiting for Max to sync");
    await new Promise(resolve => setTimeout(resolve, 200));
    await quitMax();
    await server.stop();

    const expected = globals.getSchema();
    const result = JSON.parse(fs.readFileSync(logFilename));

    assert.equal(result, expected);
  });
});


