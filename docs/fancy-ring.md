# Fancy Ring (slot 102)

An engagement ring display prop, `programs/fancy-ring.html`. It opens on the **Ring studio** tab, which shows the ring as jewellery through the engine's [showcase render](generator-styling.md#showcase-render).

## Real options

| Option | Values |
| --- | --- |
| Cut | Round, oval, princess, emerald (step cut), pear, cushion. Brilliant cuts have a table, stars, kites, upper and lower girdle facets and mains. |
| Carat | 0.25 to 3 ct. Width comes from the usual estimate `ct = k x length x width x depth`, with `k`, length ratio and depth set per cut (`CUT_DATA`). 1 ct round is about 6.5 mm. |
| Setting | 4 prong, 6 prong, bezel, halo, three stone. |
| Band | Plain, tapered, split shank. Flat, domed, comfort fit or knife edge profile. Width and thickness. |
| Size | US 3 to 13 in quarter sizes: inside diameter `11.63 + 0.8128 x size` mm. |
| Look | Yellow gold, rose gold, white gold, platinum. Diamond, sapphire, ruby, emerald, morganite. These set the studio render and the starting colors. |
| Engraving | Up to 24 characters cut into the inside of the band at the back: a single-stroke V groove (`FONT`), A-Z, 0-9, some punctuation and a heart. |

Everything is designed in real millimetres. **Display scale** then enlarges it (default 2x, so a prong is about 2 mm thick). 1x is real size and is only for resin printers.

## How it prints

`printMeshes` lays out the print plate, shown in the Print tab:

- **Two halves (default).** The ring is cut through its middle by `clipShell` and each half lies on its cut face, so everything rises from the bed and no supports are needed. Glue the halves together around the stone. The seam runs around the middle of the band and across the engraving.
- **Whole (supports).** The ring lies flat in one piece. The head overhangs, so the check goes red and it needs supports.
- **Stones.** One to three separate stones print table up on a flat culet. The culet is cut flat for this (real stones come to a point) and sits hidden in the cup. The pavilion is 45 degrees, close to a real stone's 41.

The split shank needs supports in either layout: the roof of the gap between the strands is too flat. Its option says so, and no preset uses it. A princess stone needs small supports inside its cup (the square pocket's roof is too flat), and the studio says so. Some settings over about 2 ct also get a warning.

Nothing here has been printed yet.
