# sample-myridius-project

## Running

- `npm start`
- `PORT=3000 npm start`
- `PORT=0 npm start` to let the OS choose a free port
- `npm test`

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Return service health status |
| `GET` | `/tasks` | List all tasks |
| `POST` | `/tasks` | Create a task from `{ "title": "..." }` |
| `PATCH` | `/tasks/:id/complete` | Mark a task as completed |
| `DELETE` | `/tasks/:id` | Delete a task |
