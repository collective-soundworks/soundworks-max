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
import { getLogAsString, getLogAsNumArray, getLogAsArray } from '../utils/logs-reader.js';
import floatEqual from '../utils/float-equal.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

let server;
let globals;

const patchFilename = path.join(__dirname, 'test.maxpat');
const logFilename = path.join(__dirname, 'log.txt');
try { fs.unlinkSync(logFilename); } catch (err) {}

describe('launch a server', () => {
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
    this.timeout(10 * 1000);

    await openPatch(patchFilename);
    await quitMax();
    await server.stop();
  });

  it.skip('should open a server', async function() {
    this.timeout(20 * 1000);

    for (let i = 0; i <= 10; i++) {
      // start max patch
      await openPatch(patchFilename);
      await closePatch();
    }
  });
});


