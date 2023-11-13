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

describe("errors and complex types", () => {
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
        nullable: true,
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
      myEnum: {
        type: 'enum',
        list: ['aaa', 'bbb', 'ccc'],
        default: 'aaa',
        nullable: true,
      },
      myArray: {
        type: 'any',
        default: [0, 1, 2, 3, 4],
        filterChange: false,
      },
      myObject: {
        type: 'any',
        default: {
          a: true, // this will be casted to 1 by Max, nothing we can really do here
          b: 1,
          c: 'str',
        },
        filterChange: false,
      },
      myComplexObject: {
        type: 'any',
        default: {
          b: 1,
          c: 'str',
          arr: [1, 2, 3],
        },
        filterChange: false,
      },
    });

    globals = await server.stateManager.create('globals');

    await openPatch(patchFilename);
  });

  after(async function() {
    this.timeout(10 * 1000);

    await closePatch();
    await server.stop();
  });
  it('shoud not crash the server when sending incorrect types', async function() {
    this.timeout(30 * 1000);

    // wrong types, wont log anything in the file, only in Max console
    sendOsc('/int');
    sendOsc('/float');
    sendOsc('/string');
    sendOsc('/bool');
    sendOsc('/enum');

    await new Promise(resolve => setTimeout(resolve, 2000));

    assert.ok('this is ok');
  });

  it('should properly handle complex types, i.e. any', async function() {
    this.timeout(30 * 1000);
    // complex types, default values are resend by Max
    sendOsc('/arr');
    sendOsc('/obj');
    sendOsc('/complex');

    globals.onUpdate(updates => {
      if ('myArray' in updates) {
        assert.deepStrictEqual(updates, { myArray: [0, 1, 2, 3, 4] });
      }

      if ('myObject' in updates) {
        // note that true is replaced by 1 here. nothing we can do for that...
        assert.deepStrictEqual(updates, { myObject: { a: 1, b: 1, c: 'str' } });
      }

      if ('myComplexObject' in updates) {
        assert.deepStrictEqual(updates, { myComplexObject: { b: 1, c: 'str', arr: [1, 2, 3] } });
      }
    });

    // wait for Max to receive the updates
    await new Promise(resolve => setTimeout(resolve, 2000));
    await quitMax();

    const result = getLogAsArray(logFilename);

    assert.equal(result[0], 'myArray 0 1 2 3 4');
    // remove the id of the dictionnary as it may change
    assert.equal(result[1].replace(/ u[0-9]+/, ''), 'myObject dictionary');
    assert.equal(result[2].replace(/ u[0-9]+/, ''), 'myComplexObject dictionary');

    assert.ok('this is ok');
  });

});
