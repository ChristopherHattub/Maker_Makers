# Cable Organizer (slot 117)

`programs/cable-organizer.html`, bundle `organization`. Three support-free cable holders in one generator, chosen with the **Organizer** dropdown. Every one is sized from a **slot count** (1 to 8) and a **cable thickness** (2 to 14 mm). It is separate from the Cable and Remote Caddy (slot 64), which holds remotes; this one only guides and parks cables. Unprinted so far: the snap-in grip and the desk clamp's pinch are unproven until a real print.

## Styles

| Style | What it is | How it prints |
| --- | --- | --- |
| Desk edge clip | A U-shaped clamp for the desk edge (thickness 10 to 60 mm) with a comb of snap-in cable slots on one side. Cables drop straight down the slots. | Lies on its back: the plate is on the bed and both arms stand straight up, so there is no bridge over the desk gap. The arm inner faces lean in by the "pinch" so the clip grips the desk. |
| Under-desk tray | A shallow tray with a snap-in notch per slot in both long walls and 2 or 4 screw holes in the floor. Screw the floor to the underside of the desk; the open side then faces down and cables snap up into the notches. | Floor on the bed, walls up, notches open at the top. |
| Under-desk clip strip | A flat strip of C-shaped cable clips with a screw hole at each end, screwed under the desk or on a wall. | Strip on the bed, the clips stand on it. The C opening is at the top. |

## Slot sizing

`sizes(p)` in the page: the opening is `cable thickness + clearance` (default 5 + 0.5 mm). The mouth is narrower by twice the **snap-in grip** but never below 80 % of the opening, so the lip underside stays steeper than 45 degrees and prints without supports. Lower the grip to 0 for an open slot. Tray length and wall height grow to fit the slot count and cable size, and the clip width grows with the slot count (never below "Clip width at least").

## Print-check notes

The shared print check works on a 0.4 mm voxel grid, and a lip edge that lands exactly on a voxel line can raise a one-row false "overhang" alert (the desk clip teeth did before the rib width got a 0.013 mm nudge). If an odd slider value shows a thin red chip on the desk clip with the lip on both sides of one rib, nudge the rib width rather than the geometry.

## Extending

Add a style by writing a function that returns `{ body: [...], slots: [...] }` (arrays of triangle lists from the helpers) and a choice entry in `style`. Put its sliders in their own group with a `showIf`.
