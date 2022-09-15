const { execSync } = require('node:child_process');
const findProcess = require('find-process');

// send the `killMax` message to the given state
module.exports = async function(server = null) {
  if (server) {
    await server.testSuite.set({ killMax: true });
  } else {
    try {
      execSync(`killall -9 Max`);
    } catch(err) {}
  }

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
