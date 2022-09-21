const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const findProcess = require('find-process')
const { execSync } = require('child_process');
const assert = require('chai').assert;

const createSoundworksServer = require('../utils/create-soundworks-server.js');
const { openPatch, closeOscClient, quitMax, ensureMaxIsDown } = require('../utils/max-orchestrator.js');
const { getLogAsString, getLogAsNumArray } = require('../utils/logs-reader.js');

let server;
let globals;

const patchFilename = path.join(__dirname, 'test.maxpat');
const logFilename = path.join(__dirname, 'log.txt');
try { fs.unlinkSync(logFilename); } catch (err) {}

after(async function() {
  setTimeout(() => {
    closeOscClient();
  }, 1000);
});

describe('boot ordering, reconnections, etc.', () => {
  it(`should support launching server before patch`, async function() {
    this.timeout(30 * 1000);
    await ensureMaxIsDown();

    const server = await createSoundworksServer();
    server.stateManager.registerSchema('globals', {
      myBool: {
        type: 'boolean',
        default: true,
      },
    });
    globals = await server.stateManager.create('globals');

    await openPatch(patchFilename);

    console.log('quit max');
    await quitMax();

    console.log('close server');
    await server.stop(true); // do not close orchestrator OSC client

    const expected = `1\n`;
    const result = getLogAsString(logFilename);
    assert.equal(result, expected);
  });

  it(`should receive event on max side if server closes`, async function() {
    this.timeout(30 * 1000);
    await ensureMaxIsDown();

    const server = await createSoundworksServer();
    server.stateManager.registerSchema('globals', {
      myBool: {
        type: 'boolean',
        default: true,
      },
    });
    globals = await server.stateManager.create('globals');

    await openPatch(patchFilename);

    // important to test that Max is somehow notified when server shutdown
    console.log('close server');
    await server.stop(true); // do not close orchestrator OSC client

    console.log('quit max');
    await quitMax();

    // first line is connection bang
    // second line is disconnection bang
    const expected = `1\n1\n`;
    const result = getLogAsString(logFilename);
    assert.equal(result, expected);
  });

  it(`should support launching patch before server`, async function() {
    this.timeout(30 * 1000);
    await ensureMaxIsDown();

    await openPatch(patchFilename);

    const server = await createSoundworksServer();
    server.stateManager.registerSchema('globals', {
      myBool: {
        type: 'boolean',
        default: true,
      },
    });
    globals = await server.stateManager.create('globals');

    // give some time for max client to sync
    await new Promise(resolve => setTimeout(resolve, 2000));

    await quitMax();
    await server.stop(true);

    const expected = `1\n`;
    const result = getLogAsString(logFilename);
    assert.equal(result, expected);
  });

  it(`should properly reconnect after server down`, async function() {
    this.timeout(30 * 1000);
    await ensureMaxIsDown();

    let server = await createSoundworksServer();
    server.stateManager.registerSchema('globals', {
      myBool: {
        type: 'boolean',
        default: true,
      },
    });
    globals = await server.stateManager.create('globals');

    await openPatch(patchFilename);

    // stop the server
    await server.stop(true);

    // restart server
    server = await createSoundworksServer();
    server.stateManager.registerSchema('globals', {
      myBool: {
        type: 'boolean',
        default: true,
      },
    });
    globals = await server.stateManager.create('globals');

    // give some time for max client to connect and synchronize
    await new Promise(resolve => setTimeout(resolve, 2000));

    await quitMax();
    await server.stop(true);
    // write is done only when closing the patch...
    // first 1 is patch launch, second is server stop, third is reconnection
    const expected = `1\n1\n1\n`;
    const result = getLogAsString(logFilename);
    assert.equal(result, expected);
  });

  it(`should properly reconnect after Max down`, async function() {
    this.timeout(60 * 1000);
    await ensureMaxIsDown();

    await openPatch(patchFilename);
    await new Promise(resolve => setTimeout(resolve, 500));

    const server = await createSoundworksServer();
    server.stateManager.registerSchema('globals', {
      myBool: {
        type: 'boolean',
        default: true,
      },
    });
    globals = await server.stateManager.create('globals');

    // give some time for max client to connect and synchronize
    await new Promise(resolve => setTimeout(resolve, 2000));

    await quitMax();

    {
      const expected = `1\n`;
      const result = getLogAsString(logFilename);
      assert.equal(result, expected);
    }

    await openPatch(patchFilename);
    await quitMax();

    await server.stop(true);

    {
      const expected = `1\n`;
      const result = getLogAsString(logFilename);
      assert.equal(result, expected);
    }
  });
});
