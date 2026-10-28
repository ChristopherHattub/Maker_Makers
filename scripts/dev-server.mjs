#!/usr/bin/env node
// Zero-dependency static dev server with live reload.
// Serves the repo root and reloads open browser tabs whenever a file changes.
// Usage: node scripts/dev-server.mjs [--port 5173] [--open]

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const portArg = args.indexOf('--port');
const PORT = Number(portArg >= 0 ? args[portArg + 1] : process.env.PORT) || 5173;
const OPEN = args.includes('--open');

const IGNORED = /(^|[\/\\])(\.git|node_modules|\.DS_Store)([\/\\]|$)/;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.stl': 'model/stl',
  '.obj': 'text/plain',
  '.mtl': 'text/plain',
  '.txt': 'text/plain; charset=utf-8'
};

const RELOAD_SNIPPET = `
<script>
  (() => {
    const es = new EventSource('/__livereload');
    es.onmessage = (e) => {
      if (e.data === 'css') {
        document.querySelectorAll('link[rel="stylesheet"]').forEach((l) => {
          const url = new URL(l.href);
          if (url.origin !== location.origin) return;
          url.searchParams.set('_lr', Date.now());
          l.href = url.href;
        });
      } else {
        location.reload();
      }
    };
  })();
</script>`;

const clients = new Set();

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/__livereload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });
    res.write(': connected\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  let filePath = path.join(ROOT, decodeURIComponent(url.pathname));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) filePath = path.join(filePath, 'index.html');
    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain' }).end('404 Not Found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' };
      if (ext === '.html') {
        const html = data.toString('utf8');
        const injected = html.includes('</body>')
          ? html.replace(/<\/body>(?![\s\S]*<\/body>)/, `${RELOAD_SNIPPET}\n</body>`)
          : html + RELOAD_SNIPPET;
        res.writeHead(200, headers).end(injected);
      } else {
        res.writeHead(200, headers).end(data);
      }
    });
  });
});

let timer = null;
let pendingCssOnly = true;
fs.watch(ROOT, { recursive: true }, (_event, filename) => {
  if (!filename || IGNORED.test(filename)) return;
  if (!filename.endsWith('.css')) pendingCssOnly = false;
  clearTimeout(timer);
  timer = setTimeout(() => {
    const msg = pendingCssOnly ? 'css' : 'reload';
    console.log(`[livereload] ${filename} changed -> ${msg}`);
    for (const client of clients) client.write(`data: ${msg}\n\n`);
    pendingCssOnly = true;
  }, 80);
});

server.listen(PORT, () => {
  const address = `http://localhost:${PORT}`;
  console.log(`Maker Makers dev server running at ${address}`);
  console.log('Watching for changes. Press Ctrl+C to stop.');
  if (OPEN) {
    const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start ""' : 'xdg-open';
    exec(`${cmd} ${address}`);
  }
});
