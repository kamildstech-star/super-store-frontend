import { readFile } from 'node:fs/promises';
import { createServer, request } from 'node:http';

const host = '127.0.0.1';
const port = 4173;
const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/vue.global.prod.js', ['vue.global.prod.js', 'text/javascript; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
]);

// Forward only POS routes to a loopback Laravel server so session cookies and CSRF stay same-origin.
function proxyPos(req, res) {
  const {connection, 'proxy-connection': proxyConnection, ...headers} = req.headers;
  const backend = request({
    hostname: '127.0.0.1', port: 8000, path: req.url, method: req.method,
    headers, timeout: 10000,
  }, (response) => {
    res.writeHead(response.statusCode, response.headers);
    response.pipe(res);
  });
  backend.on('timeout', () => backend.destroy(new Error('Laravel timed out')));
  backend.on('error', () => {
    if (res.headersSent) return res.destroy();
    res.writeHead(502, {'Content-Type':'application/json'})
      .end(JSON.stringify({message:'Could not reach Laravel at http://127.0.0.1:8000.'}));
  });
  req.on('aborted', () => backend.destroy());
  req.pipe(backend);
}

const server = createServer(async (req, res) => {
  if (req.url.startsWith('/api/pos/')) return proxyPos(req, res);
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  const asset = files.get(req.url.split('?')[0]);
  if (!asset) {
    res.writeHead(404).end();
    return;
  }

  const [name, type] = asset;
  try {
    const body = await readFile(new URL('./dist/' + name, import.meta.url));
    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': body.length,
      'Cache-Control': 'no-store',
    }).end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(500).end('Could not read the built frontend. Restart npm run dev.');
  }
});

server.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE'
    ? 'Port 4173 is already in use. Stop the other frontend server, then rerun npm run dev.'
    : error.message);
  process.exitCode = 1;
});
server.listen(port, host, () => console.log('POS frontend: http://' + host + ':' + port));
