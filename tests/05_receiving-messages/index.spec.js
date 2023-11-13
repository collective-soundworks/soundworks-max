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
const patchFilenameEvent = path.join(__dirname, 'test-event.maxpat');
const logFilename = path.join(__dirname, 'log.txt');
try { fs.unlinkSync(logFilename); } catch (err) {}

describe('receiving messages types', () => {
  before(async function() {
    this.timeout(15 * 1000);

    await ensureMaxIsDown();
    // get configured and started soundworks server
    server = await createSoundworksServer();

    server.stateManager.registerSchema('globals', {
      myInt: {
        type: 'integer',
        min: -Infinity,
        max: Infinity,
        default: 0,
      },
      myBool: {
        type: 'boolean',
        default: false,
      },
      myFloat: {
        type: 'float',
        min: -Infinity,
        max: Infinity,
        step: 0.001,
        default: 0.5,
      },
      myInfFloat: {
        type: 'float',
        min: -Infinity,
        max: Infinity,
        step: 0.001,
        default: 0,
      },
      myMessage: {
        type: 'string',
        default: 'my-message',
        nullable: true,
      },
      // new options
      myEvent: {
        type: 'boolean',
        default: false,
        event: true,
      }
    });

    globals = await server.stateManager.create('globals');
  });

  after(async function() {
    this.timeout(30 * 1000);

    // we need to open the patch to fully quit Max
    await openPatch(patchFilename);
    await new Promise(resolve => setTimeout(resolve, 500));
    await quitMax();

    await server.stop();
  });

  it('should log some integer sent by Max', async function() {
    this.timeout(30 * 1000);

    await openPatch(patchFilename);

    let result = ``;

    globals.onUpdate(updates => {
      if ('myInt' in updates) {
        result += `myInt ${updates.myInt}\n`;
      }
    });

    // sending command for Max to send things
    await sendOsc('/integer');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // sending command for Max to send nothing
    await sendOsc('/nothing');
    await new Promise(resolve => setTimeout(resolve, 2000));

    await closePatch();

    const expected = getLogAsString(logFilename);
    assert.notEqual(result, '');
    assert.equal(result, expected);
  });

  it('should log some boolean sent by Max', async function() {
    this.timeout(30 * 1000);

    await openPatch(patchFilename);

    let result = ``;

    globals.onUpdate(updates => {
      if ('myBool' in updates) {
        result += `myBool ${updates.myBool ? 1 : 0}\n`;
      }
    });

    // sending command for Max to send things
    await sendOsc('/bool');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // sending command for Max to send nothing
    await sendOsc('/nothing');
    await new Promise(resolve => setTimeout(resolve, 2000));

    await closePatch();

    const expected = getLogAsString(logFilename);
    assert.notEqual(result, '');
    assert.equal(result, expected);
  });

  it('should log some floats sent by Max', async function() {
    this.timeout(30 * 1000);

    await openPatch(patchFilename);

    let result = [];

    globals.onUpdate(updates => {
      if ('myFloat' in updates) {
        result.push(updates.myFloat);
      }
    });

    // sending command for Max to send things
    await sendOsc('/floaty');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // sending command for Max to send nothing
    await sendOsc('/nothing');
    await new Promise(resolve => setTimeout(resolve, 2000));

    await closePatch();

    const expected = getLogAsNumArray(logFilename);
    assert.notEqual(result, '');
    floatEqual(result, expected, 1e-3);

  });

  it('should log some strings sent by Max', async function() {
    this.timeout(30 * 1000);

    await openPatch(patchFilename);

    let result = ``;

    globals.onUpdate(updates => {
      if ('myMessage' in updates) {
        result += `myMessage ${updates.myMessage}\n`;
      }
    });

    // sending command for Max to send things
    await sendOsc('/string');
    await new Promise(resolve => setTimeout(resolve, 2500));

    // sending command for Max to send nothing
    await sendOsc('/nothing');
    await new Promise(resolve => setTimeout(resolve, 2000));

    await closePatch();

    const expected = getLogAsString(logFilename);
    assert.notEqual(result, '');
    assert.equal(result, expected);
  });

  it('should log some events sent by Max', async function() {
    this.timeout(30 * 1000);
    // start max patch
    await openPatch(patchFilenameEvent);

    let result = '';

    globals.onUpdate(updates => {
      if ('myEvent' in updates) {
        result += `myEvent ${updates.myEvent ? 1 : 0}\n`;
      }
    });

    // sending command for Max to send things
    await sendOsc('/event');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // sending command for Max to send nothing
    await sendOsc('/nothing');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // close patch message
    await closePatch();

    const expected = getLogAsString(logFilename);

    assert.notEqual(result, '');
    assert.equal(result, expected);
  });
});
