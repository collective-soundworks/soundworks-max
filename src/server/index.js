import 'source-map-support/register';
import { Server } from '@soundworks/core/server';
import path from 'path';
import serveStatic from 'serve-static';
import compile from 'template-literal';

import PlayerExperience from './PlayerExperience.js';
import ControllerExperience from './ControllerExperience.js';

import osc from 'osc';

import globalsSchema from './schemas/globals';

import getConfig from './utils/getConfig.js';
const ENV = process.env.ENV || 'default';
const config = getConfig(ENV);
const server = new Server();

// html template and static files (in most case, this should not be modified)
server.templateEngine = { compile };
server.templateDirectory = path.join('.build', 'server', 'tmpl');
server.router.use(serveStatic('public'));
server.router.use('build', serveStatic(path.join('.build', 'public')));
server.router.use('vendors', serveStatic(path.join('.vendors', 'public')));

console.log(`
--------------------------------------------------------
- launching "${config.app.name}" in "${ENV}" environment
- [pid: ${process.pid}]
--------------------------------------------------------
`);

// -------------------------------------------------------------------
// register plugins
// -------------------------------------------------------------------
// server.pluginManager.register(pluginName, pluginFactory, [pluginOptions], [dependencies])

// -------------------------------------------------------------------
// register schemas
// -------------------------------------------------------------------
server.stateManager.registerSchema('globals', globalsSchema);


(async function launch() {
  try {
    // @todo - check how this behaves with a node client...
    await server.init(config, (clientType, config, httpRequest) => {
      return {
        clientType: clientType,
        app: {
          name: config.app.name,
          author: config.app.author,
        },
        env: {
          type: config.env.type,
          websockets: config.env.websockets,
          assetsDomain: config.env.assetsDomain,
        }
      };
    });

    const playerExperience = new PlayerExperience(server, 'player');
    const controllerExperience = new ControllerExperience(server, 'controller');

    const globals = await server.stateManager.create('globals');

    // start all the things
    await server.start();
    playerExperience.start();
    controllerExperience.start();


    const udpPort = new osc.UDPPort({
      localAddress: '127.0.0.1',
      localPort: 57121,
      remoteAddress: '127.0.0.1',
      remotePort: 57122,
    });

    udpPort.on('ready', () => console.log('OSC ready'));
    udpPort.on('error', () => console.log('OSC error'));

    //
    // let localState = null;

    // need to wrap udpPort in a proper PubSub interface
    udpPort.on('message', async oscMsg => {
      console.log('subscribe 1');
      const { address, args } = oscMsg;

      switch (address) {
        case '/sw/state-manager/attach-request': {
          const [schemaName, stateId] = args;
          let localState = null;
          console.log('attach state', schemaName);

          try {
            localState = await server.stateManager.attach(schemaName, stateId);
          } catch(err) {
            udpPort.send({
              address: '/sw/state-manager/attach-error',
              args: [
                {
                  type: 's',
                  value: err,
                },
              ],
            });
            return;
          }

          const { id, remoteId } = localState;
          const schema = localState.getSchema();
          const currentValues = localState.getValues();

          // bing listeners from updates
          // udpPort.on('message', async oscMsg => {
          //   const { address, args } = oscMsg;

          // });

          udpPort.send({
            address: '/sw/state-manager/attach-response',
            args: [
              { type: 'i', value: id },
              { type: 'i', value: remoteId },
              { type: 's', value: schemaName },
              { type: 's', value: JSON.stringify(schema) },
              { type: 's', value: JSON.stringify(currentValues) },
            ],
          });

          // udpPort
          break;
        }
      }
    });

    udpPort.open();

  } catch (err) {
    console.error(err.stack);
  }
})();

process.on('unhandledRejection', (reason, p) => {
  console.log(reason);
});
