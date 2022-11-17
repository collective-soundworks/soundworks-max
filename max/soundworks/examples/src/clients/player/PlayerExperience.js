import { AbstractExperience } from '@soundworks/core/client';
import { render, html } from 'lit-html';
import renderInitializationScreens from '@soundworks/template-helpers/client/render-initialization-screens.js';

import '@ircam/simple-components/sc-text.js';
import '@ircam/simple-components/sc-slider.js';
import '@ircam/simple-components/sc-toggle.js';
import '@ircam/simple-components/sc-number.js';
import '@ircam/simple-components/sc-editor.js';
import '@ircam/simple-components/sc-bang.js';

class PlayerExperience extends AbstractExperience {
  constructor(client, config, $container) {
    super(client);

    this.config = config;
    this.$container = $container;
    this.rafId = null;

    // require plugins if needed
    this.sync = this.require('sync');

    renderInitializationScreens(client, config, $container);
  }

  async start() {
    super.start();

    this.globals = await this.client.stateManager.attach('globals');
    this.globals.subscribe((updates) => {
      console.log(updates);
      this.render();
      // reset event display
      setTimeout(() => this.render(), 100);
    });

    this.syncEvents = await this.client.stateManager.attach('sync-events');

    window.addEventListener('resize', () => this.render());
    this.render();
  }

  render() {
    const globalsSchema = this.globals.getSchema();

    render(html`
      <div style="padding: 20px">
        <h1 style="margin: 20px 0">${this.client.type} [id: ${this.client.id}]</h1>

        <div>
          <h1>SyncEvents</h1>
          <sc-button
            value="bang"
            @input="${e => {
              const syncTime = this.sync.getSyncTime() + 1;
              console.log(syncTime);
              this.syncEvents.set({ triggerTime: syncTime });
            }}"
          ></sc-button>
        </div>

        <h1>Globals</h1>
        <p>received events are logged in console</p>
        <div style="margin-bottom: 4px">
          <sc-text
            value="volume"
            width="150"
            readonly
          ></sc-text>
          <sc-slider
            display-number
            width="300"
            min="${globalsSchema.volume.min}"
            max="${globalsSchema.volume.max}"
            step="1"
            value="${this.globals.get('volume')}"
            @input=${e => this.globals.set({ volume: e.detail.value })}
          ></sc-slider>
        </div>
        <div style="margin-bottom: 4px">
          <sc-text
            value="mute"
            width="150"
            readonly
          ></sc-text>
          <sc-toggle
            ?active="${this.globals.get('mute')}"
            @change=${e => this.globals.set({ mute: e.detail.value })}
          ></sc-toggle>
        </div>
        <div style="margin-bottom: 4px">
          <sc-text
            value="gain"
            width="150"
            readonly
          ></sc-text>
          <sc-number
            value="${this.globals.get('gain')}"
            min="${globalsSchema.gain.min}"
            max="${globalsSchema.gain.max}"
            step="${globalsSchema.gain.step}"
            @input=${e => this.globals.set({ gain: e.detail.value })}
          ></sc-number>
        </div>
        <div style="margin-bottom: 4px">
          <sc-text
            value="message"
            width="150"
            readonly
          ></sc-text>
          <sc-text
            value="${this.globals.get('message')}"
            @change=${e => this.globals.set({ message: e.detail.value })}
          ></sc-text>
        </div>
        <div style="margin-bottom: 4px">
          <sc-text
            value="config"
            width="150"
            readonly
          ></sc-text>
          <sc-editor
            value="${JSON.stringify(this.globals.get('config'), null, 2)}"
            @change=${e => this.globals.set({ config: JSON.parse(e.detail.value) })}
          ></sc-editor>
        </div>
        <div style="margin-bottom: 4px">
          <p>[event=true] value is reset to null after propagation</p>
          <sc-text
            value="event"
            width="150"
            readonly
          ></sc-text>
          <sc-bang
            .active="${this.globals.get('event')}"
            @input="${e => this.globals.set({ event: true })}"
          ></sc-bang>
          <sc-text
            readonly
            value="get value: ${this.globals.get('event')}"
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
            .active="${this.globals.get('noFilterChange')}"
            @input="${e => this.globals.set({ noFilterChange: true })}"
          ></sc-bang>
          <sc-text
            readonly
            value="get value: ${this.globals.get('noFilterChange')}"
          ></sc-text>
        </div>
        <div style="margin-bottom: 4px">
          <p>
            [immediate=true] trigger locally before network propagation<br />
            (triggering "2" will be overriden to "4" by the server)
          </p>
          <sc-text
            value="immediate"
            width="150"
            readonly
          ></sc-text>
          <sc-number
            value="${this.globals.get('immediate')}"
            @change="${e => this.globals.set({ immediate: e.detail.value })}"
          ></sc-number>
          <sc-text
            readonly
            width="150"
            value="${this.globals.get('immediate')}"
          ></sc-text>
        </div>
      </div>
    `, this.$container);
  }
}

export default PlayerExperience;
