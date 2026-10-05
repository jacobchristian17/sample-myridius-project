import test from 'node:test';
import assert from 'node:assert/strict';
import { TaskStore, ValidationError } from '../src/taskStore.js';

test('create stores a trimmed task', () => {
  const store = new TaskStore();

  const task = store.create('  Write tests  ');

  assert.equal(task.title, 'Write tests');
  assert.equal(task.completed, false);
  assert.equal(typeof task.id, 'string');
  assert.equal(typeof task.createdAt, 'string');
  assert.deepEqual(store.list(), [task]);
});

test('create rejects missing and oversized titles', () => {
  const store = new TaskStore();

  assert.throws(() => store.create('   '), ValidationError);
  assert.throws(() => store.create(42), ValidationError);
  assert.throws(() => store.create('a'.repeat(201)), ValidationError);
});

test('complete marks an existing task as completed', () => {
  const store = new TaskStore();
  const task = store.create('Ship feature');

  const completedTask = store.complete(task.id);

  assert.equal(completedTask?.completed, true);
  assert.equal(store.get(task.id)?.completed, true);
});

test('complete returns null for an unknown task', () => {
  const store = new TaskStore();

  assert.equal(store.complete('missing-task'), null);
});

test('remove deletes an existing task', () => {
  const store = new TaskStore();
  const task = store.create('Clean up');

  assert.equal(store.remove(task.id), true);
  assert.equal(store.get(task.id), null);
  assert.deepEqual(store.list(), []);
});

test('remove returns false for an unknown task', () => {
  const store = new TaskStore();

  assert.equal(store.remove('missing-task'), false);
});
