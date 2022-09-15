const fs = require('fs');
const os = require('os');

module.exports.getLogAsString = function(logFilename, prefixFilter = 'test') {
  const result = fs.readFileSync(logFilename);
  return result.toString();
}

module.exports.getLogAsNumArray = function(logFilename, prefixFilter = 'test') {
  const result = fs.readFileSync(logFilename);
  let arr = result.toString().split(os.EOL);
  arr.pop(); // remove empty last element due to final eol character
  arr = arr.map(val => parseFloat(val));

  return arr;
}
