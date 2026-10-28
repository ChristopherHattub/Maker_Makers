# Tile hover assets skill v3 (for Gemini)

Version 3 asks Gemini for **one generator per image, a 16-frame half turn (0–180°) that the site mirrors for the rest**, because two generators and 24 frames per image gave uneven, repeated frames, and Gemini cannot draw the second half of a turn (270–360°) reliably. It supersedes v1 (scan-line sheets) and v2 (two generators per sheet). The base tile is unchanged.

Source of truth for the list is `js/programs.js` on `origin/main`: **42 generators** (slots 1–43; slot 14 unused).

## The design

| Piece | What Gemini draws | Count |
|---|---|---|
| Base tile | One empty tile: steel frame, orange rim, HUD, glow pool, no text | 1 (done, shared by all tiles) |
| Object image | One cyan wireframe hologram on pure black, 16 frames turning 0°→180° (12° per frame), front to back | 1 per generator, 42 total |

The site draws the label, slot number, rim colour, hologram tint and the pop-out (scale up, lift, overflow the frame), then plays f0→f15 followed by f14→f1 flipped left to right (30 frames per full turn at about 24 fps), so the spin is continuous.

| Item | Value |
|---|---|
| Object image | 1152 × 1152 (1:1), 4 × 4 grid of 288 px cells, pure black, no gaps |
| Frames | 16, left to right then top to bottom, 12° apart, 0° to 180°, clockwise seen from above (f0 front, f7–f8 side profile, f15 back) |
| Landmarks | f0 front (three-quarter), f7–f8 side with front pointing left, f15 back. Nothing is drawn past 180°. |
| Object size | Largest dimension 245–252 px (85–88% of the cell), centred, 18 px black margin |
| File name | `<id>-3d.jpg` (for example `ghost-builder-3d.jpg`) saved to Downloads, id from the manifest |

Each manifest row lists what the **front** (f0) and **back** (f15) look like, so Gemini has a visible landmark for every angle.

## 1. Gem instructions (paste into the Gem)

````text
You make image assets for a website called MakerMakers (parametric 3D-print model generators). Each request is for ONE image: either the BASE TILE or ONE OBJECT (a single generator's rotating hologram). Follow the spec exactly. Never add text, titles, captions, numbers or watermarks inside any image.

SHARED STYLE
Sci-fi holographic UI: brushed-steel frame, dark HUD screen, glowing cyan wireframe hologram. Match the attached reference images for line weight, glow and mood.

=== MODE A: "BASE TILE" ===
Make ONE image, exactly 1024 x 1024 px: an EMPTY tile with no object and no text of any kind.
- The tile is a 960 x 960 px square centred on the canvas with chamfered (cut) corners and a 32 px margin around it. The margin AND the cut-away corner triangles are flat solid magenta #FF00FF, with no gradient, shadow, glow or halo. Never use magenta, pink or purple inside the tile.
- Frame: neutral brushed steel, pure grey, NO colour cast. Four small rivets, one in each corner.
- Rim: a thin glowing line just inside the steel frame, in ONE pure saturated orange (about #FF7A00) with a soft glow in the same orange. Not blown out to white or yellow. This is the ONLY warm colour in the tile.
- Screen: dark blue-black background with a faint cyan grid, thin circular HUD arcs, small abstract readout blocks made of bars and dots (no letters or numbers), all cool cyan/blue.
- A glowing elliptical cyan pool of light with a thin ring at about 72% of the tile height. The middle of the screen above it is empty.
- Bottom strip: a plain dark empty band. Top-left: a small empty rectangular HUD box.
- Symmetric and tidy, flat lighting.

=== MODE B: "TILE <id>" (one object, 16 rotation frames) ===
Make ONE image, exactly 1152 x 1152 px (1:1), pure black #000000 background, showing ONE holographic object turning through a full 360 degree rotation in 16 frames. Look up the id in the manifest to get the subject, its front features and its back features.
- Grid: 4 columns x 4 rows of 288 x 288 px cells, no gaps, no lines, no border, no labels. Frames are read left to right, then top row to bottom row: f0 f1 f2 f3 / f4 f5 f6 f7 / f8 f9 f10 f11 / f12 f13 f14 f15.
- Treat the object as ONE fixed 3D model on a turntable photographed by a fixed camera. Frame n shows that same model rotated n x 22.5 degrees CLOCKWISE seen from above (the front moves from the viewer's right to the viewer's left). Exact angles:
  f0 0 | f1 22.5 | f2 45 | f3 67.5
  f4 90 | f5 112.5 | f6 135 | f7 157.5
  f8 180 | f9 202.5 | f10 225 | f11 247.5
  f12 270 | f13 292.5 | f14 315 | f15 337.5
  (next would be 360 = f0, so the loop is seamless).
- Landmark views: f0 = the FRONT features, seen three-quarter from slightly above. f4 = pure side profile with the front pointing to the viewer's LEFT. f8 = the BACK features, front features completely hidden. f12 = the opposite side profile with the front pointing to the viewer's RIGHT.
- Every frame must look clearly different from its neighbours: features visibly slide across the object by about a quarter of a quarter-turn each frame. NO two consecutive frames may look alike, and no angle may be skipped or repeated. Do not hold the front view for several frames. Flat objects turn edge-on at f4 and f12 (a thin line) and show their back face at f8.
- Before drawing, plan the 16 angles and which feature appears where. The object's design, size, height, line density, brightness and colour must be identical in all 16 frames; only the rotation angle changes.
- Look: dense cyan/teal holographic wireframe with fine mesh lines, brighter edges, a soft inner glow, semi-transparent, glowing slightly past its outline into black. Pure cyan only (about #2FE6FF). No background, grid, frame, ground pool, scan lines, particles or text.
- Camera: same lens, same distance and same slight downward angle for every frame.
- Size and position: centred at the exact centre of its cell. The object's largest dimension is 245-252 px, filling 85-88% of the cell, at least 18 px of pure black on every side, glow fading to black before the cell edge, nothing crossing into a neighbouring cell. (A previous attempt drew objects at only about 63% of the cell, which is too small.)

HOW TO RESPOND
1. "BASE TILE": make the base tile only.
2. "TILE <id>": make that object's 16-frame image only. If I attach an earlier accepted tile, match its line density, brightness and size exactly.
3. "redo TILE <id>, <problem>": regenerate it fixing the problem.
4. After the image add one line: size OK/not OK; background pure black yes/no; 16 distinct frames yes/no; frame f8 shows the back yes/no; no text yes/no.
Never add decoration or extra objects.
````

## 2. Manifest (paste into the Gem as knowledge)

Format: `Slot | id | subject | front (f0) | back (f15)`.

```
Slot 01 | ghost-builder | a rounded ghost with a wavy hem and two stubby arms | front f0: two round eyes, a smile and both arms visible | back f15: a smooth blank dome, no face, wavy hem
Slot 02 | pumpkin-plotter | a ribbed pumpkin with a curly stem | front f0: a carved jack-o-lantern face (triangle eyes and nose, jagged smile) | back f15: plain vertical ribs, no face, stem curl pointing the other way
Slot 03 | spider | a spider with a round abdomen and eight bent legs | front f0: a cluster of eyes and two fangs | back f15: the rear of the abdomen with an hourglass marking, legs trailing
Slot 04 | snowman | a three-ball snowman with a top hat, scarf and carrot nose | front f0: carrot nose, coal eyes, buttons, scarf knot | back f15: plain back of the balls, scarf tail hanging, back of the hat
Slot 05 | witch-hat | a tall bent witch hat with a wide curled brim | front f0: a buckle on the hat band, brim curling toward the viewer | back f15: the bent tip pointing away, no buckle
Slot 06 | snowflake | a flat six-armed snowflake ornament with a hanging loop | front f0: the flat face with the hanging loop at the top (it turns edge-on at about 90 degrees, nearly a thin line) | back f15: the mirrored back face
Slot 07 | skull-sculptor | a skull with eye sockets, nose cavity and teeth | front f0: eye sockets, nose cavity and teeth | back f15: smooth back of the cranium with a small crack
Slot 08 | holiday-tree | a tiered Christmas tree with baubles and a star topper | front f0: a garland swag, baubles and the star | back f15: plain boughs with fewer baubles
Slot 09 | gift-box | a gift box with a lid and a ribbon bow | front f0: the bow knot and a hanging tag | back f15: plain ribbon seam, no tag
Slot 10 | key-clicker | a row of mechanical keyboard keycaps | front f0: the keycap tops with symbols | back f15: the back edge with a cable port
Slot 11 | name-keychain | a rounded name plate with raised NAME letters and a key ring | front f0: raised letters with the key ring on the right | back f15: flat back of the plate with the ring on the left
Slot 12 | image-clicker | a flat print-in-place fidget clicker slab with an embossed picture | front f0: an embossed mountain-and-sun picture | back f15: a plain smooth back (turns edge-on at about 90 degrees)
Slot 13 | ornament-stacker | a stacked ornament-style snowman with a hanging loop | front f0: a face with a button row | back f15: plain back, the hanging loop at the top
Slot 15 | pottery-wheel | a vase on a pottery wheel with one side handle | front f0: the handle on the right and a carved band | back f15: no handle, plain curve of the vase
Slot 16 | gift-box-2 | a gift box with a hinged lid and a bow | front f0: the bow and a tag | back f15: the hinge side, no bow
Slot 17 | turkey-builder | a turkey with a fan of tail feathers | front f0: the face with a wattle | back f15: the full fan of tail feathers
Slot 18 | cornucopia | a horn-of-plenty basket spilling fruit and gourds | front f0: the open mouth with spilling fruit | back f15: the woven horn tip curling away
Slot 19 | leaf-press | a flat leaf ornament with raised veins | front f0: the leaf face with raised veins (turns edge-on at about 90 degrees) | back f15: the back face
Slot 20 | pumpkin-pie-slice | a slice of pumpkin pie with a crust edge | front f0: the pointed tip toward the viewer with the crust arc behind | back f15: the crust arc facing the viewer
Slot 21 | acorn-pinecone-set | an acorn and a pinecone side by side | front f0: the acorn on the left, the pinecone on the right | back f15: the two swapped sides, caps from behind
Slot 22 | scarecrow-stacker | a stacked scarecrow with a straw hat and patched body | front f0: a stitched face and body patches | back f15: plain back with straw tufts
Slot 23 | gratitude-place-cards | a standing folded place card with a leaf motif | front f0: the leaf motif on the front panel | back f15: the plain back panel
Slot 24 | countdown-clock | a clock face with chunky numerals as a cake topper | front f0: the clock face | back f15: the plain casing with a stand
Slot 25 | confetti-cannon | a party-popper cone bursting confetti | front f0: the cone mouth with confetti bursting toward the viewer | back f15: the closed tip of the cone
Slot 26 | party-hat | a striped party hat on a spinning base | front f0: the seam of the stripes and a pom-pom | back f15: the opposite side of the cone
Slot 27 | party-whistle | a curly party blower whistle | front f0: the mouthpiece and the curl | back f15: the other side of the curl
Slot 28 | conversation-hearts | a pile of heart-shaped candies with short embossed words | front f0: hearts with embossed words | back f15: plain backs of the hearts
Slot 29 | valentines-card | a folded card with a heart cut-out | front f0: the heart cut-out in the front panel | back f15: plain back, closed fold
Slot 30 | egg-decorator | a decorated egg on a stand with patterned bands | front f0: a zigzag band | back f15: a small flower pattern
Slot 31 | bunny-builder | a bunny with long ears and a round tail | front f0: the face with whiskers | back f15: the round fluffy tail
Slot 32 | chick-hatcher | a chick emerging from a cracked egg | front f0: the chick face and beak | back f15: the jagged edge of the shell
Slot 33 | flower-pot | a planter pot with a flower growing out | front f0: the flower bloom facing the viewer | back f15: a leaf and the plain pot back
Slot 34 | butterfly-wings | a butterfly with patterned open wings | front f0: the open wings facing the viewer | back f15: wings edge-on at about 90 degrees, body from behind at 180
Slot 35 | egg-basket | a woven basket with a handle holding eggs | front f0: the handle and eggs | back f15: the plain weave side
Slot 36 | cake-stacker | a tiered cake with frosting drips and a cherry | front f0: the cherry and the longest drip | back f15: the back drips
Slot 37 | candle-number | a numeral 7 candle topper with a flame | front f0: the numeral face with the flame | back f15: the mirrored back of the numeral
Slot 38 | pinata | a donkey-shaped pinata with a pull string | front f0: the donkey face | back f15: the tail and the pull string
Slot 39 | balloon-twister | a twisted balloon dog | front f0: the dog face | back f15: the twisted tail
Slot 40 | banner-letters | a row of bunting flags with letters | front f0: the lettered flags facing the viewer | back f15: the plain backs of the flags
Slot 41 | party-popper | a party popper spinner fidget | front f0: the popper mouth | back f15: the closed tip
Slot 42 | cupcake-maker | a cupcake with swirled frosting and a cherry | front f0: the cherry and frosting swirl | back f15: the wrapper pleats from behind
Slot 43 | birthday-crown | a spiked birthday crown with gems | front f0: a large central gem | back f15: a plain band with a clasp
```

## 3. How to run it

1. Paste section 1 into the Gem, add section 2 as knowledge.
2. For each generator send `TILE ghost-builder`, then `TILE pumpkin-plotter`, and so on. Attach your best accepted tile with every request so line weight and brightness stay the same.
3. Check the checklist, redo if needed ("redo TILE spider, f8 still shows the face"), save as `<id>-3d.jpg`.
4. Send me the files. The build script will be adapted to this layout when they arrive.

### Checklist (per image)

- [ ] 1152 × 1152, 4 × 4 grid, pure black everywhere outside the object.
- [ ] One object, same design, size, brightness and line density in all 16 frames; cyan only; no text, pool, grid or particles.
- [ ] Largest dimension 245–252 px, centred, 18 px margin, glow fades to black inside the cell.
- [ ] All 16 frames look different from their neighbours. Flip through them: a smooth even turn with no repeated or held frames.
- [ ] f0 shows the front features, f7–f8 a left-facing profile, f15 the back (front features hidden). Nothing is drawn past 180°.
- [ ] Clockwise seen from above (front moves from the viewer's right to left), steadily from f0 to f15 with no reversal.

## 4. Homepage handoff

Playback is built for v2 (24-frame sheets of two generators). For v3 the build script and `manifest-v2.json` change to one file per generator: `assets/thumbnails/sprites/obj-<id>.webp` (1152 × 1152, brightness to alpha, per-block normalising, optional hue), with each tile entry `{ "slot": 1, "file": "obj-ghost-builder.webp" }`, `cols` 4, `frames` 16, `rowsPerBlock` 4, `fps` 24, `mirror: true` (play f0..f15 then f14..f1 with `transform: scaleX(-1)`). Loading one small file per tile on first hover is lighter than the shared sheets. Everything else (base tile, rim hues, pop-out, label and slot text, reduced motion) stays as in v2.

## 5. Optional: second half of the turn (PART B) for asymmetric objects

Mirroring the 0–180° half only works when the object looks the same flipped left to right. Objects with a feature on one side (a hat tip that curls one way, a scarf tail, a stem curl) show that feature jumping to the other side at the 180° turnaround. For those, generate the second half too and the site plays the whole turn as drawn, with no mirroring.

Add to the Gem instructions:

```
=== MODE C: "TILE <id> PART B" (second half of the turn) ===
Same image format as TILE <id> (1152 x 1152, 4 x 4 grid of 288 px cells, pure black, same look, same size, same camera), but showing the SECOND half of the rotation, 180 to 360 degrees. I attach the accepted PART A of the same object: it is the same 3D model, so every detail (colours aside) must match it. Frame n shows the model rotated 180 + n x 12 degrees clockwise seen from above:
  f0 180 | f1 192 | f2 204 | f3 216
  f4 228 | f5 240 | f6 252 | f7 264
  f8 276 | f9 288 | f10 300 | f11 312
  f12 324 | f13 336 | f14 348 | f15 360
- f0 must look exactly like PART A's f15 (the back view). f15 must look exactly like PART A's f0 (the front view).
- Around f7-f8 (about 270 degrees) the object is in side profile with its FRONT pointing to the viewer's RIGHT; the front features then come back into view from the right side.
- Asymmetric features (a curled tip, a scarf tail, a stem) stay attached to the same side of the object as in PART A: they turn with the object, they never swap sides.
- Same rules as before: every frame different from its neighbours, steady turn in one direction, nothing held, same size and centre.
```

Save the result as `<id>-3d-b.jpg` next to `<id>-3d.jpg`. The build script then makes a 32-frame full turn (`mirror: false`) for that tile.
