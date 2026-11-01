# Paper Towel Holder (slot 104)

`programs/paper-towel-holder.html`. A countertop stand, wall mount or under-cabinet arm with a rod for a roll. Checked only by `check-mesh.mjs`; not printed yet.

## Mounts and print orientation

Every part prints with the rod pointing straight up and no supports.

- **Countertop stand**: a lofted base (six shapes, square, chamfered or rounded top edge) with the rod rising from it.
- **Wall mount**: a flat plate with counterbored screw holes; the rod rises from it (it points out from the wall in use) and can tilt 0 to 12 degrees up the wall.
- **Under cabinet**: prints lying down. A flat arm lies on the bed, the rod stands at one end, and the mounting plate stands at the other end (in use the plate is on the cabinet underside and the rod runs along it). The plate uses the same six base shapes, cut flat at the bottom so it stands on the bed and its lower edge leans no more than about 40 degrees from vertical. Screw holes are teardrop shaped because they print sideways. Max 3 holes. No stamps.
- The rod is weakest across its layers where it meets the base (it prints upright). Use a wide rod foot and sturdy filament.

## Magnet pockets

Wall and under-cabinet mounts can use magnets instead of screw holes (Fixing group: diameter 6 to 25 mm, thickness 1 to 8 mm, 2 to 4 pockets, 3 at most under a cabinet). Each pocket opens on the back face (against the wall or cabinet) and is 0.15 mm wider and 0.3 mm deeper than the magnet; glue the magnet in. On the wall plate the pocket ends in a 45 degree stepped cone, so it prints with no bridge; under the cabinet it is a teardrop that prints sideways. The plate grows thicker automatically to hold the pocket. Unprinted: check the magnet fit and the holding strength before relying on it.

## Rod

Smooth, ribbed (rippling radius), fluted or twisted-fluted cross-section, rounded, pointed or flat-chamfer tip, optional hollow bore (open at the top), and a rounded foot. Default length 170 mm; a full 280 mm roll needs a tall printer.

## Stamps

Heart, star, flower, leaf or paw outlines in a ring around the rod on the top face (stand and wall mount). Count, size, height, distance and spin are sliders; stamps that would hang off the base or cover a screw hole are dropped.

## Split rod (Print tab)

When the rod prints taller than 180 mm the Print tab offers **Split in two**: the rod is cut at a height you choose (slider, or drag the amber ring on the assembled model; the height in mm shows beside it). The lower part keeps a 16 mm round peg, the upper part has a socket with 0.25 mm clearance; both ends are 45 degree cones so nothing needs support. **Print layout** shows the two parts side by side; exports and the print check always use the layout while the split is on. A hollow rod prints solid when split, and Sculpt edits are not included in a split print. Engine hooks: `printActive`, `printShowParts`, `printPanel` (see [generator-styling.md](generator-styling.md#display-pose-and-print-plate)).
