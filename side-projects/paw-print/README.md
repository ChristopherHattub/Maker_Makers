# Paw print (side project)

A personal 3D-print project, kept apart from the Maker Makers site: not a generator, no slot, not in `js/programs.js`, not linked from anywhere. It only borrows the site's dev server and the vendored three.js.

**View it:** `npm run dev` from the repo root, then open <http://localhost:5173/side-projects/paw-print/>.
Pick Plaque / Paw only / Stamp, drag to orbit, **Light** moves the raking light, **Photo** shows the original print, **Download STL** saves the model shown.

## Models

The pads are traced from where the ink in `source.png` is densest and rounded into domes (78% of the height). The raw ink darkness rides on top as a light texture (22%), so the speckled fur, pad creases and cracks from the print still show. Bare paper is flat. Change the mix with `TEXTURE` in `build.py` (1.0 = the raw ink only).

| Model | Size | Notes |
| --- | --- | --- |
| Plaque | 100 mm disc, 5 mm | 3 mm base, 1.2 mm rim, paw raised up to 2 mm |
| Paw only | 70 x 81 mm, 4 mm | 2 mm backing cut to the paw outline, ink raised up to 2 mm |
| Stamp / mould | 100 mm disc, 10 mm | mirrored paw cut up to 2 mm deep; pressed into clay it leaves a raised paw the right way round |

All three print face up with no supports and are checked watertight. **None has been printed yet.** The texture is about 0.25 mm per pixel, so a 0.4 mm nozzle and 0.12 mm layers or finer bring out the most detail.

## Files

- `source.png`: the photo.
- `build.py`: photo to `models/heightmap.png` (red = relief, green = paw outline) and `heightmap-preview.png` (the relief as a greyscale picture). Flattens the paper lighting, domes the pads and keeps the raw ink as texture, traces the outline, scales the paw to 82 mm long. Needs numpy and Pillow.
- `mesher.js`: heightmap to watertight meshes and binary STL, shared by the viewer and the check.
- `check.mjs`: `node check.mjs` builds all three and checks edges (open / non-manifold / flipped) and volume; `--stl` also writes `models/*.stl` (git-ignored).
- `index.html`: the viewer.

Rebuild after changing `build.py`: `python3 build.py && node check.mjs`. Tune the relief height and sizes in `mesher.js` (`RELIEF`, `DISC_D`).
