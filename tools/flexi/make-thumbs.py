#!/usr/bin/env python3
"""Writes the ten flexi creature thumbnails (assets/thumbnails/flexi-*.svg) in the shared thumbnail style."""
import math, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
tpl = (ROOT / '.claude/skills/makermakers-generator/thumbnail-template.svg').read_text()
STROKE = 'stroke="#00e5ff" stroke-width="2" stroke-linejoin="round"'
ACC = 'fill="#c084fc" stroke="#fff" stroke-width="1.3"'

def bead(x, y, r, fill='mat'):
    return (f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="url(#{fill})" {STROKE}/>'
            f'<path d="M{x-r*0.62:.1f} {y-r*0.2:.1f}Q{x-r*0.4:.1f} {y-r*0.65:.1f} {x+r*0.05:.1f} {y-r*0.72:.1f}" fill="none" stroke="url(#gloss)" stroke-width="{max(2,r*0.22):.1f}" stroke-linecap="round"/>')

def chain(pts, fill='mat'):
    return ''.join(bead(x, y, r, fill) for x, y, r in pts)

def curve(n, x0, y0, x1, y1, bulge, r0, r1):
    out = []
    for i in range(n):
        t = i / (n - 1)
        x = x0 + (x1 - x0) * t
        y = y0 + (y1 - y0) * t + math.sin(t * math.pi * 2) * bulge
        out.append((x, y, r0 + (r1 - r0) * t))
    return out

def eye(x, y, r=4):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="#06152d" stroke="#fff" stroke-width="1"/><circle cx="{x-r*0.3:.1f}" cy="{y-r*0.3:.1f}" r="{r*0.3:.1f}" fill="#fff"/>'

def poly(pts, fill='mat', extra=''):
    d = 'M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in pts) + 'Z'
    return f'<path d="{d}" fill="url(#{fill})" {STROKE} {extra}/>'

def dots(pts, r=3):
    return ''.join(f'<circle cx="{x}" cy="{y}" r="{r}" {ACC}/>' for x, y in pts)

THUMBS = {}

# dragon: wings, S-curve body, head at left
body = curve(12, 262, 196, 86, 168, 14, 10, 20)[::-1]
THUMBS['flexi-dragon'] = (91, 'FLEXI DRAGON', 'green',
    poly([(150, 160), (120, 92), (170, 120), (190, 70), (214, 124), (250, 96), (222, 164)], 'green') +
    chain(sorted(curve(12, 82, 176, 300, 200, 12, 20, 9), key=lambda p: -p[0])[:0] + curve(12, 82, 176, 300, 200, 12, 18, 8)[::-1], 'green') +
    poly([(66, 168), (44, 154), (70, 156)], 'warm') + eye(84, 166) + dots([(150, 166), (186, 176), (222, 184)]))

# gecko
THUMBS['flexi-gecko'] = (92, 'FLEXI GECKO', 'warm',
    poly([(150, 170), (120, 214), (140, 226), (170, 188)], 'warm') + poly([(150, 150), (118, 118), (138, 108), (172, 138)], 'warm') +
    chain(curve(10, 300, 190, 98, 156, 10, 7, 20)[::-1], 'warm') + eye(96, 144, 5) + eye(100, 168, 5) + dots([(190, 156), (224, 162), (256, 172)]))

# crocodile
THUMBS['flexi-crocodile'] = (93, 'FLEXI CROCODILE', 'green',
    poly([(190, 168), (166, 218), (196, 222), (214, 180)], 'green') + poly([(190, 140), (166, 96), (196, 92), (214, 130)], 'green') +
    chain(curve(10, 310, 188, 150, 158, 8, 7, 20)[::-1], 'green') +
    poly([(150, 142), (74, 148), (60, 158), (74, 170), (150, 176)], 'green') + eye(128, 142, 4) + dots([(172, 150), (212, 156), (250, 168)], 2.6))

# octopus
arms = ''
for i in range(7):
    a = math.pi * (0.05 + i * 0.15)
    arms += chain([(200 + math.cos(a) * (40 + j * 14) * 1.35, 190 + math.sin(a) * (14 + j * 7) + (j * j * 0.6), 11 - j * 1.1) for j in range(6)][::-1], 'warm')
THUMBS['flexi-octopus'] = (94, 'FLEXI OCTOPUS', 'warm', arms +
    f'<ellipse cx="200" cy="150" rx="58" ry="52" fill="url(#warm)" {STROKE}/><path d="M158 126Q176 96 214 92" fill="none" stroke="url(#gloss)" stroke-width="7" stroke-linecap="round"/>' +
    eye(180, 150, 7) + eye(222, 150, 7) + dots([(200, 112), (178, 118), (222, 118)], 3.5))

# scorpion
THUMBS['flexi-scorpion'] = (95, 'FLEXI SCORPION', 'warm',
    poly([(110, 156), (84, 120), (108, 100), (128, 134)], 'warm') + poly([(110, 196), (84, 232), (108, 232), (128, 208)], 'warm') +
    chain(curve(6, 166, 176, 118, 176, 0, 12, 14)[::-1], 'warm') + chain(curve(8, 300, 178, 176, 176, -6, 5, 13)[::-1], 'warm') +
    poly([(300, 178), (330, 168), (312, 188)], 'warm') + eye(120, 168, 3) + eye(120, 184, 3) + dots([(214, 176), (244, 176), (272, 178)], 2.6))

# centipede
legs = ''.join(f'<path d="M{x} {y-14}L{x-6} {y-30}M{x} {y+14}L{x-6} {y+30}" stroke="#00e5ff" stroke-width="2.4" stroke-linecap="round"/>' for x, y, r in curve(10, 300, 182, 110, 160, 12, 12, 16))
THUMBS['flexi-centipede'] = (96, 'FLEXI CENTIPEDE', 'warm', legs +
    chain(curve(10, 300, 182, 110, 160, 12, 12, 16)[::-1], 'warm') + chain([(92, 160, 20)], 'warm') +
    '<path d="M82 144L58 124M96 142L88 112" stroke="#00e5ff" stroke-width="2.4" stroke-linecap="round" fill="none"/>' + eye(86, 154, 4) + dots([(150, 168), (200, 188), (250, 188)], 3))

# turtle
THUMBS['flexi-turtle'] = (97, 'FLEXI TURTLE', 'green',
    poly([(150, 190), (112, 236), (146, 236), (178, 200)], 'green') + poly([(250, 190), (292, 236), (258, 236), (226, 200)], 'green') +
    poly([(160, 130), (112, 98), (136, 90), (176, 118)], 'green') + poly([(240, 130), (288, 98), (264, 90), (224, 118)], 'green') +
    chain([(100, 154, 17), (124, 166, 13)], 'green') + '<ellipse cx="208" cy="168" rx="82" ry="52" fill="url(#green)" ' + STROKE + '/>' +
    '<path d="M150 144Q172 112 226 108" fill="none" stroke="url(#gloss)" stroke-width="7" stroke-linecap="round"/>' + eye(94, 150, 3.5) +
    dots([(208, 140), (176, 160), (240, 160), (208, 186)], 5))

# shark
THUMBS['flexi-shark'] = (98, 'FLEXI SHARK', 'mat',
    poly([(190, 160), (212, 96), (232, 160)], 'mat') + poly([(176, 190), (140, 232), (190, 222)], 'mat') +
    chain(curve(10, 300, 178, 100, 174, 4, 8, 22)[::-1], 'mat') + poly([(300, 176), (342, 130), (332, 176), (344, 220)], 'mat') +
    poly([(100, 172), (56, 184), (100, 186)], 'mat') + eye(112, 168, 4) + dots([(168, 176), (200, 176), (232, 176)], 3))

# seahorse
THUMBS['flexi-seahorse'] = (99, 'FLEXI SEAHORSE', 'warm',
    chain([(260 - 70 * math.sin(t * 2.4) + 0, 226 - t * 150 + 14 * math.sin(t * 5), 7 + 13 * math.sin(min(t, 1) * 2.6)) for t in [i / 11 for i in range(12)]][::-1][:0] +
          [(228 + 34 * math.cos(t * 3.4), 214 - 40 * math.sin(t * 3.4) + t * 8, 7 + t * 3) for t in [i / 7 for i in range(8)]][::-1] +
          [(194 + 6 * i, 160 - i * 10, 16 + (2 if i < 3 else 0)) for i in range(5)][::-1], 'warm') +
    chain([(168, 74, 20)], 'warm') + poly([(150, 70), (110, 74), (112, 82), (152, 84)], 'warm') + eye(172, 70, 4) + dots([(184, 56), (192, 52), (200, 52)], 3))

# caterpillar
THUMBS['flexi-caterpillar'] = (100, 'FLEXI CATERPILLAR', 'green',
    ''.join(f'<path d="M{x-6} {y+r-2}l-4 12M{x+6} {y+r-2}l4 12" stroke="#00e5ff" stroke-width="2.6" stroke-linecap="round"/>' for x, y, r in curve(8, 306, 184, 128, 184, -22, 16, 22)) +
    chain(curve(8, 306, 184, 128, 184, -22, 16, 22)[::-1], 'green') + chain([(108, 170, 26)], 'green') +
    '<path d="M98 146Q88 118 70 110M118 144Q124 112 142 104" stroke="#00e5ff" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
    f'<circle cx="70" cy="110" r="4" {ACC}/><circle cx="142" cy="104" r="4" {ACC}/>' + eye(98, 168, 5) + eye(120, 168, 5) + dots([(186, 160), (230, 170), (270, 170)], 3))

for name, (slot, title, fill, art) in THUMBS.items():
    svg = tpl.replace('MM-00N', f'MM-{slot:03d}').replace('>TITLE<', f'>{title}<')
    svg = re.sub(r'  <!-- SUBJECT:.*?-->\n', '  ' + art + '\n', svg, flags=re.S)
    (ROOT / 'assets/thumbnails' / f'{name}.svg').write_text(svg)
    print('wrote', name)
