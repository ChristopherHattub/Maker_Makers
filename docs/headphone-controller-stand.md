# Headphone & Controller Stand (slot 119)

`programs/headphone-controller-stand.html`. Four stand types in one generator, each decorated with the same eight designs as the Console Faceplate ([console-faceplate.md](console-faceplate.md): plain bezel, honeycomb, stripes, circuit, rings, pixel fade, mountains, starburst), a raised rim and the same palette, so a stand can match a faceplate. **Unprinted: every dimension is a guess until someone tries it with real headphones and controllers.**

## Types (parameter `mount`)

| Type | Build | Print orientation |
| --- | --- | --- |
| Desk headphone stand | Rounded base, a post with a panel on its front face, and a domed cradle that flares out of the post at 45 degrees. | Upright on the base. |
| Wall headphone hook | Back plate with two screw holes and one or two rounded pegs; each peg has a 45 degree lip at its tip. | On its back: pegs rise straight up from the bed. |
| Desk controller rack | Base, back wall and 1 to 5 slots split by sloped dividers (controllers stand on their edge), optional front stop. Pattern is on the rear of the back wall. | Upright on the base. |
| Wall controller shelf | Back plate with screw holes, a shelf along the bottom, dividers and a front stop, pattern in a strip above. | On its back. |

Headband width (`bandW`) is the depth of the post (desk) or the peg length (wall). Controller slot width and depth default to 70 and 130 mm, a guess for DualSense and Xbox pads standing on their grips.

## Support-free rules

- Every overhang is a 45 degree chamfer: the cradle flare, the hook lip (`wedge()`), the front stop of the wall shelf.
- Raised patterns on a **vertical** face (desk stand post, desk rack back wall) would hang sideways in the print, so `taperTile()` and `taperRing()` chamfer every downward-facing edge at about 45 degrees. Patterns on flat faces (wall plates) are plain prisms.
- Known: all sliders at their maximum together on the desk headphone stand (rim 4 mm high and 6 mm wide) leaves a tiny overhang near the rim corners.
- Wall mounts print with layers parallel to the wall, so a shelf or peg loaded downward is stressed across layer lines. Fine for headphones and pads, not for a heavy load; thicken the plate and dividers if in doubt.

## Reuse

The helpers and `PATTERNS` are copied from the Console Faceplate page; keep them in step if a design is added there. `panel(out, P, fn, p, skip, taper)` places a decorated panel on any flat face: `P` is the rectangle in the face's own (u, v) with v growing downward on the finished stand, `fn` maps (u, height, v) to world, `skip` lists rectangles to keep clear (used around the hook pegs).

## Open items

No hologram tile or side-panel render yet. Nothing printed: check the cradle width against your headphones, the slot width against your controllers and the screw head against the 4.5 mm hole (no countersink).
