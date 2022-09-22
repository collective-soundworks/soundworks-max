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
	verbose: true,
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
	log(maxId, serverIp, port);
	
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
	if (schemaName === 0) {
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
		const key = args[0];
		const value = _sanitizeInputForNode(key, args[1]);

    try {
		  await globals.state.set({ [key]: value });
    } catch(err) {
      console.log(err);
    }
	} catch(err) {
		log(err);
		console.log("cannot parse message, use dict instead");
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
}

async function _detach() {
  log(`Detaching from ${globals.schemaName}`);
  await globals.state.detach();

  globals.schemaName = null;
  globals.state = null;

  _clearDicts();
}

function _sanitizeInputForNode(key, value) {
  const def = globals.state.getSchema(key);
  let sanitizedValue = null;

  switch (def.type) {
    case 'boolean': {
      sanitizedValue = !!value;
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




