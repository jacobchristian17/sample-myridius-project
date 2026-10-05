import { randomUUID } from 'node:crypto';

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class TaskStore {
  #tasks = new Map();

  list() {
    const tasks = Array.from(this.#tasks.values()).sort((left, right) => {
      if (left.createdAt === right.createdAt) {
        return left.id.localeCompare(right.id);
      }

      return left.createdAt.localeCompare(right.createdAt);
    });

    console.log('TaskStore.list output', tasks);
    return tasks;
  }

  get(id) {
    const task = this.#tasks.get(id) ?? null;
    console.log('TaskStore.get output', { id, task });
    return task;
  }

  create(title) {
    if (typeof title !== 'string') {
      throw new ValidationError('Title is required');
    }

    const trimmedTitle = title.trim();

    if (trimmedTitle.length === 0) {
      throw new ValidationError('Title is required');
    }

    if (trimmedTitle.length > 200) {
      throw new ValidationError('Title must be 200 characters or fewer');
    }

    const task = {
      id: randomUUID(),
      title: trimmedTitle,
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.#tasks.set(task.id, task);
    console.log('TaskStore.create output', task);
    return task;
  }

  complete(id) {
    const task = this.#tasks.get(id);

    if (!task) {
      console.log('TaskStore.complete output', { id, task: null });
      return null;
    }

    task.completed = true;
    console.log('TaskStore.complete output', { id, task });
    return task;
  }

  remove(id) {
    const removed = this.#tasks.delete(id);
    console.log('TaskStore.remove output', { id, removed });
    return removed;
  }
}
