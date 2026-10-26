# Generator Registry

The generators grid has at least 40 slots and grows without limit. Generators are listed in `GENERATORS` in [`js/programs.js`](../js/programs.js), which builds the `PROGRAMS` array the site uses.

## The slot shape

The grid always shows at least `MIN_SLOTS` (40) sockets, four per row. It adds rows automatically: the slot count is the highest filled slot plus one spare row, rounded up to a full row. Add a generator with slot 41 and a new row appears; the page just scrolls further down. Each `PROGRAMS` entry looks like this:

```js
{
  id: 'SLOT-01',          // Generated: 'SLOT-' + two-digit slot number. Do not change.
  slot: 1,                // Generated: 1 upward. Shown as "#1" on the socket.
  title: '',              // Name shown on the socket and in the viewer
  category: '',           // Short label under the title, e.g. "HOOKS & WALL STORAGE"
  bundle: 'halloween',    // Optional: id (or array of ids) of the bundle(s) this generator belongs to
  thumbnailUrl: '',       // Image shown on the socket
  programUrl: '',         // Standalone generator HTML loaded in the viewer iframe
  description: ''         // Shown in the carousel
}
```

Each `GENERATORS` entry sets `slot` plus any of these fields. Only `title`, `category`, `thumbnailUrl`, `programUrl`, `description` and `bundle` are meant to be edited. `id` is generated from `slot`.

**Featuring.** Individual generators are not featured. The Featured carousel shows bundles (see below).

## Bundles

`BUNDLES` in `js/programs.js` groups generators. Bundles are not grid items. They appear as filter chips above the generators grid (picking one shows only its generators; "All" shows everything) and, when `featured: true`, as a slide in the Featured carousel (the only thing in it).

```js
{
  id: 'halloween',                 // Used by the generator `bundle` field and the filter
  name: 'Halloween Bundle',        // Chip and carousel title
  description: 'Plain text.',      // Carousel text
  featured: true,                  // Show in the Featured carousel
  generators: ['SLOT-02', 'SLOT-03']  // Optional ordered member ids
}
```

Members are the ids in `generators` plus every `GENERATORS` entry whose `bundle` field (a string or an array) names the bundle, merged without duplicates. Only generators with a `programUrl` count. After load, each bundle has `members` (resolved programs) and each program has `bundles` (ids). To add a bundle, append an entry and tag its generators; nothing else needs to change.

## Empty and active slots

A slot is treated as **active** when it has a `programUrl`:

| Condition | Socket | Carousel status | Viewer |
| --- | --- | --- | --- |
| No `thumbnailUrl` | Crosshair with "[ EMPTY SOCKET ]" | — | — |
| No `programUrl` | — | "EMPTY TEMPLATE" | "[ NO GENERATOR LOADED ]" message; Download button disabled |
| `programUrl` set | — | "ONLINE" | Program loads in the iframe; Download button enabled |

The viewer reads `programUrl` directly, so a slot can have a title and thumbnail before its program is ready.

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
