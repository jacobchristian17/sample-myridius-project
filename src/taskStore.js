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
    return Array.from(this.#tasks.values()).sort((left, right) => {
      if (left.createdAt < right.createdAt) {
        return -1;
      }

      if (left.createdAt > right.createdAt) {
        return 1;
      }

      return left.id.localeCompare(right.id);
    });
  }

  get(id) {
    return this.#tasks.get(id) ?? null;
  }

  create(title) {
    if (typeof title !== 'string') {
      throw new ValidationError('Title is required');
    }

    const normalizedTitle = title.trim();

    if (normalizedTitle.length === 0) {
      throw new ValidationError('Title is required');
    }

    if (normalizedTitle.length > 200) {
      throw new ValidationError('Title must be 200 characters or fewer');
    }

    const task = {
      id: randomUUID(),
      title: normalizedTitle,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    this.#tasks.set(task.id, task);

    return task;
  }

  complete(id) {
    const task = this.get(id);

    if (!task) {
      return null;
    }

    task.completed = true;
    return task;
  }

  remove(id) {
    return this.#tasks.delete(id);
  }
}
