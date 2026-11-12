# Whale & Dolphin (slot 131)

A humpback whale, an orca or a dolphin floating in a wave base. It is built from the animal kit
([animals.md](animals.md)); the source is `tools/animals/whale-dolphin.js` and `programs/whale-dolphin.html` is generated
by `node tools/animals/build.mjs whale-dolphin` (edit the source, not the page). Category `ANIMALS // SEA LIFE`, bundle `animals`.

## What you can change

| Group | Controls |
| --- | --- |
| Creature | Creature (humpback, orca, dolphin), body length, tail pose, back arch |
| Fins | Fin size (dorsal fin and flippers), tail fluke span |
| Waves | Base shape (oval or rounded rectangle), base thickness, wave height, wave length |
| Name tab | The name to engrave, letter height, engraving depth |

Tail pose: **Cruising** (body straight, flukes lie flat on the water), **Curled tail** (the tail swings sideways, flukes flat),
**Tail up (dive)** (the tail rises out of the water and the flukes stand as a V).

## How it prints with no supports

- **Half-sunk body.** The body is a swept tube whose axis sits only about half a radius above the waterline, so the flank
  it shows above the water is never more than about 30 degrees off vertical. The water around it is a ridge that follows the
  body (`Wf()` in the source), so even with Back arch raised the body is always cradled by water.
- **Flat sheets on the waves.** Flippers and flat flukes are thin sheets whose underside is buried in the wave height field
  (`sheet()`), so nothing hangs in the air at any wave height. Humpback flippers are long and scalloped, orca flippers are
  broad paddles, dolphin flippers are slim and swept.
- **Tail up.** The tail stock leaves the body in a quarter bend on its own mound of water, then rises vertically. The fluke V widens by at most
  0.5 mm per mm of height (steeper than 60 degrees from flat), so a bigger fluke span only makes the V taller, not flatter.
  The span is capped at about 28 mm in this pose.
- **Plinth.** The base wall is a separate smooth shell (`wdPlinth`), because the sculpted grid stair-steps a tall curved wall.
  The sea sits on top of it. The wall height is `Base thickness - 1.1 x wave height - 0.8`, so wave troughs never expose the plinth top.

## Engraved name

The name is a V groove (45 degree walls, 0.5 to 1.5 mm deep) in the front (+z) wall of the plinth, in the stroke font copied from
the Name Keychain (capitals, digits and `- . ! '`, up to 14 characters, shrunk to fit). It is cut into an exact mesh with extra rings and angles
where the lettering is, so strokes stay crisp. Letters can be at most `base thickness - 1.1 x wave height - 4.2` mm tall; a taller base leaves room for bigger letters, and a base too thin for 2 mm letters skips the name.
Engraving the whale's own flank was tried first and dropped: the sculpt grid (about 1.5 mm) turns strokes narrower than a cell into faint dimples.

## Colours and pieces

Mesh entries (Color tab parts): body, belly, eye patches and saddle (orca), dorsal fin, flippers, tail flukes, sea, foam, base, eyes, pupils, eye glints.
Sculpt tab pieces: body, head, eyes and pupils, dorsal fin, each flipper, flukes, waves, base.

## Checks and open items

- `check-mesh.mjs --all` is clean (watertight, no supports needed) for the defaults and all seven presets; a sweep of species x pose x
  slider extremes (length 80 and 140, arch 0 and 10, fin and fluke sizes, waves 0 and 5, both base shapes, letter height and depth maxima) is clean too.
- A rebuild takes roughly 1.3 to 3.8 seconds in Node (about 100,000 triangles); dragging a slider uses a coarser draft mesh.
- **Unprinted.** The 1 to 3 mm flipper and fluke sheets, the thin tail stock in the Tail up pose and the engraving depth are unproven on a real printer.
- The whale's belly is under water; only a pale band shows at the waterline.
