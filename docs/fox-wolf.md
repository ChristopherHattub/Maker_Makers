# Fox & Wolf (slot 127)

A sitting or howling canine in the `animals` group, sculpted as one seamless surface with the shared animal kit (`tools/animals/animal-kit.js`). Source: `tools/animals/fox-wolf.js`; rebuild the page with `node tools/animals/build.mjs fox-wolf`. Check with `sh tools/animals/checkall.sh fox-wolf` or `node tools/animals/pc.mjs programs/fox-wolf.html --preset "Howling wolf"`.

## Options

| Group | Option | Notes |
| --- | --- | --- |
| Animal | Shape | **Bust** (shoulders and chest on an optional round base) or **Full body** (sitting on the haunches with front legs, hind feet and a tail). |
| Animal | Pose | **Sitting** (head level) or **Howling** (head tipped back, 35 to 70 degrees; the Howl angle slider shows only then). |
| Animal | Coat | Red fox, Grey wolf, Arctic or Desert sand: the starting colours of body, chest, paws, ears and tail tip. Everything can be repainted in the Color tool. |
| Animal | Style | **Smooth**, **Soft facets** or **Low-poly**. The kit's grid cell grows from 1.3 to 2.3 to 3.4 mm, the surface smoothing is turned off and the engine's `creaseShading` is set from `build()` so the triangles read as flat facets. Ears, legs and the tail get thicker at the coarser levels because anything thinner than about two cells would break up. |
| Head | Ear shape | **Fox** (tall, pointed), **Wolf** (shorter, a rounded tip) or **Fennec** (huge). Ears are smooth plates added after the sculpt (`vslab`), so their edges stay crisp at every style. |
| Tail (full body) | Tail size, Tail curl, Tail tip | The tail is a bushy brush that lies on the bed and turns toward the side by 0 to 215 degrees. The tip can be painted a separate colour. |

## Print notes

- Defaults and every preset report "no supports needed" except Low-poly fox, which has one small warning (about 4 mm2 near the paws). The kit's support pass is stricter than usual here (`S.reach` 0.5, 0.6 when howling, lower again at coarse styles) because the tail and paws carry small overhangs at some tail-curl values; sweeping Tail curl 0 to 100 and Tail size 0.6 to 1.4 leaves at most one or two warnings of 1 to 2 mm2, never an error.
- Ears are rooted deep inside the skull with a narrow base. In the howling pose the ears lean back by up to 18 degrees only, so they never overhang.
- The nose, eyes and pupils are 42 to 46 degree domes placed on the finished surface (they print with no supports).
- Nothing here has been printed. The thin ears (4.2 mm), the carved mouth line (0.75 mm radius, off at Low-poly) and the tail wrapping close to the hind feet are unproven.
