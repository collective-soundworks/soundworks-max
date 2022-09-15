const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const findProcess = require('find-process')
const { execSync } = require('child_process');
const assert = require('chai').assert;

const createSoundworksServer = require('../utils/create-soundworks-server.js');
const { openPatch, quitMax, ensureMaxIsDown } = require('../utils/max-orchestrator.js');
const { getLogAsString } = require('../utils/logs-reader.js');

// `npm test -- tests/0_server_start_max_quit_max-boot-test/`

let server;
let globals;

const patchFilename = path.join(__dirname, 'test.maxpat');
const logFilename = path.join(__dirname, 'log.txt');
try { fs.unlinkSync(logFilename); } catch (err) {}

before(async function() {
  this.timeout(15 * 1000);
  // ensure Max is not running
  await ensureMaxIsDown();
  // get configure and started soundworks server
  server = await createSoundworksServer();
  // start max patch
  return await openPatch(patchFilename);
});

describe('testing test infrastucture', () => {
  it('should close Max from event', async function() {
    this.timeout(10 * 1000);
    // send close message to Max
    await quitMax(server);

    const processesList = await findProcess('name', 'Max');
    assert.equal(processesList.length, 0, 'some Max process has been found');

    await server.stop();
  });

  it('log file should have logged the killMax event', () => {
    const result = getLogAsString(logFilename);
    const expected = `\
1
`;

    assert.equal(result, expected);
  });
});
































