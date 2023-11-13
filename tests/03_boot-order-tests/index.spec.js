import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import * as url from 'node:url';

import { delay } from '@ircam/sc-utils';
import { assert } from 'chai';
import findProcess from 'find-process';

import createSoundworksServer from '../utils/create-soundworks-server.js';
import {
  openPatch,
  closePatch,
  quitMax,
  ensureMaxIsDown,
  sendOsc,
  closeOscClient
} from '../utils/max-orchestrator.js';
import { getLogAsString, getLogAsNumArray } from '../utils/logs-reader.js';
import floatEqual from '../utils/float-equal.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

let server;
let globals;

const patchFilename = path.join(__dirname, 'test.maxpat');
const logFilename = path.join(__dirname, 'log.txt');
try { fs.unlinkSync(logFilename); } catch (err) {}

describe('boot ordering, reconnections, etc.', () => {
  after(async function() {
    setTimeout(() => {
      closeOscClient();
    }, 1000);
  });

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

    await quitMax();
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

    await server.stop(true); // do not close orchestrator OSC client
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
