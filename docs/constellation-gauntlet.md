# Constellation Gauntlet (slot 136)

`programs/constellation-gauntlet.html`, in the Jewellery & Wearables group. A wearable armoured gauntlet, a full glove with closed fingers and thumb, that stands on its cuff with the fingers up. A hand plate on the back of the hand carries **five gems**: Solis (the core) and four satellites, Lunara, Vesper, Aurelia and Nova. The gems can be laid out six ways on the plate.

Everything in it is original: the name, the gem names, the layouts and the four style families. It does not use any film or comic names, logos or layouts.

Unprinted. The fit on a real hand, the seat clearance and the gem fit are unproven until a real print.

## Build: Wearable or Display piece

The Fit tab has a **Build** switch. Wearable is the default.

- **Wearable.** A full glove in one piece, hollow, sized from the wearer's own hand measurements in millimetres (the Overall size slider does not apply): a forearm cuff, a closed palm and back of the hand, four enclosed finger tubes and a thumb tube. The palm side has a **window** the hand slides in through (see "The wearable glove" below).
- **Display piece.** The original solid model: a hollow cuff, a solid palm, ridged fingers and a thumb. Overall size works here (100% is about 200 mm tall).

## Editing views

The Parametric tab is hidden. Each tab edits one part, and the camera swoops to it (`onTab`, see below).

| Tab | What it edits |
| --- | --- |
| Style | Four style families (Orrery, Shardcrown, Bloomguard, Cogwork) that set every part at once, the Presets list, View, main and accent metal, right or left hand, overall size (display piece only). |
| Fit | Build (Wearable or Display piece), wrist width, hand width across the knuckles, hand thickness at the palm, wrist to knuckles, room around the hand (ease), cuff opening (the clip on the forearm) and palm window width. The camera looks at the open palm side. |
| Cuff | Forearm cuff height, base flare, surface (smooth, faceted, fluted, scalloped, cogged) and raised bands. |
| Plate | Outline (round, hexagon, shield, crown star, scallop), size, thickness, flat or raised core. |
| Fingers | Finger joints (rigid, strung on cord or hinged, wearable only), a bend preview slider, finger length, armour ridges per finger (on a bendable finger: the sections), fingertip (dome, spike, flat bevel), spread, lean toward the palm (wearable) or forward curl (display piece), thumb length and angle, knuckle studs. A spike fingertip on the wearable is spiked on the fingers only; the thumb keeps a dome (see Limits). |
| Gems | Positions: six layouts, links on or off, spread, turn. Then pick one of five gems. Each has shown or hidden, shape (round, oval, hexagon, octagon, triangle, cushion), cut (brilliant, cabochon, step, spire), size, crown height, turn, colour (eight) and setting (plain, stepped, sunburst, petals, cogs). Buttons copy the chosen gem's shape, cut and setting, or its colour, to all gems. Picking another gem swoops the camera to it. |

Color tool: one mesh per part (`arm`, `plate`, `orbit` (the gem links), `settings`, `fingers`, `segments`, `knuckles`, `thumb`, `gem0` to `gem4`), so each gem and each finger can be painted. The Color tool splits a part where the surface has a sharp edge, so the shield's outside and inside can show as two parts. Sculpt is off (`sculpt: false`), because the print layout differs from the shown model.

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
| `arm` | Wearable: the cuff and palm part of the glove (`gloveMeshes`, a signed distance field meshed by surface nets). Display: `armShell`, a flared hollow cuff and a solid palm with a flat front. |
| `plate` | The hand plate: a short vertical wall, then a bevel up to the front face. Optional raised core tier. |
| `orbit` | The links, `linkShell`: a trapezoid section swept along an arc or a straight line. |
| `settings` | The five bezels (tubes with a conical seat). |
| `fingers` | Wearable: the four finger tubes of the glove (ridged cones with a shaped tip, hollow). Display: `limb`, ridged lathes along a leaning, curling axis. |
| `segments` | Jointed wearable only: the finger sections (see "Bendable fingers"). Hinged: printed in place; strung: separate pieces. |
| `thumb` | Wearable: the thumb tube of the glove. Display: a ridged lathe. |
| `knuckles` | Optional cone or spike studs. |
| `gem0` to `gem4` | Faceted gems: flat culet, a pavilion cone, a girdle band and a crown. |

### The wearable glove

The glove is one closed surface, split into the `arm`, `fingers` and `thumb` meshes only so each can be painted (they share a `smoothGroup`, and `printMeshes` merges them into one printed part).

- Method. The glove is a **signed distance field** (negative inside), evaluated one horizontal slice at a time (`gloveField`) and meshed by **surface nets** on a 1.8 mm grid (`polygonise`), then smoothed (Taubin) and repaired where the surface pinches (`splitPinched` gives each sheet its own vertex, so the result is manifold; where two sheets touch along an edge it pairs the triangles by their angle round the edge). A cavity that splits into four finger bores cannot be made from stacked rings, which is why the earlier ring-based shell is gone. The bed face is cut flat at y = 0. The build takes about a second; the result is cached (`gloveMeshes`) while only gem, plate, stud or colour controls change.
- Outer. A rounded prism (a superellipse, the cuff's wrist section growing to the hand's section, with the cuff surface forms and bands) joined to a tapered cone per finger and one for the thumb. The finger tubes share a 3.6 mm wall (`WF`).
- Cavity. The same prism moved in by the wall, plus a bore inside each finger and the thumb. Above the knuckle line the cavity ceiling is a skirt cone round each finger bore, closing at `TENT` (0.5 mm per mm of height, 27 degrees from vertical), so there is no flat ceiling. The thumb bore leans out, so it closes under its own roof (`ROOF`, 0.55) instead of along its own axis, which would be a near flat ceiling.
- Sizes. The inside of the cuff is the wrist width by 0.66 of that for the thickness, plus the ease; the inside of the glove is the hand width by the hand thickness, plus the ease; each finger bore is a share of the hand width (index, middle, ring, little in 0.97, 1.05, 1.0, 0.88). The finger lengths are 0.97, 1.08, 1.0 and 0.8 of the Finger length slider.
- The palm window is a wedge cut through the palm side at the cuff opening angle, widening up the hand to the palm window width, and closing in an arch (`ARCH`, 0.8 mm per mm, 39 degrees) above the palm so it needs no supports. The wedge is cut square to the wall, so the cut edge is clean.
- Putting it on. The hand goes in through the window low on the glove (the cuff opening is the clip and flexes a little), then slides up so the fingers and thumb enter their tubes. Above the window the glove is closed, so the fingers are fully enclosed.
- Printing standing. The cuff's bottom edge is the bed contact (flat, cut at y = 0). A brim helps. PETG or a tougher filament is better than PLA for the clip.
- Plate and studs sit on the back wall; the plate wall is only 1.2 mm deep in the wearable (5 mm on the display piece) so it never pokes into the cavity. Spike studs get a short straight collar and turn up 55 degrees.

### Supports

The body is designed to print with no supports. The voxel print check (`check-generator.mjs`) reads the **display piece clean**; on the wearable defaults and the four style presets it reports about 45 mm2 of small chips (a few mm across each) at the finger roots, where two finger bores meet under the cavity ceiling, and at the edge of the thumb opening. These are recorded in `ci/printability-baseline.json` as known; they come from the 1.8 mm mesh grid at the cusps of the surface rather than a real flat ceiling, but only a print will tell. Every surface that leans out over empty space is meant to be within about 40 degrees of vertical:

- Plate, bezels and links are bevels whose outline moves in at `KSLOPE` (1.3 mm per mm of height, about 38 degrees from vertical). For polygon outlines the inset is multiplied by `q` (1 / cos of the angle to the side's normal) so a flat side is offset by the same normal distance as a corner.
- Rays, petals and cogs on a bezel die away over the lower 45% of its height so their sides are as steep as the cone.
- Spike studs tilt up 40 degrees (55 on the wearable); fingers lean at most 22 degrees.
- The fingers and thumb have ridge beads (gentle lower flank, at most 18 degrees and gentler on the leaning thumb, steep upper flank).
- The skirt cones, the thumb roof and the window arch are all 39 degrees or gentler.

### Bendable fingers

The wearable's **Finger joints** switch makes the four fingers move: **Rigid**, **Strung (cord)** or **Hinged (print in place)** (the default). A rigid closed tube cannot bend, so a jointed finger is split into sections. Armour ridges per finger is the number of sections (the ridge tops are the joints); the thumb stays rigid. In both jointed modes the first section is fixed to the glove and the rest bend toward the palm about the **palm-side edge** of each joint, so the back of the joint opens. The Bend slider (preview only, `fPose`, 0 to 70 degrees per joint) shows the pose; it is not part of the print and does not rebuild the glove (`placeSegs`).

Every section is meshed on its own in a local frame (y along the finger axis, z the back of the finger, x across) as a surface-nets mesh on a fine grid, and moved onto the finger by `placeSegs`. Neighbouring fingers share a 3.6 mm wall in the glove; each loose section is cut flat 0.3 mm short of the wall's middle, so the fingers bend independently.

**Hinged (print in place), `hingeField` / `hingeMesh`.** The glove stub is cut `CAP` (9 mm) below the first joint, and a fixed **cap** section (the lower half of the first hinge) sits on it. Between two sections:

- Lower section A: two **lugs** (a disc plus a 50 degree gusset down to the wall, so nothing overhangs past 50 degrees), a **slot** between them, and a diamond **pin** standing out of each lug. Upper section B: a **tongue** (a disc with a pointed bottom) that sits in the slot, a round **pocket** (with a 50 degree roof) round each pin, and a **notch** that clears the lugs. The pin axis is on the palm-side edge of the finger. Every gap is `GAP` (0.5 mm); the pocket is round so the diamond pin turns in it, and the clearance measures at least 0.39 mm at every bend angle (checked by vertex distance with the tacks off).
- **Tacks.** A section floats above the one below, so seven 1.2 mm tacks round the face gap and one under the tongue bridge each gap (`TACK_DEG`, `TACKS_ON`). They hold the section on the printer and snap at the first bend (bend each joint a few times to free it).
- Size. A hinge needs about 15 mm of section, so the number of sections is capped at one per 15 mm of finger (the default 52 mm index finger gets one joint, a 70 mm one gets two). The hinge bosses stand about 3 mm proud on the palm side.
- Print. The sections print in place, straight, as part of the glove (`Lt.segPrint`), so the glove is about 220 mm tall, like the rigid one. The hinges add about 25 mm2 of small overhang chips to the print check (known, in the baseline).
- Cost. A build takes about 2.8 s (the sections are 160k triangles); a bend-slider or gem change takes under 100 ms.

**Strung (cord).** The first section stays fixed and the others are loose segments that print separately, standing in rows behind the gems, and are strung on elastic cord:

- Cord. A 2.2 mm groove (`HOLE`) runs up the palm side of the bore wall, parallel to the cone, in the stubs (`c.cord` in `coneBore`) and in every segment. Thread about 1 mm elastic cord from the fingertip down through the grooves and knot it at both ends: the tip knot sits in the fingertip, the other in the glove cavity behind the finger root. The cord on the palm side stays almost the same length as the finger bends; keep it just taut.
- Segments. `segMesh` (grid `SEG_CELL`, 0.8 mm so the groove resolves), cut flat against the neighbours. The glove stops at the first ridge, so it is about 181 mm tall.
- Cost. About 1.9 s against 1.2 s for rigid.

### Gems and seats

A gem prints culet down: the pavilion is a cone narrowing 0.8 mm per mm of depth (`PAV`), the crown rises above, and the gems lie in a row in front of the gauntlet in the Print tab (`printMeshes`). The seat is the same cone opened a little faster (`SEATX`, 0.15 more per mm) with 0.3 mm clearance at the bottom, growing to about 0.7 mm at the rim. The seat keeps opening above the girdle, so it has no flat ceiling and its steepest surface is about 43 degrees from vertical. Glue the gems in.

The bezels are sized from the gems (`bezelExtent`). Raising the core adds a 1.8 mm tier; its skirt is counted in the layout.

### Limits and known issues

- Unprinted. The wearable fit (whether your hand goes in through the window, the cuff clip, the ease, whether the finger tubes are roomy enough), the 0.3 mm seat clearance and the thin side walls of the spike fingertips are untested. The Rigid finger setting is a rigid shell with straight fingers. The jointed settings are also unprinted: for Hinged, the 0.5 mm clearance, the tacks (will they hold during the print and snap cleanly?) and the 3 mm pins are unproven, and the hinge is only as free as the printer's accuracy allows; for Strung, the groove size and the 1 mm elastic cord. Both pivot about the palm-side edge rather than your real knuckle centre, so your finger slides in the tube a few millimetres as it bends, and the back of the finger shows through the gap at a deep bend. Print the cuff alone first (set the fingers and plate small) to check the fit.
- Height. The default rigid glove is about 220 mm tall (a 50 mm cuff, 90 mm from wrist to knuckles, 17 mm of skirt, 52 mm fingers and the rounded tips; the bendable glove is about 181 mm, the segments print separately) and 122 mm wide, so the rigid glove needs a printer with a build height of 230 mm or more and a bed of about 130 x 70 mm. Shorten the cuff, the palm and the fingers for a smaller printer; the Overall size slider only works on the display piece.
- Measure the hand flat, across the widest part. The default hand is 84 mm wide, 30 mm thick and 62 mm at the wrist. If the clip is too tight, raise the cuff opening or the ease. If the fingers feel tight, raise the ease; each finger tube is sized from the hand width, not from your finger widths.
- The thumb tip is always a dome (a spike would need a bore that cannot close under the roof without a flat ceiling), so a spike fingertip style spikes the four fingers only.
- A few unusual gem shape and setting mixes, slider extremes (a very wide hand, a very narrow wrist, a thumb angle at the ends of its range, a finger lean over 20 degrees) and the Cross, Row and Crescent layouts at large gem sizes show larger overhang chips (up to about 140 mm2 at the widest hand with the narrowest wrist). The Row layout at the largest gems shrinks them a lot to fit.
- Over 20 degrees of finger lean (the slider stops at 22; a hinged finger leaning more leaves a sliver in the glove that is not manifold), over 25 degrees of display curl, over 50 degrees of thumb angle (display piece) and a plate thicker than 6 mm are outside the support-free range; their slider labels say so.
- The Gems tab's choice buttons all use the same small gem icon (the gem names carry the difference).
