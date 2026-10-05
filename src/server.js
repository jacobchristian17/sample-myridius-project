import http from 'node:http';
import { createApp } from './app.js';
import { TaskStore } from './taskStore.js';

const port = Number(process.env.PORT) || 3000;
const store = new TaskStore();
const server = http.createServer(createApp(store));

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
