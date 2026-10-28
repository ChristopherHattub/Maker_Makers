# Tile sprite sheet skill v2 (for Gemini)

Version 2 replaces the first spec. What changed: every tile now has the **same hover animation** (the hologram grows, pops out past the tile frame and spins clockwise in a smooth continuous turn), and the work is split into two kinds of image so the site can recolour the frame and the hologram in code.

Source of truth for the list is `js/programs.js` on `origin/main`: **42 generators** (slots 1–43; slot 14 is unused). Re-generate the manifest when slots are added. The v1 sheets (6-frame scan-line style) already on the site keep working until the v2 playback replaces them.

## The design

| Piece | What Gemini draws | Count |
|---|---|---|
| **Base tile** | The empty tile: steel frame, rivets, orange rim, HUD background, glow pool. **No object, no text.** | 1 image, made once, shared by all generators |
| **Object sheets** | Only the cyan wireframe hologram on pure black, one full 360° turn in **24 frames (15° per frame)**, drawn at its large "popped" size | 21 sheets, 2 generators each |

The site then draws the label, slot number, rim colour and hologram colour in code, and does the pop-out itself:

- **Label and slot number are real text** drawn by the site, so spelling is always right and they can be restyled. Gemini never draws text.
- **Rim colour** is changed in code per section of tiles. The base is built so it can be recoloured cleanly (see "Why these colours").
- **Pop-out** is a code animation: the object frame scales from its rest size to full size, lifts slightly, and overflows the tile frame, then the 24 rotation frames loop. Because the scale is done in code, every tile pops identically and Gemini never has to keep a rest/pop size consistent.
- **Hologram colour** is also changed in code (all holograms are drawn in the same cyan; the site shifts the hue per tile, like the orange Pumpkin Plotter).
- **Black background instead of magenta for objects:** a glowing hologram on black can be turned into transparency exactly (brightness becomes opacity), so no key colour and no coloured fringe.

### Why these colours

- **Frame:** neutral brushed steel with zero colour cast. Greys do not shift when the site changes hues.
- **Rim glow:** one pure, saturated orange (about `#FF7A00`), and **no other warm colour anywhere in the tile** (no yellow, red, brown, white-hot centre). Then "everything warm" is the rim, and a hue shift in code recolours exactly the rim and nothing else.
- **HUD, grid, glow pool:** cool cyan and blue only, so they sit on the opposite side of the colour wheel from the rim.
- **Objects:** pure cyan wireframe. Tinted in code.

### Geometry summary

| Item | Value |
|---|---|
| Base tile image | 1024 × 1024. Tile is 960 × 960 centred, 32 px flat magenta `#FF00FF` margin (also fills the chamfered corner cut-outs). |
| Object sheet | 1728 × 2304 (3:4). Cells 288 × 288. 6 columns × 8 rows. No gaps, no outer border. |
| Per generator | A **block** of 6 × 4 cells (frames f0–f23, left to right, top row to bottom row). 2 blocks per sheet, stacked top to bottom. |
| Object size in cell | Centred at the cell centre. Largest dimension 245–252 px (85–88% of the cell). At least 18 px of pure black on every side. |
| Frames | 24, one full turn in 15° steps (smooth at about 24 fps), **clockwise viewed from above** (the front of the object travels from the viewer's right to the viewer's left). f0 is the rest view: three-quarter front, slightly from above. f23 flows straight back into f0 so the loop has no jump. |

---

## 1. Gem instructions (paste into the Gem)

````text
You make image assets for a website called MakerMakers (parametric 3D-print model generators). Each request is for ONE image: either the BASE TILE, or an OBJECT SHEET. Follow the spec exactly. Never add text, titles, captions, numbers or watermarks inside any image.

SHARED STYLE
Sci-fi holographic UI: brushed-steel frame, dark HUD screen, glowing cyan wireframe hologram. Match the attached reference images for line weight, glow and mood.

=== MODE A: "BASE TILE" ===
Make ONE image, exactly 1024 x 1024 px: an EMPTY tile with no object and no text of any kind.
- The tile is a 960 x 960 px square centred on the canvas with chamfered (cut) corners and a 32 px margin around it. The margin AND the cut-away corner triangles are flat solid magenta #FF00FF, with no gradient, shadow, glow or halo. Never use magenta, pink or purple inside the tile.
- Frame: neutral brushed steel, pure grey, NO colour cast (no blue, no brown, no warm tint). Four small rivets, one in each corner.
- Rim: a thin glowing line running just inside the steel frame, in ONE pure saturated orange (about #FF7A00) with a soft glow falling off in the same orange. Do not blow it out to white or yellow. This is the ONLY warm colour in the whole tile: no yellow, red, brown, gold or orange anywhere else.
- Screen: dark blue-black background with a faint cyan grid, thin circular HUD arcs, small abstract readout blocks made of bars and dots (absolutely no letters or numbers), all in cool cyan/blue only.
- Under the centre: a glowing elliptical cyan pool of light with a thin ring, sitting at about 72% of the tile height. Nothing above it: the middle of the screen is empty so a hologram can be placed there later.
- Bottom strip: a plain dark band with nothing on it (a label is added later). Top-left: a small empty rectangular HUD box (a number is added later).
- Everything symmetric and tidy. Flat lighting, no strong shadows crossing the frame.

=== MODE B: "SHEET NN" (object sheet) ===
Make ONE image, exactly 1728 x 2304 px (3:4), pure black #000000 background, containing holographic objects in a strict grid.
- Grid: 6 columns x 8 rows of 288 x 288 px cells, no gaps, no lines, no border, no labels. Total 48 cells.
- The sheet holds TWO generators, one "block" each. A block is 6 columns x 4 rows (24 cells), and the two blocks are stacked top to bottom: block 1 = rows 1-4, block 2 = rows 5-8. Look up the subjects for the requested sheet in the manifest.
- Each block is ONE object shown as 24 animation frames of a smooth continuous turntable rotation, read left to right then top row to bottom row: f0-f5 on the block's first row, f6-f11 on the second, f12-f17 on the third, f18-f23 on the fourth.
- The object is a dense cyan/teal holographic wireframe: fine mesh lines, brighter edges, soft inner glow, semi-transparent, glowing slightly beyond its outline into black. Pure cyan only (about #2FE6FF); no other hues. No background, no grid, no frame, no ground pool, no scan lines, no particles, no text.
- Camera: three-quarter front view, slightly from above, same lens and same distance for every frame and every object.
- Size and position: the object is centred at the exact centre of its cell. Its largest dimension (height or width) is 245-252 px, so it fills about 85-88% of the cell. Keep at least 18 px of pure black on every side; glow must fade to pure black before the cell edge. Nothing crosses into a neighbouring cell.
- Rotation: the object turns on a vertical axis through the cell centre. f0 is the rest view. Each following frame turns the object a further 15 degrees at constant speed, CLOCKWISE seen from above (the front of the object moves from the viewer's right to the viewer's left): f0 = 0, f1 = 15, f2 = 30 ... f12 = 180 ... f23 = 345 degrees. The next step after f23 would be 360 = f0, so the loop is seamless. Do not skip or repeat angles; the spacing must be even so the motion looks perfectly smooth. Flat objects (cards, snowflakes, leaves, plaques) turn on the same vertical axis and show their edge or back mid-turn.
- The object must be the identical design, size, line density, brightness and colour in all 24 frames; only its turn angle changes. Keep both blocks' brightness and line weight consistent with each other.

HOW TO RESPOND
1. "BASE TILE": make the base tile. Nothing else.
2. "SHEET NN": look up sheet NN in the manifest and draw the two subjects in block order.
3. "redo block N of sheet NN": regenerate the sheet keeping the other block unchanged as far as possible, changing only block N.
4. After the image add one line: size OK/not OK; background pure black/magenta yes/no; 24 frames per block yes/no; no text in image yes/no.
Never reorder blocks, never merge generators, never add decoration.
````

## 2. Manifest (paste into the Gem as knowledge, or append to the chat)

2 generators per sheet, in slot order. `id` is the thumbnail basename from `js/programs.js`, which the site uses to find the block. The subject is a drawing hint only; the on-site label comes from the generator title.

Sheets are named `sheet-01` … `sheet-21`.

### Sheet 01

| Block | Cell rows | Slot | id | Subject |
|---|---|---|---|---|
| 1 | 1–4 | 01 | ghost-builder | a rounded ghost with a wavy hem, two stubby arms and a friendly face |
| 2 | 5–8 | 02 | pumpkin-plotter | a ribbed pumpkin with a curly stem and a carved face |

### Sheet 02

| Block | Cell rows | Slot | id | Subject |
|---|---|---|---|---|
| 1 | 1–4 | 03 | spider | a spider with a round abdomen, eight bent legs and a cluster of eyes |
| 2 | 5–8 | 04 | snowman | a three-ball snowman with a top hat, scarf and carrot nose |

### Sheet 03

| Block | Cell rows | Slot | id | Subject |
|---|---|---|---|---|
| 1 | 1–4 | 05 | witch-hat | a tall bent witch hat with a wide curled brim and a hat band |
| 2 | 5–8 | 06 | snowflake | a six-armed flat snowflake ornament with branches and a hanging loop |

### Sheet 04

| Block | Cell rows | Slot | id | Subject |
|---|---|---|---|---|
| 1 | 1–4 | 07 | skull-sculptor | a skull with eye sockets, nose cavity and teeth |
| 2 | 5–8 | 08 | holiday-tree | a tiered Christmas tree with baubles and a star topper |

### Sheet 05

| Block | Cell rows | Slot | id | Subject |
|---|---|---|---|---|
| 1 | 1–4 | 09 | gift-box | a gift box with a lid and a ribbon bow |
| 2 | 5–8 | 10 | key-clicker | a row of mechanical keyboard keycaps |

### Sheet 06

| Block | Cell rows | Slot | id | Subject |
|---|---|---|---|---|
| 1 | 1–4 | 11 | name-keychain | a rounded name plate with raised letters and a key ring |
| 2 | 5–8 | 12 | image-clicker | a flat print-in-place fidget clicker slab with an embossed picture |

### Sheet 07

| Block | Cell rows | Slot | id | Subject |
|---|---|---|---|---|
| 1 | 1–4 | 13 | ornament-stacker | a stacked ornament-style snowman with a hanging loop |
| 2 | 5–8 | 15 | pottery-wheel | a vase being shaped on a pottery wheel |

### Sheet 08

| Block | Cell rows | Slot | id | Subject |
|---|---|---|---|---|
| 1 | 1–4 | 16 | gift-box-2 | a gift box with a hinged lid and a bow, a second design from slot 9 |
| 2 | 5–8 | 17 | turkey-builder | a turkey with a fan of tail feathers |

### Sheet 09

| Block | Cell rows | Slot | id | Subject |
|---|---|---|---|---|
| 1 | 1–4 | 18 | cornucopia | a horn-of-plenty basket spilling fruit and gourds |
| 2 | 5–8 | 19 | leaf-press | a flat leaf ornament with raised veins |

### Sheet 10

| Block | Cell rows | Slot | id | Subject |
|---|---|---|---|---|
| 1 | 1–4 | 20 | pumpkin-pie-slice | a slice of pumpkin pie with a crust edge |
| 2 | 5–8 | 21 | acorn-pinecone-set | an acorn and a pinecone side by side |

### Sheet 11

| Block | Cell rows | Slot | id | Subject |
|---|---|---|---|---|
| 1 | 1–4 | 22 | scarecrow-stacker | a stacked scarecrow with a straw hat and patched body |
| 2 | 5–8 | 23 | gratitude-place-cards | a standing folded place card with a leaf motif |

### Sheet 12

| Block | Cell rows | Slot | id | Subject |
|---|---|---|---|---|
| 1 | 1–4 | 24 | countdown-clock | a clock face with chunky numerals as a cake topper |
| 2 | 5–8 | 25 | confetti-cannon | a party-popper cone bursting confetti |

### Sheet 13

| Block | Cell rows | Slot | id | Subject |
|---|---|---|---|---|
| 1 | 1–4 | 26 | party-hat | a striped party hat on a spinning base |
| 2 | 5–8 | 27 | party-whistle | a curly party blower whistle |

### Sheet 14

| Block | Cell rows | Slot | id | Subject |
|---|---|---|---|---|
| 1 | 1–4 | 28 | conversation-hearts | a pile of heart-shaped candies with short embossed words |
| 2 | 5–8 | 29 | valentines-card | a folded card with a heart cut-out |

### Sheet 15

| Block | Cell rows | Slot | id | Subject |
|---|---|---|---|---|
| 1 | 1–4 | 30 | egg-decorator | a decorated egg on a stand with patterned bands |
| 2 | 5–8 | 31 | bunny-builder | a bunny with long ears and a round tail |

### Sheet 16

| Block | Cell rows | Slot | id | Subject |
|---|---|---|---|---|
| 1 | 1–4 | 32 | chick-hatcher | a chick emerging from a cracked egg |
| 2 | 5–8 | 33 | flower-pot | a planter pot with a flower growing out |

### Sheet 17

| Block | Cell rows | Slot | id | Subject |
|---|---|---|---|---|
| 1 | 1–4 | 34 | butterfly-wings | a butterfly with patterned open wings |
| 2 | 5–8 | 35 | egg-basket | a woven basket with a handle holding eggs |

### Sheet 18

| Block | Cell rows | Slot | id | Subject |
|---|---|---|---|---|
| 1 | 1–4 | 36 | cake-stacker | a tiered cake with frosting drips and a cherry |
| 2 | 5–8 | 37 | candle-number | a numeral-shaped candle topper with a flame |

### Sheet 19

| Block | Cell rows | Slot | id | Subject |
|---|---|---|---|---|
| 1 | 1–4 | 38 | pinata | a donkey-shaped pinata with a pull string |
| 2 | 5–8 | 39 | balloon-twister | a twisted balloon dog |

### Sheet 20

| Block | Cell rows | Slot | id | Subject |
|---|---|---|---|---|
| 1 | 1–4 | 40 | banner-letters | a row of bunting flags with letters |
| 2 | 5–8 | 41 | party-popper | a party popper spinner fidget |

### Sheet 21

| Block | Cell rows | Slot | id | Subject |
|---|---|---|---|---|
| 1 | 1–4 | 42 | cupcake-maker | a cupcake with swirled frosting and a cherry |
| 2 | 5–8 | 43 | birthday-crown | a spiked birthday crown with gems |


## 3. How to run it

1. Create a Gemini Gem. Paste section 1 as the instructions. Add section 2 as knowledge, or paste it into the first chat message.
2. **Base tile first.** Attach `assets/thumbnails/pro/ghost-builder.png` as a style reference and send "BASE TILE". Regenerate until the checklist below passes. This one image is used for all 42 tiles, so it is worth a few attempts. Save as `base-tile.png`.
3. **Object sheets.** Attach 1 or 2 of the v1 hologram sheets as a style reference, and for sheets after the first also attach the first accepted sheet so line weight and brightness stay consistent. Send "SHEET 01", then "SHEET 02", and so on through 21. Save as `sheet-01.png` …
4. If a block is off, "redo block 2 of sheet 05" and attach the sheet.
5. Gemini will not hit exact pixels every time. Send me the files; the build script resizes each sheet to exactly 1728 × 2304, converts brightness to transparency and checks each block.

### Base tile checklist

- [ ] 1024 × 1024, tile 960 × 960 centred, flat magenta margin and chamfered corners with no halo.
- [ ] Zero text, letters or numbers anywhere. No object in the middle.
- [ ] Steel frame is neutral grey with no colour cast.
- [ ] The rim is one saturated orange and is the only warm colour in the image (check the grid, arcs and pool are all cool).
- [ ] Glow pool at about 72% of the tile height, middle of the screen clear.
- [ ] Empty dark label band at the bottom; empty small box at top-left.
- [ ] Symmetric left and right, rivets evenly placed.

### Object sheet checklist (per sheet)

- [ ] 1728 × 2304 (or 3:4 and resized), 6 × 8 grid, pure black everywhere outside the objects.
- [ ] Two blocks of 6 × 4 cells, in manifest order, one generator each, no cell showing a different object.
- [ ] Each object is centred in its cell, largest dimension 245–252 px, 18 px of black all round, glow does not touch the cell edge.
- [ ] Same size, centre, line density and brightness in all 24 frames of a block.
- [ ] Frames turn in even 15° steps, clockwise from above, no skipped or repeated angles; f23 flows back into f0 with no jump. Flip through the frames: it should look like a smooth turntable, not a wobble.
- [ ] Pure cyan only; no background, pool, grid, scan line, particles or text.
- [ ] The look matches the other blocks and sheets.

## 4. Homepage handoff (not built yet)

Replaces the v1 format. Files:

```
assets/thumbnails/sprites/base-tile.webp      keyed (magenta removed), 1024x1024, recolourable rim
assets/thumbnails/sprites/obj-sheet-01.webp   brightness converted to alpha, 1728x2304
...
assets/thumbnails/sprites/obj-sheet-21.webp
assets/thumbnails/sprites/manifest.json
```

```json
{
  "version": 2,
  "base": "base-tile.webp",
  "cell": 288,
  "frames": 24,
  "cols": 6,
  "rowsPerBlock": 4,
  "fps": 24,
  "restScale": 0.56,
  "displayScale": 0.6,
  "sheets": [{ "file": "obj-sheet-01.webp", "width": 1728, "height": 2304 }],
  "tiles": {
    "ghost-builder": { "slot": 1, "sheet": 0, "block": 0 },
    "pumpkin-plotter": { "slot": 2, "sheet": 0, "block": 1, "hue": 28 }
  }
}
```

`block` is the zero-based block on that sheet. Frame `f` of a block is at x = `(f % 6) × 288`, y = `(block × 4 + floor(f / 6)) × 288`. `displayScale` is CSS pixels per source pixel for the fully popped object (0.6 makes a 250 px object about 150 CSS px, a little larger than the 128 px tile). Optional per-tile `hue` recolours the hologram in the build step, like the current `scripts/sprite-tints.json`.

Playback and drawing rules the site needs:

- Each tile is the base tile (steel frame, rim, HUD, pool), the label and slot number as text, and an object layer drawn **on top and allowed to overflow the tile** (tile card must not clip; hovered tile gets a higher z-index, as now).
- Rest state: frame f0 shown at `restScale` × `displayScale` CSS px per source px (about 65% of the tile height as before), centred on the tile.
- Hover or focus: animate the object layer from `restScale` to 1.0 and lift it about 6% of the tile height over about 220 ms with an ease-out (a small overshoot feels like a pop), then loop frames f0 → f23 at `fps` (a full smooth turn once a second; if that feels too fast lower `fps`). Add a soft glow that grows with the scale.
- Hover end: stop the rotation, return to f0 and shrink back to `restScale`.
- Rim recolour per section: hue-shift only warm pixels of the base tile (orange rim), by section/bundle. Hologram recolour: per-tile `hue`, as now.
- Honour `prefers-reduced-motion`: no pop, no rotation.
- Lazy-load a sheet on the first hover of one of its tiles. About 21 sheets at 0.7–1.5 MB each.
