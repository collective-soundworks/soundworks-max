const path = require('path');
const Max = require('max-api');
const Client = require('@soundworks/core/client/index.js').Client;
const ClientAbstractExperience = require('@soundworks/core/client').AbstractExperience;

Max.addHandlers({
  [Max.MESSAGE_TYPES.BANG]: () => onBang(),
  [Max.MESSAGE_TYPES.DICT]: (obj) => onDict(obj),
  [Max.MESSAGE_TYPES.NUMBER]: (num) => {},
  attach: (arg) => attach(arg),
  bootstrap: (maxId, serverIp = '127.0.0.1', port = 8000, verbose = 0) => bootstrap(maxId, serverIp, port, verbose),
  detach: () => _detach(),
  [Max.MESSAGE_TYPES.ALL]: (handled, ...args) => onMessage(...args),
});

const handledMessages = ['attach', 'detach', 'dict', 'bootstrap', 'bang'];

class ClientMaxExperience extends ClientAbstractExperience {
  async start() {
    super.start();
  }
}

const globals = {
	experience: null,
	state: null,
	schemaName: null,
	verbose: false,
	maxId: null,
  serverIp: null,
  port: null,
};

function log(...args) {
	if (globals.verbose) {
		console.log(...args);
	}
}

async function bootstrap(maxId, serverIp, port, verbose) {
	const config = {
	  clientType: 'max',
	  env: { port, serverIp },
	};

  const client = new Client();
  await client.init(config);

  const experience = new ClientMaxExperience(client);
  
  // start client and experience
  await client.start();
  experience.start();

  // store global informations
  globals.experience = experience;
  globals.maxId = maxId;
  globals.serverIp = serverIp;
  globals.port = port;
  globals.verbose = !!verbose;

  log(maxId, serverIp, port, verbose);

  const reboot = async function() {
    try {
      _clearDicts();

      globals.schemaName = null;
      globals.state = null;

      await client.stop();
      await bootstrap(maxId, serverIp, port, verbose);
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

  Max.outlet('bootstrapped');
};

// -------------------------------------------------------
// HANDLERS
// -------------------------------------------------------
async function attach(schemaName) {
	if (schemaName === 0 || schemaName[0] === '@') {
		log(`Invalid schema name, abort`);
		return;
	}

	if (schemaName === globals.schemaName) {
		return;
	} else if (globals.state !== null) {
		_detach();
	}

	log(`Attaching to ${schemaName}`);

	globals.schemaName = schemaName;
	const maxId = globals.maxId;
 
  try {
  	const stateManager = globals.experience.client.stateManager;
  	const state = await stateManager.attach(schemaName);
  	globals.state = state;

  	const dictValues = await Max.getDict(`${maxId}_values`);
  	const dictUpdates = await Max.getDict(`${maxId}_updates`);
  	const dictSchema = await Max.getDict(`${maxId}_schema`);

  	state.subscribe(updates => {
			_updateDict(`${maxId}_updates`, updates);
			Max.outlet('updates');

			_updateDict(`${maxId}_values`, state.getValues());
			Max.outlet('values');

			for (let name in updates) {
				const def = globals.state.getSchema(name);

				if (def.event === true) {
					setImmediate(() => {
						_updateDict(`${maxId}_values`, state.getValues());
						Max.outlet('values');
					});
				}
			}
  	});

  	state.onDetach(() => _clearDicts());
  	state.onDelete(() => _clearDicts());

  	_updateDict(`${maxId}_values`, state.getValues());
  	_updateDict(`${maxId}_schema`, state.getSchema());

  	Max.outlet('schema'); Max.outlet('updates'); Max.outlet('values');

    // Send connected value
    Max.outlet('connect', 1);

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

	_updateDict(`${globals.maxId}_values`, globals.state.getValues());
	Max.outlet('values');
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
  await Max.setDict(`${globals.maxId}_values`,{});
  await Max.setDict(`${globals.maxId}_updates`,{});
  await Max.setDict(`${globals.maxId}_schema`,{});

  Max.outlet('schema'); Max.outlet('updates'); Max.outlet('values');

  // Send disconnected value
  Max.outlet('connect', 0);


}

async function _detach() {
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

async function _updateDict(dictName, obj) {
	// sanitize values for Max if/when needed
	await Max.setDict(dictName, obj);
}

// -------------------------------------------------------
// Notify that the script is ready and
// that bootstrap can be called
// -------------------------------------------------------
Max.outletBang();




