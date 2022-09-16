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
    default: 12,
  },
  myBool: {
    type: 'boolean',
    default: true,
  },
  myFloat: {
    type: 'float',
    min: -Infinity,
    max: Infinity,
    step: 0.001,
    default: -10.01,
  },
  myMessage: {
    type: 'string',
    default: 'tototitito',
    nullable: true,
  },
  });

  globals = await server.stateManager.create('globals');
  // start max patch
});

describe('boot tests', () => {
  it('[CHANGE PATCH] should log schema values as a proof of attach (S-M-M-S)', async function() {
    this.timeout(10 * 1000);
    console.log("starting Max");
    await openPatch(patchFilename);
    
    console.log("waiting for Max to sync");
    await new Promise(resolve => setTimeout(resolve, 200));

    const expected = `schema_values myInt 12\nschema_values myBool 1\nschema_values myFloat -10.010\nschema_values myMessage tototitito\n`

    await quitMax(server);

    const result = getLogAsString(logFilename);

    assert.equal(result, expected);

  });

  it('[TODO] should log detach notification server side (S-M-M-S)', async function() {
    this.timeout(10 * 1000);

    //const result = getLogAsString(logFilename);

    assert.equal(false);

    //do not work ?
    await server.stop();

  });

  it('[CHANGE PATCH] should log schema values as a proof of attach (M-S-M-S)', async function() {
    this.timeout(10 * 1000);

    await openPatch(patchFilename);
    await server.start();
    console.log("waiting for Max to sync");
    await new Promise(resolve => setTimeout(resolve, 200));

    const expected = `schema_values myInt 12\nschema_values myBool 1\nschema_values myFloat -10.010\nschema_values myMessage tototitito\n`

    await quitMax(server);

    const result = getLogAsString(logFilename);

    assert.equal(result, expected);

  });




});





























