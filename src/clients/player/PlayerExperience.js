import { AbstractExperience } from '@soundworks/core/client';
import { render, html } from 'lit-html';
import renderInitializationScreens from '@soundworks/template-helpers/client/render-initialization-screens.js';

import '@ircam/simple-components/sc-text.js';
import '@ircam/simple-components/sc-slider.js';
import '@ircam/simple-components/sc-toggle.js';

class PlayerExperience extends AbstractExperience {
  constructor(client, config, $container) {
    super(client);

    this.config = config;
    this.$container = $container;
    this.rafId = null;

    // require plugins if needed

    renderInitializationScreens(client, config, $container);
  }

  async start() {
    super.start();

    this.globals = await this.client.stateManager.attach('globals');
    this.globals.subscribe(() => this.render());

    window.addEventListener('resize', () => this.render());
    this.render();
  }

  render() {
    // debounce with requestAnimationFrame
    window.cancelAnimationFrame(this.rafId);

    this.rafId = window.requestAnimationFrame(() => {
      const schema = this.globals.getSchema();
      // const values = this.globals.getValues();

      render(html`
        <div style="padding: 20px">
          <h1 style="margin: 20px 0">${this.client.type} [id: ${this.client.id}]</h1>

          <div>
            <h1>Globals</h1>
            <div style="margin-bottom: 4px">
              <sc-text
                value="volume"
                width="100"
                readonly
              ></sc-text>
              <sc-slider
                display-number
                width="300"
                min="${schema.volume.min}"
                max="${schema.volume.max}"
                step="1"
                value="${this.globals.get('volume')}"
                @input=${e => this.globals.set({ volume: e.detail.value })}
              ></sc-slider>
            </div>
            <div style="margin-bottom: 4px">
              <sc-text
                value="mute"
                width="100"
                readonly
              ></sc-text>
              <sc-toggle
                .value="${this.globals.get('mute')}"
                @change=${e => this.globals.set({ mute: e.detail.value })}
              ></sc-toggle>
            </div>
        </div>
      `, this.$container);
    });
  }
}

export default PlayerExperience;
