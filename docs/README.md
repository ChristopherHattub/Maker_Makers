# Maker Makers Documentation

Maker Makers is a static website with three jobs:

1. **Generator showcase.** A pannable, zoomable world map of grouped generator tiles (with spinning hologram previews, packed around a central Workshop tile, plus placeholder groups for future generators). Each parametric generator is a standalone HTML page that exports STL and colored OBJ.
2. **Workshop.** A free-range 3D editor for combining shapes, generator models and imported STLs.
3. **Public printer radar.** A free, keyless Leaflet map of public 3D printers and makerspaces, with optional worldwide search (no location request).

There is no build step and no dependencies. The site is plain HTML, CSS and JavaScript.

## Contents

| Document | What it covers |
| --- | --- |
| [architecture.md](architecture.md) | How the page, scripts and screens fit together, state, and external services |
| [file-structure.md](file-structure.md) | Every file in the repo and what it is for |
| [generator-registry.md](generator-registry.md) | The `PROGRAMS` slot registry, the generator contract, and how to add a generator |
| [generator-styling.md](generator-styling.md) | The shared generator engine: layout, config fields, build() output, the Color tool, exports, and the visual rules |
| [homepage.md](homepage.md) | The pannable world map of grouped generator tiles and how to add to it |
| [hologram-tiles.md](hologram-tiles.md) | Rendering each generator's hologram hover tile from its real model |
| [workshop.md](workshop.md) | The Workshop 3D editor and how generators embed in it |
| [printer-map.md](printer-map.md) | The printer radar: data, search, and how to add a printer |
| [development.md](development.md) | Running the site locally and the live-reload dev server |
| [deployment.md](deployment.md) | Publishing to GitHub Pages |
| [contributing.md](contributing.md) | Conventions and checklists for changes |
| [sprite-sheet-skill.md](sprite-sheet-skill.md) | Retired: how the older Gemini-drawn hover frames were made |

Step-by-step instructions for building a new generator live in the generator skill, [`.claude/skills/makermakers-generator/SKILL.md`](../.claude/skills/makermakers-generator/SKILL.md).

## Quick start

```bash
npm run dev
```

This serves the site at http://localhost:5173 and opens it in your browser. See [development.md](development.md).
