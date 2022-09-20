const Server = require('@soundworks/core/server/index.js').Server;
const AbstractExperience = require('@soundworks/core/server').AbstractExperience;
const { closeOscClient } = require('./max-orchestrator.js');

const { StateManagerOsc } = require('../../');


class MaxExperience extends AbstractExperience {
  start() { console.log('> server started'); };
  exit(client) {
    console.log(`> client ${client.id} exited`);
    super.exit(client);
  };
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
    },
  };

  const server = new Server();

  await server.init(config);
  const maxExperience = new MaxExperience(server, 'max');

  await server.start();
  maxExperience.start();


  const oldClose = server.stop.bind(server);

    server.stop = async () => {
      closeOscClient();
      await oldClose();
    }

  return server;
}
