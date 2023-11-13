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
const logFilename = path.join(__dirname, 'log.json');
try { fs.unlinkSync(logFilename); } catch (err) {}

describe('receiving schema to Max on schema command sent', () => {
  before(async function() {
    this.timeout(15 * 1000);
    // ensure Max is not running
    await ensureMaxIsDown();
    // get configure and started soundworks server
    server = await createSoundworksServer();

    server.stateManager.registerSchema('globals', {
      myInt: {
        type: 'float',
        min: -10,
        max: 10,
        default: 0,
        step: 0.001,
        nullable: true,
      },
    });

    globals = await server.stateManager.create('globals');

    return await openPatch(patchFilename);
  });

  it('should log schema definition to log file', async function() {
    this.timeout(10 * 1000);
    // start max patch
    await openPatch(patchFilename);

    await quitMax();
    await server.stop();

    let expected = globals.getSchema();
    let result = JSON.parse(fs.readFileSync(logFilename));

    expected = expected.myInt;
    result = result.myInt;

    for (let i in expected) {
      if (typeof expected[i] === 'boolean') {
        expected[i] = expected[i] ? 1 : 0;
      }
    }

    assert.deepEqual(result, expected);
  });
});


