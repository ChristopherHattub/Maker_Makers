# Nutcracker (slot 108)

`programs/nutcracker.html`, code `MM-108`, group Christmas. A toy soldier on a plinth with a working jaw that prints in place, built from about 40 mix-and-match options (see below). Unprinted: the clearances below are checked in software only.

## How the jaw works

The lower jaw is a **quarter disc** (radius `mouth`) that hangs from the mouth line and swings on two **diamond-section pins** (half-diagonal 2.2 mm, so every overhang is 45°). It sits in a **bowl of the same centre and radius + tolerance** cut into the cup below the face, so the underside of the chin prints over a thin air gap, the standard print-in-place way, with no supports.

- Pivot point P is the jaw's top-rear corner. The jaw's back is a quarter circle round P (radius = pin radius) and the mouth ceiling follows it, so the jaw never lifts into the ceiling.
- The bowl's rear wall leans 30° (`PHI_MAX`), the swept path of the jaw's back face, so the jaw can open about 30°. A 30° lean is an overhang that prints without supports.
- The front of the cup is cut by a vertical plane at 45° round the bowl, so the chin's lower front shows and swings down in front of the cup. Nothing is added to the chin outside its circle (a beard would hit the cup).
- Pins end inside **blind diamond holes** in the cheek plates (the outer 1.9 mm of each cheek is solid, so no hole shows). The hole is sized so the pin's swept circle fits with the tolerance all round.
- `tolerance` (0.25-0.6 mm, default 0.35) is the gap on every moving face: jaw to bowl, jaw to ceiling, jaw sides to cheeks, pins to holes. Raise it if the jaw fuses on your printer; lower it for a tighter fit.
- `pose` swings the jaw open for display. Leave it at 0 to print in place; the jaw is then closed with the gap all round.

Models are built in design millimetres (112 mm tall) and scaled by `height / 112`; the tolerance is divided by the scale first, so it stays true millimetres.

## Mix and match (Parametric tab, groups)

- **Size**: height, head width, mouth size, face height.
- **Hat**: style (shako, crown, spike helmet, top hat, bearskin, pointed cap), height, brim (none, flat, fur), band (none, low, high), topper (none, pom-pom, feather, spike).
- **Face**: eyes (round, wide oval, slits, googly), eye size and gap, brows (none, straight, angry, raised), nose style and size, moustache (none, classic, walrus, handlebar), jaw colour.
- **Coat**: flare, waist, chest and shoulder width (shoulders are capped at 1.25x the waist so a narrow waist never flares too steeply), collar, buttons (count and diamond or round), belt, buckle, sash, hem trim, shoulder pads, medals, arm thickness, boots.
- **Base**: plinth shape (rounded square, round, octagon), height, stepped or plain.
- **Props**: none, spear, flag, sword, crystal staff, which side, and height. Planted props stand on the plinth; the sword is held in the hand.
- **Colours**: 8 colour schemes (the Color tool still repaints every part).
- **Print fit**: tolerance, jaw pose.
- **Mix tab**: "Surprise me" picks a random style for every piece (sizes and print fit stay put) and "Back to the default nutcracker" resets. Ten presets sit above the sliders.

Design rules that keep every mix printable: studs and medals are diamond or corner-down octagon sections (45° slopes), trim chamfers are shallower than 45°, studs embed 1.6 mm in the coat, arms start inside the coat, round and octagon plinths are scaled up so corners never poke out, sword quillons rise from the guard. Random sweeps of all options (160 mixes, extremes included) pass the print check in about 98% of cases; the rest are 3 mm² overhang flags on pads, medals or arm tops at slider extremes (tell users to nudge the slider if the chip turns red). Defaults and all ten presets are clean in CI.

## Parts (Color tool)

`base` plinth, `coat`, `trim` (hem, belt, collar), `jewel` (buttons, buckle, medals), `sash`, `boots`, `arms`, `hands`, `pads`, `prop`, `propHead`, `flag`, `head`, `cheeks` (side-hair plates), `jaw`, `eyes`, `pupils`, `brows`, `nose`, `mustache`, `hat`, `hatBrim`, `hatTrim`, `crownPoints`, `topper`. The jaw is its own shell, so Sculpt can move or delete it.

## Checking it

- `THREE_PATH=vendor/three/three.min.js node scripts/ci/check-generator.mjs nutcracker`: watertight on defaults and every preset, print check clean (no baseline entry needed).
- The jaw swing was tested by sampling the jaw surface at poses 0-30° against the fixed head (ray-parity inside test: no hits; swinging backwards does hit) and measuring the minimum gap (about the tolerance at every pose, at tolerances 0.25, 0.35, 0.6 and at the mouth and head-width extremes).
- Head, cheeks and jaw are built from flat outlines extruded along x with `THREE.ExtrudeGeometry` (the `extrude` helper); the body, hat and face use the ring-loft kit copied from Snowman Stacker.

## Print notes and open items

- Print upright with no supports. The first layers of the chin, the pins and the mouth ceiling bridge a 0.35 mm gap, which most slicers handle; if the jaw welds, raise the tolerance.
- The shared print check (`programs/shared/print-check.js`) now also counts solid two layers straight below as support (see [generator-styling.md](generator-styling.md#print-check-live-warning-chip)), because a one-layer gap otherwise reads as empty or full depending on where the voxel layers fall.
- Unprinted: the tolerance, the 30° opening, the thin side-hair plates, and the hands tucked into the coat.
- Teeth and a lever are not modelled.
