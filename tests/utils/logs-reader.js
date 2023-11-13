import fs from 'node:fs';
import os from 'node:os';
import { assert } from 'chai';

export function getLogAsString(logFilename, prefixFilter = 'test') {
  if (!fs.existsSync(logFilename)) {
    assert.fail(`file ${logFilename} should exists`);
    return ``;
  }

  const result = fs.readFileSync(logFilename);
  return result.toString();
}

export function getLogAsArray(logFilename) {
  if (!fs.existsSync(logFilename)) {
    assert.fail(`file ${logFilename} should exists`);
    return [];
  }

  let result = fs.readFileSync(logFilename).toString();
  result = result.split('\n');
  result.pop();

  return result;
}

export function getLogAsNumArray(logFilename, prefixFilter = 'test') {
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
