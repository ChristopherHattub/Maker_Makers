#!/usr/bin/env python3
"""Build the v2/v3 hover assets (shared base tile + 24-frame rotating hologram sheets).

Usage: python3 scripts/build-hover-sheets.py <base_tile image> <dir with sheet-01-3d.jpg ... and/or <id>-3d.jpg ...>
See docs/sprite-sheet-skill.md. Raw object sheets are 6 columns x 8 rows (two 6x4 blocks, one per
generator) of glowing cyan wireframes on black. Each frame is re-centred and scaled per block (so the
object does not jump or breathe), brightness becomes alpha (no key colour needed), and an optional
per-tile hue is applied. The base tile is keyed from magenta; optional per-section rim recolours
make extra base-tile-<section>.webp files. Tints and rims live in scripts/sprite-tints.json:
  { "pumpkin-plotter": { "hue": 28 }, "_rims": { "halloween": 25, "christmas": 0 } }
Outputs go to assets/thumbnails/sprites/ (obj-sheet-NN.webp, base-tile*.webp, manifest-v2.json).
"""
import json, re, sys
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets/thumbnails/sprites'
CELL, COLS, BLOCK_ROWS, BLOCKS, FRAMES, FPS = 288, 6, 4, 2, 24, 24
OBJ = 228            # px the object's largest dimension is normalised to, inside a 288 cell
BASE = 512           # output size of the base tile
CYAN, RIM = 185, 24  # source hues (degrees) of the hologram and the base tile rim

tints_path = ROOT / 'scripts/sprite-tints.json'
TINTS = json.loads(tints_path.read_text()) if tints_path.exists() else {}

def generators():
    src = (ROOT / 'js/programs.js').read_text()
    block = src[src.index('const GENERATORS'):src.index('const SLOT_COUNT') if 'const SLOT_COUNT' in src else None]
    items = re.findall(r"slot:\s*(\d+),\s*title:\s*'((?:[^'\\]|\\.)*)'.*?thumbnailUrl:\s*'[^']*?/([^/']+)\.svg'", block, re.S)
    return sorted(((int(s), t.replace("\\'", "'"), i) for s, t, i in items))

def shift_hue(rgb, src_deg, dst_deg, mask=None):
    hsv = np.asarray(Image.fromarray(rgb, 'RGB').convert('HSV')).copy()
    d = int(round((dst_deg - src_deg) / 360 * 256))
    shifted = ((hsv[..., 0].astype(int) + d) % 256).astype(np.uint8)
    hsv[..., 0] = shifted if mask is None else np.where(mask, shifted, hsv[..., 0])
    return np.asarray(Image.fromarray(hsv, 'HSV').convert('RGB'))

def magenta(a):
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    return (r - g > 90) & (b - g > 90)

def erode(m, n):
    for _ in range(n):
        m = m & np.roll(m, 1, 0) & np.roll(m, -1, 0) & np.roll(m, 1, 1) & np.roll(m, -1, 1)
    return m

def build_base(path):
    a = np.asarray(Image.open(path).convert('RGB'))
    solid = ~magenta(a)
    ys, xs = np.nonzero(solid)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    crop = np.ascontiguousarray(a[y0:y1, x0:x1])
    alpha = erode(solid[y0:y1, x0:x1], 3).astype(np.uint8) * 255
    hsv = np.asarray(Image.fromarray(crop, 'RGB').convert('HSV')).astype(int)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    warm = ((h < 28) | (h > 245)) & (s > 90) & (v > 60)           # the orange rim and its glow
    def save(rgb, name):
        im = Image.fromarray(np.dstack([rgb, alpha]), 'RGBA').resize((BASE, BASE), Image.LANCZOS)
        im.save(OUT / name, 'WEBP', quality=94, alpha_quality=100, method=6)
    save(crop, 'base-tile.webp')
    rims = {}
    for section, hue in TINTS.get('_rims', {}).items():
        save(shift_hue(crop, RIM, hue, warm), f'base-tile-{section}.webp')
        rims[section] = f'base-tile-{section}.webp'
    return rims

def build_block(a, bx, by, bw, bh, hue, cols=COLS, rows=BLOCK_ROWS, frames=FRAMES):
    """a: source array, block origin (bx,by), size (bw,bh) in source px. Returns `frames` RGBA cells (288x288)."""
    cw, ch = bw / cols, bh / rows
    cells, boxes = [], []
    for f in range(frames):
        c, r = f % cols, f // cols
        x0, y0 = int(round(bx + c * cw)), int(round(by + r * ch))
        cell = a[y0:y0 + int(round(ch)), x0:x0 + int(round(cw))]
        m = cell.max(axis=2) > 55
        ys, xs = np.nonzero(m)
        boxes.append((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
        cells.append(cell)
    scale = OBJ / max(max(b[2] - b[0], b[3] - b[1]) for b in boxes)
    # Keep one fixed centre for the whole block. Gemini already holds the object steady in its cell, while
    # centring each frame on its own bounding box makes the body jump sideways whenever an arm swings out.
    cx = cw / 2
    cy = float(np.median([(b[1] + b[3]) / 2 for b in boxes]))
    out = []
    for cell, (l, t, rr, bb) in zip(cells, boxes):
        win = CELL / scale
        im = Image.fromarray(cell, 'RGB').transform(
            (CELL, CELL), Image.AFFINE, (1 / scale, 0, cx - win / 2, 0, 1 / scale, cy - win / 2), Image.BICUBIC)
        rgb = np.asarray(im)
        if hue is not None:
            rgb = shift_hue(np.ascontiguousarray(rgb), CYAN, hue)
        mx = rgb.max(axis=2).astype(float)
        alpha = np.clip((mx - 10) / 245 * 1.15, 0, 1)
        col = np.clip(rgb / np.maximum(mx, 1)[..., None] * 255, 0, 255)
        out.append(Image.fromarray(np.dstack([col, alpha * 255]).astype(np.uint8), 'RGBA'))
    return out

def main():
    base_path, src = Path(sys.argv[1]), Path(sys.argv[2])
    gens = generators()
    OUT.mkdir(parents=True, exist_ok=True)
    rims = build_base(base_path)
    sheets, tiles = [], {}
    n = 1
    while any((src / f'sheet-{n:02d}-3d.{e}').exists() for e in ('jpg', 'png')):  # v2: two generators per sheet
        f = next(p for p in (src / f'sheet-{n:02d}-3d.jpg', src / f'sheet-{n:02d}-3d.png') if p.exists())
        a = np.asarray(Image.open(f).convert('RGB'))
        H, W = a.shape[:2]
        sheet = Image.new('RGBA', (CELL * COLS, CELL * BLOCK_ROWS * BLOCKS), (0, 0, 0, 0))
        group = gens[(n - 1) * BLOCKS:n * BLOCKS]
        for b, (slot, title, ident) in enumerate(group):
            hue = TINTS.get(ident, {}).get('hue')
            frames = build_block(a, 0, b * H / BLOCKS, W, H / BLOCKS, hue)
            for i, fr in enumerate(frames):
                sheet.paste(fr, ((i % COLS) * CELL, (b * BLOCK_ROWS + i // COLS) * CELL))
            tiles[ident] = {'slot': slot, 'sheet': n - 1, 'block': b}
        name = f'obj-sheet-{n:02d}.webp'
        sheet.save(OUT / name, 'WEBP', quality=80, alpha_quality=80, method=6)
        sheets.append({'file': name, 'width': sheet.width, 'height': sheet.height})
        print(name, [g[2] for g in group])
        n += 1
    # One generator per image (v3): a 4x4 grid holding a 0-180 degree half turn, mirrored by the site.
    for slot, title, ident in gens:
        f = next((p for p in (src / f'{ident}-3d.jpg', src / f'{ident}-3d.png') if p.exists()), None)
        if not f:
            continue
        a = np.asarray(Image.open(f).convert('RGB'))
        H, W = a.shape[:2]
        used = TINTS.get(ident, {}).get('frames', 16)   # set "frames": 15 to drop a bad last frame
        frames = build_block(a, 0, 0, W, H, TINTS.get(ident, {}).get('hue'), 4, 4, 16)
        img = Image.new('RGBA', (CELL * 4, CELL * 4), (0, 0, 0, 0))
        for i, fr in enumerate(frames):
            img.paste(fr, ((i % 4) * CELL, (i // 4) * CELL))
        name = f'obj-{ident}.webp'
        img.save(OUT / name, 'WEBP', quality=82, alpha_quality=80, method=6)
        tiles[ident] = {'slot': slot, 'file': name, 'width': img.width, 'height': img.height,
                        'cols': 4, 'frames': used, 'rowsPerBlock': 4, 'block': 0, 'mirror': True}
        print(name)
    manifest = {'version': 2, 'base': 'base-tile.webp', 'rims': rims, 'cell': CELL, 'frames': FRAMES, 'cols': COLS,
                'rowsPerBlock': BLOCK_ROWS, 'fps': FPS, 'restScale': 0.41, 'displayScale': 0.85, 'sheets': sheets, 'tiles': tiles}
    (OUT / 'manifest-v2.json').write_text(json.dumps(manifest, indent=2) + '\n')

main()
