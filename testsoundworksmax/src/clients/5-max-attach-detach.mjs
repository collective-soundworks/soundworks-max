import * as Max from 'max-api';
import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import { loadConfig, launcher } from '@soundworks/helpers/node.js';

Max.addHandlers({
  attach: (schemaName) => attach(schemaName),
  detach: () => detach(),
});

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

async function attach(name) {
  // check if already attached to the same schema
  // detach from previous attached schema

  const collection = await client.stateManager.getCollection(name);

  // register updates
  collection.onUpdate(async (state, updates) => {

    await Max.outlet("collection", collection.getValuesUnsafe());
    await Max.outlet("state", state.getValuesUnsafe());
    await Max.outlet("updates", updates);

  })

  // get schemaDef
  const def = collection.getDescription(name);

  // if there is events in schema def, put 10ms delay to make sure events are not logged by max

  // send values onAttach, onDetact

  // send values now

};

async function detach() {
  // do nothing if there is no attached states

  await collection.detach();

  await Max.outlet('collection', {});
  await Max.outlet('state', {});
  await Max.outlet('updates', {});

}
