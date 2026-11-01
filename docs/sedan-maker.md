# Sedan Maker (slot 105)

A toy sedan, `programs/sedan-maker.html`, in the Toys & Games group. The four wheels are printed in place: each stands beside the body on its own axle pin with clearance all round, so they spin straight off the bed. The Car parts tab adds click-to-place stamps (mirror, spoiler, hood scoop, antenna, roof rack, round light, door handle, exhaust pipe) the same way the Pin Maker and Dice Tower do.

Nothing here has been physically printed. The wheel clearance, the axle pins and the flat spot under each tire are unproven until a real print.

## Layout

Y up, millimetres, +X is the front of the car, Z is across it. The body rests on the bed and each tire touches the bed on a small flat spot (a percentage of the wheel radius). Everything prints in this pose with no rotation.

The wheels sit **inside the body in wheel wells**: the side of the body is open around each wheel, and the wheel, hub cap and axle head all stay inside the body outline.

| Mesh | What it is |
| --- | --- |
| `body` | Several overlapping shells, because the wells are gaps in it: a narrow chassis down the middle (through both wells), three full-width pieces (rear, middle, front) between and beyond the wells, and a full-width bridge over each well. Sections are rounded boxes lofted along X; the plan outline is a superellipse (Nose shape), the top follows the deck line, and the bottom edge is a 45 degree chamfer. |
| `cabin` | The greenhouse: a second loft, narrower than the body, sunk 1.5 mm into it. Its roof line is a trapezoid (windshield and rear window slopes) smoothed by the stations. |
| `windows` | A thin skin 0.35 mm proud on the cabin sides between the door line and the roof rail. |
| `lights` | Headlight and taillight ellipsoids, 2 each. |
| `tire`, `rim`, `axle` | The four wheels, hub caps and axles, one mesh entry each (four shells), so one paint click colours all four. |
| `stamp` | One entry per placed part. |

## Wheel wells

The roof of each well is a **tent with 45 degree sides tangent to the wheel** (apex at `axle height + 1.41 x (wheel radius + 1.4)`), so it prints without a bridge; the well walls below the tent are straight. The hood and trunk heights are raised automatically to leave 3.5 mm of roof over the apex (so the defaults are 24 and 25 mm, with 17 mm wheels). The layout across the car is worked inwards from the body side: axle head, hub cap, wheel, gap, chassis wall. A narrow body or a wide wheel shrinks the chassis; it never goes below the axle thickness plus 2.5 mm each side.

## Car parts tab

Each stamp is stored as a surface point and normal (world coordinates, mm), a type, a size, a height factor and a turn. It is modelled flat on the surface (a across, b up or forward, c out of the surface) and sinks 1.2 mm into the car. On a wall `b` is up; on a flat top it is forward. Stamps stay where they were placed when sliders change, so a part may float or sink if the body is reshaped afterwards. Undo last and Clear are in the tab.

Wall-mounted parts have 45 degree undersides (round light, door handle) or a pointed bottom (mirror, exhaust) so they print without supports.

## Adding more car types

The page is built so a truck or an ice cream van can be added later without touching the wheels, axles, lights or stamps:

1. Write a model function like `sedanModel(p)` that returns `{ hw(x), D(x), top(x), cabinX, cabinProf, hc(x), xa, ax, R, d, rH, clr, xe, ... }`: the half-width and deck height along the car, the greenhouse, and where the axles go. `hw` must be widest across the wheels (see `hwWheel`).
2. Register it in `CAR_TYPES` and add a **Car type** choice parameter (two options become a toggle, three or more a dropdown) that picks the function in `build`.
3. Mesh builders read only the model, so they are shared. A van box or a truck bed is another loft added to `build` for that type.

## Checks

`node scripts/ci/check-generator.mjs sedan-maker`: every mesh is watertight and manifold for the defaults and all six presets, and every slider at its minimum and maximum. The default model reads clean in the print check; the test stamps add one small warning from the exhaust pipe. Other presets have small known overhang errors recorded in `ci/printability-baseline.json` (a few cells at the axle pin or tire edge where the 0.4 mm clearance is not lined up with the print check's voxels, and the upright rear window of Tall and boxy). A real slicer prints a 0.4 mm gap as two layers. Nothing has been physically printed.
