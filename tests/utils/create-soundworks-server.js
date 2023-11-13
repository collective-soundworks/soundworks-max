import { Server } from '@soundworks/core/server.js';
import { configureMaxClient } from '../../src/max-server.js';

import { closeOscClient } from './max-orchestrator.js';
import log from './logger.js';

export default async function createSoundworksServer() {
  const config = {
    app: {
      name: 'test',
    },
    env: {
      type: 'development',
      port: 8000,
      serverAddress: '127.0.0.1',
      useHttps: false,
      verbose: process.env.VERBOSE === '1' ? true : false,
    },
  };

  configureMaxClient(config);

  const server = new Server(config);

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

if (process.env.MODE === 'debug') {
  createSoundworksServer();
}
