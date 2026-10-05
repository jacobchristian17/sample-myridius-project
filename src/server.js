import http from 'node:http';
import { createApp } from './app.js';
import { TaskStore } from './taskStore.js';

const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const server = http.createServer(createApp(new TaskStore()));

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
