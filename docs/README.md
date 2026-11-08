# Maker Makers Documentation

Agents: start at [../CLAUDE.md](../CLAUDE.md).

Maker Makers is a static website with three jobs:

1. **Generator showcase.** A pannable, zoomable world map of grouped generator tiles (with spinning hologram previews, packed around a central Workshop tile, plus placeholder groups for future generators). Each parametric generator is a standalone HTML page that exports STL and colored OBJ.
2. **Workshop.** A free-range 3D editor for combining shapes, generator models and imported STLs.
3. **Public printer radar.** A free, keyless Leaflet map of public 3D printers and makerspaces, with optional worldwide search (no location request).

There is no build step and no dependencies. The site is plain HTML, CSS and JavaScript.

## Contents

| Document | What it covers |
| --- | --- |
| [HANDOFF.md](HANDOFF.md) | Agent handoff: workflow rules, open threads, loose ends |
| [architecture.md](architecture.md) | How the page, scripts and screens fit together, state, and external services |
| [file-structure.md](file-structure.md) | Every file in the repo and what it is for |
| [generator-registry.md](generator-registry.md) | The `PROGRAMS` slot registry, the generator contract, and how to add a generator |
| [slot-registry.md](slot-registry.md) | Every built slot, reserved ranges and groups |
| [generator-styling.md](generator-styling.md) | The shared generator engine: layout, config fields, build() output, Parametric / Sculpt / Color / Print tabs, print check, exports, and the visual rules |
| [animals.md](animals.md) | The fifteen animal generators (slots 76-90): sculpted kit, build script, support-free rules and print-check notes |
| [flexi-creatures.md](flexi-creatures.md) | The ten print-in-place flexi animals (slots 91-100): ball-joint kit, clearance rules and the check script |
| [workshop.md](workshop.md) | The Workshop 3D editor and the `?embed=workshop` generator hook |
| [spinner-ring.md](spinner-ring.md) | The Spinner Ring (slot 46): two-piece snap-fit band, 11 fonts, five relief patterns, the Print tab demo animation |
| [pin-maker.md](pin-maker.md) | The Pin Maker (slot 103): picture tracing in the browser, rim, hanging hole, stamps |
| [paper-towel-holder.md](paper-towel-holder.md) | The Paper Towel Holder (slot 104): three mounts, base shapes, rod styles, stamps, split rod |
| [nutcracker.md](nutcracker.md) | The Nutcracker (slot 108): print-in-place jaw (quarter disc in a concentric bowl on diamond pins), hats, tolerance, how it was checked. |
| [sedan-maker.md](sedan-maker.md) | The Sedan Maker (slot 105): lofted car body, print-in-place wheels and axles, Car parts stamps, how to add car types |
| [console-faceplate.md](console-faceplate.md) | The Console Faceplate (slot 106): devices, estimated sizes, eight designs, how to add a console |
| [gingerbread-house.md](gingerbread-house.md) | The Gingerbread House (slot 113): one-piece hollow house, corbel eaves, pointed openings, no supports |
| [fancy-ring.md](fancy-ring.md) | The Fancy Ring (slot 102): real jewellery options, the studio render and how it prints in parts |
| [text-generator.md](text-generator.md) | The Text Generator (slot 101): packed OFL fonts, build styles, triangulation, offsets and the checks |
| [dice-tower.md](dice-tower.md) | The Dice Tower (slot 66): shapes, themes, tray shapes, stamps |
| [hologram-tiles.md](hologram-tiles.md) | Hover holograms rendered from the real models (posters, `build-holo.py`) |
| [sprite-sheet-skill.md](sprite-sheet-skill.md) | Retired: the older Gemini-drawn hover-frame workflow (historical) |
| [homepage.md](homepage.md) | The pannable world map of grouped generator tiles, sorting, and the full-colour side-panel previews |
| [printer-map.md](printer-map.md) | The printer radar: data, search, and how to add a printer |
| [development.md](development.md) | Running the site locally and the live-reload dev server |
| [printability-ci.md](printability-ci.md) | The GitHub Actions printability check: per-generator jobs, when they run, the known-errors baseline |
| [deployment.md](deployment.md) | Publishing to GitHub Pages |
| [contributing.md](contributing.md) | Conventions and checklists for changes |

Step-by-step instructions for building a new generator live in the generator skill, [`.claude/skills/makermakers-generator/SKILL.md`](../.claude/skills/makermakers-generator/SKILL.md).

## Quick start

```bash
npm run dev
```

This serves the site at http://localhost:5173 and opens it in your browser. See [development.md](development.md).
