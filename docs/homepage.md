# Homepage

The home screen is a searchable hub of **clusters**. Each cluster is a themed group of generators (Halloween, Christmas, Fidgets...), shown as small square thumbnail tiles joined by glowing connector lines. It is built to keep working with hundreds of generators.

## How it behaves

- **Hover or keyboard focus:** the tile lifts and scales up, its border lights in the cluster's accent colour, a pool of energy glows on the floor beneath it with a repeating ripple, and the connectors next to it brighten.
- **Touch:** there is no hover, so a press gives a short lift before the generator opens.
- **Search:** the box filters tiles live by title, category, description and group id. Clusters with no match hide.
- **Wrapping:** tiles wrap to the next row on narrow screens. `markRowStarts()` in `js/app.js` hides the connector on the first tile of each row so no line dangles.
- **Reduced motion:** transitions and the ripple are turned off.

The site collects no data. Search runs locally in the page.

## Scaling

Nothing is hand-placed. `initSplash()` renders every group in `BUNDLES` and every active generator in it, so adding a generator (or a whole group) is a data change in `js/programs.js`; see [generator-registry.md](generator-registry.md). Generators in no group appear in an automatic "More" cluster. Tile size is two CSS variables (`--tile`, `--gap`) on `.cluster`. Thumbnails use `loading="lazy"`.

Ideas for when the count gets large: collapse clusters beyond the first few, or add a group-chip row that scrolls to a cluster.

## Files

- Markup: `#splash-screen` in `index.html`
- Rendering: `createTileHTML`, `createClusterHTML`, `markRowStarts`, `filterHub` in `js/app.js`
- Style: the "HOMEPAGE HUB" section at the end of `css/styles.css`
