#!/usr/bin/env node
// Builds the flexi creature pages: programs/<name>.html = page shell + tools/flexi/flexi-lib.js + tools/flexi/<name>.js
// Usage: node tools/flexi/build.mjs [name ...]   (no names = all)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const CREATURES = [
  ['flexi-dragon', 'MM-091', 'Flexi Dragon'],
  ['flexi-gecko', 'MM-092', 'Flexi Gecko'],
  ['flexi-crocodile', 'MM-093', 'Flexi Crocodile'],
  ['flexi-octopus', 'MM-094', 'Flexi Octopus'],
  ['flexi-scorpion', 'MM-095', 'Flexi Scorpion'],
  ['flexi-centipede', 'MM-096', 'Flexi Centipede'],
  ['flexi-turtle', 'MM-097', 'Flexi Turtle'],
  ['flexi-shark', 'MM-098', 'Flexi Shark'],
  ['flexi-seahorse', 'MM-099', 'Flexi Seahorse'],
  ['flexi-caterpillar', 'MM-100', 'Flexi Caterpillar']
];
const lib = readFileSync(join(here, 'flexi-lib.js'), 'utf8');
const want = process.argv.slice(2);
for (const [name, code, title] of CREATURES) {
  if (want.length && !want.includes(name)) continue;
  const src = join(here, name + '.js');
  if (!existsSync(src)) { console.log('skip ' + name + ' (no source yet)'); continue; }
  const body = readFileSync(src, 'utf8');
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${code} ${title} // Maker Makers</title>
  <link rel="stylesheet" href="shared/generator.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
</head>
<body class="mm-gen">
  <script>
    // ${title}: a print-in-place flexi creature made of ball-and-socket segments. The shared flexi kit comes from
    // tools/flexi/flexi-lib.js and this creature from tools/flexi/${name}.js (rebuild with node tools/flexi/build.mjs).
    // The page layout, the viewport, the Color tool and the exports come from shared/generator-core.js.
    (function () {
      'use strict';

${lib}
${body}
    })();
  </script>
  <script src="shared/generator-core.js"></script>
</body>
</html>
`;
  writeFileSync(join(root, 'programs', name + '.html'), html);
  console.log('wrote programs/' + name + '.html');
}
