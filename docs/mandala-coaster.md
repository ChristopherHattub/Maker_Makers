# Mandala Coaster (slot 135)

A layered mandala that works as a coaster or, with a hanging loop, an ornament: `programs/mandala-coaster.html`, in the Home & Decor group. It prints flat in one piece with no supports. Nothing here has been physically printed; the cut-through ribs (1.6 to 4 mm) and how well a drink sits on the stepped relief are unproven.

## How the model is built

Y up, millimetres, one rotationally symmetric design. A round rim sits at the edge, a hub in the middle, and 2 to 6 rings of petals fill the space between. Ring `k` is a band of equal width; its petals are rotated copies of one prototype (`spin`), so the whole design has the chosen symmetry.

| Mesh | What it is |
| --- | --- |
| `plate` | Relief look only: the solid disc under the design (a lathe), reaching under the rim so the two overlap. |
| `rim` | The outer ring (a closed profile revolved about Y) with a small bevel. Its top is the outer ring's top plus *Rim height*. |
| `hub` | The centre. Relief: a stepped button. Cut-through: a ring with an open middle. |
| `ring0` to `ring5` | The petals of each ring, one closed shell per petal. Each ring is its own mesh so the Color tool can paint it (the Color tab lists them as "Petals, ring N"). |
| `lines` | A circular ridge at the root of every ring. Optional in relief, always present when cut-through (it ties the petals together). |
| `detail` | Relief: a smaller raised petal on every petal. Cut-through: a rib running up the middle of every window. |
| `loop` | Ornament only: a flat ring (hole plus wall) overlapping the rim, at the back of the model (negative Z, the top of the plan view). |

### Options

- **Look.** Relief: petals raised in steps on a solid plate. Cut-through: each petal is an outline (an extruded outline with a window cut in it, `petalWindow`), so you can see through the model. Windows that would be narrower than 1.6 mm are left solid, so tight patterns stay printable.
- **Petal shape.** Five profile functions `rawW(kind, t)`: Round (ellipse), Leaf (lens), Teardrop, Arch (gothic) and Fan. Each is normalised to a peak half-width of 1.
- **Symmetry** is the number of petals in the first ring (6 to 24). With *More toward the edge* each outer ring gets a whole multiple of that count so petals keep about the same width as the circles get longer (capped so no petal is under about 3.4 mm across). *Staggered* turns every other ring by half a petal.
- **Layer order / overlap.** *Centre high* stacks the inner rings above the outer ones (like a lotus); *Centre low* does the reverse. The higher ring's petals run over the lower ring's roots by *Layer overlap*. Every shell stands on the plate (or the bed in cut-through), so there are no overhangs.
- **Ornament** adds the loop. Its hole is kept outside the rim; the loop overlaps the rim by about 1.2 to 3 mm so the slicer unions them.

## Printability

Everything is a vertical extrusion or a revolve from the bed (cut-through) or from 0.3 mm inside the plate (relief), so the print check reads "no supports needed". The defaults, all presets and 346 slider-extreme combinations (every slider at its minimum and maximum, in both looks, both modes and both layer orders, plus every petal shape at fold and ring extremes) are watertight with the print check clean. The most triangles is about 74,000 (24 petals doubled to 6 rings, cut-through).

In the cut-through look every ring is tied together by its ring line and the petals' roots, so there are no loose islands.
