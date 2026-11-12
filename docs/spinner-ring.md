# Spinner Ring (slot 46)

`programs/spinner-ring.html`, bundle `fidgets`. A finger ring whose outer band spins around a fixed inner band. The two bands **print as separate pieces** side by side and snap together by hand.

## Why two pieces

The first version printed both bands in place, locked by a 45-degree V rib in a V groove with 0.4 mm between them. A test print spun, but not much, and stopped working after a couple of hundred spins: layer lines, elephant foot and fused strands inside a 0.4 mm gap grind against each other and jam. Printing the bands apart removes the gap problem (no fusing, no stringing between them) and lets the contact be a small rounded bead instead of two matching faces.

## The snap fit

Profile in (radius, height), both bands revolved around the ring axis (the axis stands up on the bed):

- **Inner band**: smooth bore (finger diameter slider), 2.2 mm wall, a bead on the outside: 1 mm flat tip, flanks that rise 1.25 mm of height per mm of bead height (about 38 degrees from the vertical, so the underside prints without supports). A radial **slit** runs through the band, about 3 mm at the bore on the default size. Its width is set so that closing it shrinks the bead tip 0.15 mm past the lips.
- **Spinning band**: a matching groove inside with 0.4 mm radial clearance and 0.4 mm of extra room each side of the bead tip, two lips at the faces and a 0.4 mm 45-degree lead-in on each lip (it also clears elephant foot). The bead is 0.9 mm tall, so it sits 0.5 mm behind each lip.
- Only the bead tip's flat band touches the groove, so friction is low. On a finger the slit cannot close, so the bands cannot separate; off the finger, squeeze the slit shut to take them apart.
- **Fixed on purpose.** The snap-fit numbers (`SNAP_GAP`, `SNAP_GRIP`, `SNAP_AXIAL`, `SNAP_PASS` in the page) are constants, not sliders, so every ring is a working one.
- **Assembly**: squeeze the inner band until the slit closes, push it straight into the spinning band and let go. It springs open into the groove with a click. Closing the slit bends a 2.2 mm wall by about 0.6% strain, well inside PLA's elastic range.
- **Why the slit.** Two earlier prints used a rigid inner band tilted in and turned flat (0.3 mm then 0.5 mm clearance). Both jammed while turning. A rigid sweep of the 0.5 mm profile shows why: the bead and band corners hit the lips by up to 0.19 mm around 10 degrees and 0.04 mm around 40 degrees, before any elephant foot. Looser clearance would only make a wobbly ring, so the geometry changed instead.
- For a longer spin, put a drop of silicone grease or a rub of candle wax on the bead. Do not use oil on PLA for long.

The check is geometric only: the profile gap between the bands is never under 0.4 mm and the bead sits 0.5 mm behind the lips (verified in the profile, not on a printer). **Nothing here has been physically printed.** Treat the click force, the spin time and the 200-spin life as unproven until printed.

The model in the Parametric and Print tabs is the **print layout**: inner band on the left, spinning band on the right, both flat on the bed.

## Decoration (Show on the band)

`Plain`, `Text`, `Pattern` or `Shape`.

### Text

Up to 16 characters in one of 11 fonts: `Pixel dots` (the original 5x7 lettering) and the 10 OFL outline fonts of the Text Generator (Bold block, Tall condensed, Soft rounded, Bubble, Slab serif, Script, Retro script, Chunky caps, Marker, Comic caps). Slider groups: Font, Text height, Text height off the band, Repeat around the ring (copies are dropped or the text shrunk when it would not fit around the ring).

Font data lives in `programs/shared/fonts-ring.js` (loaded by the page). `node tools/ring-fonts/build.mjs` copies it from `programs/shared/fonts-text.js` (which `tools/text-fonts/build.mjs` fills from the TTFs) and trims it to ASCII letters, digits and common punctuation. Licences: `tools/text-fonts/licenses/` (SIL OFL 1.1). Outline code (`triangulate`, `glyphShapes`) is copied from the Text Generator, with one change: `cleanLoop` also removes zero-width spikes (the Marker font has them and they left holes in the cap).

How a letter is made: built flat in (along band, up band, out from band), split into smaller triangles (`refineForBend`, edges about 3 mm or less) and bent around the band. The letters lean up by `SHEAR` (1.25 mm per mm of height) so the underside of every stroke rises at about 38 degrees from the vertical and prints with no supports on a ring that stands on its edge. The foot is buried 0.6 mm into the band and the vertical range is limited so neither the tip nor the foot leaves the band (an earlier version dipped below the bed).

### Patterns

Five, each a function of the unrolled band (`makePattern`) that returns a height 0 to 1. Edges ramp over about the relief height (a 43 degree flank), so raised and engraved relief print with no supports. Tile counts are rounded so the pattern joins without a seam. The pattern is written into the spinning band's outer surface as a height field (about 0.22 mm grid), so the band stays one closed shell. **Relief** switches between Raised and Engraved; engraved depth is limited so the band keeps at least 1.3 mm of wall under the groove. Line weight under about 1.6 mm does not reach the full relief height (the flanks meet in a ridge).

| Pattern | Sliders (besides size, line weight, relief height, relief) |
| --- | --- |
| Honeycomb | Centre dot size, Inner hexagon |
| Sea waves (scales) | Rings in each scale, Scales (all rings or alternate solid with an engraved ring) |
| Woven ribbons | Gap between ribbons (two diagonal ribbon families, over and under) |
| Rosette lattice | Petals, Inner petals |
| Flow maze | Tile style (curves, double curves, diagonals), Shuffle (seed) |

Sliders that do not apply to the chosen decoration or pattern are hidden with the engine's `showIf` parameter flag (see [generator-styling.md](generator-styling.md)).

### Shape

Unlike a pattern, this changes the band's own silhouette (`makeShape01`): the outer radius becomes `rout + depth * f(angle, height)`. Five shapes: Gear teeth, Soft lobes, Faceted gem, Twisted flutes (lobes that twist up the band), Ripples (rings up the band). Sliders: teeth/lobes/facets (3 to 16), shape depth, twist, ripples. Twist and ripple rates are capped so no flank leans past about 40 degrees from the vertical, and the shape never goes below the plain band radius, so the wall under the groove stays full. The band has square top and bottom edges in this mode (no bevel). 320 extreme combinations passed the mesh and print checks.

## Print tab demo

When the Print tab is open, `onFrame` plays a 12 second loop on the model meshes: the pieces on the bed, the inner band is squeezed shut, lifts and drops into the spinning band, a small click, the ring tilts toward the viewer and the spinning band is flicked and slows down. A caption (`.mm-anim-caption`, styled in `generator.css`) names the three steps. It only changes mesh transforms: exports, the print check and the Color tool use the unmoved geometry, and the transforms are reset when another tab opens.

## Checks

`node .claude/skills/makermakers-generator/check-mesh.mjs programs/spinner-ring.html --all` (defaults and all 10 presets): every shell watertight, print check "no supports needed". A wider sweep (all 11 fonts x 94 characters x 2 text depths, strings of 16 characters, and every pattern across size, line weight, relief, depth, width and the pattern-specific extremes) found no open or non-manifold meshes. The CI job `spinner-ring` runs the same check, with no baseline entry.

Known limits: no kerning; script letters overlap (a hair of offset per letter keeps their corner points from coinciding); the Color tool splits each band into a few parts (bead and bore surfaces are separate parts) and each letter is its own part; the hologram tile still shows the older assembled ring.
