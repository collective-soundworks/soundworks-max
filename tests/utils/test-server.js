const Server = require('@soundworks/core/server/index.js').Server;
const { soundworksMax } = require('../../dist/index.js');

// mixed config for server and client
const config = {
  app: {},
  env: {
    type: 'development',
    port: 8000,
    useHttps: false,
  },
};

(async function() {
  const server = new Server();
  soundworksMax.init(server);

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
      nullable: true,
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
    myEnum: {
      type: 'enum',
      list: ['aaa', 'bbb', 'ccc'],
      default: 'aaa',
      nullable: true,
    },
    myArray: {
      type: 'any',
      default: [0, 1, 2, 3, 4],
      filterChange: false,
    },
    myObject: {
      type: 'any',
      default: {
        a: true, // this will be casted to 1 by max, nothing we can really  do here
        b: 1,
        c: 'str',
      },
      filterChange: false,
    },
    myComplexObject: {
      type: 'any',
      default: {
        b: 1,
        c: 'str',
        arr: [1, 2, 3],
      },
      filterChange: false,
    },
    // new options
    myEvent: {
      type: 'boolean',
      default: false,
      event: true,
    },
  });

  const globals = await server.stateManager.create('globals');
  globals.subscribe(updates => console.log(updates));

  await server.start();
}());
