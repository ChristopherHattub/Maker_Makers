# Hologram hover tiles

The experimental homepage view shows each generator as a tile (shared base tile, label and slot number as text) with a
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

## Tuning

- `scripts/hologram-config.json`, keyed by thumbnail id: `hue` (degrees, 185 = cyan, 28 = orange), `stand` (force a flat
  model upright, default auto), `yaw0` (start angle), `fill` (how much of the cell the model fills, default 0.8),
  `skipRender` (leave a tile alone).
- Look parameters on the render URL: `wire`, `edge`, `body`, `glow`, `angle`, `frames`, `ss` (see `tools/hologram.html`).
- Rim colour per section: `scripts/sprite-tints.json` `_rims` (used by `scripts/build-hover-sheets.py`, which still builds
  the base tile from `base_tile.jpg`).

The older Gemini-drawn frames are kept under `gemini` in the manifest; add `?gemini` to the homepage URL to see them.
Flat models (snowflake, plaques, cards) are stood upright automatically so the spin shows their face.
