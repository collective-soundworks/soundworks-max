const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const findProcess = require('find-process')
const { execSync } = require('child_process');
const assert = require('chai').assert;

const createSoundworksServer = require('../utils/create-soundworks-server.js');
const { openPatch, quitMax, ensureMaxIsDown } = require('../utils/max-orchestrator.js');
const { getLogAsString, getLogAsNumArray } = require('../utils/logs-reader.js');

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

  server.stateManager.registerSchema('sch1', {
    value1: {
      type: 'float',
      default: 1,
    }
  });

  server.stateManager.registerSchema('sch2', {
    value2: {
      type: 'float',
      default: 2,
    }
  });

  server.stateManager.registerSchema('sch3', {
    value3: {
      type: 'float',
      default: 3,
    }
  });

  server.stateManager.registerSchema('sch4', {
    value4: {
      type: 'float',
      default: 4,
    }
  });

  server.stateManager.registerSchema('sch5', {
    value5: {
      type: 'float',
      default: 5,
    }
  });

  sch1 = await server.stateManager.create('sch1');
  sch2 = await server.stateManager.create('sch2');
  sch3 = await server.stateManager.create('sch3');
  sch4 = await server.stateManager.create('sch4');
  sch5 = await server.stateManager.create('sch5');
  // start max patch
});

describe('attaching with severals objets and severals schemas', () => {
  it('[REBUILD PATCH PLEASE!] should log schemas value on the output of each object', async function() {
    this.timeout(10 * 1000);

    await openPatch(patchFilename);

    console.log('waiting for Max to sync');
    await new Promise(resolve => setTimeout(resolve, 1000));

    await quitMax(server);
    await server.stop();

    let expected = ``;

    for (let i = 5; i >= 1; i--) {
      for (let j = 1; j <= 10; j++) {
          expected += `sch${i}_${j}_value value${i} ${i}\n`;
      }
    }

    const result = getLogAsString(logFilename);

    assert.equal(result, expected);
  });
});





























