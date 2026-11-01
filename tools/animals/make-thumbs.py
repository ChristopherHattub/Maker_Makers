#!/usr/bin/env python3
"""Writes the fifteen animal thumbnails (assets/thumbnails/<name>.svg) in the shared thumbnail style."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
tpl = (ROOT / '.claude/skills/makermakers-generator/thumbnail-template.svg').read_text()
ST = 'stroke="#00e5ff" stroke-width="2" stroke-linejoin="round"'
ACC = 'fill="#c084fc" stroke="#fff" stroke-width="1.3"'

def e(x, y, rx, ry=None, f='mat'):
    return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry or rx}" fill="url(#{f})" {ST}/>'
def p(pts, f='mat'):
    return f'<path d="M' + 'L'.join(f'{x} {y}' for x, y in pts) + f'Z" fill="url(#{f})" {ST}/>'
def eye(x, y, r=5):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="#06152d" stroke="#fff" stroke-width="1"/>'
def acc(x, y, r=4):
    return f'<circle cx="{x}" cy="{y}" r="{r}" {ACC}/>'
def line(pts, w=10, f='#7fd8ff'):
    d = 'M' + 'L'.join(f'{x} {y}' for x, y in pts)
    return f'<path d="{d}" fill="none" stroke="#00e5ff" stroke-width="{w + 4}" stroke-linecap="round" stroke-linejoin="round"/><path d="{d}" fill="none" stroke="{f}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'
def beads(n, x0, x1, y, r0, r1, wave=8):
    out = ''
    for i in range(n):
        t = i / (n - 1)
        yy = y + wave * (1 if i % 4 < 2 else -1) * 0.6
        out += e(round(x0 + (x1 - x0) * t), round(yy), round(r0 + (r1 - r0) * t))
    return out

T = {
 'dino-builder': ('MM-076', 'DINO BUILDER', line([(70, 235), (130, 225), (170, 205)], 14) + e(190, 190, 42, 50) + p([(170, 245), (215, 245), (212, 190), (172, 190)]) + e(225, 105, 34, 26) + p([(190, 170), (225, 120), (240, 165)]) + eye(232, 96) + acc(205, 150)),
 'dragon-maker': ('MM-077', 'DRAGON MAKER', p([(170, 165), (120, 60), (105, 110), (140, 180)]) + p([(195, 165), (170, 50), (150, 95), (170, 175)]) + line([(95, 240), (140, 235), (170, 225)], 12) + e(195, 195, 42, 52) + e(235, 110, 26, 22) + p([(220, 95), (214, 60), (232, 88)], 'warm') + p([(240, 92), (250, 58), (254, 92)], 'warm') + eye(243, 104) + acc(190, 170)),
 'cat-sculptor': ('MM-078', 'CAT SCULPTOR', line([(125, 240), (100, 225), (120, 205)], 8, '#ffc98a') + e(200, 195, 50, 52, 'warm') + e(200, 110, 38, 34, 'warm') + p([(172, 95), (168, 55), (195, 82)], 'warm') + p([(228, 95), (232, 55), (205, 82)], 'warm') + eye(186, 106) + eye(214, 106) + acc(200, 122)),
 'dog-builder': ('MM-079', 'DOG BUILDER', line([(140, 205), (120, 165)], 8, '#ffc98a') + e(190, 195, 50, 52, 'warm') + e(205, 112, 36, 34, 'warm') + e(170, 110, 11, 26, 'warm') + e(240, 122, 20, 13) + eye(204, 100) + eye(252, 118, 4) + acc(190, 150)),
 'flexi-snake': ('MM-080', 'ARTICULATED SNAKE', beads(13, 90, 290, 225, 11, 19) + eye(286, 216, 4)),
 'flexi-fish': ('MM-081', 'FLEXI FISH', p([(80, 165), (120, 200), (80, 240)], 'warm') + beads(9, 125, 260, 200, 18, 34, 2) + e(280, 200, 28, 30, 'warm') + eye(290, 190) + acc(200, 170)),
 'turtle-tortoise': ('MM-082', 'TURTLE & TORTOISE', e(115, 240, 18, 7) + e(285, 240, 18, 7) + e(290, 195, 24, 20) + f'<path d="M100 240Q200 40 300 240Z" fill="url(#green)" {ST}/>' + eye(300, 188, 4) + acc(200, 150, 7)),
 'owl-stacker': ('MM-083', 'OWL STACKER', e(200, 205, 50, 40, 'warm') + e(200, 135, 42, 36, 'warm') + e(200, 75, 34, 30, 'warm') + eye(186, 75, 8) + eye(214, 75, 8) + eye(182, 135, 9) + eye(218, 135, 9) + eye(180, 205, 10) + eye(220, 205, 10) + acc(200, 150)),
 'penguin-pals': ('MM-084', 'PENGUIN PALS', e(180, 150, 48, 92) + e(180, 180, 28, 56, 'warm') + eye(165, 100) + eye(195, 100) + acc(180, 118) + e(265, 205, 26, 40) + e(265, 218, 15, 24, 'warm') + eye(257, 192, 3) + eye(273, 192, 3)),
 'octopus-squid': ('MM-085', 'OCTOPUS & SQUID', line([(150, 215), (90, 240), (75, 215)], 11) + line([(250, 215), (310, 240), (325, 215)], 11) + line([(170, 225), (130, 245)], 11) + line([(230, 225), (270, 245)], 11) + e(200, 150, 62, 78) + eye(178, 160) + eye(222, 160) + acc(200, 110)),
 'mushroom-critters': ('MM-086', 'MUSHROOM CRITTERS', e(200, 200, 40, 48) + f'<path d="M100 130Q200 20 300 130L225 165L175 165Z" fill="url(#warm)" {ST}/>' + eye(186, 195) + eye(214, 195) + acc(200, 75, 7) + acc(150, 105, 5) + acc(250, 105, 5)),
 'shark-trophy': ('MM-087', 'SHARK FIN TROPHY', p([(90, 245), (310, 245), (295, 215), (105, 215)]) + f'<path d="M145 215Q190 70 245 50Q215 130 265 215Z" fill="url(#mat)" {ST}/>' + acc(200, 230, 5)),
 'elephant-builder': ('MM-088', 'ELEPHANT BUILDER', p([(115, 245), (150, 245), (150, 190), (115, 190)]) + p([(205, 245), (240, 245), (240, 190), (205, 190)]) + e(170, 170, 70, 55) + e(240, 115, 38, 36) + p([(215, 85), (150, 65), (170, 145), (215, 135)]) + line([(268, 125), (280, 185), (278, 240)], 14) + eye(250, 105) + acc(170, 150)),
 'monster-maker': ('MM-089', 'ALIEN & MONSTER', line([(175, 75), (165, 40)], 4) + line([(225, 75), (235, 40)], 4) + e(200, 160, 62, 88, 'green') + eye(178, 125, 13) + eye(222, 125, 13) + line([(170, 180), (200, 195), (230, 180)], 3, '#06152d') + acc(200, 225)),
 'horse-builder': ('MM-090', 'HORSE BUILDER', line([(90, 235), (110, 215)], 14, '#c084fc') + e(170, 200, 70, 42) + line([(230, 190), (250, 125)], 26, '#eaf6ff') + e(262, 105, 34, 22) + p([(250, 86), (278, 34), (266, 88)], 'warm') + eye(268, 100, 4) + acc(170, 180)),
}
for name, (code, title, art) in T.items():
    s = tpl.replace('MM-00N', code).replace('TITLE', title)
    s = re.sub(r'<!--\s*SUBJECT.*?-->', lambda m: art, s, count=1, flags=re.S)
    (ROOT / f'assets/thumbnails/{name}.svg').write_text(s)
    print('wrote', name)
