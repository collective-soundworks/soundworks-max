# `@soundworks/max`

> Utility to monitor and control soundworks' shared states within Max

This repository is about a [Max](https://cycling74.com/products/max-features) package tested on Mac.  
Windows version should work but is untested.

## Table of Contents

<!-- toc -->

- [Max](#max)
  * [Install](#install)
  * [Usage](#usage)
- [Running the example](#running-the-example)
- [Javascript](#javascript)
  * [Install](#install-1)
  * [Usage](#usage-1)
- [Next Steps](#next-steps)
- [Caveats](#caveats)
- [Running the test suite](#running-the-test-suite)
- [Acknowledgements](#acknowledgements)
- [License](#license)

<!-- tocstop -->

## Max

### Install

1. Download the Max package (soundworks-max.zip) from the release :  
[https://github.com/collective-soundworks/soundworks-max/releases](https://github.com/collective-soundworks/soundworks-max/releases)
2. Unzip the package and copy the resulting directory in `~/Documents/Max 8/Packages`
3. Open the helper patch for more informations

### Usage

See the overview patch for more informations  
cf. `~/Documents/Max 8/Packages/soundworks/extras/soundworks.maxpat`

## Running the example

1. From the overview click `soundworks.shared-state`  
2. Start the soundworks server by opening the `soundworks.example.server`   
and follow the instructions.

## Javascript

### Install

@TODO rewrite  
```sh
npm install --save @soundworks/soundworks-max
```


### Usage

@TODO rewrite  
In the `src/server/index.js` of your soundworks application:

1. Import the `soundworksMax` object

```js
import { Server } from '@soundworks/core/server.js';
// import the `configureMaxClient` function from the @soundworks/max package
import { configureMaxClient } from '@soundworks/max';

import { loadConfig } from '../utils/load-config.js';

// extends with config object to configure max client
const config = loadConfig(process.env.ENV, import.meta.url);
configureMaxClient(config);

const server = new Server(config);
```

## Next Steps

- `[soundworks.shared-state.observe]`
- `[soundworks.sync]`

## Caveats

Each `soundworks.shared-state` object creates a new soundworks client, which is 
known suboptimal, but improves user friendliness.

One of our unit test use 25 instances, which work on all systems without problems.  
This test has been run with 100 objects successfully on ARM, but not on Intel.  

## Development notes

### Running the test suite

Launching all the tests

```
npm test -- tests/**/*.spec.js
```

Launching only one test file

```
npm test -- tests/the-test/index.spec.js
```

For verbose output

```
VERBOSE=1 npm test -- tests/the-test/index.spec.js
```

### How to open patcher ?

CMD + OPTION + M puis CMD + E puis appuyer sur le bouton

## Credits

[https://soundworks.dev/credits.html](https://soundworks.dev/credits.html)

## License

[BSD-3-Clause](./LICENSE)
