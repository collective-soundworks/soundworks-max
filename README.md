# soundworks | max

Utility to monitor and control soundworks' shared states within [Max](https://cycling74.com/products/max-features).

_Note that this repository has been tested on Mac only, Windows version should work but is untested._

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

```sh
npm install --save @soundworks/max
```

### Usage

In the `src/server/index.js` of your soundworks application:

1. Import the `soundworksMax` object

```js
import { Server } from '@soundworks/core/server.js';
// 1. Import the `configureMaxClient` function from the @soundworks/max package
import { configureMaxClient } from '@soundworks/max';
import { loadConfig } from '../utils/load-config.js';

// 2. Configure max client
const config = loadConfig(process.env.ENV, import.meta.url);
configureMaxClient(config);

const server = new Server(config);
```

## Caveats

Each `soundworks.shared-state` object creates a new soundworks client, which is 
known suboptimal, but improves user friendliness.

One of our unit test use 25 instances, which work on all systems without issues.  
This test has been run with 100 objects successfully on ARM, but not on Intel.  

## Development notes

### Link Max package into `Documents/Max 8/Packages`

```sh
ln -s .path/to/soundworks-max/max/soundworks ~/Documents/Max\ 8/Packages
```

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

`CMD + OPTION + M` then `CMD + E` then click on the button

## Credits

[https://soundworks.dev/credits.html](https://soundworks.dev/credits.html)

## License

[BSD-3-Clause](./LICENSE)
