import { execSync } from 'node:child_process';
import findProcess from 'find-process';
import { Client } from 'node-osc';
import open from 'open';
import log from './logger.js';

log('> Create osc client on port 5555');
let oscClient = new Client('127.0.0.1', 5555);

export function closeOscClient() {
  oscClient.close();
  oscClient = null;
}

export async function sendOsc(channel) {
  log('sending osc message', channel)
  oscClient.send(channel);
  await new Promise(resolve => setTimeout(resolve, 100));
}

export function openPatch(patchFilename) {
  log(`> opening ${patchFilename}`);
  open(patchFilename);

  return new Promise((resolve, reject) => {
    // check for the Max/MSP process every seconds
    const intervalId = setInterval(async () => {
      log('[...waiting for the patch...]');
      try {
        const processList = await findProcess('name', 'Max');
        // the patch is effectively opened when we have 3 processes running
        if (processList.length >= 3) {
          log('> patch is opened, continue');
          clearTimeout(intervalId);
          setTimeout(resolve, 2000);
        }
      } catch(err) {
        reject(err);
      }
    }, 1000);
  });
};

export async function ensureMaxIsDown() {
  const processList = await findProcess('name', 'Max');

  if (processList.length > 0) {
    // we really want this to be displayed whatever the "verbose" value
    console.log('> WARNING:');
    console.log('> Max is already running, please quit Max before running the test');
    console.log('');
    process.exit(0);
  }
}

// send the `killMax` message to the given state
export async function quitMax() {
  log('> sending message to quit Max');
  oscClient.send('/quit');
  await new Promise(resolve => setTimeout(resolve, 100));

  return new Promise((resolve, reject) => {
    const intervalId = setInterval(async () => {
      log('[...checking if max process is running...]');

       try {
        const processList = await findProcess('name', 'Max');
        // the patch is effectively opened when we have 3 processes running
        if (processList.length === 0) {
          log('> max is not running, continue');
          clearTimeout(intervalId);
          setTimeout(resolve, 500);
        }
      } catch(err) {
        reject(err);
      }

    }, 500);
  });
}

export async function closePatch() {
  log('> sending message to close the patch');
  oscClient.send('/close');
  return new Promise(resolve => setTimeout(resolve, 500));
}
