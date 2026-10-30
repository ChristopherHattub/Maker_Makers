# Text Generator (slot 101)

`programs/text-generator.html`, bundle `personal`. Type up to 5 lines of text and print it as one of five build styles. Everything is flat on the bed (no supports): letters rise from the bed, LED letters print face down.

## Build styles

| Style | What it makes | Parts (Color tool) |
| --- | --- | --- |
| Raised letters on a plate | Plate in one of 7 shapes, optional border and hanging ring, letters standing up | Plate, Border, Lettering |
| Engraved into a plate | Plate with letter-shaped pockets (depth slider). Letters are spaced so glyph outlines never overlap | Plate, Plate top |
| Loose letters | Each letter alone, height = plate thickness + "Letters stand up" | Lettering |
| Shadowbox | Back plate, tall frame and up to 6 stepped letter layers, each inset by "Step in per layer" | Plate, Frame, Letter layer 1-6 |
| LED channel letters | Thin front face (diffuses light) plus hollow side walls, open back for an LED strip | Letter faces, Letter walls |

The Text tab holds the text box, build style, font, capitals, alignment, plate shape and hanging hole, plus "Quick looks" chips. Sliders live in the Parametric tab; sliders for styles that are not selected are ignored.

## Fonts

Ten open-licence (SIL OFL 1.1) fonts from the google/fonts repository: Archivo Black, Bebas Neue, Sniglet ExtraBold, Titan One, Alfa Slab One, Pacifico, Lobster, Bungee, Caveat Brush and Bangers. OFL permits embedding, converting and redistributing the outlines; the licence texts are in `tools/text-fonts/licenses/`. Only outlines are used (no font files are shipped or fetched), so the page works offline and sends nothing anywhere.

`node tools/text-fonts/build.mjs` downloads the TTFs into `tools/text-fonts/cache/` (git-ignored), parses them with a small built-in TrueType reader (no dependencies), and rewrites the `FONTDATA` block (between the `FONTDATA-BEGIN` / `FONTDATA-END` markers) in the page. Each glyph is stored as quadratic outlines in 1/250-em integers (`m` absolute, then `l`/`q` relative). The character set is ASCII plus common Latin accents and symbols (`CHARS` in the build script). To add a font, add it to `FONTS` in the build script, add its licence file, and re-run.

## How the geometry works

- Quadratics are flattened (about one segment per 1.1 mm), loops cleaned, then sorted into outer loops (CCW) and holes (CW) by area sign. A counter that only touches the outline at a corner is pulled in 0.02 mm so the shapes stay separate.
- Triangulation is built in (hole bridging plus ear clipping), so `check-mesh.mjs` can run without three.js. Results are cached per glyph, size and boldness.
- Offsets (boldness, shadowbox layers, LED walls, borders) move each vertex along its miter normal. `probe()` measures how far a stroke can move before folding, and `offsetShape` / `ringFor` fall back to smaller offsets until the result is a clean, non-crossing outline. A very thin font with large walls therefore gets thinner walls rather than a broken mesh.
- Modes that need non-overlapping glyphs (engraved, shadowbox, LED) push touching letters apart by 0.5 mm; raised and loose keep script fonts joined.

## Checks

`node .claude/skills/makermakers-generator/check-mesh.mjs programs/text-generator.html` checks the defaults. The page exposes `testState` (its private text/style state) so a script can sweep every style, font, plate shape and hole position. The last sweep (1,950 combinations, 3 texts) had no open or non-manifold edges. The only findings were zero-area slivers (Marker and Bungee in the shadowbox), which slicers ignore. A manifold check does not prove a triangulation is right, so plates with many letter pockets were also sampled for coverage against the true outlines (210 engraved plates, all correct).

Practical rules the generator enforces:

- **Thin strokes warning:** the Text tab shows the typical thinnest stroke (10th percentile of wall-to-wall distance). Under 0.9 mm it turns amber (a 0.4 mm nozzle cannot print it). Lobster below about 16 mm and any script font below about 10 mm trigger it.
- **LED walls** are at least 0.8 mm. A letter whose strokes are too thin or too close to hollow out (inner gaps of an m, say) is printed solid instead, so very thin fonts become mostly solid letters; pick Bungee, Sniglet, Titan One or Archivo Black for hollow letters.
- **LED letters print face down:** the front face sits on the bed and the open back faces up for the LED strip. Default size is 30 mm, so a whole word can exceed the bed; the readout shows the size, and letters can be printed one at a time.
- **Engraving** is limited to the plate thickness minus 0.8 mm, so there is always a floor.
- **Shadowbox layers** step inward by an amount clamped to the stroke width, so thin fonts lose their upper layers' step rather than breaking.
- **Heart** plates are sized to hold the text, so two lines make a large heart; one short line suits it best.

**Nothing here has been physically printed.** Raised and engraved text have no overhangs, LED letters and shadowboxes are vertical walls on a flat face.

Known limits: no kerning, no right-to-left or complex scripts, no stencil bridges (letters with counters such as O, A, B are raised or pocketed, never cut through).
