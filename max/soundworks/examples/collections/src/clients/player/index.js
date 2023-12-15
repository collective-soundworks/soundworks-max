import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import launcher from '@soundworks/helpers/launcher.js';

import { html, render } from 'lit';
import '../components/sw-credits.js';
import '@ircam/sc-components/sc-slider.js';

import pluginPlatformInit from '@soundworks/plugin-platform-init/client.js';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

/**
 * Grab the configuration object written by the server in the `index.html`
 */
const config = window.SOUNDWORKS_CONFIG;

/**
 * If multiple clients are emulated you might to want to share some resources
 */
// const audioContext = new AudioContext();

async function main($container) {
  /**
   * Create the soundworks client
   */
  const client = new Client(config);
  const audioContext = new AudioContext();

  launcher.register(client, { initScreensContainer: $container });
  client.pluginManager.register('platform-init', pluginPlatformInit, { audioContext });

  /**
   * Launch application
   */
  await client.start();


  // create a simple envelop
  const env = audioContext.createGain();
  env.gain.value = 0;
  env.connect(audioContext.destination);
  const src = audioContext.createOscillator();
  src.connect(env);

  src.start();

  function layout() {
    render(html`
      <p>Client ${client.id}</p>
      <div class="simple-layout">
        <sc-slider
          min="${player.getSchema().frequency.min}"
          max="${player.getSchema().frequency.max}"
          value="${player.get('frequency')}"
          @input=${e => player.set({frequency: e.target.value})}
          number-box=true
        ></sc-slider>
        <sc-slider
          min="${player.getSchema().volume.min}"
          max="${player.getSchema().volume.max}"
          value="${player.get('volume')}"
          @input=${e => player.set({volume: e.target.value})}
          number-box=true
        ></sc-slider>
        <sw-credits .infos="${client.config.app}"></sw-credits>
      </div>
    `, $container);
  }

  const player = await client.stateManager.create('player');
  player.onUpdate((values) => {
    layout();

    if ('frequency' in values) {
      src.frequency.value = values.frequency;
    }

    if ('volume' in values) {
      const now = audioContext.currentTime;
      env.gain.setTargetAtTime(values.volume, now,  0.1);
    }
  }, true);

}

// The launcher enables instanciation of multiple clients in the same page to
// facilitate development and testing.
// e.g. `http://127.0.0.1:8000?emulate=10` to run 10 clients side-by-side
launcher.execute(main, {
  numClients: parseInt(new URLSearchParams(window.location.search).get('emulate')) || 1,
});
