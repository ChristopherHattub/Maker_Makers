# Dice Tower (slot 66)

`programs/dice-tower.html`. A tower with baffle ramps and a landing tray. The dice path is the same in every style.

## Options

- **Tower shape:** Square or Round. Round keeps the same rectangular dice channel inside a cylinder, thinnest (the Wall thickness setting) at the channel corners.
- **Theme:** Classic, Castle, Pagoda, Tavern, Sci-fi. Each theme has its own code path for each shape (`decorate` and `decorateRound`) and its own details group of sliders (`showIf` on the theme). Default slider values reproduce the earlier look, apart from the added Pagoda detail.
- **Tray shape:** Rectangle, Rounded, Half round, Angled, Flared. On a round tower the floor and side rims run back into the curved wall, so dice can't slip past.
- **Stamps tab:** shapes and text (Archivo Black, a copy of one Text Generator font, printable ASCII only).

## Stamps

A stamp stores its angle around the tower and its height, not a surface point, so it stays on the wall when sliders or the shape change. It is sunk 0.5 mm into the wall and rises clear of the theme's relief (`themeRelief`). On a round tower `onCurve` bends it; `splitLong` first splits its triangles so large stamps follow the curve and stay watertight. On a square tower it stays on one face and shrinks to fit if needed. A stamp that would cover the exit is lifted above it.

Stamps can be hidden behind a turret if the turret stands in front of them; they are not moved for that.

## Checks

`check-mesh.mjs` places sample stamps through `testSetup`. All variants show the "Needs supports" chip, mainly for the flat ceiling over the exit (about 30 mm wide). The small round castle printed and worked in Chris's test print (2026-10-31), so this warning has not been a problem in practice at that size.
