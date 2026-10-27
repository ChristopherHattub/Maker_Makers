# Generator Registry

The homepage shows generators as grouped, connected tiles. Generators are listed in `GENERATORS` in [`js/programs.js`](../js/programs.js), which builds the `PROGRAMS` array the site uses. Slots are fixed numbers; the homepage only shows slots that have a `programUrl`, so gaps are fine.

## The generator shape

```js
{
  slot: 14,                // Unique number. Becomes id 'SLOT-14'.
  title: '',               // Tile label and viewer title
  category: '',            // Short label, e.g. "CHRISTMAS // GIFTS" (also searchable)
  bundle: 'christmas',     // Optional: group id (or array of ids)
  thumbnailUrl: '',        // Tile image
  programUrl: '',          // Standalone generator HTML loaded in the viewer iframe
  description: ''          // Searched by the homepage search box
}
```

## Groups (BUNDLES)

`BUNDLES` in `js/programs.js` defines the clusters on the homepage. Each group is a heading with its tiles joined by glowing connectors.

```js
{
  id: 'halloween',                    // Used by the generator `bundle` field
  name: 'Halloween',                  // Cluster heading
  description: 'Plain text.',         // Line under the heading
  accent: '#ff8a1f',                  // Connector and hover glow colour
  generators: ['SLOT-02', 'SLOT-03']  // Optional ordered member ids
}
```

Members are the ids in `generators` plus every `GENERATORS` entry whose `bundle` field names the group. Any generator in no group lands in an automatic last cluster called "More", so nothing is hidden. To add a group, append an entry and tag its generators; nothing else changes. See [homepage.md](homepage.md).

## Active slots

A slot is **active** when it has a `programUrl`, and only active slots get a homepage tile. A tile without a `thumbnailUrl` shows a plus sign. The viewer reads `programUrl` directly.

## The generator contract

A generator is a page in `programs/` that loads the shared engine. The page holds only its own config (parameters, presets, palette and geometry). The layout, viewport, Parametric and Color tabs, and exports all come from `programs/shared/`. The full contract is in [generator-styling.md](generator-styling.md). In practice:

- Put the page in `programs/` (for example `programs/ghost-builder.html`) and load `programs/shared/generator.css` and `programs/shared/generator-core.js`.
- It is loaded in an `<iframe>` in the viewer. Its sliders, Color tool and export buttons appear inside that frame.
- It must work with no server and no build step. It can fetch three.js from its CDN, and nothing else.
- The viewer's "Download Program (.HTML)" button, and the generator's own "Download standalone .html generator" button, both save one self-contained file. The shared files are inlined into it.
- The two "Export .STL / .3MF" buttons in the viewer are placeholders. Exporting happens inside the generator.

Use relative paths only, such as `programs/ghost-builder.html`, never a path starting with `/`. Relative paths work locally and under a GitHub Pages project URL.

## Adding a generator

1. Copy the generator's HTML file into `programs/`, for example `programs/honeycomb-hook.html`.
2. Add its thumbnail to `assets/thumbnails/`, for example `assets/thumbnails/honeycomb-hook.png`.
3. Add an entry to the `GENERATORS` list in `js/programs.js` with the next free `slot` number. Any slot number works, including past 40; the grid gets a new row by itself:

   ```js
   {
     slot: 4,
     title: 'Honeycomb Wall Hook',
     category: 'HOOKS & WALL STORAGE',
     thumbnailUrl: 'assets/thumbnails/honeycomb-hook.png',
     programUrl: 'programs/honeycomb-hook.html',
     description: 'Parametric wall hook with adjustable hole count, spacing and wall thickness.'
   }
   ```

   Add `bundle: '<bundle id>'` if it belongs to a bundle. Fields you leave out stay blank.

4. Run `npm run dev` and open the slot to check the thumbnail, the viewer, and the download button. See [development.md](development.md).

## Navigation

The URL hash tracks the screen, so the browser Back and Forward buttons work: no hash is the generators grid, `#/generator/SLOT-01` is a generator, `#/map` is the printer map. Back from a generator returns to the grid. The generator iframe is swapped with `location.replace` so it adds no history entries of its own.

## Notes

- `initSplash()` renders the grid once, at page load. Edits to `programs.js` appear after a reload (the dev server reloads automatically).
- Titles, categories and descriptions are inserted as HTML without escaping, so use plain text only. See [Known issues](architecture.md#known-issues).
