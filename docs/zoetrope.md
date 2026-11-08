# Zoetrope (slot 121)

`programs/zoetrope.html`, bundle `toys`. A slotted drum that spins on a pin, plus a strip of animation frames that curls into the drum. Spin the drum and look through the slots at the pictures on the far wall: they seem to move. **Nothing here has been physically printed.**

## What prints

Everything lies flat on the bed in one job: the base with its pin, the drum already sitting on the pin, and the strip in one to four flat pieces in front of the base (the engine centres the whole layout).

| Mesh | Part name | Notes |
| --- | --- | --- |
| `base` | Base plate | Disc 4 mm thick, radius = drum radius + 5, 1.2 mm 45° chamfers. |
| `pin` | Pin | 7 mm pin from the bed through the hub, with a cone head (45° underside, 0.8 mm rim) so it prints with no supports and keeps the drum on. |
| `drum` | Drum | One watertight lathe surface: floor, hub tube, wall, picture pocket and the crown of slots. |
| `strip` | Picture strip | Flat bands, 0.6-1.2 mm thick (default 0.8). |
| `pictures` | Pictures | Raised 0.6 mm shapes on the bands, embedded 0.2 mm into them. |

## How the drum works

- **Print-in-place gap.** The drum floor starts `gap` (default 0.5 mm, slider 0.3-0.8) above the base top and the hub bore is `pinClear` (default 0.5 mm) wider than the pin. The drum is printed over the gap like the Gear Train Spinner's gears; one twist breaks any stringing and it spins. The pin head sits `gap` above the hub, so the drum can lift about 1 mm but not come off.
- **The print check flags the gap.** The floor starts in mid-air over a 0.5 mm gap, which the shared check (cell size about 0.5 mm) reads as an overhang at about 4 mm high. This is recorded in `ci/printability-baseline.json`; the *Small desk model* preset is small enough that the check does not resolve the gap. A real slicer bridges 0.5 mm onto the base below. If a print sags or fuses, raise `Gap under the drum` and print slowly.
- **Open-top slots.** The crown is cut as open slots (no bridges). The lathe profile has a "prong" form and a "slot" form that differ only at the top, and the angle list switches between them, so the whole drum stays one closed surface (`buildDrum`). Slot sides are radial; `Slot width` is measured at the inner wall.
- **Picture pocket.** Below the slots the inner wall steps out by strip thickness + 0.4 mm. The pocket's top edge is a 45° chamfer (no overhang) that catches the strip's upper edge; the floor holds the lower edge. Curl a strip piece and slide it in from the top. Pieces together are `2π(pocket radius - strip/2) - 1 mm` long, so they fit with a 1 mm gap.
- **Slot = frame.** `Frames` sets both the number of slots and the number of pictures.
- **Spin direction.** Pictures run left to right along the strip as seen from inside the drum. Spin the drum **anticlockwise as seen from above** and the animation plays forwards (a frame advances by one for each slot that passes the eye). Worked out on paper and in the preview simulation, not on a printed drum.

## Picture sets

`ANIM_NAMES` in the page: Running figure (stick figure with a grounded stride), Flapping bird, Bouncing ball (squashes on landing), Blooming flower (two rings of petals breathing and turning opposite ways). Each is a function in `frameShapes(anim, i, n, rmin)` returning 2D polygons in figure units (picture area -1..1, +y up); the strip builder scales them to `min(frame width, picture height) - 3 mm`, extrudes them and nudges every shape by a few microns so duplicate shapes never share an edge (the mesh check counts shared edges). Strokes are never thinner than 0.6 mm radius.

To add a set: add a name to `ANIM_NAMES`, a branch in `frameShapes`, raise the `animation` slider's `max`, and run `check-mesh.mjs` on it.

## Printing the strip

- Two colours: print the band, change filament at 0.8 mm (layer 5 at 0.2 mm layers), then the pictures. Or paint the two parts in the Color tool and use the OBJ export.
- Strip pieces bend around radius about 40 mm: 0.8 mm PLA is fine, PETG is more forgiving. Thinner (0.6) bends easier.
- `Printed picture strip: Off` prints only the drum; draw frames on paper and slip them into the pocket.
- Pieces lie in a column in front of the base; with the default two pieces the layout is about 124 x 153 mm and fits a 184 mm bed.

## Checks

`node .claude/skills/makermakers-generator/check-mesh.mjs programs/zoetrope.html --all`: watertight on defaults and all seven presets, and on a sweep of every slider at its minimum and maximum for each picture set (run by temporarily adding presets). Print check: only the gap under the drum.

## Unproven (needs a real print)

- Whether the 0.5 mm gap prints free (the Spinner Ring's 0.4 mm gaps fused in a test print; flat faces may behave better than that ring's V groove).
- Strip bend and fit, and the view through the slots at the default slot width.
- The spin direction above.
