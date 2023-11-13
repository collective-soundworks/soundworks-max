const path = require('path');
const Max = require('max-api');
const Client = require('@soundworks/core/client/index.js').Client;
const ClientAbstractExperience = require('@soundworks/core/client').AbstractExperience;

const pluginSync = require('@soundworks/plugin-sync/client').default;
const { Scheduler } = require('waves-masters');

Max.addHandlers({
  [Max.MESSAGE_TYPES.BANG]: () => onBang(),
  bootstrap: (maxId, serverIp = '127.0.0.1', port = 8000, verbose = 0) => bootstrap(maxId, serverIp, port, verbose),
  [Max.MESSAGE_TYPES.ALL]: (handled, ...args) => onMessage(...args),
});

const handledMessages = ['bootstrap', 'bang'];

const globals = {
  experience: null,
  verbose: false,
  maxId: null,
  serverIp: null,
  port: null,
  sync: null,
  scheduler: null,
};

// const engine = {
//   advanceTime(currentTime, currentTime, dt) {

//   }
// }

class ClientMaxExperience extends ClientAbstractExperience {
  constructor(...args) {
    super(...args);

    globals.sync = this.require('sync');
  }

  start() {
    super.start();
    Max.outlet('bootstrapped');

    const getTimeFunction = () => globals.sync.getSyncTime();
    globals.scheduler = new Scheduler(getTimeFunction);
  }
}

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

  const startTime = process.hrtime();

  client.pluginManager.register('sync', pluginSync, {
    getTimeFunction: () => {
      const now = process.hrtime(startTime);
      return now[0] + now[1] * 1e-9;
    }
  });

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
};

// -------------------------------------------------------
// HANDLERS
// -------------------------------------------------------


async function onBang() {
  // console.log('@todo bang');
  Max.outlet(globals.sync.getSyncTime());
}

async function onMessage(...args) {
  const cmd = args[0];

  if (handledMessages.includes(cmd)) {
    return;
  }

  if (args[0] == 'list') {
    // args[1] is time
    args.shift();
    const time = args.shift();
    console.log('scheduling event at', time);

    globals.scheduler.defer((currentTime, _, dt) => {
      console.log('scheduler called at', currentTime);
      console.log('event in', dt, 'seconds');

      args.unshift(dt * 1000);
      Max.outlet(args);
    }, time);
  }
}


// -------------------------------------------------------
// HELPERS
// -------------------------------------------------------


// -------------------------------------------------------
// Notify that the script is ready and
// that bootstrap can be called
// -------------------------------------------------------
Max.outletBang();




