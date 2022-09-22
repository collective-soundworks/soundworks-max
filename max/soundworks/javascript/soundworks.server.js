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
    },
    myInt: {
      type: 'integer',
      min: -Infinity,
      max: Infinity,
      default: 0,
    },
    myBool: {
      type: 'boolean',
      default: false,
    },
    myFloat: {
      type: 'float',
      min: -Infinity,
      max: Infinity,
      step: 0.001,
      default: 0.5,
    },
    myInfFloat: {
      type: 'float',
      min: -Infinity,
      max: Infinity,
      step: 0.001,
      default: 0,
    },
    myMessage: {
      type: 'string',
      default: 'my-message',
      nullable: true,
    },
    // new options
    myEvent: {
      type: 'boolean',
      default: false,
      event: true,
    },
  });

  const globals = await server.stateManager.create('globals');

  const experience = new ServerMaxExperience(server, 'max');

  await server.start();
  experience.start();

  globals.subscribe(updates => console.log(updates));
}());
