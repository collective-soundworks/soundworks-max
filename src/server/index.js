import 'source-map-support/register';
import { Server } from '@soundworks/core/server';
import path from 'path';
import serveStatic from 'serve-static';
import compile from 'template-literal';

import PlayerExperience from './PlayerExperience.js';
import ControllerExperience from './ControllerExperience.js';

// import osc from 'osc';

import { Client as OscClient, Server as OscServer } from 'node-osc';

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

    const oscConfig = {
      localAddress: '127.0.0.1',
      localPort: 57121,
      remoteAddress: '127.0.0.1',
      remotePort: 57122,
    };

    class OscStateManager {
      constructor(config, stateManager) {
        this.config = config;
        this.stateManager = stateManager;

        this._listeners = new Map();
      }

      async init() {
        return new Promise((resolve, reject) => {
          this._oscClient = new OscClient(oscConfig.remoteAddress, oscConfig.remotePort);

          this._oscServer = new OscServer(oscConfig.localPort, oscConfig.localAddress, () => {
            console.log('osc server inited');
            resolve();
          });

          this._oscServer.on('message', msg => {
            const [channel, ...args] = msg;
            this._emit(channel, args);
          });

          // subscribe for `attach`
          this._subscribe('/sw/state-manager/attach-request', async (schemaName, stateId) => {
            let state;

            try {
              state = await this.stateManager.attach(schemaName, stateId);
            } catch(err) {
              this._oscClient.send('/sw/state-manager/attach-error', err);
            }

            const { id, remoteId } = state;

            const updateChannel = `/sw/state-manager/${id}/${remoteId}/update-request`;
            const unsubscribeUpdate = this._subscribe(updateChannel, async updates => {
              updates = JSON.parse(updates);
              console.log(`[stateId: ${id} - remoteId: ${remoteId}] received updated request ${updateChannel}`, updates);
              await state.set(updates);
              // @note - let's if we can do something here to handle
              // update-notifications vs. update-response
            });

            const detachChannel = `/sw/state-manager/${id}/${remoteId}/detach-request`;
            const unsubscribeDetach = this._subscribe(updateChannel, async () => {
              unsubscribeUpdate();
              unsubscribeDetach();
              await state.detach();
              // @note - let's if we can do something here to handle
              // update-notifications vs. update-response
            });


            state.subscribe(updates => {
              const channel = `/sw/state-manager/${id}/${remoteId}/update-notification`;
              updates = JSON.stringify(updates);
              console.log(`[stateId: ${id} - remoteId: ${remoteId}] sending update notification ${channel} ${updates}`);
              this._oscClient.send(channel, updates);
            });
            // init state listeners

            const schema = JSON.stringify(state.getSchema());
            const currentValues = JSON.stringify(state.getValues());

            console.log(`[stateId: ${id} - remoteId: ${remoteId}] sending attach response`);
            this._oscClient.send('/sw/state-manager/attach-response', id, remoteId, schema, currentValues);
          });
        });
      }

      _subscribe(channel, callback) {
        if (!this._listeners.has(channel)) {
          this._listeners.set(channel, new Set());
        }

        const listeners = this._listeners.get(channel);
        listeners.add(callback);

        return () => listeners.add(callback);
      }

      _emit(channel, args) {
        if (this._listeners.has(channel)) {
          const listeners = this._listeners.get(channel);
          listeners.forEach(callback => callback(...args));
        }
      }
    }

    const oscStateManager = new OscStateManager(oscConfig, server.stateManager);
    await oscStateManager.init();

  } catch (err) {
    console.error(err.stack);
  }
})();

process.on('unhandledRejection', (reason, p) => {
  console.log(reason);
});
