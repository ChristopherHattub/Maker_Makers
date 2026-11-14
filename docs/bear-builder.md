# Bear Builder (slot 124)

`programs/bear-builder.html`, built from `tools/animals/bear-builder.js` with the animal kit (`node tools/animals/build.mjs bear-builder`; edit the source, not the page). A chunky, cuddly bear sculpted as one seamless surface, in the `animals` group. Roughly 65,000 to 80,000 triangles, about 0.7 to 1.2 seconds per rebuild in Node, like the other sculpted animals.

## Options

- **Species** (`BEAR_SPECIES`): Brown, Polar, Panda, Koala. Each sets the colours (fur, muzzle, inner ear, nose, paw pads, limbs) and a few proportions: head axes, snout length, nose size and ear size. Panda has black arms, legs, ears, eye patches and a shoulder band; Koala has a short snout, a tall oval nose and big ears.
- **Pose:** Sitting (legs forward, paws on the thighs), Standing (stubby legs, paws held on the belly), Waving (sitting, left arm raised) or On all fours (a long body on four stout legs, head carried forward and low, like a walking bear). The belly patch is hidden in this pose because it would be underneath.
- **Ears:** Round, Small, Big fluffy (set wider and lower), Pointy (rounded triangle plates). Ear size is a separate slider.
- **Belly patch:** None, Oval, Heart or Round, painted on the front of the body (a recolour only, the shape does not change).
- **Dress up:** Scarf (sculpted into the neck, with a hanging tail) and a Hat: Beanie (cuff, crown and pompom) or Party hat (striped cone and pompom).
- **Sliders:** overall size, body chunkiness, head size, snout length, ear size, eye size, belly patch size.
- **Presets:** Default brown bear, Polar bear, Panda, Koala, Standing bear, Waving bear, Bear on all fours, Winter bear, Party bear, Cub.

## How it is built

- The body, head, legs, arms, muzzle and nose are `Sculpt` forms (ellipsoids and swept limbs that melt together). Paint regions (`S.paint`) colour the belly patch, paw pads and panda markings without changing the shape. Eyes use `softEye`.
- Ears, hats and the beanie and party-hat trims are rigid shells (`S.shell`, using `pod`, `vslab` and `loft`) placed after `run()`, so each is a piece in the Sculpt tab. Hats are lofts computed from the head ellipsoid's surface, with a 45 degree chamfer at the rim so they print on the head. With a hat on, the ears are pushed out so they poke through it.
- `S.reach` is 1.15, so the support pass in the kit lets surfaces lean out about 40 degrees from vertical. That keeps the muzzle and chin rounded. Anything that would overhang further is trimmed away rather than printed in mid-air.
- The raised waving arm climbs at 55 to 70 degrees from horizontal, the steepest the support pass allows. It needs a gap of about 1.5 mm to the head; the arm and head can touch at the cheek at the largest head sizes.
- On all fours the support pass is region-dependent (`S.reachFn`, an optional hook added to the kit's `Sculpt`; `S.reach` is the fallback and nothing else uses the hook). The head and chest, in front of x 18 mm and above y 11 mm, use a generous reach (1.35, surfaces may lean out about 53 degrees) so the muzzle and chin keep their shape out over the chest. Everywhere else the reach is 0.72 (about 28 degrees), which keeps the belly arches between the legs from leaving small bridges. All the numbers (leg, belly and chest positions, the reach regions) are in one `T` object at the top of the pose-3 block. The pose has a lower, forward head over a chest that sits on the front legs, paw pads on all four feet, and the snout slider is capped at 1.05 here, because a longer muzzle hangs too far past the chest. The mouth line and the belly patch are not drawn in this pose.
- A small ellipsoid fills the slot between the legs (standing) and a seat fills the arch between the thighs (sitting), so the underside is one flat base.

## Checks

`check-mesh.mjs --all` is clean for the defaults and all ten presets: watertight, and "no supports needed" from the print check. Sweeps with the print check, all with no errors: every species, ear, hat and scarf combination in the three upright poses (72 variants, five tiny warnings) and on all fours (128 variants, tiny warnings of 1 to 3 mm² near the toes), plus every slider minimum and maximum on all fours for brown and koala (25 variants). On all fours the Chunkiness slider is held at 0.95 or more, because a slimmer body opens the belly arches too wide to print without a bridge.

Pointed ears on the big-eared koala are capped in size (`R = min(ER, 9 * earSize * headSize)`) and, with a hat in an upright pose, sunk deeper into the head. Without that the pointed plates hung in mid-air beside the hat.

## Not verified

Nothing is printed. The thin pointy ear plates, the waving arm and the hat rims are the likeliest places for a print to go wrong. The mouth line is a very shallow groove (about 0.5 mm) that the kit's smoothing mostly removes, so it is not reliable. On all fours the head and chin lean out at about 53 degrees (steeper than anywhere else in the generator, though the print check accepts it), the head reaches out over the chest, and the thin pads of the toes are only 1 mm proud; expect to test those first.
