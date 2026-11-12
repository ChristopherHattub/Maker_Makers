#!/usr/bin/env python3
"""Paw print photo -> heightmap for the 3D viewer.

Reads source.png (a photo of an inked paw print), flattens the paper lighting,
turns ink darkness into height (raw: every speckle and crease is kept) and
traces the paw outline. Writes models/heightmap.png:
  red   = relief, 0 (bare paper) .. 255 (darkest pad ink)
  green = paw outline mask (255 inside the paw)
  blue  = unused
at exactly PX_MM millimetres per pixel. index.html turns it into meshes.

Needs only numpy and Pillow:  python3 build.py
"""
import os
from collections import deque

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'source.png')
OUT = os.path.join(HERE, 'models', 'heightmap.png')
PREVIEW = os.path.join(HERE, 'models', 'heightmap-preview.png')

PX_MM = 0.25          # output resolution, mm per pixel (keep in step with index.html)
PAW_LONG_MM = 82.0    # length of the paw's longer side in the 100 mm plaque
CROP_X = (40, 924)    # photo has black bars left and right
GAMMA = 1.0          # 1 = height follows ink darkness linearly
TEXTURE = 0.22       # share of the height from the raw ink (speckle, creases); the rest is the domed pads
PAD_LEVEL = (0.34, 0.54)  # blurred ink density that counts as pad (soft edge between the two)


def box_blur(a, r):
    """Box blur of radius r (window 2r+1) with edge padding, via cumulative sums."""
    if r < 1:
        return a.copy()
    p = np.pad(a, r, mode='edge')
    c = np.cumsum(np.cumsum(p, axis=0), axis=1)
    c = np.pad(c, ((1, 0), (1, 0)))
    k = 2 * r + 1
    s = c[k:, k:] - c[:-k, k:] - c[k:, :-k] + c[:-k, :-k]
    return s / (k * k)


def gauss_blur(a, r):
    """Three box passes ~ a Gaussian."""
    for _ in range(3):
        a = box_blur(a, r)
    return a


def median3(a):
    p = np.pad(a, 1, mode='edge')
    h, w = a.shape
    stack = [p[dy:dy + h, dx:dx + w] for dy in range(3) for dx in range(3)]
    return np.median(np.stack(stack), axis=0)


def resize(a, w, h):
    im = Image.fromarray(a.astype(np.float32), mode='F')
    return np.asarray(im.resize((w, h), Image.BOX if w < a.shape[1] else Image.BICUBIC), dtype=np.float64)


def components(mask):
    """Label 4-connected components; returns (labels, sizes)."""
    h, w = mask.shape
    lab = np.zeros((h, w), np.int32)
    sizes = [0]
    n = 0
    for y0 in range(h):
        for x0 in range(w):
            if mask[y0, x0] and not lab[y0, x0]:
                n += 1
                cnt = 0
                q = deque([(y0, x0)])
                lab[y0, x0] = n
                while q:
                    y, x = q.popleft()
                    cnt += 1
                    for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
                        if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not lab[ny, nx]:
                            lab[ny, nx] = n
                            q.append((ny, nx))
                sizes.append(cnt)
    return lab, sizes


def fill_holes(mask):
    h, w = mask.shape
    outside = np.zeros_like(mask)
    q = deque()
    for y in range(h):
        for x in (0, w - 1):
            if not mask[y, x] and not outside[y, x]:
                outside[y, x] = True; q.append((y, x))
    for x in range(w):
        for y in (0, h - 1):
            if not mask[y, x] and not outside[y, x]:
                outside[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and not mask[ny, nx] and not outside[ny, nx]:
                outside[ny, nx] = True
                q.append((ny, nx))
    return ~outside


def main():
    img = np.asarray(Image.open(SRC).convert('L'), dtype=np.float64)
    img = img[:, CROP_X[0]:CROP_X[1]]
    h, w = img.shape

    # 1. Paper lighting: the brightest values in coarse blocks are paper; blur them into a background.
    b = 24
    hh, ww = h // b, w // b
    blocks = img[:hh * b, :ww * b].reshape(hh, b, ww, b)
    bg_small = np.percentile(blocks, 90, axis=(1, 3))
    bg_small = gauss_blur(bg_small, 2)
    bg = resize(bg_small, w, h)
    norm = np.clip(img / np.maximum(bg, 1), 0, 1.2)

    # 2. Ink density, raw, with only a 3x3 median against single-pixel sensor noise.
    dens = 1.0 - median3(norm)
    lo, hi = np.percentile(dens, 40), np.percentile(dens, 99.5)
    dens = np.clip((dens - lo) / (hi - lo), 0, 1)

    # 3. Paw outline: blurred ink coverage, largest blob, holes filled, smoothed.
    cover = gauss_blur(dens, 10)
    m = cover > 0.10
    lab, sizes = components(m)
    m = lab == int(np.argmax(sizes))
    m = fill_holes(m)
    m = gauss_blur(m.astype(np.float64), 16) > 0.45
    m = fill_holes(m)

    # 4. Crop to the paw with a margin and scale to millimetres.
    ys, xs = np.nonzero(m)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    pad = 6
    y0, x0 = max(0, y0 - pad), max(0, x0 - pad)
    y1, x1 = min(h, y1 + pad), min(w, x1 + pad)
    dens, m = dens[y0:y1, x0:x1], m[y0:y1, x0:x1]
    long_px = max(dens.shape)
    scale = PAW_LONG_MM / PX_MM / long_px
    ow, oh = round(dens.shape[1] * scale), round(dens.shape[0] * scale)
    rel = resize(dens, ow, oh)
    msk = resize(m.astype(np.float64), ow, oh) > 0.5

    # Soft-fade the ink outside the outline (stray pen marks, paper grain) to zero.
    feather = np.clip(gauss_blur(msk.astype(np.float64), 4) * 2.0, 0, 1)
    raw = np.clip(rel, 0, 1) ** GAMMA * feather

    # 5. Domed pads: where the ink is dense over a few millimetres it is a pad. Blur that pad shape
    #    again to round it into a cushion, so pads rise smoothly instead of as flat ink plateaus.
    soft = gauss_blur(raw, 12)
    soft = soft / max(np.percentile(soft, 99.5), 1e-6)
    t = np.clip((soft - PAD_LEVEL[0]) / (PAD_LEVEL[1] - PAD_LEVEL[0]), 0, 1)
    pads = t * t * (3 - 2 * t)
    cushion = gauss_blur(pads, 9)
    cushion = np.clip(cushion / max(cushion.max(), 1e-6), 0, 1) ** 0.6
    dome = np.minimum(pads, 1) * 0.35 + cushion * 0.65
    dome = dome / max(dome.max(), 1e-6)
    rel = np.clip((1 - TEXTURE) * dome + TEXTURE * raw, 0, 1) * feather

    rgb = np.zeros((oh, ow, 3), np.uint8)
    rgb[..., 0] = np.round(rel * 255)
    rgb[..., 1] = msk * 255
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    Image.fromarray(rgb, 'RGB').save(OUT, optimize=True)
    prev = (255 - rgb[..., 0]).astype(np.uint8)
    Image.fromarray(prev, 'L').save(PREVIEW, optimize=True)
    print('heightmap %dx%d px = %.1f x %.1f mm (%.2f mm/px), mask %d px' %
          (ow, oh, ow * PX_MM, oh * PX_MM, PX_MM, int(msk.sum())))


if __name__ == '__main__':
    main()
