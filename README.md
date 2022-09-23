# `@soundworks/max`

> Utility to monitor and control soundworks' shared states within Max

<!-- _**Warning**: this component is experimental and will probably be subject to changes_ -->

This repository is about a [Max](https://cycling74.com/products/max-features) package tested on Mac.  
Windows version should work but is untested.

## Table of Contents

<!-- toc -->

- [Max](#max)
  * [Installation](#installation)
  * [Usage](#usage)
- [Running the example](#running-the-example)
- [Javascript](#javascript)
  * [NPM](#npm)
- [Caveats](#caveats)
- [Running the tests](#running-the-tests)
- [License](#license)

<!-- tocstop -->

## Max

### Installation

1. Download the Max package (soundworks-max.zip) from the release :  
[https://github.com/collective-soundworks/soundworks-max/releases](https://github.com/collective-soundworks/soundworks-max/releases)
2. Unzip the package and copy the resulting directory in `~/Documents/Max 8/Packages`
3. Open the helper patch for more informations

### Usage

See the overview patch for more informations  
cf. `~/Documents/Max 8/Packages/soundworks/extras/soundworks.maxpat`

## Running the example

1. From the overview click `soundworks.shared-state`. 
2. Start the soundworks server by opening the `soundworks.example.server`   
and follow the instructions.

## Javascript
### NPM

```sh
npm install --save @soundworks/state-manager-osc
```


## Caveats
Each `soundworks.shared-state` object will create a new soundworks client,   
which is known as being suboptimal, but improve user friendliness.  
Our unit tests uses 25 instances, which work on all systems without problems.  
We run the test with 100 objects successfully on ARM, but we've got some problems on Intel.  

## Running the tests

Launching all the tests

```
npm test -- tests/**/*.spec.js
```

Launching one test file

```
npm test -- tests/the-test/index.spec.js
```

For verbose output

```
VERBOSE=1 npm test -- tests/the-test/index.spec.js
```


## License

BSD-3-Clause
