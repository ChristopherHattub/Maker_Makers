# Energy Saber (slot 110, `programs/energy-saber.html`)

A collapsible, extendable toy saber, printed in one go. The hilt is a hollow handle; the blade is two to five round tubes nested inside it that slide out like a telescope. Original design, not a replica of any franchise prop. Y up, millimetres, standing on y = 0, centred on the Y axis. Every solid is a closed lathe shell (`revolve`).

## How the telescope works

Radii run outwards from the tip tube (`ro`), with `c` = slide clearance, `e` = catch overlap, `w` = tube wall, `Lb` = guide length, `s = c + e`:

- Each tube has a **collar** at its bottom (outer radius `f = ro + c + e`, length `Lb`, 45 degree chamfer on top) and a **lip** at its top (hole radius `h = ro_next + c`, flat bore `Lb` long, 45 degree underside). The collar is wider than the hole by `e`, so a tube stops when its chamfer meets the lip's cone.
- Tube `k` is `2c + e + w` smaller than tube `k-1`. The hilt is tube 0: a bore of `ro1 + 2c + e`, a 4 mm floor and the same lip.
- All tubes stand on the hilt floor with a vertical gap (default 0.4 mm, two layers) and their tops are flush with the hilt top. Stroke per tube is `tube length - 2 Lb - e`.
- Every surface that faces down is a 45 degree cone, so nothing needs supports. The hilt outline is passed through a slope limiter (never widens faster than about 42 degrees), so any style, grip width or ring setting prints without supports.
- The tip tube is closed by a solid dome (rounded, bullet or flat) over a 45 degree cone.

Slider notes: more tubes make the whole saber wider (each step costs `2c + e + w` of radius); the grip width has a floor so the hilt wall never gets thinner than 2.2 mm around the bore. The **Extend** slider is preview only: at 0 % the model is in its print position, any other value floats tubes in the air and the print chip rightly turns red.

## Hilt parts tab

A second tab, **Hilt parts**, places decorative modules on the hilt by tapping it (the same pattern as the Sedan Maker's Car parts): band, flange, ribs, fins, studs and gem. A tap sets the height (and the turn angle for fins, studs and the gem); the sliders in the tab (size, height, count) apply to the next part. Parts stay put when other sliders change, each is its own colour in the Color tool, and "Add a sample set", "Undo last part" and "Clear parts" are in the tab. State lives in the `parts` array (also `embedState` for the Workshop).

Rules that keep every part printable: undersides are 45 degree cones, bands and ribs follow the hilt outline, studs and the gem start at the narrowest wall height under them so no plug hangs in the air, and every part is sunk into the wall but never closer than 0.8 mm to the bore (so it cannot touch a blade tube). Parts are clamped to the hilt height. `testSetup` places one of each so `check-mesh.mjs` and CI cover them, using the tab's slider values; ribs are limited to one bead per 1.2 mm and kept 0.3 mm apart so no two beads share an edge.

## Print check

`printCheckOptions: { bridgeGap: 0.8 }` tells the shared print check that a part hovering within 0.8 mm of another solid is a deliberate print-in-place gap (the voxel grid cannot resolve 0.4 mm). `bridgeGap` defaults to 0, so no other generator changes. The gap itself is still a bridge over 0.4 mm of air in the slicer.

## Testing the clearances

`MM_GENERATOR` exposes `layout`, `hiltLoop` and `tubeLoop` (the 2D profiles that are revolved). A 2D check of the profile polygons of every neighbouring pair confirmed, for defaults, every preset and slider extremes: at 0 % and 50 % extension the closest approach is at least the slide clearance (or the floor gap) and no profiles overlap; at 99.9 % there is no overlap and at 100.1 % the tubes overlap, i.e. the stop sits exactly where the geometry says. See the PR for the numbers.

## Known untested

Unprinted. Unproven on a real printer: the 0.35 mm side clearance and 0.4 mm floor gap (try "Tight fit" or raise the clearance if tubes fuse), the bridge over the gap, blade stiffness when extended (longer guide length helps), and whether the 1.2 mm catch overlap holds under a hard pull.
