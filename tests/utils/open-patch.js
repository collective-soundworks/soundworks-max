const open = require('open');
const findProcess = require('find-process');

module.exports = function openPatch(patchFilename) {
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
