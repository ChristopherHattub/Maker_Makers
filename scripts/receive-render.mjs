#!/usr/bin/env node
// Tiny upload receiver for tools/hologram.html: POST /save?name=<file> writes the body to the --out directory.
// Usage: node scripts/receive-render.mjs --out <dir> [--port 5190]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const arg = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const OUT = path.resolve(arg('--out', '.'));
const PORT = Number(arg('--port', 5190));
fs.mkdirSync(OUT, { recursive: true });

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.end(); return; }
  const name = path.basename(new URL(req.url, 'http://x').searchParams.get('name') || 'out.bin');
  const chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', () => {
    fs.writeFileSync(path.join(OUT, name), Buffer.concat(chunks));
    console.log('saved', name);
    res.end('ok');
  });
}).listen(PORT, () => console.log(`receiving into ${OUT} on :${PORT}`));
