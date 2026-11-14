# Accordion Lampshade (slot 139)

`programs/accordion-lampshade.html`. A diamond-pleated drum lampshade for a harp lamp, as a three-part kit:

- **Shade**: printed in spiral vase mode. The STL is a closed solid (flat bottom and top caps) so the slicer can turn every layer into one loop; with bottom shell layers at 0 the print is open at both ends.
- **Spider**: three arms and a hub that sits on the harp. A peg under each arm drops into one of the shade's outer pockets at the top rim. The pockets narrow as they go down, so the pegs wedge in by friction.
- **Finial**: screws onto the harp stud on top of the hub. Four styles (Faceted gem, Pleated orb, Teardrop, Spire) or None.

## Geometry

The shade is a Yoshimura-style lattice: `bands + 1` levels, each with `2 x pleats` points that alternate between the outer and inner radius. Each level is offset one point from the level below, so every band is a ring of diamonds. Quads fold along the diagonal joining two outer points (`Folds: Valleys out` picks the other diagonal). Optional waist pinch (every other level pulled in), taper (top width) and twist act on the lattice.

`pleats` moves in steps of 3 so the three spider arms land on matching pockets 120 degrees apart. The pockets used are the outer points of the top level.

The viewport shows the shade as a thin open wall (1.2 mm) so the spider is visible inside; the print plate uses the closed solid.

## Spider peg fit

The pegs size themselves to the pocket (`fitInfo`):

1. The peg centre sits `0.46 x pleat depth` inside the outer points (11 mm on the tested 24 mm pleat).
2. Peg radius = distance from the peg centre to the pocket's two sides at the rim, less a 0.65 mm vase wall (`VASE_WALL`, the outer wall line width) and the `Peg gap` slider.
3. The top band is then sliced every 0.25 mm going down to find how deep the round-tipped peg sinks before a slice has no room. That depth places the spider in the viewport and is reported in the Print tab's fit check.

On the default shade this gives 7.3 mm pegs (radius 3.65), the same as the snug spider that was printed and fits (`Peg gap` 0.05 is that tested fit). The friction fit holds the shade on the lamp once the finial clamps the hub; it does not hold if you lift the shade by the spider.

## Finial

Each finial is a solid of revolution (`revolve`) that stands on a flat collar, widens at 45 degrees or less, and has a bore that ends in a 45-degree cone so it prints without support. Faceted styles reshape each ring with `polyR` (8 facets, or 4 for the Spire); the Pleated orb uses the shade's diamond lattice on the ring radius.

The stud hole is either **Plain**, slightly under the thread's minor size so the steel stud cuts its own thread (5.9 mm for 1/4"-27, 9.4 mm for M10), or a **Printed thread**: the bore radius follows a helix with a triangle profile (pitch 25.4/27 mm or 1 mm, 0.2 mm clearance on the major diameter).

## Print tab

`printPanel` adds a plate picker, a fit check and the recommended Bambu Studio settings for the selected plate. `printMeshes` returns:

- **Shade**: the closed shade solid. Settings: spiral vase on, bottom shell layers 0, 0.2 mm layers, outer wall line width 0.6 to 0.7 mm, brim 5 mm.
- **Spider + finial**: the spider flipped (flat face down, pegs up) with the finial standing between two arms. Normal mode, 4 walls; 0.12 mm layers suggested for a printed thread.

Picking a plate also changes the file name field. There is no Sculpt tab (the generator uses `printMeshes`).

## Checks

`check-mesh.mjs` passes (watertight, no supports needed) for every preset on both plates, every finial style with both stud holes, and the shade slider extremes (120 mm / 48 pleats / 12 mm deep / 2 rows, and 300 mm / 18 pleats / 40 mm deep / 9 rows). To check the second plate, temporarily change `var plate = 0` to `1`.

## Print status

- Printed (P1S, PLA, 0.65 mm line width): the default shade, a 35 mm fit-test ring cut from its top, and the spider with 3.6 mm-radius pegs on a 1/4"-27 harp. Clean in vase mode once the filament was dried.
- Unprinted: the finials, both stud holes, the M10 option and other shade shapes. The pocket fit model is calibrated only on the default shade.
