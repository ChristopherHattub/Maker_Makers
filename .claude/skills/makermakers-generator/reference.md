# Reference snippets

## Minimal generator page

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MM-002 Example // Maker Makers</title>
  <link rel="stylesheet" href="shared/generator.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
</head>
<body class="mm-gen">
  <script>
    (function () {
      'use strict';
      window.MM_GENERATOR = {
        code: 'MM-002',
        category: 'DESK // ORGANISERS',
        title: 'Example Cup',
        fileName: 'Example_Cup',
        palette: [
          { name: 'Bone White', color: '#f1f5f9' }, { name: 'Glow Mint', color: '#a7f3d0' },
          { name: 'Pumpkin Matte', color: '#fdba74' }, { name: 'Lavender Mist', color: '#d8b4fe' },
          { name: 'Phantom Ice', color: '#93c5fd' }, { name: 'Berry Sorbet', color: '#fda4af' },
          { name: 'Shadow Black', color: '#334155' }, { name: 'Sunny Yellow', color: '#fde047' }
        ],
        partNames: { body: 'Cup' },
        printSettings: { material: 'PLA', layerHeight: 0.2, infill: 15, walls: 3, supports: false },
        parameters: [
          { group: 'Size', key: 'height', label: 'Height', unit: ' mm', min: 30, max: 120, step: 1, value: 70 },
          { group: 'Size', key: 'radius', label: 'Radius', unit: ' mm', min: 15, max: 50, step: 1, value: 30 }
        ],
        presets: [{ label: 'Default cup', values: { height: 70, radius: 30 } }],
        build: function (p) {
          return [{ name: 'body', positions: closedSolid(p) }];
        }
      };
      function closedSolid(p) { /* return a Float32Array of watertight triangles */ }
    })();
  </script>
  <script src="shared/generator-core.js"></script>
</body>
</html>
```

## Watertight lathe pattern (used by Ghost Builder)

Build once (outside `build`): a vertex grid `bottomPole`, `rings x segments`, `topPole`, and a `Uint32Array` of triangle indices where every ring wraps with `next = (j + 1) % SEG`. Each build only recomputes vertex positions, then expands indices to a non-indexed `Float32Array`. Because vertices are shared, the surface is closed by construction; features (cut-outs, waves, arms) only move vertices, never remove triangles.

## Splitting a surface into paintable meshes

Expand the same index buffer twice: triangles where any vertex has `hollow > 0.02` go to `face`, the rest to `body`, both with `smoothGroup: 'ghost'` (see `pack()` in `buildBody`).

## Console check in the browser

If you cannot run node, in the page's console:
`MM_GENERATOR.build(Object.fromEntries(MM_GENERATOR.parameters.map(p => [p.key, p.value])), {THREE}).map(m => [m.name, m.positions.length / 9])`
