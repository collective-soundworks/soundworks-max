const assert = require('chai').assert;
const fs = require('fs');
const os = require('os');

module.exports.getLogAsString = function(logFilename, prefixFilter = 'test') {
  if (!fs.existsSync(logFilename)) {
    assert.fail(`file ${logFilename} should exists`);
    return ``;
  }

  const result = fs.readFileSync(logFilename);
  return result.toString();
}

module.exports.getLogAsArray = function(logFilename) {
  if (!fs.existsSync(logFilename)) {
    assert.fail(`file ${logFilename} should exists`);
    return [];
  }

  let result = fs.readFileSync(logFilename).toString();
  result = result.split('\n');
  result.pop();

  return result;
}

module.exports.getLogAsNumArray = function(logFilename, prefixFilter = 'test') {
  if (!fs.existsSync(logFilename)) {
    assert.fail(`file ${logFilename} should exists`);
    return [];
  }

  const result = fs.readFileSync(logFilename);
  let arr = result.toString().split(os.EOL);
  arr.pop(); // remove empty last element due to final eol character
  arr = arr.map(val => parseFloat(val));

  return arr;
}
