const findProcess = require('find-process');

// send the `killMax` message to the given state
module.exports = async function(command = null) {
  if (command) {
    await command();
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
