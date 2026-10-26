# Featured Carousels

The home screen has two rotating or scrolling strips above the generators grid. They are different features with different data.

| Strip | Data | Status |
| --- | --- | --- |
| **[01] Featured Bundle** | `BUNDLES` entries where `featured` is true | Shipped |
| **[01B] Featured Community Models** | `FEATURED_MODELS` in `js/featured.js` | In progress (uncommitted) |

## [01] Featured Bundle

A slide carousel built from `BUNDLES` in `js/programs.js` (see [generator-registry.md](generator-registry.md#bundles)). Only bundles marked `featured: true` with at least one member appear, and individual generators are never featured on their own.

**Slide contents.** Each slide shows a collage of the member thumbnails (each opens that generator), a "FEATURED BUNDLE" badge, the bundle name and description, a spec table and a "View Bundle" button. The button selects that bundle in the filter chips above the generators grid and scrolls to it. On narrow screens the slide stacks: collage on top, text below.

**Controls.** PREV and NEXT wrap around, dots call `goToSlide(i)`, and autoplay advances every 5.5 seconds (restarted by any manual control).

**Known gaps.** Autoplay does not pause on hover or focus, and there is no reduced-motion check in this carousel.

## [01B] Featured Community Models

This is a horizontal strip of cards that shows user-made STL thumbnails. It is separate from the generator carousel, and it links out rather than opening the viewer.

**Status.** The HTML, CSS and script are in the working tree but not yet committed. The data is placeholder content: eight entries named "Placeholder Model 01" to "08", with `Maker Name` and `Generator Name` as fields and SVG placeholder thumbnails in `assets/thumbnails/featured/`. Replace them with real entries before shipping.

**Data.** `js/featured.js` defines `FEATURED_MODELS`. Each entry:

```js
{
  title: 'Placeholder Model 01',
  creator: 'Maker Name',
  generator: 'Generator Name',
  thumbnailUrl: 'assets/thumbnails/featured/placeholder-01.svg',
  url: ''                       // Where the card links to; '#' is used if empty
}
```

To add a model: put the thumbnail in `assets/thumbnails/featured/` and add one entry to the array.

**Rendering.** `createFeaturedCardHTML()` builds each card as a link. A card shows the thumbnail, the title, and "BY creator // generator". With no thumbnail it shows an empty socket with "[ NO THUMBNAIL ]". `initFeaturedStrip()` fills `#featured-track` at load.

**Layout.** The strip is a horizontal scroller with hidden scrollbars. Cards are sized with CSS variables: about 5.5 cards are visible on desktop, 3.5 below 1100px, and 1.5 below 680px so the next card peeks in.

**Motion.** It scrolls one card every 3.5 seconds and wraps to the start at the end. It pauses while the pointer is over the strip or focus is inside it. With `prefers-reduced-motion: reduce`, or fewer than two models, it does not scroll at all.
