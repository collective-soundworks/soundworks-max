import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import launcher from '@soundworks/helpers/launcher.js';

import { AudioBufferLoader } from 'waves-loaders';


import { loadConfig } from '../../utils/load-config.js';

import { AudioContext, GainNode, OscillatorNode, mediaDevices, MediaStreamAudioSourceNode, AnalyserNode } from 'node-web-audio-api';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

async function bootstrap() {
  /**
   * Load configuration from config files and create the soundworks client
   */
  const config = loadConfig(process.env.ENV, import.meta.url);
  const client = new Client(config);

  const audioContext = new AudioContext();

  /**
   * Register some soundworks plugins, you will need to install the plugins
   * before hand (run `npx soundworks` for help)
   */
  // client.pluginManager.register('my-plugin', plugin);

  /**
   * Register the soundworks client into the launcher
   *
   * Automatically restarts the process when the socket closes or when an
   * uncaught error occurs in the program.
   */
  launcher.register(client);

  /**
   * Launch application
   */
  await client.start();

  console.log(`Hello ${client.config.app.name}!`);

  // create a simple envelop
  const env = audioContext.createGain();
  env.gain.value = 0;
  env.connect(audioContext.destination);
  const src = audioContext.createOscillator();
  src.connect(env);

  src.start();

  const player = await client.stateManager.create('player');
  player.onUpdate((values) => {

    if ('oscillatorType' in values) {
        src.type = values.oscillatorType;
    }

    if ('frequency' in values) {
      src.frequency.value = values.frequency;
      // const now = audioContext.currentTime;
      // src.frequency.setTargetAtTime(values.volume, now,  0.01);
    }

    if ('volume' in values) {
      const now = audioContext.currentTime;
      env.gain.setTargetAtTime(values.volume, now,  0.01);
    }
  }, true);


}

// The launcher allows to fork multiple clients in the same terminal window
// by defining the `EMULATE` env process variable
// e.g. `EMULATE=10 npm run watch-process thing` to run 10 clients side-by-side
launcher.execute(bootstrap, {
  numClients: process.env.EMULATE ? parseInt(process.env.EMULATE) : 1,
  moduleURL: import.meta.url,
});
