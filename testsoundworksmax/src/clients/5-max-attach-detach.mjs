import * as Max from 'max-api';
import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import { loadConfig, launcher } from '@soundworks/helpers/node.js';

Max.addHandlers({
  attach: (schemaName) => attach(schemaName),
  detach: () => detach(),
  getDescription: (param) => getDescription(param),
});

let collection = null;

const config = {
  env: {
    type: 'development',
    port: 8000,
    serverAddress: "",
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

async function getDescription(param) {
  await Max.outlet(await collection.getDescription(param));
}

async function attach(name) {
  // detach from previous attached schema

  if (collection) {
    await collection.detach();
    collection = null;
  }

  collection = await client.stateManager.getCollection(name);

  // register updates
  collection.onUpdate(async (state, updates, values) => {
    await Max.outlet(updates);
  });

};

async function detach() {
  // do nothing if there is no attached states

  if (!collection) {
    return;
  }

  await collection.detach();
  await Max.outlet({});

}
