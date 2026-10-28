# Tile sprite sheet skill (for Gemini)

Goal: have Gemini produce sprite sheets that hold every generator's tile icon plus a short hover animation, in the style of the current pro tiles (`assets/thumbnails/pro/`). The homepage's experimental view will slice the sheets and play the frames on hover.

This doc has four parts: the **Gem instructions** (paste into a Gemini Gem), the **manifest** (paste or upload into the Gem as knowledge), the **how to run it** workflow, and the **homepage handoff** (what the site needs back). Source of truth for the list is `js/programs.js` on `origin/main`, which currently has **42 generators** (slots 1–43; slot 14 is unused). Re-generate the manifest table when slots are added.

## Decisions baked into the spec

| Item | Value | Why |
|---|---|---|
| Cell | 256 × 256 px | The experimental view draws tiles at 128 CSS px, so 256 is a crisp 2× for retina. |
| Tile art inside the cell | 240 × 240 px, centred, 8 px key-colour margin on every side | Margin doubles as a gutter, so slicing errors of a few px never touch artwork. |
| Frames per generator | 6, laid out left to right in one row | Smooth enough at about 8 fps, small enough for the model to keep consistent. |
| Rows per sheet | 4 generators per sheet | Gives 1536 × 1024 (3:2), a size Gemini can render. One giant sheet of all 42 will not work. |
| Sheets | 11 sheets, in slot order | Last sheet is short and is padded with blank key-colour rows. |
| Key colour | Flat magenta `#FF00FF` | Gemini does not reliably output transparent PNGs. Magenta is removed in post, which also gives the chamfered frame corners real transparency. |
| Hover loop | f0 is the rest pose and the static icon | Sheet frame 0 is also exported as the still `pro/<id>.png`, so the current fallback keeps working. |

### Frame order (identical for every generator)

| Frame | Object yaw | Scan line (a thin cyan horizontal sweep over the object) | Glow pool under object |
|---|---|---|---|
| f0 | 0° (rest, the static icon) | none | normal |
| f1 | +10° | 15% down the object | +10% brighter |
| f2 | +20° | 35% | +20% |
| f3 | +10° | 55% | +10% |
| f4 | 0° | 75% | normal |
| f5 | −10° | 95% | −5% |

Playback loops f0 → f5 → f0. Only the **object, the scan line and the glow pool** may change between frames. Everything else (frame, rivets, orange rim, HUD grid and readouts, label, slot number) must be pixel-identical in all six cells of a row.

---

## 1. Gem instructions (paste into the Gem)

````text
You make sprite sheets of tile icons for a website called MakerMakers (parametric 3D-print model generators). Output is ONE image per request. Follow this spec exactly. Never add text or commentary inside the image beyond the specified label and slot number.

STYLE (match the attached reference tiles)
Each tile is a square brushed-metal frame with chamfered corners, small rivets in the four corners, and a glowing orange rim on the inner edge. Inside is a dark blue-black HUD background with a faint cyan grid, thin circular HUD arcs and tiny unreadable readouts. In the centre is ONE holographic wireframe object in cyan/teal: a dense mesh of fine lines with slightly brighter edges and a soft inner glow, rendered semi-transparent so the grid shows through. Under the object is a glowing elliptical pool of cyan light with a thin ring. A mono-spaced label sits centred in the bottom strip of the tile, light grey with a dark outline, on a dark band. A small slot number sits in the top-left HUD area in the same mono font, cyan. Same lighting, same line weight and same camera for every object: three-quarter front view, slightly from above, object centred and filling about 60-70% of the tile height.

SHEET GEOMETRY (strict)
- Canvas exactly 1536 x 1024 px. If you cannot output that size, output the closest 3:2 image and say so in one line after it.
- Grid: 6 columns x 4 rows of 256 x 256 px cells. No gaps between cells, no extra border around the canvas.
- Each row is ONE generator. Each cell in a row is one animation frame, left to right f0..f5.
- Inside each cell the tile is a 240 x 240 px square centred in the cell, leaving an 8 px margin on every side.
- Keep all important art (object, label, slot number) inside a 208 x 208 px safe area centred in the tile (16 px in from the tile edge). Nothing glows or bleeds outside the tile.
- Everything outside the tiles (the 8 px margins and the chamfered corner cut-outs) is flat solid magenta #FF00FF, no gradient, no shadow, no glow, no anti-alias halo. Never use magenta, pink or purple anywhere in the tiles.
- If a request has fewer than 4 generators, fill the unused rows with flat magenta #FF00FF.

FRAME ORDER (same for every row)
f0: object at rest, yaw 0 degrees, no scan line, normal glow. This is the static icon.
f1: yaw +10 degrees, a thin bright cyan horizontal scan line crossing the object 15% from its top, glow pool 10% brighter.
f2: yaw +20, scan line 35%, glow +20%.
f3: yaw +10, scan line 55%, glow +10%.
f4: yaw 0, scan line 75%, glow normal.
f5: yaw -10, scan line 95%, glow 5% dimmer.
Only the object's rotation, the scan line and the glow pool change between frames. The frame, rivets, orange rim, background grid, HUD arcs, readouts, label and slot number must be IDENTICAL in all 6 cells of a row. The object must keep the same size, same centre and same design in every frame; only its yaw changes.

LABEL AND SLOT
Use exactly the label text and slot number given in the manifest for each row, spelled exactly, in the same mono font and size in every cell. Slot number format is two digits, e.g. 07.

HOW TO RESPOND
1. When the user gives a sheet number (for example "sheet 03"), look it up in the manifest, and generate that sheet. Draw each row's subject as a holographic wireframe object described in the Subject column. Keep style identical across all rows.
2. When the user attaches reference tiles, copy their frame, colours, font and HUD style exactly.
3. When the user says "redo row N of sheet XX", regenerate the whole sheet keeping the other rows unchanged as far as possible and only changing row N.
4. After the image, add a one-line checklist: size OK/not OK, magenta key clean yes/no, label spelling matches yes/no.
Never merge generators in one row. Never change the order of rows. Never add a title or caption inside the image.
````

## 2. Manifest (paste into the Gem as knowledge, or append to the chat)

Rows are in slot order, 4 generators per sheet. The Label is the exact on-tile text (shortened from the site title to stay under about 18 characters so it fits the mono label at 256 px). `id` is the thumbnail basename from `js/programs.js`; the homepage uses it to find the sheet row.

Sheets are named `sheet-01` … `sheet-{{CHUNKS}}`.

### Sheet 01 (rows 0–3)

| Row | Slot | Label (exact text) | id | Subject |
|---|---|---|---|---|
| 0 | 01 | Ghost Builder | ghost-builder | a rounded ghost with a wavy hem, two stubby arms and a friendly face |
| 1 | 02 | Pumpkin Plotter | pumpkin-plotter | a ribbed pumpkin with a curly stem and a carved face |
| 2 | 03 | Spider | spider | a spider with a round abdomen, eight bent legs and a cluster of eyes |
| 3 | 04 | Snowman Stacker | snowman | a three-ball snowman with a top hat, scarf and carrot nose |

### Sheet 02 (rows 0–3)

| Row | Slot | Label (exact text) | id | Subject |
|---|---|---|---|---|
| 0 | 05 | Witch Hat | witch-hat | a tall bent witch hat with a wide curled brim and a hat band |
| 1 | 06 | Snowflake Studio | snowflake | a six-armed flat snowflake ornament with branches and a hanging loop |
| 2 | 07 | Skull Sculptor | skull-sculptor | a skull with eye sockets, nose cavity and teeth |
| 3 | 08 | Holiday Tree | holiday-tree | a tiered Christmas tree with baubles and a star topper |

### Sheet 03 (rows 0–3)

| Row | Slot | Label (exact text) | id | Subject |
|---|---|---|---|---|
| 0 | 09 | Holiday Gift Box | gift-box | a gift box with a lid and a ribbon bow |
| 1 | 10 | Key Clicker | key-clicker | a row of mechanical keyboard keycaps |
| 2 | 11 | Name Keychain | name-keychain | a rounded name plate with raised letters and a key ring |
| 3 | 12 | Image Clicker | image-clicker | a flat print-in-place fidget clicker slab with an embossed picture |

### Sheet 04 (rows 0–3)

| Row | Slot | Label (exact text) | id | Subject |
|---|---|---|---|---|
| 0 | 13 | Snowman 2.0 | ornament-stacker | a stacked ornament-style snowman with a hanging loop |
| 1 | 15 | Pottery Wheel | pottery-wheel | a vase being shaped on a pottery wheel |
| 2 | 16 | Gift Box 2.0 | gift-box-2 | a gift box with a hinged lid and a bow, a second design from slot 9 |
| 3 | 17 | Turkey Builder | turkey-builder | a turkey with a fan of tail feathers |

### Sheet 05 (rows 0–3)

| Row | Slot | Label (exact text) | id | Subject |
|---|---|---|---|---|
| 0 | 18 | Cornucopia | cornucopia | a horn-of-plenty basket spilling fruit and gourds |
| 1 | 19 | Leaf Press | leaf-press | a flat leaf ornament with raised veins |
| 2 | 20 | Pumpkin Pie Slice | pumpkin-pie-slice | a slice of pumpkin pie with a crust edge |
| 3 | 21 | Acorn & Pinecone | acorn-pinecone-set | an acorn and a pinecone side by side |

### Sheet 06 (rows 0–3)

| Row | Slot | Label (exact text) | id | Subject |
|---|---|---|---|---|
| 0 | 22 | Scarecrow Stacker | scarecrow-stacker | a stacked scarecrow with a straw hat and patched body |
| 1 | 23 | Gratitude Cards | gratitude-place-cards | a standing folded place card with a leaf motif |
| 2 | 24 | Countdown Clock | countdown-clock | a clock face with chunky numerals as a cake topper |
| 3 | 25 | Confetti Cannon | confetti-cannon | a party-popper cone bursting confetti |

### Sheet 07 (rows 0–3)

| Row | Slot | Label (exact text) | id | Subject |
|---|---|---|---|---|
| 0 | 26 | Party Hat Spinner | party-hat | a striped party hat on a spinning base |
| 1 | 27 | Party Whistle | party-whistle | a curly party blower whistle |
| 2 | 28 | Conversation Hearts | conversation-hearts | a pile of heart-shaped candies with short embossed words |
| 3 | 29 | Valentine Card | valentines-card | a folded card with a heart cut-out |

### Sheet 08 (rows 0–3)

| Row | Slot | Label (exact text) | id | Subject |
|---|---|---|---|---|
| 0 | 30 | Egg Decorator | egg-decorator | a decorated egg on a stand with patterned bands |
| 1 | 31 | Bunny Builder | bunny-builder | a bunny with long ears and a round tail |
| 2 | 32 | Chick Hatcher | chick-hatcher | a chick emerging from a cracked egg |
| 3 | 33 | Flower Pot | flower-pot | a planter pot with a flower growing out |

### Sheet 09 (rows 0–3)

| Row | Slot | Label (exact text) | id | Subject |
|---|---|---|---|---|
| 0 | 34 | Butterfly Wings | butterfly-wings | a butterfly with patterned open wings |
| 1 | 35 | Egg Hunt Basket | egg-basket | a woven basket with a handle holding eggs |
| 2 | 36 | Cake Stacker | cake-stacker | a tiered cake with frosting drips and a cherry |
| 3 | 37 | Candle Number | candle-number | a numeral-shaped candle topper with a flame |

### Sheet 10 (rows 0–3)

| Row | Slot | Label (exact text) | id | Subject |
|---|---|---|---|---|
| 0 | 38 | Pull-String Pinata | pinata | a donkey-shaped pinata with a pull string |
| 1 | 39 | Balloon Twister | balloon-twister | a twisted balloon dog |
| 2 | 40 | Banner Letters | banner-letters | a row of bunting flags with letters |
| 3 | 41 | Party Popper | party-popper | a party popper spinner fidget |

### Sheet 11 (rows 0–1)

| Row | Slot | Label (exact text) | id | Subject |
|---|---|---|---|---|
| 0 | 42 | Cupcake Maker | cupcake-maker | a cupcake with swirled frosting and a cherry |
| 1 | 43 | Birthday Crown | birthday-crown | a spiked birthday crown with gems |


## 3. How to run it

1. Create a Gemini Gem. Paste section 1 as the instructions. Add section 2 as knowledge (or paste it into the first chat message).
2. Attach 1–2 of the existing pro tiles (for example `assets/thumbnails/pro/ghost-builder.png` and `skull-sculptor.png`) to **every** request. They anchor the style.
3. Ask for one sheet at a time: "Sheet 01". Download the PNG and save it as `sheet-01.png`.
4. Check the consistency list below. If one row is off, ask "redo row 2 of sheet 01" and attach the previous result. If the grid is off, ask again with "canvas exactly 1536 x 1024, 6 x 4 grid of 256 px cells".
5. Gemini will not hit exact pixels every time. Before slicing, resize each sheet to exactly 1536 × 1024 (nearest edge is fine; a few px of drift lands inside the 8 px margins). Then key out `#FF00FF` (tolerance about 10%) to transparent and save as PNG or WebP.
6. Send the finished sheets back; I'll add them under `assets/thumbnails/sprites/` with the manifest JSON in section 4.

### Consistency checklist (per sheet)

- [ ] Image is 1536 × 1024 (or 3:2 and resized), 6 × 4 grid, no gaps, no outer border.
- [ ] Each row is exactly one generator, rows in manifest order, unused rows pure magenta.
- [ ] Magenta key is flat and clean: nothing magenta/pink in the art, no coloured halo on the chamfered corners, no glow outside the frame.
- [ ] Tile is centred in its cell with an even 8 px margin; no cell is shifted or scaled relative to its neighbours.
- [ ] Frame, rivets, orange rim, grid, HUD and readouts are identical across the 6 frames of a row.
- [ ] Label text and slot number match the manifest exactly (spelling, case, two-digit slot), same font and size in every cell and on every row.
- [ ] Label and slot number sit inside the safe area and are not covered by the object.
- [ ] Object has the same size, centre and design in all 6 frames; only yaw, scan line and glow pool change.
- [ ] f0 has no scan line; f1→f5 scan line moves strictly top to bottom.
- [ ] Style matches the reference pro tiles (cyan wireframe, orange rim, same line weight) and matches the other rows and sheets.
- [ ] Looping f0→f5→f0 looks smooth (no jump in size or position).

## 4. Homepage handoff (what the experimental view needs)

Not built yet. This is the contract so playback is a small change in `js/worldmap.js` (which already loads `assets/thumbnails/pro/<id>.png` with `proThumbUrl`, and falls back to the SVG when missing).

### Files

```
assets/thumbnails/sprites/manifest.json
assets/thumbnails/sprites/sheet-01.png   (keyed PNG or WebP, 1536 x 1024)
...
assets/thumbnails/sprites/sheet-{{CHUNKS}}.png
assets/thumbnails/pro/<id>.png           (frame 0, 240 x 240, existing still; keep for fallback)
```

### manifest.json

```json
{
  "version": 1,
  "cell": 256,
  "inset": 8,
  "tile": 240,
  "frames": 6,
  "fps": 8,
  "sheets": [
    { "file": "sheet-01.png", "width": 1536, "height": 1024 }
  ],
  "tiles": {
    "ghost-builder": { "slot": 1, "label": "Ghost Builder", "sheet": 0, "row": 0 },
    "pumpkin-plotter": { "slot": 2, "label": "Pumpkin Plotter", "sheet": 0, "row": 1 }
  }
}
```

`tiles` is keyed by the `id` column above (the thumbnail basename), so it matches `proThumbUrl`. `sheet` is a zero-based index into `sheets`; `row` is the zero-based row in that sheet. Frame `f` of a tile sits at source x = `f * cell + inset`, y = `row * cell + inset`, size `tile × tile`. Optional per-tile overrides (`frames`, `fps`) let one tile deviate. A tile missing from `tiles` just keeps its still.

### Playback requirements

- On `mouseenter` / `focus` of a tile (experimental view only), load the tile's sheet if not already loaded (lazy, one request per sheet, cached), then step frames at `fps` using CSS `background-position` (or a canvas). On `mouseleave` / `blur`, stop and return to f0. Honour `prefers-reduced-motion` (no playback).
- Tile CSS size is 128 px and the visible art is 240 source px, so scale = 128 / 240. Set `background-size: (sheetWidth × scale) × (sheetHeight × scale)` and `background-position: -(f × 256 + 8) × scale px, -(row × 256 + 8) × scale px`.
- Keep the current `.has-pro` flow: show the still first, swap to the sprite on hover. Tiles without a sprite entry behave as today.
- The label is baked into the artwork, so `.tile.has-pro .tile-label` stays hidden as now.
- Size budget: 11 sheets at roughly 1–2 MB each; only fetch on first hover. Prefer WebP with alpha if file size matters.
