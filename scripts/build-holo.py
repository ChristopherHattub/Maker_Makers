#!/usr/bin/env python3
"""Turn the atlases rendered by tools/hologram.html into the site's hover assets.

Usage: python3 scripts/build-holo.py <dir the receiver saved holo-<id>.png into>
Each atlas (6x4 cells of 288 px, 24 frames, 15 degrees apart) becomes assets/thumbnails/sprites/holo-<id>.webp and a
tile entry in manifest-v2.json (a full turn, no mirroring). An entry that was there before (the Gemini frames) is kept
under "gemini" so the homepage can still show it with ?gemini.
"""
import json, re, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets/thumbnails/sprites'

def generators():
    src = (ROOT / 'js/programs.js').read_text()
    block = src[src.index('const GENERATORS'):src.index('const SLOT_COUNT') if 'const SLOT_COUNT' in src else None]
    items = re.findall(r"slot:\s*(\d+),\s*title:\s*'((?:[^'\\]|\\.)*)'.*?thumbnailUrl:\s*'[^']*?/([^/']+)\.svg'", block, re.S)
    return {i: int(s) for s, t, i in items}

POSTER = 192

def write_poster(im, ident):
    """Frame 0 as a small still, shown until the full 24-frame atlas has been fetched."""
    cell = im.width // 6
    im.crop((0, 0, cell, cell)).resize((POSTER, POSTER), Image.LANCZOS).save(
        OUT / f'poster-{ident}.webp', 'WEBP', quality=80, alpha_quality=80, method=6)

def backfill():
    """python3 scripts/build-holo.py --posters : posters for every atlas already in the manifest."""
    mpath = OUT / 'manifest-v2.json'
    m = json.loads(mpath.read_text())
    for ident, e in m['tiles'].items():
        if e.get('source') != 'holo': continue
        write_poster(Image.open(OUT / e['file']).convert('RGBA'), ident)
        e['poster'] = f'poster-{ident}.webp'
    mpath.write_text(json.dumps(m, indent=2) + '\n')
    print('posters written')

def main():
    if sys.argv[1] == '--posters': return backfill()
    src = Path(sys.argv[1])
    slots = generators()
    mpath = OUT / 'manifest-v2.json'
    m = json.loads(mpath.read_text())
    done = 0
    for png in sorted(src.glob('holo-*.png')):
        ident = png.stem[len('holo-'):]
        im = Image.open(png).convert('RGBA')
        name = f'holo-{ident}.webp'
        im.save(OUT / name, 'WEBP', quality=80, alpha_quality=80, method=6)
        write_poster(im, ident)
        prev = m['tiles'].get(ident)
        entry = {'slot': slots.get(ident, prev['slot'] if prev else 0), 'file': name, 'width': im.width, 'height': im.height,
                 'cols': 6, 'frames': 24, 'rowsPerBlock': 4, 'block': 0, 'mirror': False, 'order': list(range(24)),
                 'source': 'holo', 'poster': f'poster-{ident}.webp'}
        if prev:
            old = prev.get('gemini') if prev.get('source') == 'holo' else {k: v for k, v in prev.items() if k != 'holo'}
            if old and old.get('file') != name:
                entry['gemini'] = old
        m['tiles'][ident] = entry
        done += 1
    mpath.write_text(json.dumps(m, indent=2) + '\n')
    print(done, 'tiles written')

main()
