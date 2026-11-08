# Battery Dispenser (slot 111)

`programs/battery-dispenser.html`, in the Organisation group. A battery-shaped block with two slots on top, one for AA and one for AAA. Each slot is a vertical shaft; batteries lie on their sides and stack. The bottom battery rolls down a small ramp and rests against a lip, half out of the front. Lift it over the lip and pull, and the rest of the stack drops one place and the next battery rolls into the pocket. There is nothing to assemble and nothing moves: one printed part.

Nothing here has been physically printed. The battery clearances, the ramp, the lip and the arch are unproven until a real print. Print it with 3 walls or more; it is mostly solid at the divider and end walls.

## Layout

Y up, millimetres. Batteries lie along X. The AA channel opens to +Z (the front), the AAA channel to -Z (the back). Per channel, `q` is the distance out from the divider face, so `z = s * (D/2 + q)` with `s = +1` for AA and `-1` for AAA.

| Mesh | What it is |
| --- | --- |
| `body` | Overlapping closed shells that a slicer unions: the floor plate, the housing (divider and end walls in one shell, with a notch for each channel), per channel a ramp wedge, a shelf slab and the arched front wall, and the base ring. Shells overlap by 0.37 to 0.43 mm and never share an edge, so the mesh check sees each as a closed solid. |
| `sleeve` | The raised wraps that make it read as a battery: the crimp band at the top, the label sleeve over the plain upper body (above the window arches, 0.8 mm proud) and each has a 45 degree taper underneath. Own part in the Color tool, so it can be painted another colour. |
| `terminal` | The positive terminal nub, on the divider between the two slots. |
| `label` | Optional raised letters on the top deck in front of each slot: AA (two letters) beside the AA slot, AAA (three) beside the AAA slot, 0.8 mm proud, apex towards the slot. |

## Body shape

`shape` is Block (a rounded rectangle, `corner` sets the rounding) or Round (a cylinder). Round is a circle cut flat by the front and back planes where the windows are, so every piece that reaches the front (shelf, arch wall, label deck) stays flush and the side walls keep the full `wall` thickness. The circle radius is the smallest that reaches the corners of those flat cuts, so Round is about 90 mm across with defaults.

The Sculpt tab is off (`sculpt: false`): the body is a set of overlapping shells, and moving or deleting one of them breaks the part.

## How a channel works (per battery size)

- **Shaft**: `d + 2 * clear` wide (front to back) and `l + 2 * clear` long, open at the top. Batteries are AA 14.5 x 50.5 mm and AAA 10.5 x 44.5 mm.
- **Ramp**: the floor slopes 8 degrees (`SLOPE`) down towards the front, ending at a **lip** `lip` mm high (scaled by battery size, so an AAA lip is 72% of an AA lip). A battery rolls to the lip and rests on the ramp and the lip corner, with its front about 6.5 mm (`POCKET`, scaled) out in front of the shaft.
- **Shelf**: a flat tray (`shelf` mm deep) in front of the lip, level with the lip top, so a lifted battery lands on it and slides out.
- **Arched front window**: the front wall over the window has an inverted-V underside that rises 1.1 mm per mm from each end wall (`ARCH_K`, 42 degrees from vertical). It prints without supports because every layer grows inwards from the end walls. The apex is about 28 mm above the springing. The arch starts `EXIT_GAP` (1.6 mm) above the top of battery 1 as it is lifted over the lip, and battery 2 cannot leave the shaft because the arch still covers its ends.

## The dispense checks

`MM_GENERATOR.info.dispenseCheck(channel, stack)` returns the numbers below for any settings. They hold for defaults, every preset and 6000 random and extreme slider combinations (see the PR for the run).

- `exitGap`: room above battery 1 while it is lifted over the lip, measured at the ends of the arch. Always 1.6 mm.
- `holdTravel`: how far battery 2 can move forward (worst case, shifted a full clearance to one side) before the arch stops it. Under 2.4 mm in every case tried, so it cannot leave.
- `rampForce`: the ramp's push on battery 1 with the whole stack leaning on it, in battery weights. Must stay above 0: if it went negative the stack would lift battery 1 over the lip on its own. The minimum over the 6000 runs is 0.72.

The check places battery 1 touching the ramp and the lip corner, battery 2 touching the shaft's back wall and battery 1, and treats every contact as frictionless. Real batteries have a little friction, which helps.

## Parameters

Stack height (4 to 14 AA; the AAA fits more), clearance (0.3 to 0.7 mm each side), lip height (3.0 to 4.5 mm), shelf depth, body shape (Block or Round), side wall, divider width, floor, corner rounding (Block only), battery sleeve on/off, top labels on/off, top band and terminal nub height. The ramp angle and pocket reach are constants in the page, not sliders, because the dispense checks only hold for that pair: changing them breaks the stack at some other settings.

Higher stacks make the block taller (about 125 mm for 8, 180 mm for 12). The 184 mm bed fits up to 12.

## Parametric and move in one tab (experiment)

This is the first generator with `partEdit: true` ([generator-styling.md](generator-styling.md#part-edit-parametric-plus-move-in-one-tab-experimental-cfgpartedit)). The Sculpt tab is kept for the brushes only (no move tool there). On the Parametric tab, tap the Battery body, Sleeve, Top band, Terminal nub, AA label or AAA label to highlight it and drag it around; a mini window shows just that part's sliders (`part` tags on the parameters, `sculptLink` joins the shells). The page classifies shells in `sculptLink` by mesh name, height (the band sits above `lastH - 12.3`) and z side (AA front, AAA back). A moved part is not print-checked as a design, so the flag shows.

## Known open items

- Unprinted. Check that a battery rolls to the lip on a printed ramp and lifts out over it without catching the arch.
- The AA channel is the front, the AAA the back; there is no label on the body, only the different slot widths.
- Hologram tile and side-panel render are of the first version (no sleeve, labels or round shape); re-render them if the look should match.
