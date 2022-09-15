const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const findProcess = require('find-process')
const { execSync } = require('child_process');
const assert = require('chai').assert;

const createSoundworksServer = require('../utils/create-soundworks-server.js');
const { openPatch, quitMax, ensureMaxIsDown } = require('../utils/max-orchestrator.js');
const { getLogAsString, getLogAsNumArray } = require('../utils/logs-reader.js');
const floatEqual = require('./utils/float-equal');

// `npm test -- tests/1_server-max-max-server-boot-test/`

let server;
let globals;

const patchFilename = path.join(__dirname, 'test.maxpat');
const logFilename = path.join(__dirname, 'log.txt');
try { fs.unlinkSync(logFilename); } catch (err) {}

before(async function() {
  this.timeout(15 * 1000);

  await ensureMaxIsDown();
  // get configure and started soundworks server
  server = await createSoundworksServer()

  server.stateManager.registerSchema('globals', {
    myValue: {
      type: 'integer',
      default: 0,
    },
  });

  globals = await server.stateManager.create('globals');
  // start max patch
  return await openPatch(patchFilename);
});

describe('launch server -> max / quit max -> server', () => {
  it('should log some values sent by server', async function() {
    this.timeout(10 * 1000);

    globals.set({ myValue: 1 });
    await new Promise(resolve => setTimeout(resolve, 100));

    globals.set({ myValue: 2 });
    await new Promise(resolve => setTimeout(resolve, 100));

    // close patch message
    globals.set({ killMax: true });
    await new Promise(resolve => setTimeout(resolve, 1000));

    await quitMax(server);
    await server.stop();

    assert.ok(true);
  });

  it('should get log as strings', () => {
    const expected = `\
0
1
2
`;
    const result = getLogAsString(logFilename);

    assert.equal(result, expected);
  });

  it('should get logs as array of numbers', () => {
    const expected = [0, 1, 2];
    const result = getLogAsNumArray(logFilename);

    assert.equal(result, expected);
  });
});





























