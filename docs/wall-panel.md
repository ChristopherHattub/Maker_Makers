# Wall Panel Maker (slot 116)

`programs/wall-panel.html`, code `MM-116`, group Home & Decor. A flat typography panel to hang on the wall, with loose elements placed on it, some of which really move: sliding checkboxes, sliders, progress bars and dials, all printed in place. It works differently from the other generators: a few global settings in the Parametric tab, and an **Elements** tab where pieces are dragged onto the panel and moved around freely.

Everything lies flat on the bed and needs no supports. **It has not been printed.** The clearances below are chosen from the print check and from geometry, not from a real print.

## The Parametric tab (panel)

Layout (starting set of elements), width, height, thickness, corner roundness, border width and height, hanging holes (none, two holes, keyhole) and hole size, text height, boldness, letter spacing, slide clearance and the gap above the panel. The five layouts (To-do list, Habit tracker, Progress board, Dial dashboard, Blank panel) replace the element list when the choice changes; the presets pick a layout together with a panel size.

## The Elements tab

- **Add**: drag a tile (Label, Checkbox, Slider, Progress bar, Dial, Divider, Icon) from the tab onto the panel, or tap it to add one at the middle. While dragging, a ring shows where it will land. On a phone the tile is dragged up into the 3D view.
- **Move**: with the tab open, dragging an element on the panel moves it; dragging empty space still orbits. Tapping selects it (a purple ring). **Snap to grid** (default 1 mm) is in the tab. Elements are kept inside the panel border and, on a rounded panel, inside the rounded corners.
- **Edit**: the selected element has its own sliders (text, font, size, slide distance, scale marks, rotate in 15 degree steps, move left/right and up/down), Duplicate and Delete (the Delete key works too). Undo, Reset to layout and Remove all are at the bottom. **Look from above** (also done the first time the tab opens) puts the camera over the panel.
- The tab shows a warning when elements overlap (they would print as one lump and the moving parts would jam), when text strokes are thinner than about 0.9 mm, or when an element reaches past the panel edge.

## How the print-in-place parts work

All of them are the same trick as the Sedan Maker axles: a **mushroom-section post** on the panel (a neck that flares out at about 50 degrees from flat and closes to a narrow flat top, so no face is steeper than 40 degrees from vertical) and a **chip or knob** whose cavity is that same shape pushed out by the clearance. The chip's bottom lips sit under the flare, so it cannot lift off, and nothing needs support: the flare undersides are gentle slopes and the cavity roof is a bridge only about 1.3 mm wide.

| Part | Mushroom section | Notes |
| --- | --- | --- |
| Slider, progress bar, checkbox | Rail with a stop block at each end (3 mm, 0.5 mm gap to the chip) | The chip is printed at the start end; the "Slide distance" is how far its centre travels. The checkbox chip carries a raised tick, the slider chips raised grip ridges, and scale marks are raised ticks beside the rail |
| Dial | Round pin, same profile revolved | The knob has a pointer ridge and an optional ring of scale marks on the panel (270 degree sweep) |

Print fit sliders: **Slide clearance** (default 0.35 mm, sides and top) and **Gap above the panel** (default 0.3 mm, one to two layers). Looser clearance spins freer but wobbles more; 0.25 mm may fuse on a rough printer.

The clearance test (the `sections` hook on the config, a few lines of Node): the minimum distance between rail and chip section is exactly the clearance for 0.25, 0.35 and 0.6 mm. The chip bottom is `gap` above the panel.

The print check needs `printCheckOptions: { bridgeGap: 0.8 }` (an option added to `print-check.js` with the Energy Saber): a part hovering within 0.8 mm of another counts as print-in-place, not as a floating strand. Without it every chip would read "floating".

## Text

Text uses a subset of the Text Generator fonts (`block`, `tall`, `slab`, `bubble`, `arcade`, `comic`, `swash`; SIL OFL 1.1, see [text-generator.md](text-generator.md)), copied between `FONTDATA-BEGIN` and `FONTDATA-END` and shown by the same glyph and triangulation code. Each Label element has its own text (up to 40 characters, one line), font and letter height; **Boldness** and **Letter spacing** are global. Add a font by copying its entry from the Text Generator page.

## Meshes and colours

`plate`, `rim`, `text`, `deco` (dividers and icons), `rails` (rails and stops), `chips`, `pins`, `knobs` and `marks` (scale marks, grips, ticks and pointers). Paint them in the Color tool. The Sculpt tab is off (`sculpt: false`): edits would not survive the Elements tab rebuilding the model.

State: the element list lives in the page (`items`) and goes to the Workshop through `embedState`; it is not autosaved on the site. Items overlap the panel by 0.2 mm (text and flat parts) and 0.4 mm (rails, pins) so the slicer unions them.

## Checks

`node .claude/skills/makermakers-generator/check-mesh.mjs programs/wall-panel.html --all` passes (watertight, no supports) for the defaults, all presets and the minimum and maximum of every slider. `testSetup` adds one of every element type, some rotated, in the first free spots of the panel, so the check covers them. Overlapping elements are the visitor's own doing and can read "floating" or "overhang"; the Elements tab warns about them. `sections` on the config exposes the rail, chip and pin outlines for a clearance test.

## Open items

- Unprinted. Check first: the 0.35 mm clearance and 0.3 mm gap (dials and sliders may bind or wobble), the 0.5 mm chip-to-stop gap, the thin (about 1.3 mm) bridge at the top of each chip cavity, and how the chip's first layer over the 0.3 mm gap looks.
- Elements are single-colour per element type in the Color tool, not per element.
- Text is one line per Label and always flat on the panel (no engraved or stepped text).
- The hologram tile and side-panel preview show the default to-do layout.
