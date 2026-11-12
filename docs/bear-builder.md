# Bear Builder (slot 124)

`programs/bear-builder.html`, built from `tools/animals/bear-builder.js` with the animal kit (`node tools/animals/build.mjs bear-builder`; edit the source, not the page). A chunky, cuddly bear sculpted as one seamless surface, in the `animals` group. Roughly 65,000 to 80,000 triangles, about 0.7 to 1.2 seconds per rebuild in Node, like the other sculpted animals.

## Options

- **Species** (`BEAR_SPECIES`): Brown, Polar, Panda, Koala. Each sets the colours (fur, muzzle, inner ear, nose, paw pads, limbs) and a few proportions: head axes, snout length, nose size and ear size. Panda has black arms, legs, ears, eye patches and a shoulder band; Koala has a short snout, a tall oval nose and big ears.
- **Pose:** Sitting (legs forward, paws on the thighs), Standing (stubby legs, paws held on the belly) or Waving (sitting, left arm raised).
- **Ears:** Round, Small, Big fluffy (set wider and lower), Pointy (rounded triangle plates). Ear size is a separate slider.
- **Belly patch:** None, Oval, Heart or Round, painted on the front of the body (a recolour only, the shape does not change).
- **Dress up:** Scarf (sculpted into the neck, with a hanging tail) and a Hat: Beanie (cuff, crown and pompom) or Party hat (striped cone and pompom).
- **Sliders:** overall size, body chunkiness, head size, snout length, ear size, eye size, belly patch size.
- **Presets:** Default brown bear, Polar bear, Panda, Koala, Standing bear, Waving bear, Winter bear, Party bear, Cub.

## How it is built

- The body, head, legs, arms, muzzle and nose are `Sculpt` forms (ellipsoids and swept limbs that melt together). Paint regions (`S.paint`) colour the belly patch, paw pads and panda markings without changing the shape. Eyes use `softEye`.
- Ears, hats and the beanie and party-hat trims are rigid shells (`S.shell`, using `pod`, `vslab` and `loft`) placed after `run()`, so each is a piece in the Sculpt tab. Hats are lofts computed from the head ellipsoid's surface, with a 45 degree chamfer at the rim so they print on the head. With a hat on, the ears are pushed out so they poke through it.
- `S.reach` is 1.15, so the support pass in the kit lets surfaces lean out about 40 degrees from vertical. That keeps the muzzle and chin rounded. Anything that would overhang further is trimmed away rather than printed in mid-air.
- The raised waving arm climbs at 55 to 70 degrees from horizontal, the steepest the support pass allows. It needs a gap of about 1.5 mm to the head; the arm and head can touch at the cheek at the largest head sizes.
- A small ellipsoid fills the slot between the legs (standing) and a seat fills the arch between the thighs (sitting), so the underside is one flat base.

## Checks

`check-mesh.mjs --all` is clean for the defaults and all nine presets: watertight, and "no supports needed" from the print check. A sweep of every slider minimum and maximum (brown and koala, all poses), every ear, hat and scarf combination in all three poses, and every species, pose and belly patch combination was also run with the print check (see the PR for the result).

## Not verified

Nothing is printed. The thin pointy ear plates, the waving arm and the hat rims are the likeliest places for a print to go wrong. The mouth line is a very shallow groove (about 0.5 mm) that the kit's smoothing mostly removes, so it is not reliable.
