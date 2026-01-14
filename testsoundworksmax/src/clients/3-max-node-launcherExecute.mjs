import * as Max from 'max-api';
import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import { loadConfig, launcher } from '@soundworks/helpers/node.js';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

async function bootstrap() {
  const config = {
    env: {
      type: 'development',
      port: 8000,
      serverAddress: '',
      useHttps: false,
      httpsInfos: { cert: null, key: null },
      baseUrl: '',
      auth: { clients: [], login: '', password: '' }
    },
    app: {
      name: 'testsoundworksmax',
      author: ''
    },
    role: 'max'
  }
  const client = new Client(config);

  // Eventually register plugins
  // client.pluginManager.register('my-plugin', plugin);

  // https://soundworks.dev/tools/helpers.html#nodelauncher
  launcher.register(client);

  await client.start();

  Max.post(`Hello ${client.config.app.name}!`);

}

// The launcher allows to launch multiple clients in the same terminal window
// e.g. `EMULATE=10 npm run watch thing` to run 10 clients side-by-side
launcher.execute(bootstrap, {
  numClients: process.env.EMULATE ? parseInt(process.env.EMULATE) : 1,
  moduleURL: import.meta.url,
});
