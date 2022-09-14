const fs = require('fs');
const os = require('os');

module.exports = function parseMaxConsole(logFilename, prefixFilter = 'test') {
  const result = fs.readFileSync(logFilename);
  const lines = result.toString().split(os.EOL);
  //
  const logs = lines.reduce((acc, value) => {
    const [key, log] = value.split(':');

    if (key.trim() === prefixFilter) {
      acc += `${log.trim()}\n`;
    }

    return acc;
  }, '');

  return logs;
}
