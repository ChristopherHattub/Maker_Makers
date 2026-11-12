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
| [bat-builder.md](bat-builder.md) | The Bat Builder (slot 128): flat support-free bat, scalloped wings with bone beads, ears, cute and Halloween faces, hanging loop, checks. |
| [bird-feeder.md](bird-feeder.md) | The Bird Feeder (slot 123): tray, posts, hopper with arched ports and cone roof kit, hanging, print layout, check notes. |
| [cable-organizer.md](cable-organizer.md) | The Cable Organizer (slot 117): desk edge clip, under-desk tray and clip strip, slot sizing, snap-in lips |
| [marble-run.md](marble-run.md) | The Marble Run (slot 109): zigzag tower layout, support-free track profile, the ball simulation |
| [nutcracker.md](nutcracker.md) | The Nutcracker (slot 108): print-in-place jaw (quarter disc in a concentric bowl on diamond pins), hats, tolerance, how it was checked. |
| [stamp-maker.md](stamp-maker.md) | The Stamp Maker (slot 115): mirrored relief text and icons on a plate with a one-piece tapered grip, layouts, icon list |
| [gravity-walker.md](gravity-walker.md) | The Gravity Walker (slot 122): a ramp-walking toy with print-in-place rear legs, the walking simulation and how to retune it |
| [sedan-maker.md](sedan-maker.md) | The Sedan Maker (slot 105): lofted car body, print-in-place wheels and axles, Car parts stamps, how to add car types |
| [kalimba-maker.md](kalimba-maker.md) | The Kalimba Maker (slot 120): tines cut into the board and tuned from beam theory, support-free roof, print pose vs shown pose |
| [fidget-spinner.md](fidget-spinner.md) | The Fidget Spinner (slot 114): six outline styles, print-in-place hub or 608 bearing, arm pockets, raised name |
| [console-faceplate.md](console-faceplate.md) | The Console Faceplate (slot 106): devices, estimated sizes, eight designs, how to add a console |
| [zoetrope.md](zoetrope.md) | The Zoetrope (slot 121): slotted drum on a print-in-place pin, picture strip pieces, the four picture sets, how to add one |
| [wall-panel.md](wall-panel.md) | The Wall Panel Maker (slot 116): text panel with a drag-and-drop Elements tab, print-in-place checkboxes, sliders, progress bars and dials |
| [battery-dispenser.md](battery-dispenser.md) | The Battery Dispenser (slot 111): AA and AAA gravity stacks, ramp and lip, arched front windows, the dispense checks |
| [holiday-tree-topper.md](holiday-tree-topper.md) | The Holiday Tree Topper (slot 107): faceted star on a print-in-place spinning cone, socket geometry, clearances, print-check alignment |
| [energy-saber.md](energy-saber.md) | The Energy Saber (slot 110): telescoping print-in-place blade tubes, catch and clearance geometry, hilt styles, how it is tested |
| [gingerbread-house.md](gingerbread-house.md) | The Gingerbread House (slot 113): one-piece hollow house, corbel eaves, pointed openings, no supports |
| [pet-bowl-housing.md](pet-bowl-housing.md) | The Pet Bowl Housing (slot 112): a holder with a pocket for your own bowl, single or double, outlines, profiles, wall patterns, base, tray, link bar and platform |
| [headphone-controller-stand.md](headphone-controller-stand.md) | The Headphone & Controller Stand (slot 119): desk and wall headphone stands, controller rack and shelf, Console Faceplate designs |
| [holiday-tree.md](holiday-tree.md) | The Holiday Tree (slot 8): tiered tree and its decorating options |
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
