# Mangle Rack Walker (slot 137)

`programs/mangle-walker.html`, in the Toys & Games group. A crank turns one small gear that never changes direction, yet the racetrack-shaped rack around it runs one way along the top row, slides sideways while the gear rolls round the end, and returns along the bottom row. A duck, sailboat or flag on the rack's deck paddles back and forth and bobs at each end. It is the mangle wheel and rack from Brown's *Five Hundred and Seven Mechanical Movements*, printed in place on one plate with no supports.

Nothing here has been physically printed. The gear mesh is checked in a simulation, not on a printer; the fit gaps, the bridge over each groove and the groove engagement are unproven.

## How it works

- The **gear** spins on a fixed **axle post** at the origin. It floats 0.4 mm above the base and a cone head (45 degree underside) keeps it on, as in the Gear Train Spinner.
- The **rack** is a closed loop of teeth pointing inward: a straight row on top and bottom (`rackTeeth` teeth each, 20 degree pressure angle) joined by a half circle of internal teeth at each end. The arcs have **10 more teeth than the gear** (`TWO_K`), so the gear's centre sits `d = 5 modules` off the rack's centre line. That is the smallest step at which involute teeth do not foul each other where the gear rolls round the end.
- The rack is free in the plane. The gear's centre, seen from the rack, traces a stadium: along the top row, a half circle of radius `d` round one end, back along the bottom row, and round the other end. Two **guide pins** under the rack's end caps ride in **two stadium grooves** in the base plate that are exactly the path the rack's centre must take, so the rack can only follow the gear's motion and cannot tilt. The groove island inside each loop stays joined to the base because the grooves are blind (1 mm deep by default).
- The rack frame is built from four simple pieces (top bar, bottom bar, two end caps) that overlap by 0.5 mm; the slicer unions them. The base is a slab plus two ring layers with the grooves left open.
- Everything lies in the x/z plane (`u = x`, `v = z`) and is stacked along Y. The model is drawn mid-stroke, the gear meshed with the top row, tooth 0 pointing at the top row.

## Parameters

Rack teeth per row (6 to 10, even, sets the stroke), gear teeth (10 to 16, **even** so the end arcs hold a whole number of teeth), tooth size (module 1.2 to 1.8), gear and rack height, crank knob; topper (None, Duck, Sailboat, Flag), topper size, deck depth; tooth play, groove play, groove depth, axle gap, gap above and below. Presets: Default duck, Long sailboat, Small flag, Chunky duck.

The crank knob is dropped on very small gears (it would not fit between the axle head and the tooth tips). The whole thing is about 145 x 78 mm by default and up to about 175 mm long with 10 rack teeth and the largest module.

## Checks

- `check-mesh.mjs --all`: every shell is watertight and manifold for the defaults, every preset and a set of slider extremes, and the print check reads "no supports needed". The page sets `printCheckOptions: { bridgeGap: 1.8 }`, because the rack floats 0.4 mm above the base and bridges the 4 mm wide grooves (about 1.4 mm of air under it at the default); the voxel grid reads that as an overhang. A real slicer bridges 4 mm fine.
- `node tools/mangle-walker/mesh-sim.mjs [preset] [--set key=value,...]` rolls the gear once round the whole loop, the way the grooves force it to, and reports the largest overlap between the gear outline and the rack's teeth (0.000 mm for the defaults and every preset; `--shift 8` turns the gear to prove the check can fail). At the smallest tooth play (0.25 mm) with the smallest gear it stays under 0.05 mm. It also checks that the gear's tooth phase returns after one lap.

## Unproven

- The 0.4 mm gaps (rack and gear over the base) and the 0.45 mm groove play. The rack's first layer bridges the grooves.
- The groove is only 1 mm deep, so the pins engage about 0.6 mm below the base top. The rack can be lifted off the base by hand; nothing clips it down.
- Tooth play and friction: the gear drives the rack by sliding it on the base, so a rough bottom layer will drag. A drop of oil or a smooth plate helps.
- The sail and flag are thin plates; the flag pole is 2 to 3 mm across.
