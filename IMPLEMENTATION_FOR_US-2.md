# Implementation for User Story 2

## Summary
Add a standalone `slugify(text)` utility with no dependencies, plus focused unit tests and a short README usage example.

## Assumptions
- The existing project uses ESM and Node's built-in test runner.
- `npm test` should remain `node --test`.
- The utility is standalone and does not need to be wired into the existing task API.

## Planned changes
1. Add `src/slugify.js` exporting `slugify(text)`.
2. Add `test/slugify.test.js` covering normalization, separator collapsing, edge cases, and type validation.
3. Append a brief usage section to `README.md`.
4. Commit the changes on `ai/us-2-r1` and push that branch.
