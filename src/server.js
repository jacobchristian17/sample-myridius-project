import http from 'node:http';
import { createApp } from './app.js';
import { TaskStore } from './taskStore.js';

const requestedPort = Number(process.env.PORT);
const port = Number.isInteger(requestedPort) && requestedPort >= 0 ? requestedPort : 3000;
const store = new TaskStore();
const server = http.createServer(createApp(store));

server.listen(port, () => {
  const address = server.address();
  const activePort = typeof address === 'object' && address ? address.port : port;
  console.log(`Server listening on port ${activePort}`);
});
