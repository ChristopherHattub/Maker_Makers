# File Structure

```
.
├── index.html               Page markup: header, four screens, idea modal, footer disclaimer
├── css/
│   ├── styles.css           Site styles (blueprint theme, homepage world map, viewer, printer map, modal)
│   └── workshop.css         Workshop editor and Workshop tile styles
├── js/
│   ├── programs.js          GENERATORS list, BUNDLES (map regions) and the PROGRAMS slot array built from them
│   ├── worldmap.js          Homepage world map: layout, camera, selection, hologram hover tiles, minimap, sort, rearrange
│   ├── workshop.js          Workshop: free-range 3D editor (shape catalog, STL import, booleans, STL / OBJ export)
│   └── app.js               Router, viewer, idea queue, printer map
├── data/
│   ├── public-printers.json Verified printer listings (solid dots, directory)
│   └── osm-candidates.json  Unverified OSM makerspace candidates (dimmed, toggled)
├── assets/
│   └── thumbnails/          Slot thumbnails, one <id>.svg per generator
│       ├── pro/             Optional PNG tile art, only seen on a homepage tile that has no hologram yet
│       └── sprites/         Hologram hover tiles: poster-<id>.webp (still, loaded first), holo-<id>.webp (atlas,
│                            loaded on hover / tap / idle), base-tile.webp, manifest-v2.json
│                            (obj-*.webp, sheet-*.webp and manifest.json are the older Gemini frames)
├── programs/                Generator pages, one per slot (ghost-builder.html, ...)
│   └── shared/              Shared generator engine and styles (generator-core.js, generator.css)
├── tools/
│   ├── hologram.html        Renders a generator's real model as a 24-frame hologram atlas
│   └── flexi/               Sources, builder and clearance check for the flexi creatures (slots 91-100)
├── scripts/
│   ├── dev-server.mjs       Zero-dependency static server with live reload
│   ├── receive-render.mjs   Receives the atlases tools/hologram.html uploads (port 5190)
│   ├── build-holo.py        Turns those atlases into holo-<id>.webp and updates manifest-v2.json
│   ├── hologram-config.json Per-generator hologram colour and framing
│   ├── build-hover-sheets.py, build-sprite-sheets.py, sprite-tints.json
│   │                        Older Gemini sprite pipeline (kept for the ?gemini frames and the base tile)
├── screenshots/             Reference screenshots from earlier reviews (not used by the site)
├── .claude/
│   ├── launch.json          Preview-server config (runs dev-server.mjs on port 5173)
│   └── skills/makermakers-generator/  Generator skill: SKILL.md, reference.md, check-mesh.mjs, thumbnail-template.svg
├── docs/                    This documentation (start at README.md)
├── CLAUDE.md, AGENTS.md     Agent entry point (AGENTS.md just points to CLAUDE.md)
├── .editorconfig            UTF-8, LF line endings, 2-space indent, final newline
├── .gitignore               OS, editor, node_modules, .env, tmp/ and .claude/worktrees/ entries
├── .nojekyll                Tells GitHub Pages to serve files as-is
├── package.json             Two npm scripts (dev, serve); no dependencies
├── DISCLAIMER.md            Full "as is" disclaimer (draft, needs legal review)
├── README.md                Project overview and short how-tos
└── LICENSE                  Placeholder; no license chosen yet
```

## What to edit for common tasks

| Task | Files |
| --- | --- |
| Add or update a generator slot | `js/programs.js`, plus files in `programs/` and `assets/thumbnails/` (see the generator skill) |
| Re-render a hologram tile | `tools/hologram.html`, `scripts/build-holo.py`, `scripts/hologram-config.json` (see [hologram-tiles.md](hologram-tiles.md)) |
| Change the homepage world map | `js/worldmap.js` |
| Change the viewer or routing | `js/app.js` |
| Change the Workshop | `js/workshop.js`, `css/workshop.css` |
| Change every generator's layout, tabs or exports | `programs/shared/generator-core.js`, `programs/shared/generator.css` |
| Change the look | `css/styles.css` |
| Change page layout or add a screen | `index.html` (and `js/app.js` for navigation) |
| Add a verified printer listing | `data/public-printers.json` |
| Review an unverified candidate | `data/osm-candidates.json` (move it to the verified file once checked) |
| Change how the site is published | Repository **Settings > Pages** (deploy from `main` / root) |

## Thumbnails and hover tiles

Each generator has `assets/thumbnails/<id>.svg` (named like its page). The homepage tile shows the hologram `sprites/holo-<id>.webp` on the shared base tile, with the title as text (a tile with no hologram falls back to `pro/<id>.png`, then the SVG); the SVG also appears in the details panel and in the Workshop's Generators set. A slot without a `programUrl` gets no homepage tile.

## Files not to commit

`.gitignore` excludes `node_modules/`, `.env*`, `*.local`, `tmp/`, editor folders and OS metadata. `.claude/worktrees/` (agent worktrees) is ignored too. Nothing in the site needs `node_modules`, because the dev server uses only Node built-ins.
