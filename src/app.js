import { ValidationError } from './taskStore.js';

const MAX_BODY_SIZE = 10 * 1024;

function sendJson(response, statusCode, payload, headers = {}) {
  const body = JSON.stringify(payload);

  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    ...headers,
  });

  response.end(body);
}

function sendEmpty(response, statusCode) {
  response.writeHead(statusCode);
  response.end();
}

function notFound(response) {
  sendJson(response, 404, { error: 'Not found' });
}

function methodNotAllowed(response) {
  sendJson(response, 405, { error: 'Method not allowed' });
}

async function readJsonBody(request) {
  let body = '';

  for await (const chunk of request) {
    body += chunk;

    if (Buffer.byteLength(body) > MAX_BODY_SIZE) {
      throw new Error('PAYLOAD_TOO_LARGE');
    }
  }

  if (body.length === 0) {
    return {};
  }

  try {
    return JSON.parse(body);
  } catch {
    throw new ValidationError('Request body must be valid JSON');
  }
}

export function createApp(store) {
  return async function app(request, response) {
    const requestUrl = new URL(request.url, 'http://localhost');
    const { method } = request;
    const { pathname } = requestUrl;

    try {
      if (pathname === '/health') {
        if (method !== 'GET') {
          methodNotAllowed(response);
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
          const body = await readJsonBody(request);
          const task = store.create(body.title);
          sendJson(response, 201, task);
          return;
        }

        methodNotAllowed(response);
        return;
      }

      const completeMatch = pathname.match(/^\/tasks\/([^/]+)\/complete$/);

      if (completeMatch) {
        if (method !== 'PATCH') {
          methodNotAllowed(response);
          return;
        }

        const task = store.complete(completeMatch[1]);

        if (!task) {
          notFound(response);
          return;
        }

        sendJson(response, 200, task);
        return;
      }

      const deleteMatch = pathname.match(/^\/tasks\/([^/]+)$/);

      if (deleteMatch) {
        if (method !== 'DELETE') {
          methodNotAllowed(response);
          return;
        }

        const removed = store.remove(deleteMatch[1]);

        if (!removed) {
          notFound(response);
          return;
        }

        sendEmpty(response, 204);
        return;
      }

      notFound(response);
    } catch (error) {
      if (error instanceof ValidationError) {
        sendJson(response, 400, { error: error.message });
        return;
      }

      if (error instanceof Error && error.message === 'PAYLOAD_TOO_LARGE') {
        sendJson(response, 413, { error: 'Request body must be 10 KB or smaller' });
        return;
      }

      sendJson(response, 500, { error: 'Internal server error' });
    }
  };
}
