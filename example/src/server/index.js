import 'source-map-support/register';
import { Server } from '@soundworks/core/server';
import path from 'path';
import fs from 'fs';
import serveStatic from 'serve-static';
import compile from 'template-literal';
import PlayerExperience from './PlayerExperience.js';

// -------------------------------------------------------------------
// 1. import the StateManagerOsc class
// -------------------------------------------------------------------
import { StateManagerOsc } from '@soundworks/state-manager-osc';

import globalsSchema from './schemas/globals.js';

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
// 2. register a schema
// -------------------------------------------------------------------
server.stateManager.registerSchema('globals', globalsSchema);

(async function launch() {
  try {
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

    await server.start();
    playerExperience.start();

    // -------------------------------------------------------------------
    // 3. create a global state from the registered schema
    // -------------------------------------------------------------------
    // const bigData = fs.readFileSync('./data/export.json');

    server.stateManager.registerUpdateHook('globals', updates => {
      if (updates.immediate && updates.immediate === 2) {
        return {
          ...updates,
          immediate: 4,
        };
      }

      // if (updates.loadBigData) {
      //   return {
      //     ...updates,
      //     bigData: JSON.parse(bigData),
      //   };
      // }
    });
    const globals = await server.stateManager.create('globals');

    setTimeout(() => {
      globals.set({ message: null });
    }, 2000);

    // ----------------------------------------------------------
    // 4. configure and init the StateManagerOsc
    // ----------------------------------------------------------
    const oscStateManager = new StateManagerOsc(server.stateManager, {
      localAddress: '0.0.0.0',
      localPort: 57121,
      remoteAddress: '127.0.0.1',
      remotePort: 57122,
    });

    await oscStateManager.init();

  } catch (err) {
    console.error(err.stack);
  }
})();

process.on('unhandledRejection', (reason, p) => {
  console.log(reason);
});
