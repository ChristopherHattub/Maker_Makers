# Maker Makers

A static website for hosting parametric STL / OBJ generators and customizers, a free-range 3D Workshop editor, and a free, keyless map of public 3D printers and makerspaces.

No build step and no dependencies: it is plain HTML, CSS and JavaScript, so it runs anywhere a static file host does, including GitHub Pages.

## Project layout

```
.
├── index.html            # Page markup
├── css/                  # styles.css (site), workshop.css (Workshop)
├── js/
│   ├── programs.js       # Slot registry: GENERATORS and BUNDLES (map regions)
│   ├── worldmap.js       # Homepage world map
│   ├── workshop.js       # Workshop 3D editor
│   ├── guides.js         # Printing guides page: link list and search
│   └── app.js            # Router (#/generator, #/workshop, #/map, #/guides), viewer, printer map
├── data/                 # Printer listings (verified) and OSM candidates
├── assets/thumbnails/    # Slot thumbnails; sprites/ holds the hologram hover tiles
├── programs/             # Generator pages; shared/ is the engine every generator uses
├── tools/                # hologram.html and panel-thumbs.html (renderers); animals/, flexi/, text-fonts/, ring-fonts/ and gravity-walker/ (sources and checks for those generators)
├── scripts/              # Dev server, hologram / preview build scripts, scripts/ci (printability job)
├── ci/                   # printability-baseline.json (known print-check errors)
├── .github/workflows/    # printability.yml: one printability job per generator
├── vendor/               # Self-hosted three.js, Leaflet, CSG bundle and fonts (no CDN is contacted)
├── docs/                 # Full documentation
└── .nojekyll             # Tells Pages to serve files as-is
```

Full documentation lives in [docs/](docs/README.md). AI agents: start at [CLAUDE.md](CLAUDE.md).

## Running locally with live reload

You need Node.js 18 or newer. No `npm install` is required.

```bash
npm run dev
```

This starts a server at http://localhost:5173 and opens it in your browser. Every time you save a file, open tabs reload automatically (CSS changes are swapped in without a full reload). Stop it with Ctrl+C.

To start it without opening a browser, or on another port:

```bash
npm run serve -- --port 8080
```

## Generators

124 generators in 20 groups (slots 1-139; 14 and 39 are unused), from seasonal gifts and fidgets to animals, flexi creatures, tabletop pieces, desk organisers, toys and print-in-place mechanisms. The full list is in [docs/slot-registry.md](docs/slot-registry.md). Every generator has Parametric, Color tool and Print tabs (most also a Sculpt tab), a live printability chip, and exports STL and a coloured OBJ zip.

## Adding a generator

1. Put the generator page in `programs/`, for example `programs/honeycomb-hook.html`. It holds only its config and `build()`; the shared engine in `programs/shared/` supplies the UI and exports (see [docs/generator-styling.md](docs/generator-styling.md)).
2. Put its thumbnail in `assets/thumbnails/`.
3. In `js/programs.js`, add a `GENERATORS` entry with the next free `slot` and its `title`, `category`, `thumbnailUrl`, `programUrl` and `description`, using relative paths such as `programs/honeycomb-hook.html`. To group it with others, add `bundle: '<bundle id>'` (groups are registered in `BUNDLES` in the same file; each is a region on the homepage map).
4. Render its hologram hover tile (see [docs/hologram-tiles.md](docs/hologram-tiles.md)) and its side-panel preview (see [docs/homepage.md](docs/homepage.md#side-panel-previews-full-colour)).
5. Run the printability check: `node .claude/skills/makermakers-generator/check-mesh.mjs programs/<name>.html` (see [docs/printability-ci.md](docs/printability-ci.md)).

The full checklist is in [docs/generator-registry.md](docs/generator-registry.md).

Always use relative paths (no leading `/`) so the site works both locally and under a GitHub Pages project URL like `https://<user>.github.io/<repo>/`.

## Deploying to GitHub Pages

1. Create a GitHub repository and push this project to its `main` branch.
2. In the repository, open **Settings > Pages** and set **Source** to **Deploy from a branch**, then choose branch `main` and folder `/ (root)`.
3. Every push to `main` then republishes the site automatically.

## License

No license has been chosen yet; see [LICENSE](LICENSE).
