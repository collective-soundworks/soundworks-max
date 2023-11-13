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

const genRandonString = (() => {
  const gen = (min, max) => max++ && [...Array(max-min)].map((s, i) => String.fromCharCode(min+i));

  const sets = {
    num: gen(48,57),
    alphaLower: gen(97,122),
    alphaUpper: gen(65,90),
    special: [...`~!@#$%^&*()_+-=[]\{}|;:'",./<>?`],
    emoji: ["🍕","🚔","🎉","✔","🎁","💩"],
  };

  function* iter(len, set) {
      if (set.length < 1) {
        set = Object.values(sets).flat();
      }

      for (let i = 0; i < len; i++) {
        yield set[Math.random() * set.length|0];
      }
  }

  return Object.assign(((len, ...set) => [...iter(len, set.flat())].join('')), sets);
})();

let server;
let globals;

const patchFilename = path.join(__dirname, 'test.maxpat');
const patchFilenameEVENT = path.join(__dirname, 'test-event.maxpat');
const logFilename = path.join(__dirname, 'log.txt');
try { fs.unlinkSync(logFilename); } catch (err) {}

describe('sending messages', () => {
  before(async function() {
    this.timeout(15 * 1000);

    await ensureMaxIsDown();
    // get configure and started soundworks server
    server = await createSoundworksServer()

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
      },
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

  it('should log some integer sent by server', async function() {
    this.timeout(30 * 1000);

    await openPatch(patchFilename);

    let expected = ``;

    for (let i = 0; i < 10; i++) {
      let rand = Math.floor(Math.random() * 1000);

      expected += `myInt ${rand}\n`;
      globals.set({ myInt: rand });

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    await closePatch();

    const result = getLogAsString(logFilename);
    assert.equal(result, expected);
  });

  it('should log some boolean sent by server', async function() {
    this.timeout(30 * 1000);
    // start max patch
    await openPatch(patchFilename);

    let expected = ``;
    // false is default so trigger true to have a messsage on Max side
    let randBool = false; 

    for (let i = 0; i < 10; i++) {
      randBool = !randBool;

      expected += `myBool ${randBool ? 1 : 0}\n`;
      globals.set({ myBool: randBool });

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    await closePatch();

    const result = getLogAsString(logFilename);
    assert.equal(result, expected);
  });

  it('should log some floats sent by server', async function() {
    this.timeout(30 * 1000);

    await openPatch(patchFilename);

    let expected = [];

    for (let i = 0; i < 10; i++) {
      let rand = Math.random();

      expected.push(rand);
      globals.set({ myFloat: rand });

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // close patch message
    await closePatch();

    let result = getLogAsArray(logFilename);
    result = result.map(line => line.replace('myFloat ', ''));
    result = result.map(line => parseFloat(line));

    floatEqual(result, expected, 1e-3);
  });

  it('should log some messages sent by server', async function() {
    this.timeout(30 * 1000);

    await openPatch(patchFilename);

    let expected = ``;

    for (let i = 0; i < 10; i++) {
      let msg = genRandonString(80);

      expected += `myMessage ${msg}\n`;
      globals.set({ myMessage: msg });

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    await closePatch();

    const result = getLogAsString(logFilename);
    assert.equal(result, expected);
  });

  it('should log some events sent by server', async function() {
    this.timeout(30 * 1000);
    // start max patch
    await openPatch(patchFilenameEVENT);

    let expected = ``;

    for (let i = 0; i < 10; i++) {
      let bool = Boolean(Math.round(Math.random()));

      expected += `myEvent ${bool ? 1 : 0}\n`;
      globals.set({ myEvent: bool });

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    await closePatch();

    let result = getLogAsString(logFilename);
    // console.log(result.split('\n'));
    // console.log(expected.split('\n'));

    assert.equal(result, expected);
  });
});
