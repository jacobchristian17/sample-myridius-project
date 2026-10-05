import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../src/app.js';
import { TaskStore } from '../src/taskStore.js';

let server;
let baseUrl;

before(async () => {
  server = http.createServer(createApp(new TaskStore()));

  await new Promise((resolve) => {
    server.listen(0, resolve);
  });

  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
});

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const text = await response.text();

  return {
    status: response.status,
    headers: response.headers,
    body: text ? JSON.parse(text) : null,
  };
}

test('GET /health returns ok status', async () => {
  const response = await request('/health');

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'application/json');
  assert.deepEqual(response.body, { status: 'ok' });
});

test('GET /tasks returns an empty list initially', async () => {
  const response = await request('/tasks');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, []);
});

test('POST /tasks creates a task and GET /tasks lists it', async () => {
  const createResponse = await request('/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: 'Write API tests' }),
  });

  assert.equal(createResponse.status, 201);
  assert.equal(createResponse.body.title, 'Write API tests');
  assert.equal(createResponse.body.completed, false);
  assert.ok(createResponse.body.id);

  const listResponse = await request('/tasks');

  assert.equal(listResponse.status, 200);
  assert.equal(listResponse.body.at(-1).id, createResponse.body.id);
});

test('POST /tasks rejects invalid JSON', async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: '{"title":',
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: 'Request body must be valid JSON',
  });
});

test('POST /tasks rejects invalid title', async () => {
  const response = await request('/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: '   ' }),
  });

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { error: 'Title is required' });
});

test('POST /tasks rejects oversized request bodies', async () => {
  const response = await request('/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: 'a'.repeat(11 * 1024) }),
  });

  assert.equal(response.status, 413);
  assert.deepEqual(response.body, {
    error: 'Request body must be 10 KB or smaller',
  });
});

test('PATCH /tasks/:id/complete completes an existing task', async () => {
  const createResponse = await request('/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: 'Finish user story' }),
  });

  const response = await request(`/tasks/${createResponse.body.id}/complete`, {
    method: 'PATCH',
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.id, createResponse.body.id);
  assert.equal(response.body.completed, true);
});

test('PATCH /tasks/:id/complete returns 404 for unknown task', async () => {
  const response = await request('/tasks/missing-id/complete', {
    method: 'PATCH',
  });

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { error: 'Not found' });
});

test('DELETE /tasks/:id removes an existing task', async () => {
  const createResponse = await request('/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: 'Remove task' }),
  });

  const deleteResponse = await request(`/tasks/${createResponse.body.id}`, {
    method: 'DELETE',
  });

  assert.equal(deleteResponse.status, 204);
  assert.equal(deleteResponse.body, null);

  const listResponse = await request('/tasks');
  assert.equal(listResponse.body.some((task) => task.id === createResponse.body.id), false);
});

test('DELETE /tasks/:id returns 404 for unknown task', async () => {
  const response = await request('/tasks/missing-id', {
    method: 'DELETE',
  });

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { error: 'Not found' });
});

test('returns 405 for unsupported methods on known routes', async () => {
  const healthResponse = await request('/health', { method: 'POST' });
  const tasksResponse = await request('/tasks', { method: 'PATCH' });
  const completeResponse = await request('/tasks/abc/complete', { method: 'GET' });
  const taskResponse = await request('/tasks/abc', { method: 'GET' });

  assert.deepEqual(
    [healthResponse.status, tasksResponse.status, completeResponse.status, taskResponse.status],
    [405, 405, 405, 405],
  );
  assert.deepEqual(healthResponse.body, { error: 'Method not allowed' });
});

test('returns 404 for unknown routes', async () => {
  const response = await request('/unknown');

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { error: 'Not found' });
});
