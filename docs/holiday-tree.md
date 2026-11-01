# Holiday Tree (slot 8)

A kid-friendly tree decorator. `programs/holiday-tree.html`, config only; the engine supplies the viewport, Sculpt, Color and Print tabs.

## Tabs

Decorate (first), Sculpt, Color tool, Print. The Parametric tab is hidden (`hideModelTab`); its tree shape, topper, hook and style presets live in a folded "Tree shape, topper & styles" section at the bottom of Decorate (`api.takeParams()`). Decorate shows the real colors (`coloredTabs`).

## Decorating

The picker lists nine shapes (ball, star, heart, bell, candy cane, snowflake, present, gingerbread, holly), each in six colors. Tap one, then tap the upper surface of the boughs; keep tapping to add more. Eraser removes an ornament, Undo and Clear all work, Surprise me adds 12 random ones. Size and Turn sliders apply to the next ornament. Ornaments follow the tree when its height or bottom width changes (their spot is scaled); changing the tier count may need re-placing.

Each ornament is its own mesh `orn_<id>` with a default `color`, so the Color tab can repaint it and the OBJ export carries the colors.

## Animation (preview only)

An added ornament pops in with a bounce and a sparkle burst, the tree gives a small jiggle, an erased one shrinks away. These move meshes in the viewport; exported geometry never changes. The fireplace flames and light flicker.

## Room (preview only)

`buildRoom()` adds a living room to the scene: wood floor, wallpaper, brick fireplace with stockings, garland and wreath, a snowy window, pictures, a rug under the tree and a few presents. It is not in `modelGroup`, so it is never exported, never sculpted and never part of the print check. The walls face inward, so from outside the room (zoomed out) you see in like a dollhouse.

## Export

STL and OBJ contain only the tree, trunk, snow base, topper, hook and the ornaments.
