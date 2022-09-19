const path = require('path');
const Max = require('max-api');
const Client = require('@soundworks/core/client/index.js').Client;
const ClientAbstractExperience = require('@soundworks/core/client').AbstractExperience;

Max.addHandlers({
  [Max.MESSAGE_TYPES.BANG]: () => Max.outlet('bang'),
  [Max.MESSAGE_TYPES.DICT]: (obj) => onDict(obj),
  [Max.MESSAGE_TYPES.NUMBER]: (num) => {},
  attach: (arg) => attach(arg),
  bootstrap: (serverIp = '127.0.0.1', port = 8000, schemaName = null) => bootstrap(serverIp, port, schemaName)
});

class ClientMaxExperience extends ClientAbstractExperience {
  async start() {
    super.start();
    console.log('> client started');
  }
}

const globals = {
	experience: null,
	state: null,
	schemaName: null,
};

async function bootstrap(serverIp, port, schemaName) {
	console.log(serverIp, port, schemaName);
	
	const config = {
	  clientType: 'max',
	  env: { port, serverIp },
	};

  const client = new Client();
  await client.init(config);

  const experience = new ClientMaxExperience(client);
  // store experience globally
  globals.experience = experience;
  
  // start client and experience
  await client.start();
  experience.start();

  client.socket.addListener('close', () => {
  	console.log('socket close');
  	_clearDicts();
  });
  client.socket.addListener('error', () => {
  	console.log('socket error');
  	_clearDicts();
  });

  // init schema if it was given as max object argument
  if (schemaName !== null) {
  	attach(schemaName);
  }
};

async function attach(schemaName) {
	console.log(`attaching to ${schemaName}`);


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
			Max.outlet('bang');
  	});

  	state.onDetach(() => _clearDicts());
  	state.onDelete(() => _clearDicts());

  	Max.setDict(`${schemaName}_values`, state.getValues());
  	Max.setDict(`${schemaName}_schema`, state.getSchema());

  	Max.outlet('bang');

  	console.log(`attached to ${schemaName}`);
  } catch (err) {
  	console.log(`can't attach to ${schemaName}`);
  	console.log(err);
  }
}

async function onDict(dict) {
	await globals.state.set(dict);
}

async function _clearDicts() {
	Max.setDict(`${globals.schemaName}_values`, null);  	
	Max.setDict(`${globals.schemaName}_updates`, null);
	Max.outlet('bang');
}


