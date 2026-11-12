# Bunny & Hare Sitter (slot 126)

A rabbit sculpted as one soft surface with the animal kit (`tools/animals/animal-kit.js`). Source: `tools/animals/bunny-sitter.js`; edit it and run `node tools/animals/build.mjs bunny-sitter` (the page is generated and committed). The thumbnail is written by `tools/animals/make-thumbs.py`. Different from the Easter Bunny Builder (slot 31, a lathe-built toy): this one is a sculpted, hand-posed animal.

## Options

| Group | Controls |
| --- | --- |
| Pose | **Sitting bunny**, **Standing hare** (long legs, lean body) or **Loaf**; overall size; body slim to plump; hare leg length (hare pose only). |
| Ears | Upright, Lop, or Half lop (one up, one down); ear length (bunny to hare, 0.5 to 1.7); spread of upright ears. |
| Head | Head size, muzzle from cute to hare, eye size. |
| Tail | Pom-pom, fluffy tuft (a rosette of puffs) or hare scut (short, upturned, dark tip); fluff amount. |
| Extras | Prop: none, carrot, tulip or daisy; markings: plain, patches or blaze. |

Presets: Default bunny, Lop bunny, Easter bunny (carrot, blaze), Standing hare, Long-legged hare, Sitting hare, Loaf with a flower, Spring daisy bunny.

## How it stays support-free

- The body is blended ellipsoids and limbs; the kit's support pass (`Sculpt.run`) trims anything not reachable within about 27 degrees of the solid below. Hence the shapes below.
- The sitting body and loaf are ellipsoids centred well above the bed with their bottoms below it, so the belly is a wide flat base and the lower flanks stay under 50 degrees. A body centred too low gets a steep undercut that the print check flags.
- Feet and paws dip 1.5 mm or more below the bed (a foot that only touches the bed disappears in the support pass). The tail pom-pom and tuft sit on the bed behind the rump.
- **Standing hare:** the kit cannot bridge a gap under a belly, so the legs are tucked under the body (front legs beneath the chest, the big haunch and long hind foot behind them). The belly then makes a small pointed arch between the legs, like the Dog Builder's standing pose but closed up. A longer leg slider raises the body; the gap stays small.
- Upright ears are vertical plates (`Sculpt.plate`) rooted inside the head, leaning out by the spread slider. The pink inside is a `paint` region on the front face only. Lop ears are drooping ellipsoids against the cheeks; the support pass trims their lower tips to a wedge that meets the head.
- The nose dome meets the muzzle at 45 degrees (a 55 degree dome with a tilted normal gave a small overhang).
- The carrot (leaning against the chest in the sitting pose, tip on the bed; lying on the bed otherwise) and the tulip and daisy are smooth shells (`sweep`, `horn`, `loft`, `dome`) added after the sculpt, so they are separate pieces in the Sculpt tab. The tulip and daisy stand on a stem that starts on the bed.

## Print check status

Defaults and all eight presets read "no supports needed". A sweep of every slider's minimum and maximum in all three poses was run; a few extremes (largest head, hare at 130% size, hare with lop ears and a flower prop) show a small overhang warning of 1 to 3 mm2. The head size slider stops at 1.1 for that reason. Nothing has been physically printed: the thin ears (about 4 mm), the slim hare legs (about 6 mm across at the ankle) and the flower blooms are unproven.

## Sculpt tab

Pieces: head, muzzle, nose, both ears, both eyes and pupils, body, tail, the carrot or flower, and the four legs.
