const Client = require('@soundworks/core/client/index.js').Client;
const ClientAbstractExperience = require('@soundworks/core/client').AbstractExperience;
const maxAPI = require("max-api");
// mixed config for server and client
const config = {
  clientType: 'max',
  env: {
    port: 8000,
    serverIp: '127.0.0.1',
  },
};

const handlers = {
  [maxAPI.MESSAGE_TYPES.BANG]: () => {
    console.log("got a bang");
  },
  [maxAPI.MESSAGE_TYPES.DICT]: (obj) => {
    globals.set(JSON.stringify(obj));
    console.log("got a dict "+JSON.stringify(obj));
  },
  [maxAPI.MESSAGE_TYPES.NUMBER]: (num) => {
  },
  my_message: () => {
    console.log("got my_message");
  },
  my_message_with_args: (arg1, arg2) => {
    console.log("got my arged message: ${arg1}, ${arg2} ");
  },
  //[maxAPI.MESSAGE_TYPES.ALL]: (handled, ...args) => {
  //  console.log("This will be called for ALL messages");
  //  console.log(`The following inlet event was ${!handled ? "not " : "" }handled`);
  //  console.log(args);
  //}
};

maxAPI.addHandlers(handlers);

let schemaName = "globals";

class ClientMaxExperience extends ClientAbstractExperience {
  async start() {
    super.start();
    console.log('> client started');

    //this.client.stateManager.observe((schemaName, stateId, nodeId) => {
    //  console.log(schemaName, stateId, nodeId);
    //});

    const schema = await this.client.stateManager.attach(schemaName);
    try {
      await maxAPI.setDict(schemaName+"_values",schema.getValues());
      // dict contains the dict's contents
    } catch (err) {
      console.log(err);
      console.log("can't set the dictionary");
      // handle Error here
    }
    //console.log(globals.getValues());
    //console.log(globals.get('test'));
    //console.log(globals.getSchema());
    // console.log(globals.getDefaultValues());
    // console.log(globals.getInitValues());



    schema.subscribe(updates => console.log(updates));

    // globals.onDetach(() => {})
    // globals.onDelete(() => {})

    //const result = await schema.set({ test: false });
    //console.log(result);

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
//    const client = new Client();
//    await client.init(config);
//
//    const experience = new ClientMaxExperience(client);
//
//    await client.start();
  });

  client.socket.addListener('error', () => {
    console.log('socket error');
  });

  setInterval(() => {}, 1000);
}());




