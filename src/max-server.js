export function configureMaxClient(config, options = {}) {
  if (config.app.clients && 'max' in config.app.clients) {
    throw new Error(`[soundworks:max] a client named Max has already been declared`);
  }

  // just add max client to the config
  if (!config.app.clients) {
    config.app.clients = {};
  }

  config.app.clients.max = { target: 'node' };
}
