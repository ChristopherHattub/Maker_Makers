# Kalimba Maker (slot 120)

A thumb piano, `programs/kalimba-maker.html`, in the Toys & Games group. The tines are cut into the playing board itself, so the whole instrument prints in place as one piece with no supports and no assembly. Nothing here has been physically printed: the pitch, the sound and the clearance between tines are unproven until a real print.

## Two poses

`model(p, api)` builds the **print pose**: the playing face lies on the bed (y = 0), the resonator grows up from it. `printMeshes` returns that for Export .STL / .OBJ, the Print tab and the print check. `build` returns the same meshes turned over (a half turn about X, `flipOver`) so the viewport shows the instrument playing face up. Because `printMeshes` is set, the engine hides the Sculpt tab.

## Meshes

| Mesh | What it is |
| --- | --- |
| `board` | **One closed surface**: the plate (thickness = tine thickness) with a comb-shaped slot cut through it. The teeth of the comb are the tines. Note labels are 0.6 mm pits in the playing face (engraved, so they sit in the first layers on the bed). Built from `cap` / `wall` primitives with the glyph loops shared by caps and walls, so it stays watertight. |
| `body` | The resonator shell: a rounded-rectangle outline, a straight wall, then a roof that insets at 42 degrees from vertical (`SLOPE` = 0.9) until the opening, the sound hole. Outer and inner surfaces are lofted rings with the same point count (`NA + 1` points per corner); corners shrink as true parallel curves. The shell touches the board face to face at y = thickness. |
| `bridge` | The root bar: a thick block across the rear that the tines grow out of (clamps their roots), embedded in the board and the wall so slicers fuse it. |

## Tuning

A flat tine of thickness `t` and free length `L` rings at `f = 0.16155 * t * c / L^2` (Euler-Bernoulli cantilever, first mode), with `c = sqrt(E / density)`. The page uses E = 3.0 GPa and density 1200 kg/m3 for printed PLA along the layers (`PLA_C` = 1581 m/s), scaled by the **Material stiffness** slider (L grows with E^(1/4); pitch with E^(1/2), so a tine that prints a semitone flat needs the slider about 12 percent lower). That slider is the calibration: print, tap the longest tine against a tuner app, adjust, reprint. Tine length is clamped to 12 mm.

Order: the traditional layout puts the lowest note in the middle and alternates right and left going up (note k goes to the right when k is odd, left when even); "Low to high" puts them in order left to right. Scales are major, natural minor, major and minor pentatonic and chromatic, from any key and a start octave.

Click the board in the Parametric tab to hear the nearest tine (`onPick`, Web Audio, generated in the browser): a sine at the ideal pitch plus a faint, short second mode at 6.27 times the pitch. It plays the formula's note, not the printed one.

## Geometry rules

- Slits: `gap` (default 1.2 mm) between tines and past each tip; tips are chamfered 1 mm. Under 1 mm may fuse in the first layers.
- Labels sit past the tine tips on the board, each clear of every slit and of other labels (greedy placement, `placed`). Glyph outlines are the Text Generator's bold block font (SIL OFL 1.1), embedded for `A-G`, `0-9` and `#`. Each glyph vertex is nudged by about 3 microns (`jit`) because exactly collinear vertices from two letters on one baseline made the triangulator leave a gap.
- The rear inner wall is at least `min(corner, 30)` mm from the root so the bar's rounded rear corners stay inside the cavity; the bar top is kept at least 1.3 mm under the start of the roof.
- Heights: board 1.6 to 3.6 mm, straight wall 4 to 30 mm, then the roof; with the defaults the body is about 34 mm tall in total. A smaller sound hole makes a taller roof.

## Print check

Defaults and all presets read "no supports needed". A label on a pit wider than about 2 mm can raise a small overhang warning at the lowest octaves. A voxeliser bug (a one-cell pinhole when a triangle edge fell between a cell centre and its ray) was fixed in `programs/shared/print-check.js` while building this, which removes false overhangs on long straight roof bands.

## Open items

Unprinted. To check: tine pitch against the formula and the stiffness default, whether 1.2 mm slits fuse, the engraved label legibility, and the volume of a PLA board. Presets: Default 17-key C, Pocket 8-key, Lullaby 10-key (A minor pentatonic), Deep 15-key (C3), Chromatic 13-key, Stiff PETG 17-key.
