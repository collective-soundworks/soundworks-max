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
  sendOsc
} from '../utils/max-orchestrator.js';
import { getLogAsString, getLogAsNumArray } from '../utils/logs-reader.js';
import floatEqual from '../utils/float-equal.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

let server;
let globals;

const logFilename = path.join(__dirname, 'log.txt');
try { fs.unlinkSync(logFilename); } catch (err) {}

describe('test attach methods', () => {
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

  it('should properly init with schema name as attribute', async function() {
    this.timeout(30 * 1000);

    await ensureMaxIsDown();
    // start max patch
    const patchFilename = path.join(__dirname, 'test-attach-as-attribute.maxpat');
    await openPatch(patchFilename);

    await quitMax();

    const expected = `1\n`;
    const result = getLogAsString(logFilename);
    assert.equal(result, expected);
  });

  it('should properly init with attach command', async function() {
    this.timeout(30 * 1000);

    await ensureMaxIsDown();
    // start max patch
    const patchFilename = path.join(__dirname, 'test-attach-as-command.maxpat');
    await openPatch(patchFilename);
    // await delay(8000);
    await quitMax();

    const expected = `1\n`;
    const result = getLogAsString(logFilename);
    assert.equal(result, expected);
  });
});


