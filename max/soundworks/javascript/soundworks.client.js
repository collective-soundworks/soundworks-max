const path = require('path');
const Max = require('max-api');
const Client = require('@soundworks/core/client/index.js').Client;
const ClientAbstractExperience = require('@soundworks/core/client').AbstractExperience;

Max.addHandlers({
  [Max.MESSAGE_TYPES.BANG]: () => Max.outlet('update'),
  [Max.MESSAGE_TYPES.DICT]: (obj) => onDict(obj),
  [Max.MESSAGE_TYPES.NUMBER]: (num) => {},
  attach: (arg) => attach(arg),
  bootstrap: (serverIp = '127.0.0.1', port = 8000) => bootstrap(serverIp, port),
});

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
};

function log(...args) {
	if (globals.verbose) {
		log(...args);
	}
}

async function bootstrap(serverIp, port) {
	log(serverIp, port);
	
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

  Max.outlet('bootstraped');

};

async function attach(schemaName) {
	if (schemaName === 0) {
		log(`invalid schema name, abort`);
		return;
	}

	log(`attaching to ${schemaName}`);

	if (schemaName === globals.schemaName) {
		return;
	} else if (globals.state !== null) {
		await globals.state.detach();
	}

	globals.schemaName = schemaName;
 
  try {
  	const stateManager = globals.experience.client.stateManager;
  	const state = await stateManager.attach(schemaName);
  	globals.state = state;

  	const dictValues = await Max.getDict(`${schemaName}_values`);
  	const dictUpdates = await Max.getDict(`${schemaName}_updates`);
  	const dictSchema = await Max.getDict(`${schemaName}_schema`);

  	state.subscribe(updates => {
  		Max.setDict(`${schemaName}_values`, state.getValues());  	
			Max.setDict(`${schemaName}_updates`, updates);
			Max.outlet('update');
  	});

  	state.onDetach(() => _clearDicts());
  	state.onDelete(() => _clearDicts());

  	Max.setDict(`${schemaName}_values`, state.getValues());
  	Max.setDict(`${schemaName}_schema`, state.getSchema());

  	Max.outlet('init');

  	log(`attached to ${schemaName}`);

  } catch (err) {
  	console.log(err);
  }
}

async function onDict(dict) {
	await globals.state.set(dict);
}

async function _clearDicts() {
	Max.setDict(`${globals.schemaName}_values`, null);  	
	Max.setDict(`${globals.schemaName}_updates`, null);
	Max.setDict(`${globals.schemaName}_schema`, null);
	Max.outlet('clear');
}


