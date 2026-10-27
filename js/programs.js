// Slot registry. Add a generator by adding an entry to GENERATORS with the next free slot number.
// The grid grows by itself: it always shows at least MIN_SLOTS sockets, plus one spare row of
// empty sockets after the highest filled slot, so the page just gets longer as slots are used.
const MIN_SLOTS = 40;
const GRID_COLUMNS = 4;

const GENERATORS = [
  {
    slot: 1,
    title: 'Ghost Builder',
    bundle: 'halloween',
    category: 'SPOOKY // FIGURES',
    thumbnailUrl: 'assets/thumbnails/ghost-builder.svg',
    programUrl: 'programs/ghost-builder.html',
    description: 'Parametric ghost with folds, arms, a face and embossed stamps and carved jack-o-lantern faces. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 2,
    title: 'Pumpkin Plotter',
    bundle: 'halloween',
    category: 'SPOOKY // HARVEST',
    thumbnailUrl: 'assets/thumbnails/pumpkin-plotter.svg',
    programUrl: 'programs/pumpkin-plotter.html',
    description: 'Parametric pumpkin with adjustable ribs, texture, a curly stem, an optional hollow inside and embossed stamps and carved jack-o-lantern faces. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 5,
    title: 'Witch Hat',
    bundle: 'halloween',
    category: 'SPOOKY // HEADWEAR',
    thumbnailUrl: 'assets/thumbnails/witch-hat.svg',
    programUrl: 'programs/witch-hat.html',
    description: 'Parametric witch hat with adjustable cone height, swoop, lean and floppy tip, a curled or wavy brim, a raised hat band and a flat solid or hollow underside. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 7,
    title: 'Skull Sculptor',
    bundle: 'halloween',
    category: 'SPOOKY // BONES',
    thumbnailUrl: 'assets/thumbnails/skull-sculptor.svg',
    programUrl: 'programs/skull-sculptor.html',
    description: 'Parametric skull with adjustable eye sockets (size, tilt, shape, asymmetry), nose cavity, jaw and cheeks, plus a Mouth tab of picture presets (grin, fangs, gap tooth, open jaw and more) for the teeth. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 3,
    title: 'Spider',
    bundle: 'halloween',
    category: 'SPOOKY // CREATURES',
    thumbnailUrl: 'assets/thumbnails/spider.svg',
    programUrl: 'programs/spider.html',
    description: 'Parametric spider: shape the head and abdomen, set the eyes and number of legs, and bend, thicken and taper each leg. Emboss stamps like a mini spider, skull, web or bat. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 4,
    title: 'Snowman Stacker',
    bundle: 'christmas',
    category: 'CHRISTMAS // FIGURES',
    thumbnailUrl: 'assets/thumbnails/snowman.svg',
    programUrl: 'programs/snowman.html',
    description: 'Parametric snowman: size and stack the three balls, then pick a top hat, beanie or Santa hat, a scarf, a drooping carrot nose, coal eyes, mouth and buttons, and stubby arms. A Styles tab of picture cards sets a whole look. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 6,
    title: 'Snowflake Studio',
    bundle: 'christmas',
    category: 'CHRISTMAS // ORNAMENTS',
    thumbnailUrl: 'assets/thumbnails/snowflake.svg',
    programUrl: 'programs/snowflake.html',
    description: 'Flat printable snowflake ornament: set the number and length of arms, add rows of branches, change the centre and arm tips, and add a hanging loop. A Styles tab of picture cards (fern, lace, crystal and more) sets a whole look. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 8,
    title: 'Holiday Tree',
    bundle: 'christmas',
    category: 'CHRISTMAS // TREES',
    thumbnailUrl: 'assets/thumbnails/holiday-tree.svg',
    programUrl: 'programs/holiday-tree.html',
    description: 'Tiered Christmas tree with adjustable height, width, tier count and wavy bough edges, a trunk, a snow base, baubles and a ball or sparkle topper. Every bough has a self-supporting underside. A Styles tab of picture cards sets a whole look. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 9,
    title: 'Holiday Gift Box',
    bundle: 'christmas',
    category: 'CHRISTMAS // GIFTS',
    thumbnailUrl: 'assets/thumbnails/gift-box.svg',
    programUrl: 'programs/gift-box.html',
    description: 'Solid gift box with a lid, ribbon bands and a bow: set width, depth, height, corner rounding, lid overhang, ribbon width and raise, and bow size, height and spread. A Styles tab of picture cards (tall, flat, cube, plain) sets a whole look. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 15,
    title: 'Pottery Wheel',
    category: 'POTTERY // WHEEL',
    thumbnailUrl: 'assets/thumbnails/pottery-wheel.svg',
    programUrl: 'programs/pottery-wheel.html',
    description: 'Spin a lump of clay on a wheel and mold it with the mouse or your finger: press, pinch, swell, smooth and pull it taller. Add throwing rings, fluting, facets and a mug handle, with an overhang limit that keeps it printable. Paint glaze in the Color tool and export .STL.'
  }
];

// Bundle registry. A bundle groups generators under one theme. Bundles are NOT grid items: they
// appear as the Featured carousel and as filter chips above the generators grid.
// To add a bundle: append an entry here. Members come from two places and are merged (no duplicates):
//   - `generators`: ordered list of generator ids ('SLOT-01'), controls display order
//   - the optional `bundle: '<bundle id>'` field on a GENERATORS entry (a string, or an array for several bundles)
// `featured: true` puts the bundle in the Featured carousel; only bundles are featured there.
const BUNDLES = [
  {
    id: 'halloween',
    name: 'Halloween Bundle',
    description: 'Everything spooky in one place: a ghost, a pumpkin, a spider, a witch hat and a skull. Print the whole haunt or mix and match, and paint every part in the Color tool.',
    featured: true,
    generators: ['SLOT-02', 'SLOT-03', 'SLOT-05', 'SLOT-07', 'SLOT-01']
  },
  {
    id: 'christmas',
    name: 'Christmas Bundle',
    description: 'A festive set: a snowman, a snowflake ornament, a tiered tree and a gift box with a bow. Every model prints flat or self-supporting, and every part can be painted in the Color tool.',
    featured: false,
    generators: ['SLOT-04', 'SLOT-08', 'SLOT-09', 'SLOT-06']
  }
];

const highestSlot = GENERATORS.reduce((max, g) => Math.max(max, g.slot), 0);
const SLOT_COUNT = Math.max(MIN_SLOTS, Math.ceil((highestSlot + 1) / GRID_COLUMNS) * GRID_COLUMNS);

const PROGRAMS = Array.from({ length: SLOT_COUNT }, (_, index) => {
  const slotNum = String(index + 1).padStart(2, '0');
  return {
    id: `SLOT-${slotNum}`,
    slot: index + 1,
    title: '',
    category: '',
    thumbnailUrl: '',
    programUrl: '',
    description: '',
    ...GENERATORS.find(g => g.slot === index + 1)
  };
});

// Resolve bundle membership: each program gets `bundles` (ids), each bundle gets `members` (programs, ordered).
BUNDLES.forEach(b => {
  const ids = (b.generators || []).slice();
  PROGRAMS.forEach(p => {
    const tag = [].concat(p.bundle || []);
    if (tag.includes(b.id) && !ids.includes(p.id)) ids.push(p.id);
  });
  b.members = ids.map(id => PROGRAMS.find(p => p.id === id)).filter(p => p && p.programUrl);
  b.members.forEach(p => { p.bundles = (p.bundles || []).concat(b.id); });
});
