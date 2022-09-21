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
  this.timeout(1000);
  await server.stop();
})

describe('testing bug node is not running', () => {
  it('should attach to the state', async function() {
    this.timeout(100 * 1000);

    // start max patch
    await openPatch(patchFilename);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const expected = `1`;

    await closePatch();
    await new Promise(resolve => setTimeout(resolve, 500));

    const result = getLogAsString(logFilename);

    assert.equal(result, expected);
  });
});


