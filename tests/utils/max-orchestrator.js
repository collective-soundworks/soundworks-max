const { execSync } = require('node:child_process');
const findProcess = require('find-process');
const open = require('open');

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
          console.log('> path is opened, continue');
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
module.exports.quitMax = async function(server = null) {
  if (!server) {
    throw new Error(`quit max requires the soundworks server`)
  }

  console.log('> sending kill message to Max');
  await server.testSuite.set({ killMax: true });

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
