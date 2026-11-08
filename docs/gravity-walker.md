# Gravity Walker (slot 122)

`programs/gravity-walker.html`, in the Toys & Games group. A toy that shuffles down a gentle ramp with no motor or batteries. The body has one fixed foot and two rear legs on print-in-place hinge pins; the rear legs swing between two stops, so the toy rocks from one foot onto the other. A printable ramp with side rails is part of the same generator (the **Print** choice in the Ramp group: Walker only (default), Ramp only, or both).

**Nothing here has been physically printed.** The walk is checked only in a planar simulation ([tools/gravity-walker/walk-sim.mjs](../tools/gravity-walker/walk-sim.mjs)). The hinge clearance, the stops and the slope the real toy needs are unproven until a real print. Expect to tune the ramp slope (the simulation walks on about 7 to 10 degrees).

## How it walks

It is the two-link passive walker of Trevino, Galloway and Bhounsule (a 3D printed non-assembly toy, J. Mechanisms and Robotics 2018), re-derived for this generator:

- Two rigid bodies hinged at one point H: the **body** (with its foot) and the **rear legs** (a pair, one each side).
- Every foot is an **arc of the same circle round H** (radius = *Leg length*): the body's arc is +-20 degrees, each rear leg's is +-24 degrees. The foot that holds the ground rolls without slipping, and when the ground leaves its arc the other foot takes over smoothly (no heel strike). The one in the air swings free between two stops.
- The centre of weight of the body hangs about a third of the leg length under H; the rear legs are about a quarter to a third of the weight, with most of it in the feet (the **Foot weight** blocks, the thick ring sectors on the outside of each leg). Both numbers matter: with the weight too high or the rear legs too light it sits down or stalls.
- The ramp slope has to be large enough to keep it going and small enough that it does not slide or tumble: the simulation walks for 7 to 10 degrees. Default 8.5.

The simulation reads the mass properties from the generator itself (`MM_GENERATOR.walkProps(params)`: mass, centre-of-mass distance and angle, and inertia of the body and of the rear legs, from the real profiles) so a change to a shape is checked with its real numbers:

```
node tools/gravity-walker/walk-sim.mjs                 defaults: mass numbers and whether it walks
node tools/gravity-walker/walk-sim.mjs --slopes        walk speed for ramp slopes 4 to 14 degrees
node tools/gravity-walker/walk-sim.mjs --robust        9 perturbed runs; 9 of 9 is a sound design
node tools/gravity-walker/walk-sim.mjs legR=60 head=1  override parameters
```

The perturbed runs move the slope +-1.5 degrees, each centre of weight +-15 percent and the rear leg weight +-20 percent. Every preset gets 9 of 9, except Small walker (8; its pins and clearances are the same size as on a big walker, so they weigh more).

What the simulation leaves out: friction at the hinge pin (a hinge friction term is in the code and changes little), rolling resistance, slip of the feet on the ramp, sideways wobble and the print's own play. The real toy will not match it; the simulation exists to find a proportion that can work at all, and to stop a change from breaking it.

## Layout

Y up, millimetres, +X is the way it walks, Z across. In a profile the hinge is the origin and `pol(R, theta)` is a point at angle theta from straight down (positive forward). The model rests on the bed on its foot arcs.

| Mesh | What it is |
| --- | --- |
| `body` | Foot (sector of +-20 degrees), the torso (a bell: 50 degree flanks, so nothing under it needs support) and the neck. Full body width. |
| `head` | Head (duck beak, robot antenna, or cat ears) on the neck. Narrows to the neck at 45 degrees below. |
| `eyes` | Two raised discs on the sides of the head. |
| `legs` | The two rear legs: a 2.4 mm plate (hip disc, neck, foot ring) beside each side of the body, and the foot weight block on its outside. |
| `pins` | Per side: the hinge pin and its head, and a small stop pin. All are diamond-section pins (a square turned 45 degrees with a flat on the bottom). |
| `ramp`, `rails` | The wedge at the chosen slope, with a side rail each side. High end at the back, 5 mm thick at the low end. |

Every solid is an extrusion of a 2D side profile (`extrude()`: caps triangulated with `THREE.ShapeUtils`, walls reuse the same corner points), so every shell is closed by construction. The page needs `api.THREE` (r128, vendored), like the other generators that extrude.

## Print in place

- Each rear leg stands beside the body wall with a gap of *Clearance* (default 0.3 mm) and hangs on the **hinge pin**: a diamond pin (3.2 mm half-diagonal) through a hole with a pointed top (faces 40 degrees from flat, flat roof 2 mm), so no bridge. A bigger diamond head on the outside, a clearance away from the plate, keeps the leg on.
- **Stops**: a small diamond pin fixed to the body, straight ahead of the hinge, runs in a slot cut in the leg (hull of two diamonds, pointed ends). The slot length sets the swing, -16 to +12 degrees between the legs and the body, plus a little slack from the clearance.
- The leg hangs on the pin top once lifted, so its foot sits about the clearance lower than the body's foot. When the foot is on the ground the leg is carried by the ground and the pin does not touch.
- The whole toy prints in its standing pose, feet on the bed, legs free. After printing, swing each rear leg to free it.

## Print check

`node scripts/ci/check-generator.mjs gravity-walker`: every mesh is watertight and manifold for the defaults and all presets. The print check reads **overhang** (known, in `ci/printability-baseline.json`): the **round soles**. A foot arc of 50 mm radius lying on the bed is a shallow curve, shallower than 45 degrees for its first 35 mm, so the check calls it an overhang. A slicer lays this down like any cylinder lying on its side, with a rough first few layers; a printable alternative (a flat sole or a polygon) would change how it rolls. Everything else (the body, the head, the pins, the stop slot, the rail and the ramp) passes. The ramp alone passes the print check.

To make the soles smoother, print with a thin layer height. Add a strip of rubber or non-slip tape to the ramp if the feet slide (the Trevino toy needed rubber soles on a smooth printed ramp).

## Sizing rules and limits

- Leg length 42 to 64 mm; body above the hinge 4 to 10 percent and head size 14 to 18 percent of leg length. Outside those, the body weight climbs too high and the simulation stops walking, so the sliders stop there.
- Foot weight 8 to 16 mm adds weight to the feet of the rear legs; the default 14 gives a total width of about 66 mm with the heads.
- The ramp is as wide as the walker (feet and weights) plus 6 mm each side and runs up to 220 mm; above 184 mm it needs a larger bed.
