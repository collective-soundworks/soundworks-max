const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const findProcess = require('find-process')
const { execSync } = require('child_process');
const assert = require('chai').assert;

const createSoundworksServer = require('../utils/create-soundworks-server.js');
const parseMaxConsole = require('../utils/parse-max-console.js');
const openPatch = require('../utils/open-patch.js');

// `npm test -- tests/0_server_start_max_quit_max-boot-test/`

let server;
let globals;

const patchFilename = path.join(__dirname, 'test.maxpat');
const logFilename = path.join(__dirname, 'log.txt');
try { fs.unlinkSync(logFilename); } catch (err) {}

before(async function() {
  this.timeout(15 * 1000);
  // get configure and started soundworks server
  server = await createSoundworksServer()

  server.stateManager.registerSchema('globals', {
    killMax: {
      type: 'boolean',
      default: false,
      event: true,
    },
  });

  globals = await server.stateManager.create('globals');

  // start max patch
  return await openPatch(patchFilename);
});

describe('testing test infrastucture', () => {
  it('should close Max from event', async function() {
    this.timeout(10 * 1000);

    globals.set({ killMax: true });

    await new Promise(resolve => setTimeout(resolve, 4 * 1000));

    const processesList = await findProcess('name', 'Max');
    assert.equal(processesList.length, 0, 'some Max process has been found');

    await server.stop();
  });

  it('log file should have logged the killMax event', () => {
    const result = parseMaxConsole(logFilename);
    const expected = `\
1
`;

    assert.equal(result, expected);
  });
});
































