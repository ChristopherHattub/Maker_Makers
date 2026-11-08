# Console Faceplate (slot 106)

`programs/console-faceplate.html`. A flat decorative cover plate, printed face up with nothing under it, so it needs no supports. Original patterns only: no logos, console shapes or trademarked art.

## Devices (sizes are estimates)

The plate sizes in `DEVICES` are rough values taken from published console dimensions and photos. **Nothing was measured on hardware and nothing is printed.** Test-print a small piece or use the Trim slider (-6 to +6 mm) to grow or shrink the plate before a long print.

| Device | Plate (x by z, mm) | Corner radius | Notes |
| --- | --- | --- | --- |
| Switch dock | 160 x 92 | 9 | Fits the 184 mm preview bed. |
| Switch 2 dock | 178 x 100 | 10 | Fits the 184 mm bed. |
| PS5 side panel | 380 x 250 | 28 | Bigger than most beds; the engine grows the preview bed. Use Size (%) to print it smaller. |
| Xbox Series X top | 148 x 148 | 6 | The square top face. |

## Parts

`plate` (rounded slab, optional through-cut vent slots), `rim` (raised bezel, 0 mm height turns it off) and `pattern` (raised convex tiles, each embedded 0.4 mm into the plate). Pattern shapes are generated as convex polygons, clipped to the inner rectangle, and dropped when any corner would leave the rounded plate corner. Shapes never share an edge (that would be non-manifold), so keep gaps between neighbours.

## Designs

0 Plain bezel, 1 Honeycomb, 2 Diagonal stripes, 3 Circuit traces, 4 Broken rings, 5 Pixel fade, 6 Mountains and sun, 7 Starburst. Pattern size and shuffle (seed) change them.

## Add a design or a console

Designs are entries in `PATTERNS` (call `add(convexPolygon)`; `R` is the pattern rectangle) plus a name in `DESIGNS`. Consoles are entries in `DEVICES`. Run `node scripts/ci/check-generator.mjs console-faceplate`; also sweep every design on every console at the cell, relief and scale extremes.

## Open items

No hologram tile or side-panel render yet. How a plate attaches to each console (adhesive, tape, snap fit) is not designed; the plate is a decorative cover only.
