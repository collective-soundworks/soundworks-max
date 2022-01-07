// make sure huge data set are send from js
import fs from 'fs';
import path from 'path';
import { Client as OscClient, Server as OscServer } from 'node-osc';

const address = '127.0.0.1';
const port = 57122;

const oscClient = new OscClient(address, port);
// oscClient._sock.setSendBufferSize();
console.log(oscClient._sock.getSendBufferSize())

const oscServer = new OscServer(port, address, () => {
  // allow Max to resend its observe requests when node wakes up
  console.log('listening:', address, port);

  oscClient.send('/data', 1);
  const bigData = fs.readFileSync(path.join(process.cwd(), 'example', 'data', 'export.json'));

  console.log(Buffer.byteLength(bigData, 'utf8'))
  // console.log('sending data', bigData.toString());
  oscClient.send('/data', bigData.toString(), err => {
    console.log('send error');
    console.log(err);
  });
});

oscServer.on('message', (msg, rinfo) => {
  console.log('received data');
  console.log(msg, rinfo);
});

oscServer.on('error', (err, rinfo) => {
  console.log('err');
  console.log(err, rinfo);
});

oscServer.on('bundle', (msg, rinfo) => {
  console.log('received data');
  console.log(msg, rinfo);
});
