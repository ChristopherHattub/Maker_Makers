# Maker Makers Documentation

Maker Makers is a static website with two jobs:

1. **Generator showcase.** A 4 x 10 grid of "machinery sockets" where parametric STL / 3MF generators (standalone HTML programs) are attached, previewed, and downloaded.
2. **Public printer radar.** A free, keyless Leaflet map of public 3D printers and makerspaces, with GPS and worldwide search.

There is no build step and no dependencies. The site is plain HTML, CSS and JavaScript.

## Contents

| Document | What it covers |
| --- | --- |
| [architecture.md](architecture.md) | How the page, scripts and screens fit together, state, and external services |
| [file-structure.md](file-structure.md) | Every file in the repo and what it is for |
| [generator-registry.md](generator-registry.md) | The `PROGRAMS` slot registry, the standalone generator contract, and how to add a generator |
| [featured-carousel.md](featured-carousel.md) | The auto-rotating Featured Generator carousel and the Featured Community Models strip |
| [printer-map.md](printer-map.md) | The printer radar: data, search, GPS, and how to add a printer |
| [development.md](development.md) | Running the site locally and the live-reload dev server |
| [deployment.md](deployment.md) | Publishing to GitHub Pages |
| [contributing.md](contributing.md) | Conventions and checklists for changes |

## Quick start

```bash
npm run dev
```

This serves the site at http://localhost:5173 and opens it in your browser. See [development.md](development.md).
