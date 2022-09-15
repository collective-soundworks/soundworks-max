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

    const globals = await this.client.stateManager.attach('globals');
    console.log(globals.getValues());
  }
}

(async function() {
  const client = new Client();
  await client.init(config);

  const experience = new ClientMaxExperience(client);

  await client.start();
  experience.start();
}());
