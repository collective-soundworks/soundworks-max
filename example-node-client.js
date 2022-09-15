const Client = require('@soundworks/core/client/index.js').Client;
const ClientAbstractExperience = require('@soundworks/core/client').AbstractExperience;
// mixed config for server and client
const config = {
  clientType: 'max',
  env: {
    port: 8000,
    serverIp: '127.0.0.1',
  },
};

class ClientMaxExperience extends ClientAbstractExperience {
  async start() {
    super.start();
    console.log('> client started');

    this.client.stateManager.observe((schemaName, stateId, nodeId) => {
      console.log(schemaName, stateId, nodeId);
    });

    const globals = await this.client.stateManager.attach('globals');
    console.log(globals.getValues());
    console.log(globals.get('test'));
    console.log(globals.getSchema());
    // console.log(globals.getDefaultValues());
    // console.log(globals.getInitValues());

    globals.subscribe(updates => console.log(updates));

    // globals.onDetach(() => {})
    // globals.onDelete(() => {})

    const result = await globals.set({ test: false });
    console.log(result);

    // await globals.detach();
  }
}

(async function() {
  const client = new Client();
  await client.init(config);

  const experience = new ClientMaxExperience(client);

  await client.start();
  experience.start();

  client.socket.addListener('close', async () => {
    console.log('socket closed');
    // const client = new Client();
    // await client.init(config);

    // const experience = new ClientMaxExperience(client);

    // await client.start();
  });

  client.socket.addListener('error', () => {
    console.log('socket error');
  });

  setInterval(() => {}, 1000);
}());
