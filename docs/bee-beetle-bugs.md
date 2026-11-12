# Bee & Beetle Bugs (slot 129)

`programs/bee-beetle-bugs.html`, in the Animals & Creatures group. A bug picker: honey bee, ladybug, stag beetle or dragonfly. Every bug lies on its belly and prints with no supports. **Nothing here has been printed**; the check is `check-mesh.mjs` (watertight, manifold) and the shared print check.

## How the models are built

Y up, millimetres, the head points to +x, z is across the body. Everything is closed by construction.

| Piece | Mesh name | How |
| --- | --- | --- |
| Abdomen / elytra, thorax | `body`, `thorax`, `stripes` | One loft along x. A cross-section is a dome on a **40 degree chamfer** that ends in a flat belly (`sect()`), so nothing in the body is steeper than 40 degrees from vertical. Sections come from `makeBody()`: a soft union (power mean) of ellipsoid-like lobes, with Gaussian grooves between body segments (at most 3 mm deep). The loft is split into three entries (same `smoothGroup: 'torso'`): thorax, abdomen, and the abdomen bands that carry the stripe colour. |
| Head | `head` | Same loft code, one lobe. |
| Eyes, spots | `eyes`, `spots` | `lens()`: a dome laid on the body surface in (x, psi) coordinates, so its rim sits exactly on the surface at any curvature, embedded a little. They sit on the upper shoulders (45 degrees and up) so they never overhang. |
| Antennae | `antennae` | Round rods (`sweepRod`) in three segments rising at 55 degrees or more from flat. |
| Legs, mandibles | `legs`, `mandibles` | Flat-bottomed bars (`sweepBar`): the same chamfered section swept along a path lying on the bed. |
| Wings | `wings`, `veins` | Three styles, below. Veins are thin flat-bottomed ridges on the plate. |

## Parameters

- **Bug**: species, body length, plumpness, body segments (0 = the bug's own count) and segment grooves.
- **Pattern**: Bug's own, Plain, Stripes (alternate abdomen bands are coloured, flush with the body) or Spots (round domes; count and size).
- **Wings**: style, size, shape (rounded, pointed, long), sweep back, the raised V angle and veins.
- **Head and feelers**: antenna length (percent of the bug's own), thickness and spread, eye size, mandible size (stag beetle).
- **Legs**: on or off, length, thickness.

Where a slider says "bug's own" the value comes from the species table in the page (`BUGS`), so switching species always gives a sensible bug. The presets (Default honey bee, Bumble bee, Ladybug, Stag beetle, Dragonfly, Damselfly, Wingless worker) set the species and a few extras. The Default preset resets every parameter.

## Wing styles and why they need no supports

- **Spread flat**: plates 1.4 mm thick lying on the bed beside the thorax (a pinned-specimen pose). Sweep can go to 62 degrees.
- **Raised V**: plates tilted 58 to 80 degrees from flat (default 66), so the underside is at most 32 degrees from vertical. The plate root is a narrow strip embedded in the flank, and sweep is a shear inside the plate (capped at 34 degrees) so the trailing edge never gets shallower than the plate's own slope allows. The plan view of a swept raised wing is therefore less swept than the slider suggests.
- **Folded back**: a thin cover over the back (`patchTris`), a leaf region in (x, psi) raised 1 mm above the surface and faded to nothing at its edge, so it leaves no ledge. On the ladybug and stag beetle these are the wing cases (red on a black body); on the bee and dragonfly they are folded wings. The two covers keep a gap at the centre line.
- With **Raised V** or **Spread flat** on a ladybug, the dome itself is coloured red (the shell), without covers.

## Print check results

The sweep that was run while building it: every species x wing style x pattern, every wing shape, the raised angle at 58 and 80, legs and veins off, and a minimum and a maximum of every slider, 109 variants in all: all watertight, no print-check errors. The preset variants run in CI (`scripts/ci/check-generator.mjs bee-beetle-bugs`).

Known limits:

- Raised wings and antennae are thin and fragile once printed; the V angle slider says that steeper prints better.
- The stinger of the bee and the fine mandible tips are 1 to 2 mm features.
- Folded wing covers sit 1 mm proud of the body. A step that small can show layer lines.

## Colours

Each species ships its own part colours (entry `color` fields in `BUGS`), all repaintable in the Color tool. Stripes, spots, eyes, antennae, legs, mandibles and veins are `singlePart` entries, so one click paints all of them.
