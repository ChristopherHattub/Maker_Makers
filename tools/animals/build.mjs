#!/usr/bin/env node
// Builds the animal generator pages: programs/<name>.html = page shell + tools/flexi/flexi-lib.js
// + tools/animals/animal-kit.js + tools/animals/<name>.js
// Usage: node tools/animals/build.mjs [name ...]   (no names = all)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const ANIMALS = [
  ['dino-builder', 'MM-076', 'Dino Builder'],
  ['dragon-maker', 'MM-077', 'Dragon Maker'],
  ['cat-sculptor', 'MM-078', 'Cat Sculptor'],
  ['dog-builder', 'MM-079', 'Dog Builder'],
  ['flexi-snake', 'MM-080', 'Articulated Snake'],
  ['flexi-fish', 'MM-081', 'Flexi Fish'],
  ['turtle-tortoise', 'MM-082', 'Turtle & Tortoise'],
  ['owl-stacker', 'MM-083', 'Owl Stacker'],
  ['penguin-pals', 'MM-084', 'Penguin Pals'],
  ['octopus-squid', 'MM-085', 'Octopus & Squid'],
  ['mushroom-critters', 'MM-086', 'Mushroom Critters'],
  ['shark-trophy', 'MM-087', 'Shark Fin Trophy'],
  ['elephant-builder', 'MM-088', 'Elephant Builder'],
  ['monster-maker', 'MM-089', 'Alien & Monster Maker'],
  ['horse-builder', 'MM-090', 'Horse Builder']
];
const lib = readFileSync(join(here, '..', 'flexi', 'flexi-lib.js'), 'utf8');
const kit = readFileSync(join(here, 'animal-kit.js'), 'utf8');
const want = process.argv.slice(2);
for (const [name, code, title] of ANIMALS) {
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
  <script src="../vendor/three/three.min.js"></script>
  <script src="../vendor/three/OrbitControls.js"></script>
</head>
<body class="mm-gen">
  <script>
    // ${title}: built from the shared animal kit (tools/animals/animal-kit.js on top of tools/flexi/flexi-lib.js)
    // and tools/animals/${name}.js. Rebuild with node tools/animals/build.mjs.
    // The page layout, the viewport, the Color tool and the exports come from shared/generator-core.js.
    (function () {
      'use strict';

${lib}
${kit}
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
