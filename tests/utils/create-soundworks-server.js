const Server = require('@soundworks/core/server/index.js').Server;
const AbstractExperience = require('@soundworks/core/server').AbstractExperience;
const { closeOscClient } = require('./max-orchestrator.js');

const { StateManagerOsc } = require('../../');
const log = require('../utils/logger.js');


class MaxExperience extends AbstractExperience {
  start() {
    log('> server started');
  }

  enter(client) {
    log(`> client ${client.id} entered`);
    super.enter(client);
  }

  exit(client) {
    log(`> client ${client.id} exited`);
    super.exit(client);
  }
}

module.exports = async function createSoundworksServer(initStateManagerOsc = true) {
  const config = {
    app: {
      name: 'test',
      clients: {
        max: { target: 'node' },
      },
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

  await server.init(config);
  const maxExperience = new MaxExperience(server, 'max');

  await server.start();
  maxExperience.start();

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
