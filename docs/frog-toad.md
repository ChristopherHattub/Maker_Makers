# Frog & Toad (slot 125)

`programs/frog-toad.html`, in the `animals` group. A squat, big-eyed amphibian sculpted in one piece with the animal kit: a slim tree frog (red slit eyes, orange toe pads), a heavy bullfrog (eardrum discs, ridges down the back) or a warty toad (glands behind the eyes, wart bumps). Options: eye size and spacing, body and back-leg size, a closed smile or an open mouth, a tongue with a fly stuck on the tip, and an optional lily-pad base. Unprinted: the thin tongue and toes, the fly and the toe-pad sizes are unproven.

## Files

| File | Role |
| --- | --- |
| `tools/animals/frog-toad.js` | The source: kinds, `buildFrog()`, parameters, presets. |
| `programs/frog-toad.html` | Built page. **Edit the source, then run `node tools/animals/build.mjs frog-toad`.** |
| `assets/thumbnails/frog-toad.svg` | Slot thumbnail (hand drawn from the template). |
| `assets/thumbnails/sprites/holo-frog-toad.webp`, `poster-frog-toad.webp` | Hover hologram (the pad is left out with `hide` in `scripts/hologram-config.json`). |
| `assets/thumbnails/panel/frog-toad.webp` | Side-panel preview render. |

Check with `node tools/animals/pc.mjs programs/frog-toad.html --set kind=1 --set mouth=2` (it also prints where each overhang is) or `sh tools/animals/checkall.sh frog-toad`.

## How it is built

Y up, mm, the frog faces +x. Forms are `Sculpt` ellipsoids and tubes that melt together (body, hump, head, thighs, shins, arms, toes), blended with a different `k` per part. `Sculpt.reach` is set to 1.0 (the kit default is 0.72), so forms may lean out up to about 50 degrees from the bed. That is what the print check allows and it is what makes the open mouth and the eye mounds wide enough to read. Entries, one colour each in the Color tool: `skin`, `limbs`, `web`, `toes`, `belly`, `mouth`, `spots`, `glands`, `eyes`, `pupils`, `glints`, `ears`, `tongue`, `fly`, `flyeyes`, `flywings`, `pad`.

- **Kinds** are a table (`FROG_KINDS`): body, head and eye sizes, limb sizes, toe pads, colours, eye direction, and which extras (`ears`, `ridges`, `glands`) it has. Warts are a `relief` of 40 bumps on the back; the Warts slider scales their height.
- **Eyes**: a mound plus a globe per side, then an iris dome placed on the finished surface by a ray (`S.face`). The tree frog's slit pupil is `slitEye()`, a copy of the kit's `reptileEye` with a 38 degree dome. Bullfrog and toad use `softEye`. The iris looks forward and up on purpose: a dome on a more sideways-facing globe has a lower rim that overhangs.
- **Closed mouth**: a thin groove carved around the head, curling up at the cheeks.
- **Open mouth**: a pointed arch, a carved elliptic cone whose roof climbs at about 52 degrees (`mH = mouthOpen`, `mAz = mH / 1.3`). A wide flat roof would be trimmed by the support pass, so wider mouths are taller, and the head gets taller too (the jaw drop). The inside is painted dark rose.
- **Tongue and fly**: the tongue is a straight pole from the mouth floor at the Lift angle (60 to 82 degrees; shallower tongues broke up on the bullfrog), with a sticky tip. The fly body sits on the tip. Its wings are two leaf-shaped slabs tilted outward (`slab`, added as rigid shells), its eyes are domes.
- **Lily pad** (`lilyPad()`): its own closed polar mesh, not part of the sculpted field, so its rim is smooth (as a field form the rim came out stair-stepped). Flat underside, domed top, 15 pressed veins and a small notch at the back. The frog is sculpted on the bed and then lifted 2.6 mm (`lift`) so its feet sink into the pad; `S.yOff` tells the Sculpt tab about the lift. With No base the frog sits on the bed with its feet sunk 1.2 mm so the underside is flat.

## Print check

Defaults and all nine presets have no errors. A few 3 to 6 mm² overhang warnings remain around the fly (its underside and the wing roots) and, with no base, at the toe tips. Limits found by sweeping every slider at its ends are baked into the slider ranges: Mouth opening at least 11 mm, Tongue lift at least 60 degrees, Tongue length at least 24 mm, Back legs at most 1.1x. Outside them the arch roof, the tongue or the thigh tops fail the check.

## Known limits

- Unprinted. The 3 mm tongue pole and 2 mm toes are thin; the fly wings are 1.4 mm slabs.
- 70,000 to 90,000 triangles; a rebuild takes 0.2 to 0.5 s in the browser, and sliders use a coarse mesh while moving (kit behaviour).
- The Sculpt tab works on every piece (head, eyes, arms, legs, tongue, fly, pad). Pulling the fly or tongue off its support will show the "Sculpted models may have print errors" flag.
