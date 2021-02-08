# `@sounworks/state-manager-osc`

> Utility to monitor and control soundworks' shared state within Max through OSC

**warning: this component is experimental and may be subbject to changes**

## Table of Contents

<!-- toc -->

## Installation

```sh
npm install --save @sounworks/state-manager-osc
```

## Usage

### Javascript

```js
import { Server } from '@soundworks/core/server';
import { StateManagerOsc } from '@soundworks/state-manager-osc';

// init the soundworks server as usual
const config = getConfig(ENV);
const server = new Server();
await server.init(config, /* ... */);

// register and create a global schema
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
};

server.stateManager.registerSchema('globals', globalsSchema);
const globals = await server.stateManager.create('globals');

// start the server
await server.start();

// initialize the StateManagerOsc component
const oscConfig = { // these are the defaults
  localAddress: '0.0.0.0',
  localPort: 57121,
  remoteAddress: '127.0.0.1',
  remotePort: 57122,
};

const oscStateManager = new StateManagerOsc(server.stateManager, oscConfig);
await oscStateManager.init();
// now you can control and monitor the `globals` state from your Max patch
```

### Max

1. Download the Max abstraction from the release page 
2. Copy the directory into ~/Documents/Max 8/packages
3. Open the Helper patch for more informations

![./resources/max.png](max example)

## License

BSD-3-Clause
