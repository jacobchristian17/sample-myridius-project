## Implementation Plan

### Summary
Create a zero-dependency Node.js 22 HTTP service using ES modules and the standard library. The service will expose a health endpoint plus task management routes backed by an in-memory store, with unit tests for both the store and the HTTP layer.

### Files
- `package.json` for Node metadata and scripts
- `src/taskStore.js` for the in-memory task store
- `src/app.js` for routing and JSON HTTP handling
- `src/server.js` for the executable server entry point
- `test/taskStore.test.js` for store unit tests
- `test/app.test.js` for HTTP route tests
- `.gitignore` for `node_modules/`
- `README.md` updates for running and endpoint usage

### Approach
1. Implement a `TaskStore` class backed by a `Map`, with validation for task creation and methods to list, create, complete, and remove tasks.
2. Build a request handler factory in `src/app.js` that handles routing, JSON responses, body parsing, payload size limits, validation errors, and not-found / method-not-allowed cases.
3. Keep `src/server.js` thin so tests can import the app without starting the production server.
4. Add unit tests for the store and HTTP routes using `node:test` and Node's built-in assertion library.
5. Update the README with start/test commands and the endpoint table.

### Assumptions
- Node 22 or newer is available, including global `fetch`.
- Task completion is modeled as `PATCH /tasks/:id/complete`.
- Request and response bodies use JSON only.
- In-memory storage resets when the process restarts.
