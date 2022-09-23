import 'source-map-support/register';
import { Server } from '@soundworks/core/server';
import path from 'path';
import fs from 'fs';
import serveStatic from 'serve-static';
import compile from 'template-literal';
import PlayerExperience from './PlayerExperience.js';

// -------------------------------------------------------------------
// 1. import the soundworksMax object
// -------------------------------------------------------------------
import { soundworksMax } from '@soundworks/max';

import globalsSchema from './schemas/globals.js';

import getConfig from './utils/getConfig.js';
const ENV = process.env.ENV || 'default';
const config = getConfig(ENV);
const server = new Server();

// -------------------------------------------------------------------
// 2. init soundworks for Max
// -------------------------------------------------------------------
soundworksMax.init(server);

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

    const globals = await server.stateManager.create('globals');
  } catch (err) {
    console.error(err.stack);
  }
})();

process.on('unhandledRejection', (reason, p) => {
  console.log(reason);
});
