# Stamp Maker (slot 115)

`programs/stamp-maker.html`, bundle `personal`. A hand stamp: raised, **mirrored** text and an icon on a plate, with a tapered grip underneath. The Design tab opens first (`tabsFirst`). `sculpt: false`.

## Print orientation (why it has no supports)

The model is built as it prints: the grip's flat small end is on the bed, the grip widens up to the plate at no more than 45 degrees from vertical, the plate sits on top and the raised design points up. Flip it over to stamp. Nothing hangs in mid-air, so there are no supports and nothing to assemble.

The grip widens along a gentle curve (about 1.2 times 45 degrees at its steepest). `buildBody` raises the grip height automatically when the plate is wide or the grip base is small, so the 45 degree rule always holds; the "Grip height" slider is a minimum. Handle "None (flat plate)" prints the plate on the bed with no grip.

## Design

- **Layouts:** icon above text, icon beside text, text only, icon only, and a round seal (line 1 of the text runs over the top, line 2 under the icon, auto-sizing the ring to fit the text; the plate is forced round).
- **Fonts:** the ten fonts of the Text Generator (`programs/shared/fonts-text.js`, shared with it; regenerate with `tools/text-fonts/build.mjs`, see [text-generator.md](text-generator.md)).
- **Icons:** 18 hand-drawn outlines in `ICONS` (heart, star, paw, flower, smiley, moon, sun, house, crown, music note, fish, cat, bolt, key, tree, gear, check mark, butterfly). Each icon is a list of pieces `[outer, holes...]` in a unit box; pieces may overlap (slicers union them). To add one, add an entry to `ICONS`; the picker and chip pictures are built from it.
- **Mirroring:** on by default, so the imprint reads correctly on paper. "Reads normally" is a preview-only option.
- **Plate:** rounded rectangle, square, circle, oval, pill, hexagon, scallop badge, heart, with an optional border line. The design sits 1.6 mm proud by default.
- Glyph code (outlines, triangulation, offsets) is the Text Generator's. Joined script letters get a 0.013 mm alternate offset so touching glyphs never share an exact edge (keeps the mesh manifold).

Hologram tile (`holo-stamp-maker.webp`, poster, manifest) and the side-panel render (`panel/stamp-maker.webp`, config in `scripts/panel-thumbs-config.json`) are made.

Parts for the Color tool: Stamp body, Border line, Icon, Lettering (two-colour stamps print the icon and lettering in another filament).

## Checks

`check-mesh.mjs programs/stamp-maker.html --all` passes (watertight, "no supports needed") for the defaults and all three presets. The page exposes `testState` for sweeps: 1,600 combinations of layout, font, plate shape, grip and border, all 18 icons, and every slider at its minimum and maximum across layouts, shapes and grip settings had no open or non-manifold edges and no print-check errors.

## Known open items

**Unprinted.** Unproven until a real print: the first-layer grip on a small base (use a brim for tall, wide stamps), relief detail under 1 mm strokes, and how well the imprint transfers. Text under about 5 mm tall or strokes under 0.9 mm warn on the Design tab.
