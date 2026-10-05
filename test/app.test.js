import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../src/app.js';
import { TaskStore } from '../src/taskStore.js';

let server;
let baseUrl;

test.before(async () => {
  server = http.createServer(createApp(new TaskStore()));
  await new Promise((resolve) => {
    server.listen(0, resolve);
  });

  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
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

test('GET /health returns ok status', async () => {
  const response = await fetch(`${baseUrl}/health`);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'application/json');
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('GET /tasks lists tasks', async () => {
  const createResponse = await fetch(`${baseUrl}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: 'First task' })
  });

  assert.equal(createResponse.status, 201);

  const listResponse = await fetch(`${baseUrl}/tasks`);
  const tasks = await listResponse.json();

  assert.equal(listResponse.status, 200);
  assert.equal(Array.isArray(tasks), true);
  assert.equal(tasks.length >= 1, true);
  assert.equal(tasks.some((task) => task.title === 'First task'), true);
});

test('POST /tasks creates a task', async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: 'Create docs' })
  });

  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.title, 'Create docs');
  assert.equal(body.completed, false);
  assert.equal(typeof body.id, 'string');
});

test('POST /tasks rejects invalid JSON', async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: '{invalid'
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'Invalid JSON' });
});

test('POST /tasks rejects an invalid title', async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: '   ' })
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'Title is required' });
});

test('POST /tasks rejects oversized bodies', async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: 'a'.repeat(11 * 1024) })
  });

  assert.equal(response.status, 413);
  assert.deepEqual(await response.json(), { error: 'Request body too large' });
});

test('GET /tasks/:id returns a task', async () => {
  const createResponse = await fetch(`${baseUrl}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: 'Find me' })
  });
  const createdTask = await createResponse.json();

  const response = await fetch(`${baseUrl}/tasks/${createdTask.id}`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), createdTask);
});

test('GET /tasks/:id returns 404 for unknown tasks', async () => {
  const response = await fetch(`${baseUrl}/tasks/unknown-task`);

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'Task not found' });
});

test('PATCH /tasks/:id/complete marks a task complete', async () => {
  const createResponse = await fetch(`${baseUrl}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: 'Finish task' })
  });
  const createdTask = await createResponse.json();

  const response = await fetch(`${baseUrl}/tasks/${createdTask.id}/complete`, {
    method: 'PATCH'
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    ...createdTask,
    completed: true
  });
});

test('PATCH /tasks/:id/complete returns 404 for unknown tasks', async () => {
  const response = await fetch(`${baseUrl}/tasks/unknown-task/complete`, {
    method: 'PATCH'
  });

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'Task not found' });
});

test('DELETE /tasks/:id removes a task', async () => {
  const createResponse = await fetch(`${baseUrl}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: 'Remove me' })
  });
  const createdTask = await createResponse.json();

  const deleteResponse = await fetch(`${baseUrl}/tasks/${createdTask.id}`, {
    method: 'DELETE'
  });

  assert.equal(deleteResponse.status, 204);
  assert.equal(await deleteResponse.text(), '');

  const secondDeleteResponse = await fetch(`${baseUrl}/tasks/${createdTask.id}`, {
    method: 'DELETE'
  });

  assert.equal(secondDeleteResponse.status, 404);
  assert.deepEqual(await secondDeleteResponse.json(), { error: 'Task not found' });
});

test('known paths reject unsupported methods', async () => {
  const responses = await Promise.all([
    fetch(`${baseUrl}/health`, { method: 'POST' }),
    fetch(`${baseUrl}/tasks`, { method: 'PUT' }),
    fetch(`${baseUrl}/tasks/some-id`, { method: 'PATCH' }),
    fetch(`${baseUrl}/tasks/some-id/complete`, { method: 'DELETE' })
  ]);

  for (const response of responses) {
    assert.equal(response.status, 405);
    assert.deepEqual(await response.json(), { error: 'Method not allowed' });
  }
});

test('unknown paths return 404', async () => {
  const response = await fetch(`${baseUrl}/missing`);

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'Not found' });
});
