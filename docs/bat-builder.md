# Bat Builder (slot 128)

`programs/bat-builder.html`, in the Halloween group. A bat lying face up on the bed with its wings spread, so every surface slopes upward and it prints with no supports. Unprinted: the ear lean, the wing bone relief and the strength of the loop are unproven until a real print.

## Pieces (mesh names, each paintable and selectable in Sculpt)

Design space is `u` across, `y` up, `v` toward the top of the head; `finish()` maps it to the printed pose and orients every shell by its signed volume. Each piece is its own closed shell and the slicer unions the overlaps.

| Mesh | What it is |
| --- | --- |
| `wings` | One extruded slab (`polyPrism`, three.js earcut) under both wings, the body and the tail. Outline: a leading edge offset 2.7 mm from the arm bone, rounded finger tips, a scalloped trailing edge (one quadratic curve per finger, pulled toward the wrist) and a tail curve. |
| `bones` | Raised half-round beads (`ridge`) for the arm bone and 2 to 6 finger bones per wing, plus a dome at each wrist. Beads follow the surface and sink into it so there is no gap. |
| `body` | A torso dome and a head dome (half ellipsoids with flat bases on the bed). |
| `fur` | Three chest chevrons (beads). |
| `ears`, `innerEars` | Each ear is a curved tapered loft that starts on the bed inside the head and leans forward 34 degrees at the tip (plus the flare outward), so no surface goes past about 45 degrees. The inner ear is a thin patch on the visible face. |
| `eyes`, `pupils`, `glints`, `brows`, `nose`, `mouth`, `fangs` | Face. Cute: round eyes with a pupil and a sparkle, a smile and two small fangs. Halloween: slanted eyes with slit pupils, angry brows, a wide grin with two big fangs and three small teeth. Fangs are tapered beads lying on the head, so they need no support. |
| `loop` | A flat-bottomed ring (D section, 3.2 mm tall, 3.4 mm hole) at the feet end. Hanging pose only. |

## Controls

Wingspan 80 to 170 mm, wing bones per wing, scallop depth, membrane thickness, bone height, Cute or Halloween face, ear size and flare, fang length (0 = none), Perched or Hanging pose, hanging loop, body size. Hanging turns the whole design 180 degrees in the plane (head toward the viewer, loop at the far end), so a bat hung by the loop appears upside down. Presets: Default cute bat, Cute hanger, Halloween hanger, Spooky perched bat, Big-eared perched bat, Vampire bat, Tiny charm, Big-eared fruit bat.

Fang length is capped at 75% of the head depth, and each scallop is flattened until its edge leaves a finger tip at 30 degrees or more, so a bone never ends over a notch. The last finger is kept above the hip so the outline cannot cross itself on small bodies.

## Checks

`check-mesh.mjs --all` is clean (watertight, no print-check issues) for the defaults and every preset, and about 120 random slider combinations (with the extremes over-sampled) were clean. The viewport opens from a steep top-down camera (`onStage`), since the bat is flat.
