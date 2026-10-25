# File Structure

```
.
├── index.html               Page markup: header, three screens, idea modal, footer
├── css/
│   └── styles.css           All site styles (blueprint theme, grid, carousel, map, modal)
├── js/
│   ├── programs.js          PROGRAMS: the 40-slot registry
│   ├── featured.js          FEATURED_MODELS: Featured Community Models data (in progress)
│   └── app.js               Rendering, carousel, viewer, idea queue, printer map
├── data/
│   ├── public-printers.json Verified printer listings (solid dots, directory)
│   └── osm-candidates.json  Unverified OSM makerspace candidates (dimmed, toggled)
├── assets/
│   └── thumbnails/          Slot thumbnail images (currently only .gitkeep)
│       └── featured/        Featured Community Models thumbnails (in progress)
├── programs/                Generator pages (ghost-builder.html, ...)
│   └── shared/              Shared generator engine and styles (generator-core.js, generator.css)
├── scripts/
│   └── dev-server.mjs       Zero-dependency static server with live reload
├── .github/workflows/
│   └── pages.yml            GitHub Pages deploy workflow
├── .claude/
│   └── launch.json          Preview-server config (runs dev-server.mjs on port 5173)
├── docs/                    This documentation
├── .editorconfig            UTF-8, LF line endings, 2-space indent, final newline
├── .gitignore               OS, editor, node_modules, .env and tmp/ entries
├── .nojekyll                Tells GitHub Pages to serve files as-is
├── package.json             Two npm scripts (dev, serve); no dependencies
├── README.md                Project overview and short how-tos
└── LICENSE                  Placeholder; no license chosen yet
```

## What to edit for common tasks

| Task | Files |
| --- | --- |
| Add or update a generator slot | `js/programs.js`, plus files in `programs/` and `assets/thumbnails/` |
| Change the grid, carousel or viewer behavior | `js/app.js` |
| Change the look | `css/styles.css` |
| Change page layout or add a screen | `index.html` (and `js/app.js` for navigation) |
| Add a verified printer listing | `data/public-printers.json` |
| Review an unverified candidate | `data/osm-candidates.json` (move it to the verified file once checked) |
| Add a featured community model | `js/featured.js` and `assets/thumbnails/featured/` |
| Change how the site is published | `.github/workflows/pages.yml` |

## Folders that are intentionally empty

`assets/thumbnails/` contains only the featured placeholders for now. Slot 1 points at `programs/ghost-builder.html`, which has no thumbnail yet, so its socket shows the empty crosshair until one is added. The other slots have no `programUrl` or `thumbnailUrl`, so they render as empty sockets.

## Files not to commit

`.gitignore` excludes `node_modules/`, `.env*`, `*.local`, `tmp/`, editor folders and OS metadata. Nothing in the site needs `node_modules`, because the dev server uses only Node built-ins.
