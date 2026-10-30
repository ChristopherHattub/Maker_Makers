#!/usr/bin/env python3
"""Turn the panel-<id>.png renders from tools/panel-thumbs.html into assets/thumbnails/panel/<id>.webp.
Usage: python3 scripts/build-panel-thumbs.py <receiver out dir>   (needs Pillow)"""
import sys, glob, os
from PIL import Image

src = sys.argv[1] if len(sys.argv) > 1 else '.'
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'thumbnails', 'panel')
os.makedirs(out, exist_ok=True)
n = 0
for f in sorted(glob.glob(os.path.join(src, 'panel-*.png'))):
    id_ = os.path.basename(f)[len('panel-'):-4]
    Image.open(f).convert('RGB').save(os.path.join(out, id_ + '.webp'), 'WEBP', quality=86, method=6)
    n += 1
print('wrote', n, 'thumbnails to', os.path.normpath(out))
