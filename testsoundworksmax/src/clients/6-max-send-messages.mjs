import * as Max from 'max-api';
import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import { loadConfig, launcher } from '@soundworks/helpers/node.js';

// create a lib with this function
import nodeSanitizeInput from '../../../src/nodeSanitizeInput.js';

Max.addHandlers({
  [Max.MESSAGE_TYPES.DICT]: (obj) => onDict(obj),
  [Max.MESSAGE_TYPES.ALL]: (handled, ...args) => onMessage(...args),
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

const collection = await client.stateManager.getCollection('global');
collection.onUpdate(async (state, updates, values) => {
  await Max.outlet(updates);
});

async function onMessage(...args) {

  if (args[0] === "dict") {
    return;
  }

  const key = args.shift();

  const def = collection.getDescription(key);

  const value = nodeSanitizeInput(key, def, ...args);

  try {
    await collection.set({ [key]: value });
  } catch(err) {
    console.log(err.message);
  }
}

async function onDict(dict) {
  // check for ARRAYs ?

  // sanitize each entry of dict
  for (let name in dict) {
    const def = collection.getDescription(name);
    dict[name] = nodeSanitizeInput(name, def, dict[name]);
  }

  console.log(dict);
  await collection.set(dict);

}
