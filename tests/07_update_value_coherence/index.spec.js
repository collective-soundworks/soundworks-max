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
const patchFilenameEVENT = path.join(__dirname, 'testEVENT.maxpat');
const logFilename = path.join(__dirname, 'log.txt');
try { fs.unlinkSync(logFilename); } catch (err) {}

const genRandonString = (() => {
    const gen = (min, max) => {
      max++ && [...Array(max-min)].map((s, i) => String.fromCharCode(min+i))
    };

    const sets = {
        //num: gen(48,57),
        alphaLower: gen(97,122),
        alphaUpper: gen(65,90),
        special: [...`~!@#$%^&*()_+-=[]\{}|;:'",./<>?`],
        //emoji: ["🍕","🚔","🎉","✔","🎁","💩"],
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

describe('coherence between dict in Max', () => {
  before(async function() {
    this.timeout(15 * 1000);

    await ensureMaxIsDown();
    // get configure and started soundworks server
    server = await createSoundworksServer()

    server.stateManager.registerSchema('globals', {
      myString: {
        type: 'string',
        default: 'toto',
        nullable: true,
      },
      toto: {
        type: 'float',
        default: 0,
      },
    });

    globals = await server.stateManager.create('globals');

    await openPatch(patchFilename);
  });

  it('should log same value 2 times (update on server side)', async function() {
    this.timeout(10 * 1000);
    
    await openPatch(patchFilename);
    // start max patch
    let expected = `values myString toto\nvalues toto 0\n`;

    let randStr = genRandonString(20);
    globals.set({ myString: randStr });

    expected += `updates myString ${randStr}\n`;
    expected += `values myString ${randStr}\nvalues toto 0\n`;

    await closePatch();

    globals.set({ myString: 'toto' });

    const result = getLogAsString(logFilename);
    assert.equal(result, expected);
  });

  it('should log same value 2 times (update on Max side)', async function() {
    this.timeout(30 * 1000);
    // start max patch
    await openPatch(patchFilename);

    let expected = `values myString toto\nvalues toto 0\n`;

    let randStr = genRandonString(20);

    sendOsc(randStr);
    await new Promise(resolve => setTimeout(resolve, 1000));

    expected += `updates myString ${randStr}\n`;
    expected += `values myString ${randStr}\nvalues toto 0\n`;

    // close patch message
    await quitMax();
    await server.stop();

    const result = getLogAsString(logFilename);
    assert.equal(result, expected);
  });
});
