#!/usr/bin/env node
// Packs the Spinner Ring's font outlines. The glyph data is not downloaded again: it is copied from the Text
// Generator page (which tools/text-fonts/build.mjs fills from the open-licence TTFs) and trimmed to the characters
// the ring text box accepts, so the ring page stays smaller. Rewrites the FONTDATA block (between the
// FONTDATA-BEGIN / FONTDATA-END markers) in programs/spinner-ring.html.
// Usage: node tools/ring-fonts/build.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const CHARS = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const root = new URL('../../', import.meta.url);
const textPage = readFileSync(new URL('programs/text-generator.html', root), 'utf8').split('\n');
const line = textPage.find((l) => l.trimStart().startsWith('var FONTDATA = '));
if (!line) throw new Error('FONTDATA not found in programs/text-generator.html');
const all = JSON.parse(line.slice(line.indexOf('{'), line.lastIndexOf('}') + 1));

const out = {};
for (const id of Object.keys(all)) {
  const f = all[id], g = {};
  for (const ch of CHARS) if (f.g[ch]) g[ch] = f.g[ch];
  out[id] = { label: f.label, asc: f.asc, desc: f.desc, cap: f.cap, g };
}

const file = new URL('programs/spinner-ring.html', root);
const page = readFileSync(file, 'utf8');
const begin = page.indexOf('// FONTDATA-BEGIN'), end = page.indexOf('// FONTDATA-END');
if (begin < 0 || end < 0) throw new Error('FONTDATA markers not found in programs/spinner-ring.html');
const beginLineEnd = page.indexOf('\n', begin) + 1;
const block = '      var FONTDATA = ' + JSON.stringify(out) + ';\n      ';
writeFileSync(file, page.slice(0, beginLineEnd) + block + page.slice(end));
console.log('FONTDATA: ' + Object.keys(out).length + ' fonts, ' + (JSON.stringify(out).length / 1024).toFixed(0) + ' KB');
