# Constellation Gauntlet (slot 136)

`programs/constellation-gauntlet.html`, in the Jewellery & Wearables group. A wearable armoured gauntlet that stands on its cuff with the fingers up. A hand plate on the back of the hand carries **five gems**: Solis (the core) and four satellites, Lunara, Vesper, Aurelia and Nova. The gems can be laid out six ways on the plate.

Everything in it is original: the name, the gem names, the layouts and the four style families. It does not use any film or comic names, logos or layouts.

Unprinted. The fit on a real hand, the seat clearance and the gem fit are unproven until a real print.

## Build: Wearable or Display piece

The Fit tab has a **Build** switch. Wearable is the default.

- **Wearable.** A forearm clip cuff and a back-of-hand shield in one piece, hollow, open on the palm side, sized from the wearer's own hand measurements in millimetres (the Overall size slider does not apply). The fingers are dorsal plates that lie along the backs of the fingers; there is no thumb part, so the thumb is free.
- **Display piece.** The original solid model: a hollow cuff, a solid palm, ridged fingers and a thumb. Overall size works here (100% is about 200 mm tall).

## Editing views

The Parametric tab is hidden. Each tab edits one part, and the camera swoops to it (`onTab`, see below).

| Tab | What it edits |
| --- | --- |
| Style | Four style families (Orrery, Shardcrown, Bloomguard, Cogwork) that set every part at once, the Presets list, View, main and accent metal, right or left hand, overall size (display piece only). |
| Fit | Build (Wearable or Display piece), wrist width, hand width across the knuckles, hand thickness at the palm, wrist to knuckles, room around the hand (ease), cuff opening and hand shield opening. The camera looks at the open palm side. |
| Cuff | Forearm cuff height, base flare, surface (smooth, faceted, fluted, scalloped, cogged) and raised bands. |
| Plate | Outline (round, hexagon, shield, crown star, scallop), size, thickness, flat or raised core. |
| Fingers | Finger length, armour plates per finger, fingertip (dome, spike, flat bevel), spread, plate curve (flat, shallow, curved), lean toward the hand, knuckle studs. Display piece only: forward curl, thumb length and angle. |
| Gems | Positions: six layouts, links on or off, spread, turn. Then pick one of five gems. Each has shown or hidden, shape (round, oval, hexagon, octagon, triangle, cushion), cut (brilliant, cabochon, step, spire), size, crown height, turn, colour (eight) and setting (plain, stepped, sunburst, petals, cogs). Buttons copy the chosen gem's shape, cut and setting, or its colour, to all gems. Picking another gem swoops the camera to it. |

Color tool: one mesh per part (`arm`, `plate`, `orbit` (the gem links), `settings`, `fingers`, `knuckles`, `thumb`, `gem0` to `gem4`), so each gem and each finger can be painted. The Color tool splits a part where the surface has a sharp edge, so the shield's outside and inside can show as two parts. Sculpt is off (`sculpt: false`), because the print layout differs from the shown model.

## Gem layouts

`placeGems(kind, Ro, rot, seat, on)` returns the five positions on the plate and the links between them. The Gems tab sets the layout, the spread (`orbitR`) and a turn of -90 to 90 degrees (`orbitTurn`).

| Layout | Positions | Links |
| --- | --- | --- |
| Orbit | Solis in the middle, the four satellites on a circle | Arcs between neighbouring satellites |
| Cross | Solis in the middle, satellites at the four compass points | Straight spokes from Solis |
| Row | A straight chain, Solis in the middle | Short bars |
| Crescent | A bowl-shaped arc, Solis at the lowest point (centred on the plate) | Arcs on the same circle |
| Pentagon | The five gems on a ring, Solis at the top | Arcs round the ring |
| Zigzag | A W shape, Solis in the middle | Straight bars |

Gaps come from each gem's seat radius (`seatOf`), so big gems push the layout apart. If it does not fit on the plate (the plate radius is at most 37 mm, less on a narrow hand) all gems are drawn smaller together and the Gems tab says by how much. The raised core option works on the layouts that keep Solis in the middle (Orbit, Cross, Row, Zigzag).

## Camera swoops

`cfg.onTab(tabId, api)` (called from `setTab` in `generator-core.js`) starts a flight to that tab's view. A flight interpolates the target and, in spherical coordinates, the camera around it, with a quintic ease, a short pull back and a sideways bow in the middle (the swoop). It takes 0.9 to 1.7 s depending on how far it goes, and it is skipped for `prefers-reduced-motion`. `onStage` starts the opening flight (the engine selects the first tab before the stage exists), and `onFrame` steps it. Views are computed from the build (`last.anchor`), so they follow the sliders. The Print tab keeps the engine's own framing. Changing the gem selection while the Gems tab is open calls `startFly` from `onFrame` after the rebuild.

`showIf` also works on parameters that belong to a generator tab (`generator-core.js`, `renderExtraTabs`). The Gems tab uses it to show only the selected gem's controls, and the Fit and Fingers tabs use it to show the controls that belong to the chosen build.

## Geometry

Y up, millimetres, the body centred and resting on y = 0. Everything is built from rings of points joined into closed shells (`ring`, `strip`, `solid`, `tube`), so each shell is watertight by construction and `orient()` flips a shell whose volume comes out negative. Rings may be offset by half a step (the brilliant crown) and a strip handles that with a zipper.

| Mesh | What it is |
| --- | --- |
| `arm` | Wearable: `armWear`, a stack of C-shaped rings (outer curve, inner curve, joined at the two edges of the opening). Display: `armShell`, a flared hollow cuff and a solid palm with a flat front. |
| `plate` | The hand plate: a short vertical wall, then a bevel up to the front face. Optional raised core tier. |
| `orbit` | The links, `linkShell`: a trapezoid section swept along an arc or a straight line. |
| `settings` | The five bezels (tubes with a conical seat). |
| `fingers` | Wearable: `plateLimb`, shallow arcs (flat, shallow or curved) standing up from the shield and leaning toward the hand, with ridges and a shaped tip. Display: `limb`, ridged lathes along a leaning, curling axis. |
| `thumb` | Display piece only. |
| `knuckles` | Optional cone or spike studs. |
| `gem0` to `gem4` | Faceted gems: flat culet, a pavilion cone, a girdle band and a crown. |

### The wearable shell

- Sizes. The inside of the cuff is the wrist width by 0.66 of that for the thickness, plus the ease; the inside of the shield is the hand width by the hand thickness, plus the ease. Walls are 2.6 mm. The cross-section grows from the wrist to the hand slowly (under about 14 degrees), so no wall leans out over the inside.
- Opening. Every ring is a C open on the palm side. The cuff opening (half angle, 55 degrees by default) is the clip: the cuff wraps most of the forearm and flexes to go on. The opening widens up the hand to the shield opening (72 degrees). It only ever widens going up, so the free edges face up and print with no supports.
- Printing standing. The cuff's flat bottom edge (2.6 mm wide, about 250 degrees round) is the bed contact. A brim helps. PETG or a tougher filament is better than PLA for the clip.
- Finger plates. Four shallow arcs, one per finger (index, middle, ring, little from the thumb side), sized to share the hand width. They stand on the top edge of the shield and lean toward the hand (8 degrees by default, 25 at most) so they come down toward the fingers. They rest on the backs of the fingers and do not wrap round them. Hold them with a glove, tape or an elastic strap. A fully enclosed finger tube cannot print without supports (its ceiling would have to bridge the palm), which is why the fingers are plates.
- Plate and studs sit on the back wall; the plate wall is only 1.2 mm deep in the wearable (5 mm on the display piece) so it never pokes into the cavity. Spike studs get a short straight collar and turn up 55 degrees.

### Supports

The body prints with no supports on the defaults and all four style presets (voxel print check, `check-generator.mjs`). Every surface that leans out over empty space is within about 40 degrees of vertical:

- Plate, bezels and links are bevels whose outline moves in at `KSLOPE` (1.3 mm per mm of height, about 38 degrees from vertical). For polygon outlines the inset is multiplied by `q` (1 / cos of the angle to the side's normal) so a flat side is offset by the same normal distance as a corner.
- Rays, petals and cogs on a bezel die away over the lower 45% of its height so their sides are as steep as the cone.
- Spike studs tilt up 40 degrees (55 on the wearable); finger plates lean at most 25 degrees.
- The finger plates and display fingers have ridge beads (gentle lower flank 18 degrees, steep upper flank).

### Gems and seats

A gem prints culet down: the pavilion is a cone narrowing 0.8 mm per mm of depth (`PAV`), the crown rises above, and the gems lie in a row in front of the gauntlet in the Print tab (`printMeshes`). The seat is the same cone opened a little faster (`SEATX`, 0.15 more per mm) with 0.3 mm clearance at the bottom, growing to about 0.7 mm at the rim. The seat keeps opening above the girdle, so it has no flat ceiling and its steepest surface is about 43 degrees from vertical. Glue the gems in.

The bezels are sized from the gems (`bezelExtent`). Raising the core adds a 1.8 mm tier; its skirt is counted in the layout.

### Limits and known issues

- Unprinted. The wearable fit (the cuff clip, the ease, whether the finger plates stay put), the 0.3 mm seat clearance and the thin side walls of the spike fingertips are untested. Print the cuff alone first (set the plate and fingers small) to check the fit.
- Height. The default wearable is about 210 mm tall (a 50 mm cuff, 90 mm from wrist to knuckles, 62 mm fingers, and the rounded tips), so it needs a printer with a build height of 230 mm or more. Shorten the cuff, the palm and the fingers for a smaller printer; the Overall size slider only works on the display piece.
- Measure the hand flat, across the widest part. The default hand is 84 mm wide, 30 mm thick and 62 mm at the wrist. If the clip is too tight, raise the cuff opening or the ease.
- A few unusual gem shape and setting mixes, a few slider extremes (a very wide hand with a long palm, a very short cuff, a curved finger plate) and the Cross, Row and Crescent layouts at large gem sizes can show a small amber overhang chip (a few mm2, depending on the voxel grid). The Row layout at the largest gems shrinks them a lot to fit.
- Over 25 degrees of finger lean or curl, over 50 degrees of thumb angle (display piece) and a plate thicker than 6 mm are outside the support-free range; their slider labels say so.
- The Gems tab's choice buttons all use the same small gem icon (the gem names carry the difference).
