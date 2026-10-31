# Animal generators (slots 76-90)

Fifteen generators in the `animals` group: Dino Builder, Dragon Maker, Cat Sculptor, Dog Builder, Articulated Snake, Flexi Fish, Turtle & Tortoise, Owl Stacker, Penguin Pals, Octopus & Squid, Mushroom Critters, Shark Fin Trophy, Elephant Builder, Alien & Monster Maker, Unicorn & Pegasus.

## Files

| File | Role |
| --- | --- |
| `tools/animals/animal-kit.js` | The shared kit, concatenated after `tools/flexi/flexi-lib.js`. |
| `tools/animals/<name>.js` | One animal: parameters, presets and `build()`. |
| `tools/animals/build.mjs` | Builds `programs/<name>.html`. The pages are committed; **edit the sources, then run `node tools/animals/build.mjs`**. |
| `tools/animals/make-thumbs.py` | Writes the fifteen `assets/thumbnails/*.svg`. |
| `tools/animals/pc.mjs` | Print check with `--set key=value`, `--preset label` and `--only entry,entry`, to find which part causes a problem. |

## Staying support-free

The kit's newer shapes (`loft`, `pod`) are built from the bed upward and cannot grow outward faster than about 45 degrees (`GROW`). A form that starts on the bed or inside a shape below it always prints, at any slider value. `pod` takes an `anchor`, a point inside the shape underneath, and corbels out from it, which is how heads project over chests. The anchor must be inside the host, or its base shows as a shelf.

Other rules the animals follow:

- `dome` meets a surface at 45 degrees or less, so eyes and spots print on vertical faces. `ridge` does the same for raised lines.
- `horn` and `sweep` with `rise` always climb at least as fast as they travel. Nothing points down from mid-air, so tusks, fangs and mane locks rise.
- `sweep` with `bed` lies flat on the bed with a 45 degree underside (tails, tentacles, folded legs).
- Vertical plates (ears, wings) have lower edges that climb at 50 degrees from a root inside the host.
- Each paint colour needs its own entry name, because a `Scene` entry holds one colour.

## Print check status

Defaults and presets report no print-check errors, except Flexi Fish. Its remaining overhangs are the small bridges at its ball joints, the same kind the flexi creatures carry, and they are recorded in `ci/printability-baseline.json`. Run `node tools/flexi/check-flexi.mjs` on the snake and fish for joint clearance.

Some slider extremes can still raise a warning or a small overhang, and nothing here has been physically printed.
