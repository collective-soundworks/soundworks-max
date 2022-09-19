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

// `npm test -- tests/10_attach/`

let server;
let globals;

const logFilename = path.join(__dirname, 'log.txt');
try { fs.unlinkSync(logFilename); } catch (err) {}

before(async function() {
  this.timeout(15 * 1000);
  // ensure Max is not running
  await ensureMaxIsDown();
  // get configure and started soundworks server
  server = await createSoundworksServer();
    server.stateManager.registerSchema('globals', {
    myBool: {
      type: 'boolean',
      default: true,
    },
  });
  globals = await server.stateManager.create('globals');
});

after(async function() {
  await server.stop();
});

describe('test attach methods', () => {
  it('should properly init with schema name as attribute', async function() {
    this.timeout(15 * 1000);

    await ensureMaxIsDown();
    // start max patch
    const patchFilename = path.join(__dirname, 'test-attach-as-attribute.maxpat');
    await openPatch(patchFilename);
    // give some time to connect and sync
    await new Promise(resolve => setTimeout(resolve, 500));

    await quitMax();

    await new Promise(resolve => setTimeout(resolve, 1000));

    const expected = `1\n`;
    const result = getLogAsString(logFilename);
    assert.equal(result, expected);
  });

  it('should properly init with attach command', async function() {
    this.timeout(15 * 1000);

    await ensureMaxIsDown();
    // start max patch
    const patchFilename = path.join(__dirname, 'test-attach-as-command.maxpat');
    await openPatch(patchFilename);
    // give some time to connect and sync
    await new Promise(resolve => setTimeout(resolve, 500));

    await quitMax();

    await new Promise(resolve => setTimeout(resolve, 1000));

    const expected = `1\n`;
    const result = getLogAsString(logFilename);
    assert.equal(result, expected);
  });
});


