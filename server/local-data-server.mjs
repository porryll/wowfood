import http from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dataDir = path.join(root, 'data');
const dataFile = path.join(dataDir, 'wowfood-store.json');
const port = Number(process.env.WOWFOOD_DATA_PORT || 1777);

async function readState() {
  try {
    const raw = await readFile(dataFile, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function writeState(state) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        request.destroy();
        reject(new Error('request body too large'));
      }
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function normalizeIncomingState(payload, previous) {
  const previousRevision = Number(previous?.revision || 0);
  return {
    revision: previousRevision + 1,
    updatedAt: new Date().toISOString(),
    settings: payload.settings,
    categories: Array.isArray(payload.categories) ? payload.categories : [],
    products: Array.isArray(payload.products) ? payload.products : [],
    orders: Array.isArray(payload.orders) ? payload.orders : []
  };
}

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === 'OPTIONS') {
      sendJson(response, 204, {});
      return;
    }

    if (request.url === '/api/health' && request.method === 'GET') {
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.url === '/api/state' && request.method === 'GET') {
      const state = await readState();
      sendJson(response, 200, state || { revision: 0, initialized: false });
      return;
    }

    if (request.url === '/api/state' && request.method === 'PUT') {
      const body = await readBody(request);
      const payload = JSON.parse(body || '{}');
      const previous = await readState();
      const nextState = normalizeIncomingState(payload, previous);
      await writeState(nextState);
      sendJson(response, 200, nextState);
      return;
    }

    sendJson(response, 404, { error: 'not found' });
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : 'internal server error'
    });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`WOWFOOD local data server ready at http://127.0.0.1:${port}`);
});
