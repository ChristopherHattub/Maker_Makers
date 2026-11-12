# Animal generators (slots 76-90)

Fifteen generators in the `animals` group: Dino Builder, Dragon Maker, Cat Sculptor, Dog Builder, Articulated Snake, Flexi Fish, Turtle & Tortoise, Owl Stacker, Penguin Pals, Octopus & Squid, Mushroom Critters, Shark Fin Trophy, Elephant Builder, Alien & Monster Maker, Horse Builder.

The Crab & Lobster (slot 132, [crab-lobster.md](crab-lobster.md)) joins the `animals` group and is built with the same `build.mjs` from `tools/animals/crab-lobster.js`, but from plain shells rather than `Sculpt` forms.

## Files

| File | Role |
| --- | --- |
| `tools/animals/animal-kit.js` | The shared kit, concatenated after `tools/flexi/flexi-lib.js`. |
| `tools/animals/<name>.js` | One animal: parameters, presets and `build()`. |
| `tools/animals/build.mjs` | Builds `programs/<name>.html`. The pages are committed; **edit the sources, then run `node tools/animals/build.mjs`**. |
| `tools/animals/make-thumbs.py` | Writes the fifteen `assets/thumbnails/*.svg`. |
| `tools/animals/pc.mjs` | Print check with `--set key=value`, `--preset label` and `--only entry,entry`, to find which part causes a problem. |

## Sculpted animals

Every animal uses `Sculpt` in the kit, except that the Snake and Fish use it only for their heads and the Shark's plinth is lofted. Forms (`ell`, `path`, `plate`) melt into each other with a smooth blend; `carve` cuts grooves, `relief` presses patterns and `paint` recolours a region without changing its shape. `run()` samples them on a grid and works up from the bed, trimming anything not within 45 degrees of the solid below, so a form with nothing under it disappears rather than overhanging. `addTo()` meshes one closed surface, split into paintable entries with a shared `smoothGroup`. Eyes and noses are `dome`s placed afterward with `hit()`. These models are roughly 45,000 to 120,000 triangles and take roughly 0.3 to 2 seconds to rebuild in Node, so sliders on them respond more slowly than on other generators. Features thinner than about two grid cells break up.

## Poses and sliders

Dragon Maker (Sitting, Prowling, Rearing, Asleep), Dog Builder (Sitting, Standing, Lying down, Begging) and Horse Builder (Kneeling, Standing, Rearing) have a Pose option. Every pose has to reach the bed, because the support pass trims anything without solid below it: tails and feet carry raised bodies, and raised limbs climb steeply. Dino Builder shows a separate slider group per species through `showIf`. `reptileEye` gives dinosaurs and dragons small set-in eyes under a sculpted brow. Dragon wings, horns and back fins are smooth shells added with `S.shell`, not sculpted forms, so their edges are clean. While a slider moves, sculpted generators build a mesh with cells twice as big (`useEdits` in the kit) and the engine skips the paint-part analysis while nothing is painted (`sliding` in `generator-core.js`); both are redone when the slider settles or is released.

Dragon Maker is built as a skeleton per pose (`DRAGON_POSES` in `tools/animals/dragon-maker.js`: torso, S-curved neck, shoulders, elbows, wrists, thighs, feet, tail and spine line) dressed by shared builders: the head is built in its own frame (forward, up, side) and then pitched and placed, so every pose reuses the same wedge head with brow ridges, nostrils, fangs and two pairs of horns. A head that sticks out over air gets its jaw trimmed by the support pass, so the Sitting and Rearing heads are held up with a throat running from the chin into the neck, and the Prowling head rests on the bed (its height scales with Head size so it stays there). The belly plates are a painted stripe from chin to belly with carved bands; before `run()` their positions are found by marching rays through the analytic forms (`preHit`), so they sit on the real surface in any pose. Back blades are fired onto the finished surface along the spine line with `S.hit` and lean back but never below 53 degrees. Raised wings are flat membranes in a vertical plane with scalloped trailing edges (the lower scallops are cut straight in, not toward the wrist, so their edges stay steep), and the lowest edge climbs from the shoulder at about 50 degrees; finger bones stay close to the membrane thickness and stop just short of the tips. Every form that should rest on the bed dips about 1 mm below it (toes, claws, forearms, tail root, a low pad under the haunches): anything floating even 0.5 mm above the bed is eaten away layer by layer by the support pass.

Alien & Monster Maker has seven archetypes, each a separate builder in `tools/animals/monster-maker.js` with its own slider group (shown through `showIf`): Gumdrop buddy (the original egg-shaped alien, still the default), Classic grey, Saucer pilot, Cyclops brute, Slime blob, Bug alien and Yeti beast. The Saucer pilot's hull, rim, deck and cockpit ring are smooth lofts added with `S.shell`; the pilot is sculpted and stands on a post hidden inside the hull, so the support pass sees it reach the bed. Its rim lights sit on the upward-facing deck, and open mouths (Slime, Yeti) are cut with a pointed 45 degree roof so they print.

Owl Stacker and Penguin Pals are built from smooth lofts (`profileLoft`) and shells, not `Sculpt` forms, so they stay crisp and have clean colour edges.

## Sculpt tab

All fifteen animals have the Sculpt tab ([generator-styling.md](generator-styling.md#sculpt-tab-experimental-cfgsculpt)). In a source file, `S.piece(id, parent)` names the forms that follow it, `S.face` and `S.sub` place eyes and other surface details as pieces, and `S.shell` adds a rigid shell (a fin, a bead, the Shark's plinth) as a piece. `sculptModule` lists the pieces with their section and parent. On the Snake and Fish, moving a bead or the head can break the print-in-place joint it belongs to.

## Staying support-free

The kit's newer shapes (`loft`, `pod`) are built from the bed upward and cannot grow outward faster than about 45 degrees (`GROW`). A form that starts on the bed or inside a shape below it always prints, at any slider value. `pod` takes an `anchor`, a point inside the shape underneath, and corbels out from it, which is how heads project over chests. The anchor must be inside the host, or its base shows as a shelf.

Other rules the animals follow:

- `dome` meets a surface at 45 degrees or less, so eyes and spots print on vertical faces. `ridge` does the same for raised lines.
- `horn` and `sweep` with `rise` always climb at least as fast as they travel. Nothing points down from mid-air, so tusks, fangs and mane locks rise.
- `sweep` with `bed` lies flat on the bed with a 45 degree underside (tails, tentacles, folded legs).
- Vertical plates (ears, wings) have lower edges that climb at 50 degrees from a root inside the host.
- Each paint colour needs its own entry name, because a `Scene` entry holds one colour.

## Print check status

Defaults and presets report no print-check errors, except Flexi Fish. The Snake is clean on every preset and slider extreme (its mouth-line groove is a thin 0.3 mm cut and the eyes sit at 0.98 of the head radius; a lower eye or a wider groove put small overhangs back). Cat Sculptor: the Loaf tail width follows the Body slider, the eyes sit at 0.3 of the head radius so large eyes do not overhang, and the Sleeping curl tail starts closer to the body. Sleeping curl still has one 2 mm² warning at the closed-eye line. Its remaining overhangs are the small bridges at its ball joints, the same kind the flexi creatures carry, and they are recorded in `ci/printability-baseline.json`. Run `node tools/flexi/check-flexi.mjs` on the snake and fish for joint clearance.

Some slider extremes can still raise a warning or a small overhang, and nothing here has been physically printed.
