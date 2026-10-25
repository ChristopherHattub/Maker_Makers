# Featured Carousels

The home screen has two rotating or scrolling strips above the 4 x 10 grid. They are different features with different data.

| Strip | Data | Status |
| --- | --- | --- |
| **[01] Featured Generator Modules** | `PROGRAMS` slots where `featured` is true | Shipped |
| **[01B] Featured Community Models** | `FEATURED_MODELS` in `js/featured.js` | In progress (uncommitted) |

## [01] Featured Generator Modules

This is a slide carousel built from the generator registry.

**Data.** `initSplash()` in `js/app.js` filters `PROGRAMS` to `featured` entries and stores them in `featuredList`. Each entry becomes one slide. Slots 1 to 3 are featured by default (see [generator-registry.md](generator-registry.md)).

**Slide contents.** Each slide shows the slot socket (thumbnail or empty bay), a "FEATURED SLOT 0N // STANDBY" badge, the title, description, a spec table (socket id, target exports, status), and an "Inspect Slot Shell" button. The button calls `openProgram(id)` for that slot.

**Empty slides.** A featured slot with no title shows "[ EMPTY FEATURED SLOT 0N ]" and a placeholder description.

**Controls.**
- PREV and NEXT buttons call `moveCarousel(-1)` and `moveCarousel(1)`. They wrap around.
- Dots call `goToSlide(i)`. The dot for the current slide is marked active.
- Autoplay advances one slide every 5.5 seconds (`startCarouselAutoPlay()`).
- Any manual control restarts the 5.5-second timer.

Moving is done by setting `translateX(-N * 100%)` on `#carousel-track`. Each slide is a full-width flex item.

**Known gaps.** Autoplay does not pause on hover or focus, and there is no reduced-motion check in this carousel. The Featured Community Models strip does have both.

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
