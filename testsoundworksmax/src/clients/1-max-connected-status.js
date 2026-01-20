import * as Max from 'max-api';
import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import { loadConfig, launcher } from '@soundworks/helpers/node.js';

// process.
// const ENV = 
const config = loadConfig('../../my-app/config/env-prod.yaml');

Max.outlet(0);

// const config = {
//   env: {
//     type: 'development',
//     port: 8000,
//     serverAddress: '',
//     useHttps: false,
//     httpsInfos: { cert: null, key: null },
//     baseUrl: '',
//     auth: { clients: [], login: '', password: '' }
//   },
//   app: {
//     name: 'testsoundworksmax',
//     author: ''
//   },
//   role: 'max'
// }

const client = new Client(config);

launcher.register(client);
await client.start();

Max.outlet(1);


