import { ValidationError } from './taskStore.js';

const JSON_HEADERS = {
  'Content-Type': 'application/json'
};

const MAX_BODY_SIZE = 10 * 1024;

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, JSON_HEADERS);
  response.end(JSON.stringify(payload));
}

function sendNoContent(response) {
  response.writeHead(204);
  response.end();
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;

    if (size > MAX_BODY_SIZE) {
      const error = new Error('Request body too large');
      error.statusCode = 413;
      throw error;
    }

    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    const error = new Error('Invalid JSON');
    error.statusCode = 400;
    throw error;
  }
}

function matchTaskId(pathname) {
  const completeMatch = pathname.match(/^\/tasks\/([^/]+)\/complete$/);

  if (completeMatch) {
    return { type: 'complete', id: completeMatch[1] };
  }

  const deleteMatch = pathname.match(/^\/tasks\/([^/]+)$/);

  if (deleteMatch) {
    return { type: 'task', id: deleteMatch[1] };
  }

  return null;
}

export function createApp(store) {
  return async function app(request, response) {
    const url = new URL(request.url, 'http://localhost');
    const { method } = request;
    const { pathname } = url;

    if (pathname === '/health') {
      if (method !== 'GET') {
        sendJson(response, 405, { error: 'Method not allowed' });
        return;
      }

      sendJson(response, 200, { status: 'ok' });
      return;
    }

    if (pathname === '/tasks') {
      if (method === 'GET') {
        sendJson(response, 200, store.list());
        return;
      }

      if (method === 'POST') {
        try {
          const body = await readJsonBody(request);
          const task = store.create(body.title);
          sendJson(response, 201, task);
        } catch (error) {
          if (error instanceof ValidationError || error.statusCode === 400) {
            sendJson(response, 400, { error: error.message });
            return;
          }

          if (error.statusCode === 413) {
            sendJson(response, 413, { error: error.message });
            return;
          }

          sendJson(response, 500, { error: 'Internal server error' });
        }

        return;
      }

      sendJson(response, 405, { error: 'Method not allowed' });
      return;
    }

    const taskMatch = matchTaskId(pathname);

    if (taskMatch?.type === 'complete') {
      if (method !== 'PATCH') {
        sendJson(response, 405, { error: 'Method not allowed' });
        return;
      }

      const task = store.complete(taskMatch.id);

      if (!task) {
        sendJson(response, 404, { error: 'Task not found' });
        return;
      }

      sendJson(response, 200, task);
      return;
    }

    if (taskMatch?.type === 'task') {
      if (method !== 'DELETE') {
        sendJson(response, 405, { error: 'Method not allowed' });
        return;
      }

      const removed = store.remove(taskMatch.id);

      if (!removed) {
        sendJson(response, 404, { error: 'Task not found' });
        return;
      }

      sendNoContent(response);
      return;
    }

    sendJson(response, 404, { error: 'Not found' });
  };
}
