# Hologram hover tiles

The homepage shows each generator as a tile (shared base tile, label and slot number as text) with a
hologram of the generator's real 3D model that pops out and spins on hover. The holograms are rendered from the
generators themselves, so a new or changed generator only needs a re-render.

## Re-render everything (or one generator)

```
git pull origin main
node scripts/dev-server.mjs --port 5185 &
node scripts/receive-render.mjs --out /tmp/holo &
# open in a browser (it renders and uploads each atlas):
#   http://localhost:5185/tools/hologram.html?gen=all&save=1          all generators in js/programs.js
#   http://localhost:5185/tools/hologram.html?gen=spider&save=1       one generator (thumbnail id)
python3 scripts/build-holo.py /tmp/holo
```

`build-holo.py` writes `assets/thumbnails/sprites/holo-<id>.webp` and updates `manifest-v2.json`. Commit both.

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
