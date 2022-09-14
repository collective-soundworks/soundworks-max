const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const findProcess = require('find-process')
const open = require('open');
const { execSync } = require('child_process');
// const assert = require('chai').assert;

const Server = require('@soundworks/core/server/index.js').Server;
const ServerAbstractExperience = require('@soundworks/core/server').AbstractExperience;

const Client = require('@soundworks/core/client').Client;
const ClientAbstractExperience = require('@soundworks/core/client').AbstractExperience;


const { StateManagerOsc } = require('../../');

config = {
  app: {
    name: 'test-plugin-audio-buffer-loader',
    clients: {}, // we don't have clients here
  },
  env: {
    type: 'development',
    port: 8081,
    serverIp: '127.0.0.1',
    useHttps: false,
  },
};
;

class ServerTestExperience extends ServerAbstractExperience {
  start() { console.log('> server started'); }
}

let server;

(async function() {
  // ---------------------------------------------------
  // START server
  // ---------------------------------------------------
  server = new Server();
  // @note - these two should not be mandatory
  server.templateEngine = { compile: () => {} };
  server.templateDirectory = __dirname;

  server.stateManager.registerSchema('globals', {
    myValue: {
      type: 'integer',
      default: 0,
    },
    killMax: {
      type:'boolean',
      default:false,
      event:true
    }
  });

  await server.init(config);
  // @note - client type should not be mandatory
  const serverTestExperience = new ServerTestExperience(server, 'dummy');

  await server.start();
  serverTestExperience.start();

  const globals = await server.stateManager.create('globals');

  // init osc state manager with default values
  const stateManagerOsc = new StateManagerOsc(server.stateManager, {
    localAddress: '0.0.0.0',
    localPort: 57121,
    remoteAddress: '127.0.0.1',
    remotePort: 57122,
    speedLimit: 20,
  });
  await stateManagerOsc.init();

  const logFile = path.join(__dirname, 'log.txt');
  try {
    fs.unlinkSync(logFile);
  } catch (err) {}
  fs.writeFileSync(logFile, '');

  await new Promise(resolve => setTimeout(resolve, 2 * 1000));

  // ---------------------------------------------------
  // START MAX
  // ---------------------------------------------------

  console.log('open echo.maxpat');
  await open(path.join(__dirname, 'echo.maxpat'));
  await new Promise(resolve => setTimeout(resolve, 5 * 1000));

  // ---------------------------------------------------
  // KILL MAX
  // ---------------------------------------------------

  globals.set({killMax:true});

  await new Promise(resolve => setTimeout(resolve, 1000));

  // ---------------------------------------------------
  // LOG
  // ---------------------------------------------------
  const processesList = await findProcess('name','Max');


  if (processesList.length === 0) {
    console.log("test passed");
  }
  else {
    console.log("test FAILED");
  }

  // ---------------------------------------------------
  // KILL SERVER
  // ---------------------------------------------------
  process.exit();

}());

































