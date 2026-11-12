# Peacock & Flamingo (slot 133)

`programs/peacock-flamingo.html`, group `animals`, code `MM-133`. A display bird on a pedestal: a **peacock** with a fanned tail, or a **flamingo** on one leg or two. Nothing here has been printed.

## Parameters

| Group | What it sets |
| --- | --- |
| Bird | Peacock or Flamingo, overall size (60-110%), neck length, neck curve (the S bend; 100% still prints clean). |
| Peacock tail | Feather count (5-25), fan spread, feather length and width, eye pattern (None, Oval, Teardrop, Round), eye size, crest plumes. |
| Flamingo | One or two legs, leg length, leg spacing (two legs), beak bend, wing detail. |
| Pedestal | Round, Hexagon, Rounded square or None; height; margin around the feet. |

Presets: Default peacock, Grand fan, Slim fan with teardrop eyes, Round-eyed peacock, Plain feathers, Flamingo on one leg, Flamingo wading, Tall elegant flamingo.

## How it is built

Everything is a closed shell made by `ringSolid(rings, capA, capB)`: a list of equally wound rings (or single-point poles) joined by quads. Tubes (`tube`), ellipsoids, leaf lenses (`leaf`), eye domes (`dome`), webbed feet (`footPlate`) and the pedestal are all rings, so every shell is watertight by construction. Shells overlap; slicers union them. Build output meshes are named by part (`body`, `neck`, `feathers`, `eyeRim`...) so the Color tab and Sculpt tab list them.

- **Body** (`domeBody`): the region between a dome (top) and a cone that grows out of the hip points at slope 0.95 (underside), so the belly never overhangs. The wings are lenses lying on the flanks.
- **Neck**: the tangent angle is `lean + amp * sin(2 pi t)`, with `amp` capped so the neck never leans more than 42 degrees from vertical.
- **Peacock fan**: feathers radiate in the vertical plane behind the body (normal along the bird's length) from a hub on a tail stalk that stands on the pedestal. The outer feathers lean `spread / 2 - 4` degrees, so the default 90 degree spread is the support-free limit; over about 100 degrees the lower edges overhang (the slider label says so). Neighbouring feathers alternate 0.45 mm in thickness offset so overlapping faces do not fight. Feather width follows the tip spacing, capped at 6.4 mm half width.
- **Eyes**: three stacked domes per feather face (ring, middle, centre), each in its own mesh entry so the three colours paint across all feathers at once.
- **Flamingo**: one standing leg with a knee bulge and webbed foot; in the one-leg stance the lifted leg is a tube lying along the underside cone. The beak is a tube bent downward (the last part is a separate `beakTip` entry).
- **Pedestal**: sized from the feet and stalk contact points plus the margin slider.

## Print check

Defaults and most presets read "no supports needed". The remaining warnings are under 8 mm squared: the beak tip, the lifted leg at the belly, and the slim-fan feather roots. A beak that points forward overhangs, which is why the peacock beak points down 50 degrees. Run the sweep by building each slider's minimum and maximum for both birds; `spread` at its top end is expected to fail.

Unproven on a printer: the thin flamingo leg holding the body, the fan's outer feather edges, the downturned beaks and the 0.8 mm crest stalks.
