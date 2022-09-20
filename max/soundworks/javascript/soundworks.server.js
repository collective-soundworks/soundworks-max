const Server = require('@soundworks/core/server/index.js').Server;
const ServerAbstractExperience = require('@soundworks/core/server').AbstractExperience;
// mixed config for server and client
const config = {
  app: {
    clients: {
      max: { target: 'node' },
    },
  },
  env: {
    type: 'development',
    port: 8000,
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
      type: 'float',
      min: -Infinity,
      max: Infinity,
      default: 10,
    }
  });

  const globals = await server.stateManager.create('globals');
  console.log(globals.getSchema());

  const experience = new ServerMaxExperience(server, 'max');

  await server.start();
  experience.start();

  globals.subscribe(updates => console.log(updates));

  console.log('globals:', globals.getValues());
}())
