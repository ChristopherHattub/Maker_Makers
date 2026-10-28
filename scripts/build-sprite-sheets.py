#!/usr/bin/env python3
"""Normalise raw Gemini sprite sheets into the layout the homepage plays.

Usage: python3 scripts/build-sprite-sheets.py <dir with sheet-01.jpg ...>
See docs/sprite-sheet-skill.md. Raw sheets are 6 columns (frames) x up to 4 rows (generators) on a
flat magenta background. Each tile is found by its non-magenta bounding box (so Gemini's grid drift
does not matter), keyed to transparent, resized to 240x240 and packed into a 256px cell with an 8px
inset. Output: assets/thumbnails/sprites/sheet-NN.webp (1536x1024) and manifest.json.
"""
import json, re, sys
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets/thumbnails/sprites'
CELL, INSET, TILE, FRAMES, ROWS, FPS = 256, 8, 240, 6, 4, 8

def generators():
    src = (ROOT / 'js/programs.js').read_text()
    block = src[src.index('const GENERATORS'):src.index('const SLOT_COUNT') if 'const SLOT_COUNT' in src else None]
    items = re.findall(r"slot:\s*(\d+),\s*title:\s*'((?:[^'\\]|\\.)*)'.*?thumbnailUrl:\s*'[^']*?/([^/']+)\.svg'", block, re.S)
    return sorted(((int(s), t.replace("\\'", "'"), i) for s, t, i in items))

def magenta(a):
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    return (r - g > 90) & (b - g > 90)

def spans(flags, n, min_run=40):
    """Return n (start, end) runs of True in a 1-D bool array, splitting at the n-1 widest gaps."""
    idx = np.flatnonzero(flags)
    runs, start = [], idx[0]
    for a, b in zip(idx, idx[1:]):
        if b - a > 1:
            runs.append((start, a)); start = b
    runs.append((start, idx[-1]))
    runs = [r for r in runs if r[1] - r[0] >= min_run]
    if len(runs) != n:
        raise SystemExit(f'expected {n} tiles along an axis, found {len(runs)}')
    return runs

def erode(m, n):
    for _ in range(n):
        m = m & np.roll(m, 1, 0) & np.roll(m, -1, 0) & np.roll(m, 1, 1) & np.roll(m, -1, 1)
    return m

def process(path, rows):
    im = Image.open(path).convert('RGB')
    a = np.asarray(im)
    solid = ~magenta(a)
    # Column and row bounds from projections, ignoring thin JPEG noise.
    cols = spans(solid.sum(0) > a.shape[0] * 0.05, FRAMES)
    rws = spans(solid.sum(1) > a.shape[1] * 0.05, rows)
    sheet = Image.new('RGBA', (CELL * FRAMES, CELL * ROWS), (0, 0, 0, 0))
    for r, (y0, y1) in enumerate(rws):
        for c, (x0, x1) in enumerate(cols):
            m = solid[y0:y1 + 1, x0:x1 + 1]
            ys, xs = np.nonzero(m)
            ty0, ty1, tx0, tx1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
            crop = a[y0:y1 + 1, x0:x1 + 1][ty0:ty1, tx0:tx1]
            alpha = erode(m[ty0:ty1, tx0:tx1], 3).astype(np.uint8) * 255
            rgba = np.dstack([crop, alpha])
            t = Image.fromarray(rgba, 'RGBA').resize((TILE, TILE), Image.LANCZOS)
            sheet.paste(t, (c * CELL + INSET, r * CELL + INSET))
    return sheet

def main():
    src = Path(sys.argv[1])
    gens = generators()
    OUT.mkdir(parents=True, exist_ok=True)
    sheets, tiles = [], {}
    n = 1
    while (src / f'sheet-{n:02d}.jpg').exists() or (src / f'sheet-{n:02d}.png').exists():
        f = next(p for p in (src / f'sheet-{n:02d}.jpg', src / f'sheet-{n:02d}.png') if p.exists())
        group = gens[(n - 1) * ROWS:n * ROWS]
        sheet = process(f, len(group))
        name = f'sheet-{n:02d}.webp'
        sheet.save(OUT / name, 'WEBP', quality=92, alpha_quality=100, method=6)
        sheets.append({'file': name, 'width': sheet.width, 'height': sheet.height})
        for r, (slot, title, ident) in enumerate(group):
            tiles[ident] = {'slot': slot, 'label': title, 'sheet': n - 1, 'row': r}
        print(name, [g[2] for g in group])
        n += 1
    manifest = {'version': 1, 'cell': CELL, 'inset': INSET, 'tile': TILE, 'frames': FRAMES, 'fps': FPS,
                'sheets': sheets, 'tiles': tiles}
    (OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')

main()
