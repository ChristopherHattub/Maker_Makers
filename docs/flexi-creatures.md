# Flexi creatures (slots 91-100)

Print-in-place articulated animals: a dragon, gecko, crocodile, octopus, scorpion, centipede, turtle, shark, seahorse
and caterpillar. Each prints as one piece (no assembly) and every joint moves straight off the bed.

## How the joints work

Every segment is one closed lathe shell with a **ball on its front** and a **socket on its rear**. The socket cavity is a
sphere larger than the ball by the **joint clearance** (default 0.45 mm, a slider on every flexi page). The socket opening
is narrower than the ball, so a segment cannot pull out. A joint flexes about 15 to 30 degrees, more on thick beads
and less on the thin tail tip.

Rules the kit follows so the joints never fuse:

- Rigid parts (wings, fins, feet, spikes) belong to **one** bead only and sit clear of the neighbouring beads. Flat
  slabs start outside the socket cavity (`slabRoot`) and reach out past the flank of the bead.
- Legs, arms and flippers are short chains hung off a ball on the body (`limb`). The first segment is pushed out far
  enough that its rim clears a slanted flank.
- Everything rests on the bed: beads are flattened at the bed plane and the chain follows the taper, so the defaults print
  with **no supports** apart from the usual tiny bridges over the 0.45 mm gaps. The only support-needing pose is the
  scorpion's lifted tail (labelled in its slider).
- Rest-pose bends (wiggle, curl) stay small so the neck of each ball keeps its clearance from the socket rim.

## Files

| File | Role |
| --- | --- |
| `tools/flexi/flexi-lib.js` | The shared kit: lathe shells, ball and socket maths (`jointDims`, `chain`), flat slabs, limbs, heads. |
| `tools/flexi/flexi-<name>.js` | One creature: parameters, presets and `build()`. |
| `tools/flexi/build.mjs` | Builds `programs/flexi-<name>.html` (page shell + kit + creature). The generated pages are committed; **edit the sources, then run `node tools/flexi/build.mjs`**. |
| `tools/flexi/check-flexi.mjs` | The print-in-place check (below). |
| `tools/flexi/make-thumbs.py` | Writes the ten `assets/thumbnails/flexi-*.svg`. |

## Checking a creature before shipping

```
node tools/flexi/build.mjs
node .claude/skills/makermakers-generator/check-mesh.mjs programs/flexi-dragon.html "Wyvern"   # watertight
node tools/flexi/check-flexi.mjs programs/flexi-dragon.html "Wyvern"                           # joint clearance
node tools/flexi/check-flexi.mjs programs/flexi-dragon.html --set wiggle=0 --set gap=0.35      # any slider extreme
```

`check-flexi.mjs` measures the gap between every pair of separate moving bodies (bead to bead, limb to body, and so on) and
fails if any pair is closer than 75% of the clearance setting. `WHERE=1` prints where the worst pair is. Run it for the
defaults, every preset and the slider extremes you changed. Joints between beads measure about 0.42 to 0.47 mm at the
default 0.45 mm setting.
