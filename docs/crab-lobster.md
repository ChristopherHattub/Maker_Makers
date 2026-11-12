# Crab & Lobster (slot 132)

`programs/crab-lobster.html`, code `MM-132`, group Animals & Creatures. A claw-forward crab or lobster that prints with no supports, with two pincers that move (print in place). Unprinted: the hinge clearance has only been checked in software.

It is built from the animal kit like the other animals: **edit `tools/animals/crab-lobster.js` and run `node tools/animals/build.mjs crab-lobster`** (the page is the generated file). It does not use the `Sculpt` forms; every part is a closed shell (a flat-bellied superellipsoid for the carapace, `bellyShell` palms and tail segments, swept tubes for legs and arms, extruded outlines for fingers). Overlapping shells are fine, slicers union them.

## Options

- **Creature**: crab or lobster, body size, shell height, five colour schemes (the Color tool repaints every part).
- **Claws**: size, pose (guarding forward, spread apart, pinching together, arms wide), matching pair or a big-claw fiddler (right or left), movable or fixed-shut pincers, the opening angle it is printed at, and the joint clearance (0.3 to 0.6 mm, default 0.4).
- **Legs**: 2 to 5 per side, reach, knee height.
- **Eyes**: stalk length (0 puts the eyes on the shell), size, spacing.
- **Shell**: smooth, ribbed, bumpy, plated or spiky, and the texture depth. Textures are normal-direction offsets of the carapace surface (`clTexture`); spines are separate cones.
- **Lobster only**: tail segments (3 to 6, with a tail fan) and antenna length. Lobster dimensions are scaled by 0.84 so the default fits the 184 mm bed.

## How the movable claw prints

Claws rest on the bed, so each pincer can sit on the bed too and swing in the bed plane. In the claw's own frame (`p` forward, `q` outward):

- The **hand** is a flat-bellied egg (palm) plus a curved fixed finger, a thin **stage** (1 mm, the convex hull of the pincer's whole swing) and a **post** with a 45 degree mushroom head.
- The **pincer** is a ring around the post (hole = post radius + clearance) plus a curved blade. It floats `gap` mm above the stage, so the first layers bridge a one-layer air gap, the standard print-in-place way. The head retains it. The pincer's top is level with the fixed finger.
- The pincer is built at the opening angle you choose and can swing from 0 to about 42 degrees (the stage covers that range). At 0 the tips are about `gap + 0.15` mm apart.
- `printCheckOptions: { bridgeGap: 0.8 }` tells the print check that the hovering ring is deliberate.
- Checked in software (`gap.mjs`-style point to triangle distances at openings 0 to 40 degrees): the smallest distance between the pincer and the hand stays at the clearance (0.39 mm for 0.4), so nothing binds or fuses by design. Real prints may still need a larger clearance.
- "Fixed shut" welds the pincer to the hand (no stage, post or gap) for a plain claw.

## Printing without supports

- The carapace is a superellipsoid with 42% of its height cut below the bed; the lower flank is never overhanging more than about 50 degrees, which also keeps the nose and tail ends clean at the print check's voxel size.
- **Legs** are tubes: a 55 degree rise to the knee, a 62 degree descent to the bed, then a foot lying flat on the bed (axis at 0.75 of the radius so the flat underside meets the sides at 41 degrees). **Arms** rise from the shoulder to a raised elbow and down to the wrist at 52 degrees or more, so the arch is self-supporting.
- **Eyes** are a stalk, a steep cone (about 30 degrees from vertical) widening to the bulb, and a dome pupil at 30 degrees. Antennae use `sweep` with `rise`, so they always climb faster than they travel.
- The lobster tail segments are overlapping flat-bellied shells; the fan is flat slabs on the bed.
- Defaults and all seven presets pass the print check. A random sweep of all sliders reports an error in a few percent of mixes (9 to 13 mm² of small overhang at the shell flank, mostly with fixed-shut pincers); nudge the slider if the chip turns red. Lobster claw size is capped at 1.25 because larger claws raise an error.

## Parts (Color tool)

`shell`, `tail`, `legs` (legs and antennae), `arms`, `claws` (palms, fixed fingers, stages, posts), `pincers`, `spines`, `eyes`, `pupils`.

## Open items

- Unprinted: the 0.4 mm hinge clearance, the 1 mm stage, the thin antennae and 1.5 mm leg tips, and the leg flat feet.
- Claws only rest on the bed, so there is no raised-claw pose; a raised claw would need a tilted hinge and supports.
- Hologram and panel preview are renders of the default crab.
