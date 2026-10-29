# Hologram hover tiles

The homepage shows each generator as a tile (shared base tile, label and slot number as text) with a
hologram of the generator's real 3D model that pops out and spins on hover. The holograms are rendered from the
generators themselves, so a new or changed generator only needs a re-render.

Memory aid for new generators: every new generator needs a hologram (poster + atlas + manifest entry), or its tile falls back to the SVG thumbnail. Gemini sheets are no longer used ([sprite-sheet-skill.md](sprite-sheet-skill.md)). Some tiles are still weak (thin, flat or low-contrast models); retune with `scripts/hologram-config.json` and re-render that one generator.

## Re-render everything (or one generator)

```
git pull origin main
# render in a real browser; the page needs WebGL
node scripts/dev-server.mjs --port 5185 &
node scripts/receive-render.mjs --out /tmp/holo &
# open in a browser (it renders and uploads each atlas):
#   http://localhost:5185/tools/hologram.html?gen=all&save=1          all generators in js/programs.js
#   http://localhost:5185/tools/hologram.html?gen=spider&save=1       one generator (thumbnail id)
#   add &port=5232 (and run receive-render.mjs --port 5232) if :5190 is already taken
python3 scripts/build-holo.py /tmp/holo
```

`build-holo.py` writes `assets/thumbnails/sprites/holo-<id>.webp` plus a 192 px still of frame 0, `poster-<id>.webp`
(~10 KB), and updates `manifest-v2.json`. Commit all three. `python3 scripts/build-holo.py --posters` backfills posters
for atlases already in the manifest.

## Loading

The homepage shows each tile's poster first and only fetches the ~300 KB atlas when the tile is hovered, focused or
tapped, or, while the browser is idle, for tiles on screen (one at a time; skipped under Data Saver / 2g). A tile whose
manifest entry has no `poster` loads its atlas immediately, as before. Tiles with a hologram don't fetch their SVG
thumbnail at all.

- `<id>` is the basename of the generator's `thumbnailUrl` (for example `ghost-builder`).
- The upload port is fixed at 5190 in `tools/hologram.html`. If another session holds it, stop that receiver first (or render one at a time); `receive-render.mjs --port` only changes the receiver side.
- `build-holo.py` needs Python 3 with Pillow.
- Each atlas is 6 x 4 cells of 288 px: 24 frames, 15° apart, a full clockwise turn with no mirroring. The homepage plays it at 20 fps while the tile is hovered or focused.

## Tuning

- `scripts/hologram-config.json`, keyed by thumbnail id: `hue` (degrees, 185 = cyan, 28 = orange), `stand` (force a flat
  model upright, default auto), `yaw0` (start angle), `fill` (how much of the cell the model fills, default 0.8),
  `skipRender` (leave a tile alone), `sat`/`light` (colour saturation/lightness; `sat: 0` = white),
  `dark: true` (black model: part-transparent near-black body with scanlines, light rim and edge glow; `darka` URL param sets body opacity, default 0.62). Every tile has a thematic `hue`/`sat`/`light`.
- Look parameters on the render URL: `wire`, `edge`, `body`, `glow`, `angle`, `frames`, `ss` (see `tools/hologram.html`).
- Every tile currently uses the one shared `base-tile.webp` (`rims` in the manifest is empty). Per-section rim colours
  would come from `scripts/sprite-tints.json` `_rims`, built by the older `scripts/build-hover-sheets.py`.

The older Gemini-drawn frames ([sprite-sheet-skill.md](sprite-sheet-skill.md), now retired) are kept under `gemini` in the manifest for the first generators; add `?gemini` to the homepage URL to see them.
Flat models (snowflake, plaques, cards) are stood upright automatically so the spin shows their face.
