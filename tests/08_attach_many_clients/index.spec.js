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

const numOfSchema = 10;
const numOfInstances = 10;
const states = {};

const patchFilename = path.join(__dirname, 'test.maxpat');
const logFilename = path.join(__dirname, 'log.txt');
try { fs.unlinkSync(logFilename); } catch (err) {}

describe('attaching with severals objets and severals schemas', () => {
  before(async function() {
    this.timeout(30 * 1000);

    await ensureMaxIsDown();
    // get configure and started soundworks server
    server = await createSoundworksServer()

    for (let i = 1; i <= numOfSchema; i++) {
      server.stateManager.registerSchema(`sch${i}`, {
        value: {
          type: 'float',
          default: i,
        }
      });

      states[`sch${i}`] = await server.stateManager.create(`sch${i}`);
    }
  });

  // @fixme - seems to be the same issue as in 02_attach
  it('should log schemas value on the output of each object', async function() {
    this.timeout(60 * 1000);

    await openPatch(patchFilename);
    // the poly may be long to instanciate (looks better but not stable)
    await new Promise(resolve => setTimeout(resolve, 5 * 1000));

    await quitMax(server);
    await server.stop();

    let expected = [];

    for (let i = 1; i <= numOfSchema; i++) {
      for (let j = 1; j <= numOfInstances; j++) {
        expected.push(`sch${i}_${j}_value value ${i}`);
      }
    }

    expected.sort();

    const result = getLogAsArray(logFilename);
    result.sort();

    assert.deepEqual(result, expected);
  });
});
