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

describe('boot ordering, reconnections, etc.', () => {
  it(`should support launching server before patch`, async function() {
    this.timeout(15 * 1000);
    await ensureMaxIsDown();

    const server = await createSoundworksServer();
    server.stateManager.registerSchema('globals', {
      myBool: {
        type: 'boolean',
        default: true,
      },
    });
    globals = await server.stateManager.create('globals');

    await new Promise(resolve => setTimeout(resolve, 500));

    await openPatch(patchFilename);
    // give some time for max client to sync
    await new Promise(resolve => setTimeout(resolve, 500));

    await server.stop();
    await quitMax();


    const expected = `
1
`;
    const result = getLogAsString(logFilename);
    assert.equal(result, expected);
  });

  it(`should support launching patch before server`, async function() {
    this.timeout(15 * 1000);
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

    // give some time for max client to sync
    await new Promise(resolve => setTimeout(resolve, 500));

    await quitMax();
    await server.stop();

    const expected = `
1
`;
    const result = getLogAsString(logFilename);
    assert.equal(result, expected);
  });

  it(`should properly reconnect after server down`, async function() {
    this.timeout(15 * 1000);
    await ensureMaxIsDown();

    let server = await createSoundworksServer();
    server.stateManager.registerSchema('globals', {
      myBool: {
        type: 'boolean',
        default: true,
      },
    });
    globals = await server.stateManager.create('globals');

    await new Promise(resolve => setTimeout(resolve, 500));

    await openPatch(patchFilename);
    // give some time for max client to sync
    await new Promise(resolve => setTimeout(resolve, 500));

    // stop the server
    await server.stop();

    {
      const expected1 = `1\n`;
      const result = getLogAsString(logFilename);
      assert.equal(result, expected1);
    }

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
    await new Promise(resolve => setTimeout(resolve, 500));

    {
      const expected1 = `1\n`;
      const result = getLogAsString(logFilename);
      assert.equal(result, expected);
    }
  });

  it(`should properly reconnect after Max down`, async function() {
    this.timeout(15 * 1000);
    await ensureMaxIsDown();

    await openPatch(patchFilename);
    // give some time for max client to sync
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
    await new Promise(resolve => setTimeout(resolve, 500));

    {
      const expected1 = `1\n`;
      const result = getLogAsString(logFilename);
      assert.equal(result, expected);
    }

    // stop Max
    await quitMax();
    await new Promise(resolve => setTimeout(resolve, 500));

    await openPatch(patchFilename);
    await new Promise(resolve => setTimeout(resolve, 500));

    {
      const expected1 = `1\n`;
      const result = getLogAsString(logFilename);
      assert.equal(result, expected);
    }
  });

  // it(`should survive very messy problems`, async function() {
  //   this.timeout(15 * 1000);

  //   await ensureMaxIsDown();

  // });

  // it('[CHANGE PATCH] should log schema values as a proof of attach (S-M-M-S)', async function() {
  //   this.timeout(10 * 1000);
  //   console.log("starting Max");
  //   await openPatch(patchFilename);

  //   console.log("waiting for Max to sync");
  //   await new Promise(resolve => setTimeout(resolve, 200));

  //   const expected = `schema_values myInt 12\nschema_values myBool 1\nschema_values myFloat -10.010\nschema_values myMessage tototitito\n`

  //   await quitMax(server);

  //   const result = getLogAsString(logFilename);

  //   assert.equal(result, expected);

  // });

  // it('[TODO] should log detach notification server side (S-M-M-S)', async function() {
  //   this.timeout(10 * 1000);

  //   //const result = getLogAsString(logFilename);

  //   assert.equal(false);

  //   //do not work ?
  //   await server.stop();

  // });

  // it('[CHANGE PATCH] should log schema values as a proof of attach (M-S-M-S)', async function() {
  //   this.timeout(10 * 1000);

  //   await openPatch(patchFilename);
  //   await server.start();
  //   console.log("waiting for Max to sync");
  //   await new Promise(resolve => setTimeout(resolve, 200));

  //   const expected = `schema_values myInt 12\nschema_values myBool 1\nschema_values myFloat -10.010\nschema_values myMessage tototitito\n`

  //   await quitMax(server);

  //   const result = getLogAsString(logFilename);

  //   assert.equal(result, expected);

  // });
});





























