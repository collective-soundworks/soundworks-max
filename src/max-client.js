import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import { isPlainObject } from '@ircam/sc-utils';

import path from 'node:path';
import Max from 'max-api';

const globals = {
  collection: null,
  schemaName: null,
  verbose: false,
  maxId: null,
  serverIp: null,
  port: null,
  attachRequest: null,
  ready: false,
};

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

Max.addHandlers({
  [Max.MESSAGE_TYPES.BANG]: () => onBang(),
  [Max.MESSAGE_TYPES.DICT]: (obj) => onDict(obj),
  [Max.MESSAGE_TYPES.NUMBER]: (num) => {},
  attach: (schemaName) => attachRequest(schemaName),
  detach: () => _detach(),
  debug: (verbose) => onDebug(verbose),
  port: (port) => globals.port = port,
  ip: (serverIp) => globals.serverIp = serverIp,
  maxId: (maxId) => globals.maxId = maxId,
  done: () => bootstrap(),
  schema: () => onSchema(),
  [Max.MESSAGE_TYPES.ALL]: (handled, ...args) => onMessage(...args),
});

const handledMessages = ['attach', 'detach', 'dict', 'debug', 'bang', 'port', 'ip', 'maxId', 'done', 'schema'];

function log(...args) {
  if (globals.verbose) {
    console.log(...args);
  }
}

function attachRequest(schemaName) {
  globals.attachRequest = schemaName;

  if (globals.ready) {
    attach(globals.attachRequest);
  } else {
    log("server is not ready - cannot attach");
  }
}

async function bootstrap() {
  try {
    log(`maxID : ${globals.maxId} || serverIp : ${globals.serverIp} || port : ${globals.port} || verbose : ${globals.verbose}`);
  } catch(err) {
    console.log(err);
  }

  const config = {
    "env": {
      "type": "development",
      "port": globals.port,
      "useHttps": false,
      "serverAddress": globals.serverIp
    },
    "app": {
      "name": "soundworks-max",
      "author": "",
      "clients": {
        "max": {
          "target": "node"
        }
      }
    },
    role: 'max',
  };

  const client = new Client(config);
  await client.start();

    // store global informations
  globals.client = client;

  const reboot = async function() {
    try {
      _clearDicts();

      globals.schemaName = null;
      globals.collection = null;

      await client.stop();
      await bootstrap();
    } catch(err) { console.log(err) }
  }

  client.socket.addListener('close', async () => {
    log('socket close');
    await reboot();
  });

  client.socket.addListener('error', async () => {
    log('socket error');
    await reboot();
  });

  if (globals.attachRequest !== null) {
    attach(globals.attachRequest);
  }

  // Max.post(`> soundworks client is ready!`);
  globals.ready = true;

}

// "values" output
// {[schemaName] : [{ values1 },  { values2 }, ]}
// "schema" output
// {[schemaName] : [{ schema1 },  { schema2 }, ]}
// "updates" output
// {[schemaName] : [{ updates1 },  { updates2 }, ]}

// -------------------------------------------------------
// HANDLERS
// -------------------------------------------------------
async function attach(schemaName) {

  if (schemaName === globals.schemaName) {
    return;
  } else if (globals.collection !== null) {
    _detach();
  }

  log(`Attaching to ${schemaName}`);

  globals.schemaName = schemaName;
  const maxId = globals.maxId;

  try {
    const collection = await globals.client.stateManager.getCollection(schemaName);
    globals.collection = collection;

    collection.onUpdate((state, updates) => {

      Max.outlet("collection", collection.getValues());
      Max.outlet("state", state.getValues());
      Max.outlet("updates", updates);

      let hasEvent = false;

      for (let name in updates) {
        const def = collection.getSchema(name);

        if (def.event === true) {
          hasEvent = true;
          updates[name] = null;
        }
      }

      if (hasEvent) {
        setTimeout(() => {
          Max.outlet("collection", collection.getValues());
          Max.outlet("state", state.getValues());
          Max.outlet("updates", updates);
        }, 10);
      }
    });

    collection.onAttach(state => {
      Max.outlet("collection", collection.getValues());
      Max.outlet("state", state.getValues());
      Max.outlet("updates", {});
    });

    collection.onDetach(state => {
      Max.outlet("collection", collection.getValues());
      Max.outlet("state", {});
      Max.outlet("updates", {});
    });

    // Send connected value
    Max.outlet("connect", 1);
    Max.outlet("schema", collection.getSchema());
    Max.outlet("collection", collection.getValues());
    Max.outlet("state", {});
    Max.outlet("updates", {});

    log(`attached to ${schemaName}`);
  } catch (err) {
    console.log(err);
  }
}

async function onDict(dict) {
  if (globals.collection === null) {
    return;
  }

  if ("array" in dict) {
    // we are passing an array
    onArray(dict.array);
  } else {
    // we are passing a dict
    for (let name in dict) {
      dict[name] = _sanitizeInputForNode(name, dict[name]);
    }

    try {
      await globals.collection.set(dict);
    } catch(err) {
      console.log(err);
    }
  }
}

async function onArray(array) {
  array.forEach((values, index) => {
    for (let name in values) {
      values[name] = _sanitizeInputForNode(name, values[name]);
    }
  })

  globals.collection.forEach(async (state, index) => {
    if (isPlainObject(array[index])) {
      try {
        await state.set(array[index]);
      } catch(err) {
        console.log(err);
      }
    }
  })
}

function onDebug(verbose) {
  globals.verbose = !!verbose;
  Max.outlet("debug", globals.verbose);
}

function onBang() {
  if (globals.collection === null) {
    return;
  }

  Max.outlet("collection",globals.collection.getValues());
}

function onSchema() {
  if (globals.state === null) {
    return;
  }

  Max.outlet("schema",globals.collection.getSchema());
}

async function onMessage(...args) {
  if (globals.collection === null) {
    return;
  }

  const cmd = args[0];

  if (handledMessages.includes(cmd)) {
    return;
  }

  try {
    // @note - we must accept a list, because array are translated to lists by max
    // @note - messages inputs update all the collection with the current value
    const key = args.shift();
    const value = _sanitizeInputForNode(key, ...args);

    try {
      await globals.collection.set({ [key]: value });
    } catch(err) {
      console.log(err.message);
    }
  } catch(err) {
    console.error(err.message);
  }

}

// -------------------------------------------------------
// HELPERS
// -------------------------------------------------------
function _clearDicts() {
  // Send disconnected value
  Max.outlet('connect', 0);
  Max.outlet('schema', {});
  Max.outlet('collection', {});
  Max.outlet('state', {});
  Max.outlet('updates', {});
}

async function _detach() {
  if (!globals.state) {
    log('cannot detach - not attached');
    return;
  }

  log(`Detaching from ${globals.schemaName}`);

  await globals.collection.detach();

  globals.schemaName = null;
  globals.collection = null;

  _clearDicts();
}

function _sanitizeInputForNode(key, ...value) {
  if (value.length === 1) {
    value = value[0];
  }

  let def;

  try {
    def = globals.collection.getSchema(key);
  } catch(err) {
    throw new Error(`Unknown param ${key}`);
  }

  let sanitizedValue = null;

  // parse max null
  if (value === 'null') {
    value = null;
  }

  switch (def.type) {
    case 'boolean': {
      if (value === 1) {
        sanitizedValue = true;
      } else if (value == 0) {
        sanitizedValue = false;
      } else if (def.nullable && value === null) {
        sanitizedValue = value;
      } else {
        throw new Error(`Invalid value ${value} for param ${key} - type: boolean`);
      }
      break;
    }
    case 'integer': {
      if (Number.isInteger(value)) {
        sanitizedValue = value;
      } else if (def.nullable && value === null) {
        sanitizedValue = value;
      } else {
        throw new Error(`Invalid value ${value} for param ${key} - type: integer`);
      }

      break;
    }
    case 'float': {
      if (Number.isFinite(value)) {
        sanitizedValue = value;
      } else if (def.nullable && value === null) {
        sanitizedValue = value;
      } else {
        throw new Error(`Invalid value ${value} for param ${key} - type: float`);
      }
      break;
    }
    case 'string': {
      if (typeof value === 'string' || value instanceof String) {
        sanitizedValue = value;
      } else if (def.nullable && value === null) {
        sanitizedValue = value;
      } else {
        throw new Error(`Invalid value ${value} for param ${key} - type: string`);
      }
      break;
    }
    case 'enum': {
      let { list } = def;

      if (list.indexOf(value) !== -1) {
        sanitizedValue = value;
      } else if (def.nullable && value === null) {
        sanitizedValue = value;
      } else {
        throw new Error(`Invalid value ${value} for param ${key} - type: enum`);
      }
      break;
    }
    case 'any': {
      if (!def.nullable && value === null) {
        throw new Error(`Invalid value ${value} for param ${key} - type: any`);
      } else {
        sanitizedValue = value;
      }
      break;
    }
    default: {
      sanitizedValue = value;
      break;
    }
  }

  if (def.nullable === false && sanitizedValue === null) {
    throw new Error(`Failed to sanitize ${value} to ${def.type}`);
  }

  return sanitizedValue;
}

// -------------------------------------------------------
// Notify that the script is ready and
// that bootstrap can be called
// -------------------------------------------------------
Max.outletBang();
