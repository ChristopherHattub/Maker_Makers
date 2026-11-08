# Fidget Spinner (slot 114)

`programs/fidget-spinner.html`, in the Fidgets & Clickers group. A personalised hand spinner in six styles. Everything lies flat on the bed (Y up, thickness along Y) and prints with no supports. Nothing here has been physically printed: the hub clearance, the bearing pocket fit and the pocket sizes are unproven until a real print.

## Geometry

The outline is one star-shaped polar curve `r(theta)` (600 samples), so it cannot self-intersect. Each style is a lobe profile `lobeShape(style, t, w)` over the phase `t` of one arm; the curve is then blurred twice (the *Corner rounding* slider sets the blur width in mm) so every corner, valley and tip is smooth.

| Style | Profile |
| --- | --- |
| Classic lobes | round-ended lobes |
| Flower | `cos^2` petals |
| Star | triangular points |
| Gear | square teeth (rounded by the blur) |
| Blade | one slow rise and a fast drop, a pinwheel |
| Disc | a plain circle (use through holes or pockets for the cut-outs) |

The waist radius is raised automatically so there are 2.5 mm of wall around the centre ring; the tip radius is raised to at least waist + 6 mm.

| Mesh | What it is |
| --- | --- |
| `body` | One closed surface: outline walls with a 0.5 mm bottom chamfer, the centre hole and the arm-end pockets or holes. |
| `core` | The ring around the centre. A separate closed solid touching the body along a 96-sided cylinder. |
| `hub` | Print-in-place centre disc (lathe). |
| `pads` | Two thumb pads for the bearing mode, printed flat beside the spinner. |
| `text` | The name: one thin stroke quad per segment, each a closed solid, slightly different heights so touching strokes never share an exact corner. |

## Print-in-place hub

The ring's inner wall has a V groove with 45 degree sides (1.6 mm deep, `d` in the code). The hub has the matching diamond-section rim, offset by the *Hub clearance* slider (default 0.35 mm, 0.2 to 0.6) measured **perpendicular to the wall** all round (checked numerically: the minimum gap equals the slider). Both slopes are 45 degrees, so nothing bridges and no supports are needed; the bottom edges are chamfered 0.4 mm to open the gap on the first layers (elephant foot). The hub's rim is wider than the ring's opening, so it is captive. The hub top is a thumb dish, flat or a dome.

If the hub sticks after printing, twist it with a little force, or raise the clearance.

## 608 bearing mode

The ring has a 22.3 mm pocket (22 mm plus *Bearing pocket clearance*, default 0.15 mm per side) over a 0.8 mm floor lip with a 9 mm opening that supports the outer race. Thickness is raised to 8.6 mm when needed (a 608 is 7 mm thick). Two printed pads with an 8 mm peg (3.9 mm radius) press into the bore from each side. The pocket at the arm ends with a diameter of 21.5 mm or more also uses the 8.6 mm minimum.

## Arm ends

Solid, Weight pocket (1.2 mm floor, open on top: drop in steel balls, nuts, coins or another 608 and glue them in) or Through hole. The pocket is placed as far out as it fits with 1.6 mm wall (searching the outline in 0.5 mm steps) and shrinks in 0.5 mm steps if it cannot fit; a note in the Name tab says so. If it cannot fit at all it is dropped.

## Name

Type the name in the Name tab (A to Z, 0 to 9 and `. ! + - <`; up to 12 characters; `<` draws a small heart). *One letter per arm* uses the letters in order and repeats them if the name is shorter than the number of arms; *Whole name on each arm* writes the whole name outwards along each arm. The letters shrink (by 7 % steps, down to 5 mm) until every corner lies inside the outline and clear of pockets and the centre ring; if they still do not fit the name is dropped and the tab shows why. The strokes are plain polylines (`FONT`), so the letters are simple capitals.

## Checks

`node .claude/skills/makermakers-generator/check-mesh.mjs programs/fidget-spinner.html --all` is watertight with no supports needed for the defaults and every preset. A random sweep of 96 parameter sets (every slider at its minimum and maximum plus random mixes) was also clean.
