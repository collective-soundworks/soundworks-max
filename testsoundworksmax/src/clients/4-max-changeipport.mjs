import * as Max from 'max-api';
import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import { loadConfig, launcher } from '@soundworks/helpers/node.js';

Max.outlet(0);

const config = {
  env: {
    type: 'development',
    port: 9999,
    serverAddress: "MacbookPro.local",
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

launcher.register(client);
await client.start();

Max.outlet(1);