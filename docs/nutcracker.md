# Nutcracker (slot 108)

`programs/nutcracker.html`, code `MM-108`, group Christmas. A toy soldier on a plinth with a working jaw that prints in place. Hat choices: shako, crown, spike helmet. Unprinted: the clearances below are checked in software only.

## How the jaw works

The lower jaw is a **quarter disc** (radius `mouth`) that hangs from the mouth line and swings on two **diamond-section pins** (half-diagonal 2.2 mm, so every overhang is 45°). It sits in a **bowl of the same centre and radius + tolerance** cut into the cup below the face, so the underside of the chin prints over a thin air gap, the standard print-in-place way, with no supports.

- Pivot point P is the jaw's top-rear corner. The jaw's back is a quarter circle round P (radius = pin radius) and the mouth ceiling follows it, so the jaw never lifts into the ceiling.
- The bowl's rear wall leans 30° (`PHI_MAX`), the swept path of the jaw's back face, so the jaw can open about 30°. A 30° lean is an overhang that prints without supports.
- The front of the cup is cut by a vertical plane at 45° round the bowl, so the chin's lower front shows and swings down in front of the cup. Nothing is added to the chin outside its circle (a beard would hit the cup).
- Pins end inside **blind diamond holes** in the cheek plates (the outer 1.9 mm of each cheek is solid, so no hole shows). The hole is sized so the pin's swept circle fits with the tolerance all round.
- `tolerance` (0.25-0.6 mm, default 0.35) is the gap on every moving face: jaw to bowl, jaw to ceiling, jaw sides to cheeks, pins to holes. Raise it if the jaw fuses on your printer; lower it for a tighter fit.
- `pose` swings the jaw open for display. Leave it at 0 to print in place; the jaw is then closed with the gap all round.

Models are built in design millimetres (112 mm tall) and scaled by `height / 112`; the tolerance is divided by the scale first, so it stays true millimetres.

## Parts (Color tool)

`base` plinth, `coat`, `trim` (hem, belt, collar), `jewel` (buttons, buckle), `boots`, `arms`, `hands`, `head`, `cheeks` (side-hair plates), `jaw`, `eyes`, `brows`, `nose`, `mustache`, `hat`, `hatTrim`, `plume` (plume, crown points or helmet spike). The jaw is its own shell, so Sculpt can move or delete it.

## Checking it

- `THREE_PATH=vendor/three/three.min.js node scripts/ci/check-generator.mjs nutcracker`: watertight on defaults and every preset, print check clean (no baseline entry needed).
- The jaw swing was tested by sampling the jaw surface at poses 0-30° against the fixed head (ray-parity inside test: no hits; swinging backwards does hit) and measuring the minimum gap (about the tolerance at every pose, at tolerances 0.25, 0.35, 0.6 and at the mouth and head-width extremes).
- Head, cheeks and jaw are built from flat outlines extruded along x with `THREE.ExtrudeGeometry` (the `extrude` helper); the body, hat and face use the ring-loft kit copied from Snowman Stacker.

## Print notes and open items

- Print upright with no supports. The first layers of the chin, the pins and the mouth ceiling bridge a 0.35 mm gap, which most slicers handle; if the jaw welds, raise the tolerance.
- The shared print check (`programs/shared/print-check.js`) now also counts solid two layers straight below as support (see [generator-styling.md](generator-styling.md#print-check-live-warning-chip)), because a one-layer gap otherwise reads as empty or full depending on where the voxel layers fall.
- Unprinted: the tolerance, the 30° opening, the thin side-hair plates, and the hands tucked into the coat.
- The face is simple (ball eyes, ball nose, bar brows and moustache). Teeth, a sword and a lever are not modelled.
