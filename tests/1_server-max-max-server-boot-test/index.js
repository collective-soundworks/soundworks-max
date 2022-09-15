const path = require('path');
const os = require('os');
const open = require('open');
const { execSync } = require('child_process');
const fs = require('fs');
const assert = require('assert');
// const assert = require('chai').assert;

const createSoundworksServer = require('../utils/create-soundworks-server.js');
const parseMaxConsole = require('../utils/parse-max-console.js');

let server;

(async function() {
  // get configure and started soundworks server
  server = await createSoundworksServer();

  server.stateManager.registerSchema('globals', {
    myValue: {
      type: 'integer',
      default: 0,
    },
    killMax: {
      type: 'boolean',
      default: false,
      event: true,
    },
  });

  const globals = await server.stateManager.create('globals');
  const patchFilename = path.join(__dirname, 'test.maxpat');
  const logFilename = path.join(__dirname, 'log.txt');
  try { fs.unlinkSync(logFile); } catch (err) {}

  // start max patch
  console.log(`> open ${patchFilename}`);
  await open(patchFilename);
  await new Promise(resolve => setTimeout(resolve, 10 * 1000));

  // ---------------------------------------------------
  // sends some values
  // ---------------------------------------------------

  console.log('update globals.myValue = 1');
  globals.set({ myValue: 1 });

  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('update globals.myValue = 2');
  globals.set({ myValue: 2 });

  await new Promise(resolve => setTimeout(resolve, 1000));

  // close patch message
  globals.set({ killMax: true });
  await new Promise(resolve => setTimeout(resolve, 1000));

  // ---------------------------------------------------
  // check results
  // ---------------------------------------------------
  const expected = `\
0
1
2
`;

  const logPrefix = 'print';
  const result = parseMaxConsole(logFilename, logPrefix);
  console.log(result);

  assert.equal(result, expected);

  // close the server
  console.log(`> close server`);
  await server.stateManagerOsc.stop();
  await server.stop();
}());

































