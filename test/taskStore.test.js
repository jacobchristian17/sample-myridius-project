import test from 'node:test';
import assert from 'node:assert/strict';
import { TaskStore, ValidationError } from '../src/taskStore.js';

test('create stores a trimmed task', () => {
  const store = new TaskStore();

  const task = store.create('  Write tests  ');

  assert.match(task.id, /^[0-9a-f-]{36}$/i);
  assert.equal(task.title, 'Write tests');
  assert.equal(task.completed, false);
  assert.match(task.createdAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.deepEqual(store.list(), [task]);
  assert.equal(store.get(task.id), task);
});

test('create rejects missing or blank titles', () => {
  const store = new TaskStore();

  assert.throws(() => store.create(), ValidationError);
  assert.throws(() => store.create('   '), ValidationError);
});

test('create rejects titles longer than 200 characters', () => {
  const store = new TaskStore();

  assert.throws(() => store.create('a'.repeat(201)), {
    name: 'ValidationError',
    message: 'Title must be 200 characters or fewer',
  });
});

test('complete marks an existing task as completed', () => {
  const store = new TaskStore();
  const task = store.create('Ship feature');

  const completedTask = store.complete(task.id);

  assert.equal(completedTask, task);
  assert.equal(completedTask.completed, true);
});

test('complete returns null for an unknown id', () => {
  const store = new TaskStore();

  assert.equal(store.complete('missing-id'), null);
});

test('remove deletes an existing task', () => {
  const store = new TaskStore();
  const task = store.create('Delete me');

  assert.equal(store.remove(task.id), true);
  assert.deepEqual(store.list(), []);
  assert.equal(store.get(task.id), null);
});

test('remove returns false for an unknown id', () => {
  const store = new TaskStore();

  assert.equal(store.remove('missing-id'), false);
});
