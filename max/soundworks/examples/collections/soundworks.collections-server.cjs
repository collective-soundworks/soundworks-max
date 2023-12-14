// soundworks-max default template to launch a soundworks server from Max node.script object
// please put this cjs file and the attached Max patch
// on top of your soundworks file tree

const { fork } = require('child_process');

const child = fork('./.build/server/index.js');

process.on('exit', function() {
  child.kill('SIGTERM');
});

process.on('error', function() {
  child.kill('SIGTERM');
});

process.on('uncaughtException', function() {
  child.kill('SIGTERM');
});

child.on('message', function(message) {
  if (message === 'error') {
    console.log('> node script will stop');
    process.exit();
  }
});
