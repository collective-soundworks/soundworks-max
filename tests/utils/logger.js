
module.exports = function(...args) {
  if (process.env.VERBOSE == '1') {
    console.log(...args);
  }
}
