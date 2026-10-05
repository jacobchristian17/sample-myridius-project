# Implementation for User Story 1

## Summary
Build a zero-dependency Node.js 22 HTTP service using ES modules and the standard library only. The service exposes a health check plus task management endpoints backed by an in-memory store, with unit tests for store and route behavior.

## Planned files
- `package.json`
- `.gitignore`
- `src/taskStore.js`
- `src/app.js`
- `src/server.js`
- `test/taskStore.test.js`
- `test/app.test.js`
- `README.md`

## Approach
1. Add a minimal Node.js project definition with `start` and `test` scripts.
2. Implement an in-memory `TaskStore` backed by `Map`, including validation for task titles.
3. Implement a request handler that serves JSON responses for health and task routes.
4. Keep server bootstrap code separate from application logic for testability.
5. Add `node:test` coverage for task store behavior and HTTP routes.
6. Document how to run the service and the available endpoints.

## Assumptions
- Node.js 22 is available in the target environment.
- Task completion is represented by `PATCH /tasks/:id/complete`.
- In-memory state resets when the process restarts, which satisfies the non-persistent data requirement.
