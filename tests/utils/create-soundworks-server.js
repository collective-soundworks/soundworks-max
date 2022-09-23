const Server = require('@soundworks/core/server/index.js').Server;
const AbstractExperience = require('@soundworks/core/server').AbstractExperience;
const { closeOscClient } = require('./max-orchestrator.js');
const { soundworksMax } = require('../../dist/index.js');


const { StateManagerOsc } = require('../../');
const log = require('../utils/logger.js');

module.exports = async function createSoundworksServer(initStateManagerOsc = true) {
  const config = {
    app: {
      name: 'test',
    },
    env: {
      type: 'development',
      port: 8000,
      serverIp: '127.0.0.1',
      useHttps: false,
      verbose: process.env.VERBOSE === '1' ? true : false,
    },
  };

  const server = new Server();
  soundworksMax.init(server);

  await server.init(config);

  await server.start();

  const oldClose = server.stop.bind(server);

  // override stop to close orchestrator OSC connection by default
  server.stop = async (keepOsc = false) => {
    log('> closing server');

    if (keepOsc === false) {
      closeOscClient();
    }

    await oldClose();
    return new Promise(resolve => setTimeout(resolve, 500));
  }

  return server;
}
