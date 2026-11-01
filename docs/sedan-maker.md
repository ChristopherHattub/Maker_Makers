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

The roof of each well is a **tent with 45 degree sides tangent to the wheel** (apex at `axle height + 1.41 x (wheel radius + 0.7)`), so it prints without a bridge; the well walls below the tent are straight. The hood and trunk heights are raised automatically to leave 3.5 mm of roof over the apex (the defaults are 22 and 23 mm, with 16 mm wheels). The layout across the car is worked inwards from the body side: axle head, hub cap, wheel, gap, chassis wall. 

## Car parts tab

Each stamp is stored as a surface point and normal (world coordinates, mm), a type, a size, a height factor and a turn. It is modelled flat on the surface (a across, b up or forward, c out of the surface) and sinks 1.2 mm into the car. On a wall `b` is up; on a flat top it is forward. Stamps stay where they were placed when sliders change, so a part may float or sink if the body is reshaped afterwards. Undo last and Clear are in the tab.

Wall-mounted parts have 45 degree undersides (round light, door handle) or a pointed bottom (mirror, exhaust) so they print without supports.

## Adding more car types

The page is built so a truck or an ice cream van can be added later without touching the wheels, axles, lights or stamps:

1. Write a model function like `sedanModel(p)` that returns `{ hw(x), D(x), top(x), cabinX, cabinProf, hc(x), xa, ax, R, d, rH, clr, xe, ... }`: the half-width and deck height along the car, the greenhouse, and where the axles go. `hw` must be widest across the wheels (see `hwWheel`).
2. Register it in `CAR_TYPES` and add a **Car type** choice parameter (two options become a toggle, three or more a dropdown) that picks the function in `build`.
3. Mesh builders read only the model, so they are shared. A van box or a truck bed is another loft added to `build` for that type.

## Always functional

`sedanModel` clamps every option so that no combination of sliders makes a car that cannot work:

- The **body widens by itself** if the wheels need more room across than the Body width slider gives (axle head, hub cap, wheel, gaps and a chassis wall at least axle thickness plus 2.5 mm each side).
- The **wheel width** is reduced if it still would not fit; the wells are kept at least 3 mm apart and 6 mm from the ends (the Distance between axles slider is clamped).
- The **hood, trunk and deck** are raised to leave 3.5 mm of roof over each well, the nose and tail blends keep the wells covered.
- The **axle thickness** is limited to 28 percent of the wheel radius, the wheel clearance to 0.3 to 0.7 mm, the flat spot to 14 percent, the wheel size to at least 15 mm.
- The **hub cap** grows until its ring around the pointed hole is at least 0.6 mm wide, and drops its lobes if it cannot; it never reaches below the bed.
- No two shells of the body share a vertex, so the body stays manifold at any length.

A random sweep (700 random slider settings plus the defaults and presets) checks every mesh is watertight, the lowest point is on the bed, the chassis, head, wells and roof invariants above hold, and no wheel vertex lies inside the body, cabin or axle (and no body or axle vertex inside a wheel). The script is not in the repo; rerun the same idea after any change to `sedanModel`, `wheelLayout`, `rimShell` or `lowerBody`.

## Checks

`node scripts/ci/check-generator.mjs sedan-maker`: every mesh is watertight and manifold for the defaults and all six presets, and every slider at its minimum and maximum. The default model reads clean in the print check; the test stamps add one small warning from the exhaust pipe. Sporty low and Chunky wheels have small known overhang errors (tire edge and pin cells) recorded in `ci/printability-baseline.json`; the other presets only show the exhaust-stamp warning. A real slicer prints a 0.4 mm gap as two layers. Nothing has been physically printed.
