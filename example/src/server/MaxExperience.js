import { AbstractExperience } from '@soundworks/core/server';

class ServerMaxExperience extends AbstractExperience {
  start() {
    super.start();
    console.log('> server started');
  }

  enter(client) {
    super.enter(client);
    console.log(`client ${client.id} entered`);
  }

  exit(client) {
    console.log(`client ${client.id} exited`);
    super.exit(client);
  }
}

export default ServerMaxExperience;