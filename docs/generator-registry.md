# Generator Registry

The site has 40 generator slots. They are defined in one array, `PROGRAMS`, in [`js/programs.js`](../js/programs.js).

## The slot shape

`programs.js` builds the array with `Array.from({ length: 40 }, ...)`. Each entry looks like this:

```js
{
  id: 'SLOT-01',          // Generated: 'SLOT-' + two-digit slot number. Do not change.
  slot: 1,                // Generated: 1 to 40. Shown as "#1" on the socket.
  title: '',              // Name shown on the socket and in the viewer
  category: '',           // Short label under the title, e.g. "HOOKS & WALL STORAGE"
  featured: index < 3,    // true puts the slot in the Featured Generator carousel
  thumbnailUrl: '',       // Image shown on the socket
  programUrl: '',         // Standalone generator HTML loaded in the viewer iframe
  description: ''         // Shown in the carousel
}
```

Only `title`, `category`, `thumbnailUrl`, `programUrl`, `description` and `featured` are meant to be edited. Keep `id` and `slot` as generated.

**Default featured slots.** The code sets `featured: index < 3`, so slots 1 to 3 are featured out of the box, even though the README says to set `featured: true` by hand. To feature a different slot, change its `featured` value. To stop featuring a slot, set it to `false`.

## Empty and active slots

A slot is treated as **active** when it has a `programUrl`:

| Condition | Socket | Carousel status | Viewer |
| --- | --- | --- | --- |
| No `thumbnailUrl` | Crosshair with "[ EMPTY SOCKET ]" | — | — |
| No `programUrl` | — | "EMPTY TEMPLATE" | "[ NO GENERATOR LOADED ]" message; Download button disabled |
| `programUrl` set | — | "ONLINE" | Program loads in the iframe; Download button enabled |

The viewer reads `programUrl` directly, so a slot can have a title and thumbnail before its program is ready.

## The standalone generator contract

A generator is a single HTML file that runs on its own. The site does not pass it any data and does not read anything back. In practice:

- Put it in `programs/` (for example `programs/honeycomb-hook.html`).
- It is loaded in an `<iframe>` in the viewer. Its own sliders and export controls appear inside that frame.
- It must work with no server, no build step, and no external data it cannot fetch itself.
- Its "Download Program (.HTML)" button downloads the file by linking to `programUrl` with a `download` attribute. The file name becomes `SLOT-NN-generator.html`.
- The two "Export .STL / .3MF" buttons in the viewer are placeholders. They are disabled and not wired to anything; exporting happens inside the generator.

Use relative paths only, such as `programs/honeycomb-hook.html`, never a path starting with `/`. Relative paths work locally and under a GitHub Pages project URL.

## Adding a generator

1. Copy the generator's HTML file into `programs/`, for example `programs/honeycomb-hook.html`.
2. Add its thumbnail to `assets/thumbnails/`, for example `assets/thumbnails/honeycomb-hook.png`.
3. Fill in the slot in `js/programs.js`. The file has no per-slot data yet: all 40 entries come from one `Array.from` call, and every slot is blank. So give slot 4 its values by replacing its generated object with a literal entry, keeping `id` and `slot` matching the position:

   ```js
   {
     id: 'SLOT-04',
     slot: 4,
     title: 'Honeycomb Wall Hook',
     category: 'HOOKS & WALL STORAGE',
     featured: false,
     thumbnailUrl: 'assets/thumbnails/honeycomb-hook.png',
     programUrl: 'programs/honeycomb-hook.html',
     description: 'Parametric wall hook with adjustable hole count, spacing and wall thickness.'
   }
   ```

   If you fill many slots, consider moving the data into a plain list of overrides, so the generator function stays unchanged.

4. Run `npm run dev` and open the slot to check the thumbnail, the viewer, and the download button. See [development.md](development.md).

## Notes

- `initSplash()` renders the grid once, at page load. Edits to `programs.js` appear after a reload (the dev server reloads automatically).
- Titles, categories and descriptions are inserted as HTML without escaping, so use plain text only. See [Known issues](architecture.md#known-issues).
