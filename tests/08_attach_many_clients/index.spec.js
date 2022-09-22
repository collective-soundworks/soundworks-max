const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const findProcess = require('find-process')
const { execSync } = require('child_process');
const assert = require('chai').assert;

const createSoundworksServer = require('../utils/create-soundworks-server.js');
const { openPatch, quitMax, ensureMaxIsDown } = require('../utils/max-orchestrator.js');
const { getLogAsString, getLogAsNumArray, getLogAsArray } = require('../utils/logs-reader.js');

// `npm test -- tests/1_server-max-max-server-boot-test/`

let server;
let globals;

const numOfSchema = 10;
const numOfInstances = 10;
const states = {};

const patchFilename = path.join(__dirname, 'test.maxpat');
const logFilename = path.join(__dirname, 'log.txt');
try { fs.unlinkSync(logFilename); } catch (err) {}

before(async function() {
  this.timeout(30 * 1000);

  await ensureMaxIsDown();
  // get configure and started soundworks server
  server = await createSoundworksServer()

  for (let i = 1; i<=numOfSchema; i++) {
    server.stateManager.registerSchema(`sch${i}`, {
      value: {
        type: 'float',
        default: i,
      }
    });

    states[`sch${i}`] = await server.stateManager.create(`sch${i}`);
  }
});

describe('attaching with severals objets and severals schemas', () => {
  it('should log schemas value on the output of each object', async function() {
    this.timeout(30 * 1000);

    await openPatch(patchFilename);
    // the poly may be long to instanciate (looks better but not stable)
    await new Promise(resolve => setTimeout(resolve, 10 * 1000));

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





























