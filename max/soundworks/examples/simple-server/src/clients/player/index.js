import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import launcher from '@soundworks/helpers/launcher.js';

import '@ircam/sc-components/sc-number.js';
import '@ircam/sc-components/sc-slider.js';
import '@ircam/sc-components/sc-text.js';
import '@ircam/sc-components/sc-toggle.js';
import '@ircam/sc-components/sc-editor.js';
import '@ircam/sc-components/sc-bang.js';

import { html, render } from 'lit';
import '../components/sw-credits.js';

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

  /**
   * Register some soundworks plugins, you will need to install the plugins
   * before hand (run `npx soundworks` for help)
   */
  // client.pluginManager.register('my-plugin', plugin);

  /**
   * Register the soundworks client into the launcher
   *
   * The launcher will do a bunch of stuff for you:
   * - Display default initialization screens. If you want to change the provided
   * initialization screens, you can import all the helpers directly in your
   * application by doing `npx soundworks --eject-helpers`. You can also
   * customise some global syles variables (background-color, text color etc.)
   * in `src/clients/components/css/app.scss`.
   * You can also change the default language of the intialization screen by
   * setting, the `launcher.language` property, e.g.:
   * `launcher.language = 'fr'`
   * - By default the launcher automatically reloads the client when the socket
   * closes or when the page is hidden. Such behavior can be quite important in
   * performance situation where you don't want some phone getting stuck making
   * noise without having any way left to stop it... Also be aware that a page
   * in a background tab will have all its timers (setTimeout, etc.) put in very
   * low priority, messing any scheduled events.
   */
  launcher.register(client, { initScreensContainer: $container });

  /**
   * Launch application
   */
  await client.start();

  const globals = await client.stateManager.attach('globals');
  const globalsSchema = globals.getSchema();

  globals.onUpdate(() => {
    render(html`
      <div style="padding: 20px">
        <h1 style="margin: 20px 0">${client.type} [id: ${client.id}]</h1>

        <h1>Globals</h1>
        <p>received events are logged in console</p>
        <div style="margin-bottom: 4px">
          <sc-text
            value="volume"
            style="width:150px"
            readonly
          ></sc-text>
          <sc-slider
            number-box
            style="width:150px"
            min="${globalsSchema.volume.min}"
            max="${globalsSchema.volume.max}"
            step="1"
            value="${globals.get('volume')}"
            @input=${e => globals.set({ volume: e.detail.value })}
          ></sc-slider>
        </div>
        <div style="margin-bottom: 4px">
          <sc-text
            style="width:150px"
            readonly
          >mute</sc-text>
          <sc-toggle
            ?active="${globals.get('mute')}"
            @change=${e => globals.set({ mute: e.detail.value })}
          ></sc-toggle>
        </div>
        <div style="margin-bottom: 4px">
          <sc-text
            value="gain"
            style="width:150px"
            readonly
          ></sc-text>
          <sc-number
            value="${globals.get('gain')}"
            min="${globalsSchema.gain.min}"
            max="${globalsSchema.gain.max}"
            step="${globalsSchema.gain.step}"
            @input=${e => globals.set({ gain: e.detail.value })}
          ></sc-number>
        </div>
        <div style="margin-bottom: 4px">
          <sc-text
            readonly
          >message</sc-text>
          <sc-text
            editable=true
            value="${globals.get('message')}"
            @change=${e => globals.set({ message: e.detail.value })}
          ></sc-text>
        </div>
        <div style="margin-bottom: 4px">
          <sc-text
            style="width:150px"
            readonly
          >config</sc-text>
          <sc-editor
            value="${JSON.stringify(globals.get('config'), null, 2)}"
            @change=${e => globals.set({ config: JSON.parse(e.detail.value) })}
          ></sc-editor>
        </div>
        <div style="margin-bottom: 4px">
          <p>[event=true] value is reset to null after propagation</p>
          <sc-text
            style="width:150px"
            readonly
          >event</sc-text>
          <sc-bang
            ?active="${globals.get('event')}"
            @input="${e => globals.set({ event: true })}"
          ></sc-bang>
          <sc-text
            readonly
            value="get value: ${globals.get('event')}"
          ></sc-text>
        </div>
        <div style="margin-bottom: 4px">
          <p>[filterChange=false] will retrigger subscribe each time even if value does not change</p>
          <sc-text
            value="noFilterChange"
            width="150"
            readonly
          ></sc-text>
          <sc-bang
            ?active="${globals.get('noFilterChange')}"
            @input="${e => globals.set({ noFilterChange: true })}"
          ></sc-bang>
          <sc-text
            readonly
            value="get value: ${globals.get('noFilterChange')}"
          ></sc-text>
        </div>
        <div style="margin-bottom: 4px">
          <p>
            [immediate=true] trigger locally before network propagation<br />
            (triggering "2" will be overriden to "4" by the server)
          </p>
          <sc-text
            value="immediate"
            style="width:150px"
            readonly
          ></sc-text>
          <sc-number
            value="${globals.get('immediate')}"
            @change="${e => globals.set({ immediate: e.detail.value })}"
          ></sc-number>
          <sc-text
            readonly
            style="width:150px"
            value="${globals.get('immediate')}"
          ></sc-text>
        </div>
      </div>
    `, $container);
  }, true);
}

// The launcher enables instanciation of multiple clients in the same page to
// facilitate development and testing.
// e.g. `http://127.0.0.1:8000?emulate=10` to run 10 clients side-by-side
launcher.execute(main, {
  numClients: parseInt(new URLSearchParams(window.location.search).get('emulate')) || 1,
});
