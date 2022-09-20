const { execSync } = require('node:child_process');
const findProcess = require('find-process');
const { Client } = require('node-osc');
const open = require('open');

console.log('> Create osc client on port 5555');
let oscClient = new Client('127.0.0.1', 5555);

module.exports.closeOscClient = () => {
  oscClient.close();
  oscClient = null;
}

module.exports.sendOsc = async function sendOsc(channel) {
  console.log('sending osc message', channel)
  oscClient.send(channel);
  await new Promise(resolve => setTimeout(resolve, 100));
}

module.exports.openPatch = function openPatch(patchFilename) {
  console.log(`> opening ${patchFilename}`);
  open(patchFilename);

  return new Promise((resolve, reject) => {
    // check for the Max/MSP process every seconds
    const intervalId = setInterval(async () => {
      console.log('[...waiting for the patch...]');
      try {
        const processList = await findProcess('name', 'Max');
        // the patch is effectively opened when we have 3 processes running
        if (processList.length >= 3) {
          console.log('> patch is opened, continue');
          clearTimeout(intervalId);
          resolve();
        }
      } catch(err) {
        reject(err);
      }
    }, 1000);
  });
};

module.exports.ensureMaxIsDown = async function ensureMaxIsDown() {
  const processList = await findProcess('name', 'Max');

  if (processList.length > 0) {
    console.log('> WARNING:');
    console.log('> Max is already running, please quit Max before running the test');
    console.log('');
    process.exit(0);
  }
}

// send the `killMax` message to the given state
module.exports.quitMax = async function() {
  console.log('> sending message to quit Max');
  oscClient.send('/quit');
  await new Promise(resolve => setTimeout(resolve, 100));

  return new Promise((resolve, reject) => {
    const intervalId = setInterval(async () => {
      console.log('[...checking if max process is running...]');

       try {
        const processList = await findProcess('name', 'Max');
        // the patch is effectively opened when we have 3 processes running
        if (processList.length === 0) {
          console.log('> max is not running, continue');
          clearTimeout(intervalId);
          resolve();
        }
      } catch(err) {
        reject(err);
      }

    }, 500);
  });
}

module.exports.closePatch = async function() {
  console.log('> sending message to close the patch');
  oscClient.send('/close');
  return new Promise(resolve => setTimeout(resolve, 500));
}
