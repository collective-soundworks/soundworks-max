import { AbstractExperience } from '@soundworks/core/server';

class ServerMaxExperience extends AbstractExperience {
  constructor(...args) {
    super(...args);

    this.require('sync');
  }
}

export const soundworksMax = {
  experience: null,

  init(server, options = {}) {
    // add max client to config
    server.addListener('inited', () => {
      if (!server.config.app.clients) {
        server.config.app.clients = {};
      }

      server.config.app.clients.max = { target: 'node' };

      this.experience = new ServerMaxExperience(server, 'max');
    });

    server.addListener('started', async () => {
      await this.experience.start();
    });
  }
}

