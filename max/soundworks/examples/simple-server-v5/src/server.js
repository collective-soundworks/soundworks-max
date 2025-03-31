import '@soundworks/helpers/polyfills.js';
import '@soundworks/helpers/catch-unhandled-errors.js';
import { Server } from '@soundworks/core/server.js';
import { loadConfig, configureHttpRouter } from '@soundworks/helpers/server.js';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

const config = loadConfig(process.env.ENV, import.meta.url);

console.log(`
--------------------------------------------------------
- launching "${config.app.name}" in "${process.env.ENV || 'default'}" environment
- [pid: ${process.pid}]
--------------------------------------------------------
`);

const server = new Server(config);
configureHttpRouter(server);

// Register plugins and create shared state classes
// server.pluginManager.register('my-plugin', plugin);
// server.stateManager.defineClass('my-class', description);

await server.start();

// and do your own stuff!

const globalsSchema = {
  volume: {
    type: 'integer',
    min: -80,
    max: 6,
    default: 0,
  },
  mute: {
    type: 'boolean',
    default: false,
  },
  gain: {
    type: 'float',
    min: 0,
    max: 1,
    step: 0.001,
    default: 0.5,
  },
  message: {
    type: 'string',
    default: 'my-message',
    nullable: true,
  },
  config: {
    type: 'any',
    default: { a: 1, b: true },
  },
  // new options
  event: {
    type: 'boolean',
    event: true,
  },
  noFilterChange: {
    type: 'boolean',
    default: true,
    filterChange: false,
  },
  immediate: {
    type: 'integer',
    default: 0,
    immediate: true,
  },
  // //
  // loadBigData: {
  //   type: 'boolean',
  //   default: true,
  //   event: true,
  // },
  // bigData: {
  //   type: 'any',
  //   default: null,
  //   nullable: true,
  //   filterChange: false,
  // },
};

server.stateManager.registerSchema('globals', globalsSchema);

const globals = await server.stateManager.create('globals');
