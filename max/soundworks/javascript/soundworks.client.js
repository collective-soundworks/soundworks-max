const path = require('path');
const Max = require('max-api');
const Client = require('@soundworks/core/client/index.js').Client;
const ClientAbstractExperience = require('@soundworks/core/client').AbstractExperience;

Max.addHandlers({
  [Max.MESSAGE_TYPES.BANG]: () => Max.outlet('update'),
  [Max.MESSAGE_TYPES.DICT]: (obj) => onDict(obj),
  [Max.MESSAGE_TYPES.NUMBER]: (num) => {},
  attach: (arg) => attach(arg),
  bootstrap: (maxID, serverIp = '127.0.0.1', port = 8000) => bootstrap(maxID, serverIp, port),
  detach: () => _detach(),
  [Max.MESSAGE_TYPES.ALL]: (handled, ...args) => onMessage(...args),
});

const handledMessages = ['attach', 'detach', 'dict', 'bootstrap', 'bang'];

class ClientMaxExperience extends ClientAbstractExperience {
  async start() {
    super.start();
    log('> client started');
  }
}

const globals = {
	experience: null,
	state: null,
	schemaName: null,
	verbose: false,
	maxID: null,
};

function log(...args) {
	if (globals.verbose) {
		console.log(...args);
	}
}

async function bootstrap(maxID, serverIp, port) {
	log(maxID, serverIp, port);
	
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

  client.socket.addListener('close', () => {
  	log('socket close');
  	_clearDicts();
  });
  client.socket.addListener('error', () => {
  	log('socket error');
  	_clearDicts();
  });

  // store experience globally
  globals.experience = experience;

  globals.maxID = maxID;
  Max.outlet('bootstraped');

};

async function attach(schemaName) {
	if (schemaName === 0) {
		log(`invalid schema name, abort`);
		return;
	}

	if (schemaName === globals.schemaName) {
		return;
	} else if (globals.state !== null) {
		_detach();
		//await globals.state.detach();
	}

	log(`attaching to ${schemaName}`);

	globals.schemaName = schemaName;
	const maxID = globals.maxID;
 
  try {
  	const stateManager = globals.experience.client.stateManager;
  	const state = await stateManager.attach(schemaName);
  	globals.state = state;

  	const dictValues = await Max.getDict(`${maxID}_values`);
  	const dictUpdates = await Max.getDict(`${maxID}_updates`);
  	const dictSchema = await Max.getDict(`${maxID}_schema`);

  	state.subscribe(updates => {
  		console.log(updates);
  		updateDict(`${maxID}_values`, state.getValues());  	
			updateDict(`${maxID}_updates`, updates);
			Max.outlet('update');
  	});

  	state.onDetach(() => _clearDicts());
  	state.onDelete(() => _clearDicts());

  	updateDict(`${maxID}_values`, state.getValues());
  	updateDict(`${maxID}_schema`, state.getSchema());

  	Max.outlet('init');

  	log(`attached to ${schemaName}`);

  } catch (err) {
  	console.log(err);
  }
}

async function onDict(dict) {
	for (let name in dict) {
		dict[name] = sanitizeInputForNode(name, dict[name]);
	}

	await globals.state.set(dict);
}

async function _clearDicts() {
	Max.setDict(`${globals.maxID}_values`,{});  	
	Max.setDict(`${globals.maxID}_updates`,{});
	Max.setDict(`${globals.maxID}_schema`,{});
	Max.outlet('clear');
}

async function _detach() {
	//@TODO detach request to the server did not seem to work
	log(`detaching from ${globals.schemaName}`);
	await globals.state.detach();
	globals.schemaName = null;
	globals.state = null;
	_clearDicts();
}

function sanitizeInputForNode(key, value) {
	const def = globals.state.getSchema(key);
	let sanitizedValue = null;

	// if (value === 'null' && def.nullable) {
	// 	return null;
	// }

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

function sanitizeInputForMax(key, value) {
	const def = globals.state.getSchema(key);
	let sanitizedValue = null;

	if (value === null && def.nullable) {
		return 'null';
	}

	return sanitizedValue;
}

async function onMessage(...args) {
	const cmd = args[0];
	if (handledMessages.includes(cmd)) {
		return;
	}

	try {
		const key = args[0];
		const value = sanitizeInputForNode(key, args[1]);

		await globals.state.set({ [key]: value });
	} catch(err) {
		log(err);
		console.log("cannot parse message, use dict instead");
	}

}

async function updateDict(dictName, obj) {
	for (let name in obj) {
		//obj[name] = sanitizeInputForMax(name, obj[name]);
	}

	Max.setDict(dictName, obj);
} 







