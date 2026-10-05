# sample-myridius-project

## Running

```bash
npm start
npm test
```

## Slugify

```js
import { slugify } from './src/slugify.js';

slugify('Crème Brûlée');
// "creme-brulee"
```

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Returns service health status |
| `GET` | `/tasks` | Lists all tasks |
| `GET` | `/tasks/:id` | Returns a single task |
| `POST` | `/tasks` | Creates a new task from `{ "title": "..." }` |
| `PATCH` | `/tasks/:id/complete` | Marks a task as completed |
| `DELETE` | `/tasks/:id` | Deletes a task |