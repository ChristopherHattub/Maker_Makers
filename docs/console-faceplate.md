# Console Faceplate (slot 106)

`programs/console-faceplate.html`. A flat decorative cover plate, printed face up with nothing under it, so it needs no supports. Original patterns only: no logos, console shapes or trademarked art.

## Devices (sizes are estimates)

The plate sizes in `DEVICES` are rough values taken from published console dimensions and photos. **Nothing was measured on hardware and nothing is printed.** Plate sizes are fixed (no size or trim sliders), so a plate always fits the same. Test-print one and, if it does not fit, edit the numbers in `DEVICES`.

| Device | Plate (x by z, mm) | Corner radius | Notes |
| --- | --- | --- | --- |
| Switch dock | 160 x 92 | 9 | Fits the 184 mm preview bed. |
| Switch 2 dock | 178 x 100 | 10 | Fits the 184 mm bed. |
| PS5 side panel | 380 x 250 | 28 | Bigger than most beds; the engine grows the preview bed. |
| Xbox Series X front | 148 x 298 | 6 | The front face only. The top is left clear because it holds the fan vents. Taller than 256 mm, so the preview bed grows to 350 mm. |

## Parts

`plate` (rounded slab, optional through-cut vent slots), `rim` (raised bezel, 0 mm height turns it off) and `pattern` (raised convex tiles, each embedded 0.4 mm into the plate). Pattern shapes are generated as convex polygons, clipped to the inner rectangle, and dropped when any corner would leave the rounded plate corner. Shapes never share an edge (that would be non-manifold), so keep gaps between neighbours.

The three parts have their own default colors so they read apart while customizing: plate Shadow Black, rim Phantom Ice, pattern Glow Mint (mesh `color` fields; the Color tab still repaints them).

## Designs

0 Plain bezel, 1 Honeycomb, 2 Diagonal stripes, 3 Circuit traces, 4 Broken rings, 5 Pixel fade, 6 Mountains and sun, 7 Starburst. Pattern size and shuffle (seed) change them.

## Add a design or a console

Designs are entries in `PATTERNS` (call `add(convexPolygon)`; `R` is the pattern rectangle) plus a name in `DESIGNS`. Consoles are entries in `DEVICES`. Run `node scripts/ci/check-generator.mjs console-faceplate`; also sweep every design on every console at the cell and relief extremes.

## Open items

Hologram tile and side-panel render done (12 Nov). How a plate attaches to each console (adhesive, tape, snap fit) is not designed; the plate is a decorative cover only.
