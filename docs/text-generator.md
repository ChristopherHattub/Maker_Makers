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

`node .claude/skills/makermakers-generator/check-mesh.mjs programs/text-generator.html` checks the defaults. The page exposes `testState` (its private text/style state) so a script can sweep every style, font, plate shape and hole position. A sweep of 1,950 combinations (3 texts) had open or non-manifold meshes only in a few combinations: Marker (shadowbox layer 2, one degenerate sliver) and Slab and Marker LED walls (one case each), plus engraved Bangers with multi-line text where lines overlap. Treat those as untested until printed. **Nothing here has been physically printed.** Raised and engraved text have no overhangs; LED letters need the open back facing up; deep shadowbox frames are tall flat-walled boxes.

Known limits: no kerning, no right-to-left or complex scripts, no stencil bridges (letters with counters such as O, A, B are raised or pocketed, never cut through).
