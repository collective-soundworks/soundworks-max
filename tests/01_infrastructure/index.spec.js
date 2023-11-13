import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
 import * as url from 'node:url';

import findProcess from 'find-process';
import { assert } from 'chai';

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

const patchFilename = path.join(__dirname, 'test.maxpat');
const logFilename = path.join(__dirname, 'log.txt');
try { fs.unlinkSync(logFilename); } catch (err) {}

describe('testing test infrastucture', () => {
  before(async function() {
    this.timeout(30 * 1000);
    // ensure Max is not running
    await ensureMaxIsDown();
    // get configure and started soundworks server
    server = await createSoundworksServer();
  });

  after(async function() {
    this.timeout(1000);
    await server.stop();
  });

  it('should open patch and close patch from event', async function() {
    this.timeout(30 * 1000);
    // start max patch
    await openPatch(patchFilename);

    const processesList1 = await findProcess('name', 'Max');
    assert.isAtLeast(processesList1.length, 3);
  });

  it('should send osc message to patch', async () => {
    await sendOsc('/coucou');
    assert.ok(true);
  });

  it('should close patch without quitting Max', async () => {
    // dispose the patch
    await closePatch();
    assert.ok(true);
  });

  it('should have logged osc messages', () => {
    const expected = `/coucou\n/close\n`;
    const result = getLogAsString(logFilename);

    assert.equal(result, expected);
  });

  it('should close Max from event', async function() {
    this.timeout(30 * 1000);

    await openPatch(patchFilename);
    await quitMax();

    const processesList = await findProcess('name', 'Max');
    assert.equal(processesList.length, 0, 'some Max process has been found');
  });

  it('should have logged osc quit message', () => {
    const expected = `/quit\n`;
    const result = getLogAsString(logFilename);
    assert.equal(result, expected);
  });

  it('should have a way to compare arrays of floats with a tolerance', () => {
    // uncomment to see the test fail
    floatEqual([0.02], [0.01], 1e-2);
  });

  it('should open and close Max many times', async function() {
    this.timeout(30 * 1000);
    await openPatch(patchFilename);
    await closePatch();
    await openPatch(patchFilename);
    await closePatch();
    await openPatch(patchFilename);
    await quitMax();

    const processesList = await findProcess('name', 'Max');
    assert.equal(processesList.length, 0, 'some Max process has been found');
  });
});
