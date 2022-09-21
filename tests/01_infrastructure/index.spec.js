const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const findProcess = require('find-process')
const { execSync } = require('child_process');
const assert = require('chai').assert;

const createSoundworksServer = require('../utils/create-soundworks-server.js');
const { openPatch, closePatch, quitMax, ensureMaxIsDown, sendOsc } = require('../utils/max-orchestrator.js');
const { getLogAsString, getLogAsNumArray } = require('../utils/logs-reader.js');
const floatEqual = require('../utils/float-equal.js');

// `npm test -- tests/0_server_start_max_quit_max-boot-test/`

let server;
let globals;

const patchFilename = path.join(__dirname, 'test.maxpat');
const logFilename = path.join(__dirname, 'log.txt');
try { fs.unlinkSync(logFilename); } catch (err) {}

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
})

describe('testing test infrastucture', () => {
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
    const expected = `\
/coucou
/close
`;
    const result = getLogAsString(logFilename);

    assert.equal(result, expected);
  });

  it('should close Max from event', async function() {
    this.timeout(30 * 1000);

    await openPatch(patchFilename);
    // send close message to Max
    await quitMax();

    const processesList = await findProcess('name', 'Max');
    assert.equal(processesList.length, 0, 'some Max process has been found');

    //await server.stop();
  });

  it('should have logged osc quit message', () => {
    const expected = `\
/quit
`;
    const result = getLogAsString(logFilename);

    assert.equal(result, expected);
  });

  it('should have a way to compare arrays of floats with a tolerance', () => {
    // uncomment to see the test fail
    floatEqual([0.02], [0.01], 1e-2);
  });

  // it('should get logs as array of numbers', () => {
  //   const expected = [1];
  //   const result = getLogAsNumArray(logFilename);

  //   assert.deepEqual(result, expected);
  // });
});

//oops...
  it('should open and close Max many times', async function() {
    this.timeout(30 * 1000);
    await openPatch(patchFilename);
    // await new Promise(resolve => setTimeout(resolve, 500));
    await closePatch();
    // await new Promise(resolve => setTimeout(resolve, 500));
    await openPatch(patchFilename);
    // await new Promise(resolve => setTimeout(resolve, 500));
    await closePatch();
    // await new Promise(resolve => setTimeout(resolve, 500));
    await openPatch(patchFilename);
    // await new Promise(resolve => setTimeout(resolve, 500));
    await quitMax();
    // await new Promise(resolve => setTimeout(resolve, 500));
    const processesList = await findProcess('name', 'Max');
    assert.equal(processesList.length, 0, 'some Max process has been found');
  });

