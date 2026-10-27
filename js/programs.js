// Slot registry. Add a generator by adding an entry to GENERATORS with the next free slot number.
const MIN_SLOTS = 40; // internal lookup table size only; the homepage shows filled slots, not empty ones
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
    slot: 10,
    title: 'Key Clicker',
    category: 'DESK // FIDGETS',
    thumbnailUrl: 'assets/thumbnails/key-clicker.svg',
    programUrl: 'programs/key-clicker.html',
    description: 'Pad of connected clicker buttons: pick how many (1 to 12), rows, button shape, body shape, keycap height and rounding, and type a character on every keycap. Optional switch socket under each key. Caps print flat beside the body with no supports. Paint body, caps and characters in the Color tool and export .STL.'
  },
  {
    slot: 11,
    title: 'Name Keychain',
    category: 'KEYCHAINS // PERSONAL',
    thumbnailUrl: 'assets/thumbnails/name-keychain.svg',
    programUrl: 'programs/name-keychain.html',
    description: 'Personalised name keychain: type one or two lines, pick a lettering style, plate shape, border and key ring hole, then tune size and thickness. Prints flat with no supports. Paint plate, border and letters in the Color tool and export .STL.'
  },
  {
    slot: 12,
    title: 'Image Clicker',
    category: 'FIDGET // CLICKERS',
    thumbnailUrl: 'assets/thumbnails/image-clicker.svg',
    programUrl: 'programs/image-clicker.html',
    description: 'Upload a PNG, JPG or SVG, or pick a shape, and turn it into a print-in-place fidget clicker: the picture becomes the button outline or is raised on a badge. Set button size, travel, hinge softness, housing wall and an optional keyring loop. Everything runs in your browser. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 13,
    title: 'Snowman 2.0 Generator',
    category: 'CHRISTMAS // SNOWMAN',
    thumbnailUrl: 'assets/thumbnails/ornament-stacker.svg',
    programUrl: 'programs/ornament-stacker.html',
    description: 'A snowman-building game: pick one to four snowballs, then drag hats, faces, scarves, buttons and stick arms from a picture catalog onto the snowman, with a guide showing where each lands. Add as many as you like, paint parts in the Color tool and export .STL.'
  },
  {
    slot: 15,
    title: 'Pottery Wheel',
    category: 'POTTERY // WHEEL',
    thumbnailUrl: 'assets/thumbnails/pottery-wheel.svg',
    programUrl: 'programs/pottery-wheel.html',
    description: 'Spin a lump of clay on a wheel and mold it with the mouse or your finger: press, pinch, swell, smooth and pull it taller. Add throwing rings, fluting, facets and a mug handle, with an overhang limit that keeps it printable. Paint glaze in the Color tool and export .STL.'
  },
  {
    slot: 16,
    title: 'Gift Box 2.0',
    bundle: 'christmas',
    category: 'CHRISTMAS // GIFTS',
    thumbnailUrl: 'assets/thumbnails/gift-box-2.svg',
    programUrl: 'programs/gift-box-2.html',
    description: 'A working gift box with a lid that slips over a hollow box, shown in a cozy Christmas workshop with a turning table, fireplace, tree and falling snow. Ten presets plus square, round or hexagon shapes, wall, lid fit, ribbon bands and a classic, pom-pom or flat bow, then tap the box to stick on stars, hearts, trees and more. Paint parts in the Color tool and export .STL.'
  }
];

// Group registry. A group (BUNDLES) is a themed cluster on the homepage: its generators show as
// connected tiles under one heading. Add a group by appending an entry; add a generator to it with
// the `bundle: '<group id>'` field (a string, or an array for several groups) or the `generators` list.
// Generators with no group land in an automatic "More" cluster, so nothing is ever hidden.
//   id / name / description: shown on the cluster header and used by the homepage search
//   accent: CSS colour for the cluster's connectors and hover glow
//   generators: optional ordered list of ids ('SLOT-01') to control tile order
const BUNDLES = [
  {
    id: 'halloween',
    name: 'Halloween',
    description: 'A ghost, a pumpkin, a spider, a witch hat and a skull.',
    accent: '#ff8a1f',
    generators: ['SLOT-02', 'SLOT-03', 'SLOT-05', 'SLOT-07', 'SLOT-01']
  },
  {
    id: 'christmas',
    name: 'Christmas',
    description: 'Snowmen, snowflakes, a tiered tree and a gift box.',
    accent: '#ff4d6d',
    generators: ['SLOT-04', 'SLOT-13', 'SLOT-08', 'SLOT-09', 'SLOT-06']
  },
  {
    id: 'fidgets',
    name: 'Fidgets & Clickers',
    description: 'Print-in-place clickers and keycap pads.',
    accent: '#00e5ff',
    generators: ['SLOT-10', 'SLOT-12']
  },
  {
    id: 'personal',
    name: 'Personalised',
    description: 'Name plates and keychains.',
    accent: '#ffae00',
    generators: ['SLOT-11']
  },
  {
    id: 'pottery',
    name: 'Pottery',
    description: 'Throw and sculpt clay vessels.',
    accent: '#00ff9d',
    generators: ['SLOT-15']
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

// Anything in no group goes to an automatic last group, so a new generator always appears.
(function () {
  const grouped = new Set(BUNDLES.flatMap(b => b.members.map(p => p.id)));
  const rest = PROGRAMS.filter(p => p.programUrl && !grouped.has(p.id));
  if (rest.length) {
    const more = { id: 'more', name: 'More', description: 'Everything else.', accent: '#7ab3ff', generators: [], members: rest };
    rest.forEach(p => { p.bundles = (p.bundles || []).concat('more'); });
    BUNDLES.push(more);
  }
})();
