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
│   └── app.js            # Router, viewer, idea queue, printer map
├── data/                 # Printer listings (verified) and OSM candidates
├── assets/thumbnails/    # Slot thumbnails; sprites/ holds the hologram hover tiles
├── programs/             # Generator pages; shared/ is the engine every generator uses
├── tools/                # hologram.html (renders hologram tiles), flexi/ (flexi creature sources)
├── scripts/              # Dev server and hologram build scripts
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

## Adding a generator

1. Put the generator page in `programs/`, for example `programs/honeycomb-hook.html`. It holds only its config and `build()`; the shared engine in `programs/shared/` supplies the UI and exports (see [docs/generator-styling.md](docs/generator-styling.md)).
2. Put its thumbnail in `assets/thumbnails/`.
3. In `js/programs.js`, add a `GENERATORS` entry with the next free `slot` and its `title`, `category`, `thumbnailUrl`, `programUrl` and `description`, using relative paths such as `programs/honeycomb-hook.html`. To group it with others, add `bundle: '<bundle id>'` (groups are registered in `BUNDLES` in the same file; each is a region on the homepage map).
4. Render its hologram hover tile (see [docs/hologram-tiles.md](docs/hologram-tiles.md)).

The full checklist is in [docs/generator-registry.md](docs/generator-registry.md).

Always use relative paths (no leading `/`) so the site works both locally and under a GitHub Pages project URL like `https://<user>.github.io/<repo>/`.

## Deploying to GitHub Pages

1. Create a GitHub repository and push this project to its `main` branch.
2. In the repository, open **Settings > Pages** and set **Source** to **Deploy from a branch**, then choose branch `main` and folder `/ (root)`.
3. Every push to `main` then republishes the site automatically.

## License

No license has been chosen yet; see [LICENSE](LICENSE).
