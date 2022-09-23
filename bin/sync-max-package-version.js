const path = require('path');
const fs = require('fs');
const pkg = require('../package.json');

console.log('syncing package.json version');
const version = pkg.version;

const maxPkgPathname = path.join('max', 'soundworks', 'javascript', 'package.json');
const maxPkgString = fs.readFileSync(maxPkgPathname).toString();
const maxPkg = JSON.parse(maxPkgString);

maxPkg.version = version;

fs.writeFileSync(maxPkgPathname, JSON.stringify(maxPkg, null, 2));
