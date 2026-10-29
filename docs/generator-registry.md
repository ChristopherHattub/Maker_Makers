# Generator Registry

The homepage shows generators as grouped, connected tiles. Generators are listed in `GENERATORS` in [`js/programs.js`](../js/programs.js), which builds the `PROGRAMS` array the site uses. Slots are fixed numbers; the homepage only shows slots that have a `programUrl`, so gaps are fine.

## The generator shape

```js
{
  slot: 14,                // Unique number. Becomes id 'SLOT-14'.
  title: '',               // Tile label and viewer title
  category: '',            // Short label, e.g. "CHRISTMAS // GIFTS" (also searchable)
  bundle: 'christmas',     // Optional: group id (or array of ids); none = the automatic "More" region
  thumbnailUrl: '',        // SVG for the details panel and the Workshop; its basename is the hologram tile id
  programUrl: '',          // Standalone generator HTML loaded in the viewer iframe
  description: ''          // Searched by the homepage search box
}
```

## Groups (BUNDLES)

`BUNDLES` in `js/programs.js` defines the regions of the homepage world map. Related groups are placed next to each other.

```js
{
  id: 'halloween',                    // Used by the generator `bundle` field
  name: 'Halloween',                  // Region heading
  description: 'Plain text.',         // Shown under the heading and in the details panel
  accent: '#ff8a1f',                  // Region tint, connectors and hover glow
  planned: false,                     // true = reserved placeholder region with no generators yet
  generators: ['SLOT-02', 'SLOT-03']  // Optional ordered member ids
}
```

Members are the ids in `generators` plus every `GENERATORS` entry whose `bundle` field names the group. Position and size are automatic: each region is sized to its tiles and packed around the Workshop tile. Older entries still carry `at` and `size`; they are ignored. Any generator in no group lands in an automatic "More" region. See [homepage.md](homepage.md).

The full list of built slots, reserved ranges (76-90 animals) and the next free slot is in [slot-registry.md](slot-registry.md).

## Active slots

A slot is **active** when it has a `programUrl`, and only active slots get a homepage tile. Slots in use today: 1 to 65, except 14. The homepage tile shows the generator's hologram (`assets/thumbnails/sprites/holo-<id>.webp`, see [hologram-tiles.md](hologram-tiles.md)); a tile with no hologram and no `thumbnailUrl` shows a plus sign. The viewer reads `programUrl` directly.

## The generator contract

A generator is a page in `programs/` that loads the shared engine. The page holds only its own config (parameters, presets, palette and geometry). The layout, viewport, Parametric and Color tabs, and exports all come from `programs/shared/`. The full contract is in [generator-styling.md](generator-styling.md). In practice:

- Put the page in `programs/` (for example `programs/ghost-builder.html`) and load `programs/shared/generator.css` and `programs/shared/generator-core.js`.
- It is loaded in an `<iframe>` in the viewer. Its sliders, Color tool and export buttons appear inside that frame.
- It must work with no server and no build step. It can fetch three.js from its CDN, and nothing else.
- The generator's "Download standalone .html generator" button (Print tab) saves one self-contained file with the shared files inlined.
- Exporting happens inside the generator. The viewer's **Save STL** just presses the generator's Export .STL button, and **Send to Workshop** hands the model to the Workshop (see [workshop.md](workshop.md)).

Use relative paths only, such as `programs/ghost-builder.html`, never a path starting with `/`. Relative paths work locally and under a GitHub Pages project URL.

## Adding a generator

1. Copy the generator's HTML file into `programs/`, for example `programs/honeycomb-hook.html`.
2. Add its thumbnail to `assets/thumbnails/`, for example `assets/thumbnails/honeycomb-hook.svg` (start from the skill's `thumbnail-template.svg`).
3. Add an entry to the `GENERATORS` list in `js/programs.js` with the next free `slot` number. Any slot number works:

   ```js
   {
     slot: 66,
     title: 'Honeycomb Wall Hook',
     bundle: 'organization',
     category: 'HOOKS & WALL STORAGE',
     thumbnailUrl: 'assets/thumbnails/honeycomb-hook.svg',
     programUrl: 'programs/honeycomb-hook.html',
     description: 'Parametric wall hook with adjustable hole count, spacing and wall thickness.'
   }
   ```

   Fields you leave out stay blank.

4. Render its hologram tile (see [hologram-tiles.md](hologram-tiles.md)) and commit `holo-<id>.webp` with `manifest-v2.json`.
5. Run `npm run dev` and open the tile to check the hologram, the details panel, the viewer, Save STL and Send to Workshop. See [development.md](development.md).

The full step-by-step (printability checks, palette, thumbnail style) is in the generator skill, `.claude/skills/makermakers-generator/SKILL.md`.

## Navigation

The URL hash tracks the screen, so the browser Back and Forward buttons work: no hash is the homepage map, `#/generator/SLOT-01` is a generator, `#/workshop` is the Workshop, `#/map` is the printer map. Back from a generator returns to the map. The generator iframe is swapped with `location.replace` so it adds no history entries of its own.

## Notes

- `initSplash()` builds the map at page load. Edits to `programs.js` appear after a reload (the dev server reloads automatically).
- Titles, categories and descriptions are plain text; the homepage escapes them.
