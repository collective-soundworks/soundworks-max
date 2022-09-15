const assert = require('chai').assert;

module.exports = function floatEqual(actual, expected, tolerance) {
  assert.equal(actual.length, expected.length, 'expected arrays to have same length');
  let maxDiff = 0;

  for (let i = 0; i < actual.length; i++) {
    let diff = Math.abs(actual[i] - expected[i]);
    if (diff > maxDiff) {
      maxDiff = diff;
    }
  }
  // second, our type check
  assert.isAtMost(maxDiff, tolerance, `expected max diff to be below ${tolerance}, found ${maxDiff}`);
}

// floatEqual([0.1], [0.2], 1e-1);
// floatEqual([0.1], [0.2], 1e-2);
