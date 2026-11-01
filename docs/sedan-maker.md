# Sedan Maker (slot 105)

A toy sedan, `programs/sedan-maker.html`, in the Toys & Games group. The four wheels are printed in place: each stands beside the body on its own axle pin with clearance all round, so they spin straight off the bed. The Car parts tab adds click-to-place stamps (mirror, spoiler, hood scoop, antenna, roof rack, round light, door handle, exhaust pipe) the same way the Pin Maker and Dice Tower do.

Nothing here has been physically printed. The wheel clearance, the axle pins and the flat spot under each tire are unproven until a real print.

## Layout

Y up, millimetres, +X is the front of the car, Z is across it. The body rests on the bed and each tire touches the bed on a small flat spot (a percentage of the wheel radius). Everything prints in this pose with no rotation.

| Mesh | What it is |
| --- | --- |
| `body` | Lower body: a loft of rounded-box cross-sections along X. The plan outline is a superellipse (the Nose shape slider), the top follows the deck line (nose, hood, trunk, tail heights). The bottom edge is a 45 degree chamfer so the first layers have no overhang. The side is widened over each wheel so the axle pin is short. |
| `cabin` | The greenhouse: a second loft, narrower than the body, sunk 1.5 mm into it. Its roof line is a trapezoid (windshield and rear window slopes) smoothed by the stations. |
| `windows` | A thin skin 0.35 mm proud on the cabin sides between the door line and the roof rail. Skipped when the cabin is too low for a window. |
| `lights` | Headlight and taillight ellipsoids, 2 each. |
| `tire`, `rim`, `axle` | The four wheels, hub caps and axles, one mesh entry each (four shells), so one paint click colours all four. |
| `stamp` | One entry per placed part. |

## Print-in-place wheels

- The axle is a **diamond-section pin** (a square turned 45 degrees) so its underside is a 45 degree slope. It starts 2.5 mm inside the body, crosses the gap, passes through the wheel and ends in a flared head.
- The wheel hole is a circle of radius `axle / 2 + clearance` with a pointed top (tangent lines at 45 degrees), so the hole roof has no bridge. The wheel stays on because the flared head is wider than the hole.
- The head grows **upward only** from the pin's bottom point, so its underside never gets shallower than 45 degrees.
- The hole's bottom sits on a 0.2 mm layer line so the gap under the pin is a whole number of layers.
- When the car is placed on a table, the pin rests on the bottom of the hole, which lifts the body by about the clearance, so the wheels roll.
- The wheel gap to the body is `clearance + 0.15`; the head starts `clearance` beyond the hub cap.

Sliders: wheel size, width, distance between axles, flat spot, tread bumps, hub cap style (plain, 5 or 8 lobes) and size, wheel clearance (0.2 to 0.8, default 0.4), axle thickness.

## Car parts tab

Each stamp is stored as a surface point and normal (world coordinates, mm), a type, a size, a height factor and a turn. It is modelled flat on the surface (a across, b up or forward, c out of the surface) and sinks 1.2 mm into the car. On a wall `b` is up; on a flat top it is forward. Stamps stay where they were placed when sliders change, so a part may float or sink if the body is reshaped afterwards. Undo last and Clear are in the tab.

Wall-mounted parts have 45 degree undersides (round light, door handle) or a pointed bottom (mirror, exhaust) so they print without supports.

## Adding more car types

The page is built so a truck or an ice cream van can be added later without touching the wheels, axles, lights or stamps:

1. Write a model function like `sedanModel(p)` that returns `{ hw(x), D(x), top(x), cabinX, cabinProf, hc(x), xa, ax, R, d, rH, clr, xe, ... }`: the half-width and deck height along the car, the greenhouse, and where the axles go. `hw` must be widest across the wheels (see `hwWheel`).
2. Register it in `CAR_TYPES` and add a **Car type** choice parameter (two options become a toggle, three or more a dropdown) that picks the function in `build`.
3. Mesh builders read only the model, so they are shared. A van box or a truck bed is another loft added to `build` for that type.

## Checks

`node scripts/ci/check-generator.mjs sedan-maker`: every mesh is watertight and manifold for the defaults and all six presets, and every slider at its minimum and maximum. The default model with no stamps reads "no supports needed". The test stamps include an exhaust pipe that reads a small overhang warning. The five other presets have known overhang errors recorded in `ci/printability-baseline.json`: they are at the axle pin where it crosses the wheel hole, where the print check's 0.4 mm voxels see the 0.4 mm clearance under the pin as empty, plus a few tire edge voxels. A real slicer prints a 0.4 mm gap as two layers.
