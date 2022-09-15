const Server = require('@soundworks/core/server/index.js').Server;
const ServerAbstractExperience = require('@soundworks/core/server').AbstractExperience;
// mixed config for server and client
const config = {
  app: {
    name: 'test-state-manager',
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


class ServerMaxExperience extends ServerAbstractExperience {
  start() {
    super.start();
    console.log('> server started');
  }

  enter(client) {
    super.enter(client);
    console.log(`client ${client.id} entered`);
  }

  exit(client) {
    console.log(`client ${client.id} exited`);
    super.exit(client);
  }
}

(async function() {
  const server = new Server();
  await server.init(config);

  server.stateManager.registerSchema('globals', {
    test: {
      type: 'boolean',
      default: true,
    }
  });

  const globals = await server.stateManager.create('globals');
  const experience = new ServerMaxExperience(server, 'max');

  await server.start();
  experience.start();

  console.log('globals:', globals.getValues());
}())
