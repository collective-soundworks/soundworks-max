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

```sh
npm install --save @soundworks/state-manager-osc
```


### Usage

In the `src/server/index.js` of your application

1. Import the `soundworksMax` object

```js
import { soundworksMax } from '@soundworks/max';
```

2. Init the `soundworksMax` object right after the creation of the soundworks server

```js
const server = new Server();
// pass the soundworks server as argument
soundworksMax.init(server);
```

## Next Steps

- `[soundworks.shared-state.observe]`
- `[soundworks.sync]`

## Caveats

Each `soundworks.shared-state` object creates a new soundworks client, which is 
known suboptimal, but improves user friendliness.

One of our unit test use 25 instances, which work on all systems without problems.  
This test has been run with 100 objects successfully on ARM, but not on Intel.  

## Running the test suite

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

## Acknowledgements

The `soundworks-max` has received support from the Ircam UPI SO(a)P

## License

BSD-3-Clause
