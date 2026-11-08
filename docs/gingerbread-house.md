# Gingerbread House (slot 113)

A gingerbread house, `programs/gingerbread-house.html`, in the Christmas group. It prints as **one piece with nothing to assemble**, hollow and open underneath so it stands over a 38 mm LED tea light. There is no moving part (a hinged door was left out: nothing here has been printed, and a print-in-place hinge would be a guess).

Nothing has been physically printed. The print check passes for the defaults and every preset, but the 45 degree corbels, the pointed window tops and the 40 degree ceiling are unproven on a real printer.

## Layout

Y up, millimetres, long side along X, the front door on +Z. The model sits on the bed (lowest point y = 0).

| Mesh | What it is |
| --- | --- |
| `walls` | Four plates: front and back (extruded along Z, with the window holes and, for an open doorway, a notch) and two gable ends (extruded along X, pentagon outline). The gable plates stop inside the long walls so no two shells share an edge. |
| `roof` | **One profile extruded along X**: a thick inverted V. The underside is the ceiling (rises at the roof pitch, so 40 degrees from vertical or better), the top is the roof, and the eaves are 45 degree corbels (below). Tile rows are steps cut into the profile. |
| `door`, `knob` | A raised pointed panel on the front wall (only for *Raised door*), and a 40 degree frustum knob. |
| `chimney` | A box on the front slope. Its bottom edge is cut parallel to the roof and sunk into the middle of the roof thickness, so it never pokes into the room. |
| `candy`, `candy2` | Gumdrops: low domes sitting on the tiles, alternating between two meshes so they can be two colours. |
| `base` | Optional snow plate (plain or scalloped), open in the middle so the light still fits. |

## Why it needs no supports

- **Hollow, open underneath.** The walls stand on the bed, so there is no floor to bridge. The ceiling is an inverted V whose slopes are at least 40 degrees from vertical.
- **Eaves on corbels.** A roof that slopes down past the wall would start in mid-air at its lowest point. Instead the overhang is carried by a 45 degree chamfer that starts on the wall face and rises outward (*Wall height under the eaves* is where it starts), and the roof top meets it at a 1.6 mm blunt tip. A thicker roof or a longer overhang makes the wedge bigger, never longer than *Eave overhang* asks (a very thick roof grows the overhang a little so the wall still reaches it).
- **Every opening has a pointed top.** Windows are pointed (45 degree sides), diamond, or teardrop (a circle with a 45 degree point). The open doorway is pointed too. The centre bar splits a pointed window in two, each half still has a sloped top.
- **Tiles** are vertical steps on the top face, which are not overhangs. Gumdrops are domes below 70 degrees on a sloping roof, which keeps them under 40 degrees of lean.
- Windows and the door stay 4 mm under the start of the corbel (they shrink to fit a low wall).

## Three.js and the hole quirk

Window holes use `THREE.ExtrudeGeometry`. Its triangulator drops collinear points, which opens T-junctions when two holes share a bottom line. Each hole is lifted by 0.004 mm per hole (`place()`), which is far below anything printable. Keep that if you add holes.

## Known limits

- The print check runs on a voxel grid of (longest side / 170). On the very largest houses at the minimum pitch it can flag a spurious overhang on the ceiling at some alignments; the defaults, every preset and all single-slider extremes pass.
- Sculpt edits move and delete the separate plates, roof and domes; they do not re-cut windows.
- The tea light fit needs an inside of at least about 42 mm; keep *Depth* high enough for the wall thickness you choose.
