# Character Creator (slot 138)

`programs/character-creator.html`, bundle `tabletop`. A tabletop miniature (about 30 mm tall by default, scalable) customized like a video-game character. Everything is original and generic fantasy; no trademarked designs.

## Tabs

- **Hero**: name (typed or "Roll a name", per-race syllables), race (Human, Elf, Dwarf, Orc, Halfling, Drakeling), class (Fighter, Wizard, Rogue, Cleric, Ranger, Barbarian, Paladin, Bard, Warlock, Druid, Monk, Sorcerer) and a colour row per role. Race and class are chip grids in `mount`; the real parameters are hidden and the chips follow presets via `onFrame`.
- **Pose**: Heroic stand, Battle ready, Lunge, Casting, Sneak, Triumph. Left or right handed (mirrors x).
- **Companion**: none, Wolf, Cat, Raven, Baby dragon, Slime, three poses each.
- **Base**: round, rounded square, hex, octagon; height; ground cover (none, cobblestones, rubble, grass tufts); name plaque with raised lettering on the front.

The sculpt tab is off (`sculpt: false`).

## How it is built

Every primitive (blob, tube, limb, lathe, taper, curve, prism) is its own closed shell and the slicer unions the overlaps. Poses are authored for a 32 mm human and squashed for the chibi proportions (legs 0.84). The base is a chamfered hull of its outline and grows to cover the feet and the companion.

## Support-free rules

Raised forearms climb at least 55 degrees, elbows tuck against the torso with a gusset, shield, bow and staff reach the base, cape hems reach the ground, hat brims turn up. Chamfers are steeper than 45 degrees.

## Verified and unproven

Defaults and all 13 presets are watertight; the Default hero has no overhang and the other presets are WARN only (1 to 6 mm²). A sweep of all 432 race, class and pose combinations is watertight, but about 70 show overhang ERRORs (8 mm² or more), mostly Lunge and Sneak, Orc and Drakeling bulk and robes in a lunge. CI checks only defaults and presets. Nothing has been printed: thin weapon blades, the bow (reads as a stick from the front), hands, and the small chin, snout and crotch overhangs are unproven.
