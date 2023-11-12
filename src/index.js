import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';

import path from 'node:path';
import Max from 'max-api';

const globals = {
  stateManager: null,
  state: null,
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
  debug: (verbose) => globals.verbose = !!verbose,
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
  /**
   * Load configuration from config files and create the soundworks client
   */
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
  };

  config.role = 'max';

  const client = new Client(config);

  /**
   * Register some soundworks plugins, you will need to install the plugins
   * before hand (run `npx soundworks` for help)
   */
  // client.pluginManager.register('my-plugin', plugin);

  /**
   * Register the soundworks client into the launcher
   *
   * Automatically restarts the process when the socket closes or when an
   * uncaught error occurs in the program.
   */

  /**
   * Launch application
   */
  await client.start();

    // store global informations
  globals.client = client;

  const reboot = async function() {
    try {
      _clearDicts();

      globals.schemaName = null;
      globals.state = null;

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

  Max.post(`> soundworks client is ready!`);
  globals.ready = true;

}


// -------------------------------------------------------
// HANDLERS
// -------------------------------------------------------
async function attach(schemaName) {

  if (schemaName === globals.schemaName) {
    return;
  } else if (globals.state !== null) {
    _detach();
  }

  log(`Attaching to ${schemaName}`);

  globals.schemaName = schemaName;
  const maxId = globals.maxId;

  try {
    const stateManager = globals.client.stateManager;
    const state = await stateManager.attach(schemaName);
    globals.state = state;

    // const dictValues = await Max.getDict(`${maxId}_values`);
    // const dictUpdates = await Max.getDict(`${maxId}_updates`);
    // const dictSchema = await Max.getDict(`${maxId}_schema`);

    state.onUpdate(updates => {
      Max.outlet("updates", updates);
      Max.outlet("values", state.getValues());

      for (let name in updates) {
        const def = globals.state.getSchema(name);

        if (def.event === true) {
          setTimeout(() => {
            Max.outlet("values", state.getValues());
          }, 10);
        }
      }
    });

    state.onDetach(() => _clearDicts());
    state.onDelete(() => _clearDicts());

    // Send connected value
    Max.outlet('connect', 1);
    Max.outlet("schema", state.getSchema());
    Max.outlet("values", state.getValues());
    Max.outlet("updates", {});

    log(`attached to ${schemaName}`);
  } catch (err) {
    console.log(err);
  }
}

async function onDict(dict) {
  if (globals.state === null) {
    return;
  }

  for (let name in dict) {
    dict[name] = _sanitizeInputForNode(name, dict[name]);
  }

  try {
    await globals.state.set(dict);
  } catch(err) {
    console.log(err);
  }
}

async function onBang() {
  if (globals.state === null) {
    return;
  }

  Max.outlet("values",globals.state.getValues());
}

async function onSchema() {
  if (globals.state === null) {
    return;
  }

  Max.outlet("schema",globals.state.getSchema());
}

async function onMessage(...args) {
  if (globals.state === null) {
    return;
  }

  const cmd = args[0];

  if (handledMessages.includes(cmd)) {
    return;
  }

  try {
    // @note - we must accept a list, because array are translated to lists by max
    const key = args.shift();
    const value = _sanitizeInputForNode(key, ...args);

    try {
      await globals.state.set({ [key]: value });
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
async function _clearDicts() {
  // Send disconnected value
  Max.outlet('connect', 0);
  Max.outlet("schema", {});
  Max.outlet("values", {});
  Max.outlet("updates", {});
}

async function _detach() {
  if (!globals.state) {
    log('cannot detach - not attached');
    return;
  }

  log(`Detaching from ${globals.schemaName}`);

  await globals.state.detach();

  globals.schemaName = null;
  globals.state = null;

  _clearDicts();
}

function _sanitizeInputForNode(key, ...value) {
  if (value.length === 1) {
    value = value[0];
  }

  let def;

  try {
    def = globals.state.getSchema(key);
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

