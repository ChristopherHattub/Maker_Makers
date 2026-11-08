# Bird Feeder (slot 123)

A hanging gazebo bird feeder, `programs/bird-feeder.html`, in the Garden group. It prints as a kit of three parts laid flat on the bed, none of which needs supports. The viewport shows the feeder assembled; the Print tab (and every export) shows the print layout. It uses `printMeshes`, so the Sculpt tab is not offered ([generator-styling.md](generator-styling.md#display-pose-and-print-plate)).

Nothing here has been physically printed. The fit clearance, the post-in-groove roof and the seed flow through the ports are unproven until a real print.

## Parts

Y up, millimetres, every part on y = 0 with its centre on the axis. All round parts are closed loops of a (radius, y) profile revolved about Y (`lathe`), so they are watertight by construction. Polygon outlines (hexagon, octagon, square) use the same loops with 6, 8 or 4 segments, scaled so the width across the flats matches the round size.

| Mesh | What it is |
| --- | --- |
| `tray` | Floor plate (a three.js extrusion with the cord hole and the drain holes), a 2 mm rim wall, and a hub holding the cord hole and a solid seed cone that sheds seed towards the ports. Three overlapping shells, unioned by the slicer. |
| `posts` | 3 to 8 boxes standing on the floor, overlapping the rim by 0.5 mm. On a polygon outline there is one post on the middle of each flat. |
| `hopper` | An open tube, always round, standing on the floor around the cone. The bottom edge is lifted into pointed (ogive) arches, one per feeding port, by moving the bottom ring vertices (`notch`), so the arches are smooth and need no cut-outs. The arch walls are at least 33 degrees from vertical, so they print without supports. |
| `roof` | A cone shell (45 to 70 degree pitch) with a vertical lip, an apex chimney for the cord, an optional finial, and an **inner and outer guide wall** under the cone. The gap between the walls is a groove, `post thickness + 2 x clearance` wide, and the cone itself is its roof. The post tops slide into the groove and rest on the ceiling; the roof can turn freely. |

The roof's underside never has a flat bridge: the ceiling is the cone, at most 45 degrees from vertical at the default and steeper pitches. The finial flares out at about 41 degrees.

## Hanging

Thread a cord through the roof, down the middle of the hopper and out of the cord hole in the tray, and knot it under the tray. The cord carries the whole feeder; the roof simply lifts off along the cord to refill the hopper. Hopper off gives an open tray feeder with a small mound in the middle.

## Print layout

`printMeshes` packs the roof, the tray with its posts and the hopper into rows no wider than 236 mm, 10 mm apart. The default kit is about 234 x 200 mm, so it needs a 256 mm bed or three separate plates; the Print tab's bed outline grows to fit.

## Print check notes

`check-mesh.mjs` and the live chip voxelise the whole layout at a cell size of span / 170, so a very large layout (tray wider than about 130 mm with a big roof overhang) is checked coarsely and can show false overhangs. The defaults and every preset are clean. A per-part check at 0.5 mm cells was run over every slider's minimum and maximum and a set of combined extremes: all clean at pitch 45 or more (below that the roof ceiling goes past 45 degrees from vertical).

## Presets

Default gazebo feeder, Finch feeder (small ports), Tray feeder (no hopper), Hexagon cottage, Pagoda (octagon, tall roof and finial), Big hopper.
