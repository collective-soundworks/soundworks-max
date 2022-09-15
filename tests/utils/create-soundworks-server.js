const Server = require('@soundworks/core/server/index.js').Server;
const ServerAbstractExperience = require('@soundworks/core/server').AbstractExperience;
const { closeOscClient } = require('./max-orchestrator.js');

const { StateManagerOsc } = require('../../');


class ServerTestExperience extends ServerAbstractExperience {
  start() { console.log('> server started'); }
}

module.exports = async function createSoundworksServer(initStateManagerOsc = true) {
  const config = {
    app: {
      name: 'test',
      clients: {}, // we don't have clients here
    },
    env: {
      type: 'development',
      port: 8081,
      serverIp: '127.0.0.1',
      useHttps: false,
    },
  };

  const server = new Server();

  await server.init(config);
  // @note - client type should not be mandatory
  const serverTestExperience = new ServerTestExperience(server, []);

  await server.start();
  serverTestExperience.start();

  server.stateManager.registerSchema('testSuite', {
    closePatch: {
      type: 'boolean',
      default: false,
      event: true,
    },
    killMax: {
      type: 'boolean',
      default: false,
      event: true,
    },
  });

  server.testSuite = await server.stateManager.create('testSuite');

  if (initStateManagerOsc === true) {
    // init osc state manager with default values
    const stateManagerOsc = new StateManagerOsc(server.stateManager, {
      localAddress: '0.0.0.0',
      localPort: 57121,
      remoteAddress: '127.0.0.1',
      remotePort: 57122,
      speedLimit: 20,
    });

    await stateManagerOsc.start();

    const oldClose = server.stop.bind(server);

    server.stop = async () => {
      console.log('> closing server');
      closeOscClient();
      await stateManagerOsc.stop();
      await oldClose();
    }
  }

  return server;
}
