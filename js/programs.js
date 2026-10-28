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
  },
  {
    slot: 17,
    title: 'Turkey Builder',
    bundle: 'thanksgiving',
    category: 'FALL // FIGURES',
    thumbnailUrl: 'assets/thumbnails/turkey-builder.svg',
    programUrl: 'programs/turkey-builder.html',
    description: 'A plump turkey with a fan of tail feathers: set body size, head, neck and beak, then feather count, length, width and spread, an inner feather row and a base plate. Prints without supports at the default spread. Paint every part in the Color tool and export .STL.'
  },
  {
    slot: 18,
    title: 'Cornucopia',
    bundle: 'thanksgiving',
    category: 'FALL // HARVEST',
    thumbnailUrl: 'assets/thumbnails/cornucopia.svg',
    programUrl: 'programs/cornucopia.html',
    description: 'A woven horn of plenty lying on its side with fruit spilling from the mouth: set length, mouth size, curl, taper, wall and inside depth, then the weave ribs and up to six apples, gourds and grape bunches. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 19,
    title: 'Leaf Press Ornament',
    bundle: 'thanksgiving',
    category: 'FALL // LEAVES',
    thumbnailUrl: 'assets/thumbnails/leaf-press.svg',
    programUrl: 'programs/leaf-press.html',
    description: 'A maple, oak or birch leaf with raised veins, made as a hanging ornament, a coaster or a cookie stamp. Set size, thickness, jagged edge and vein width, height and count. Paint the leaf and veins in the Color tool and export .STL.'
  },
  {
    slot: 20,
    title: 'Pumpkin Pie Slice',
    bundle: 'thanksgiving',
    category: 'FALL // KITCHEN',
    thumbnailUrl: 'assets/thumbnails/pumpkin-pie-slice.svg',
    programUrl: 'programs/pumpkin-pie-slice.html',
    description: 'A pie slice trinket box with a drop-in lid: set the pie radius, slice angle and height, wall and lid fit, then the crimped crust and a whipped cream dollop. Tin and lid print side by side with no supports. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 21,
    title: 'Acorn & Pinecone Set',
    bundle: 'thanksgiving',
    category: 'FALL // FOREST',
    thumbnailUrl: 'assets/thumbnails/acorn-pinecone-set.svg',
    programUrl: 'programs/acorn-pinecone-set.html',
    description: 'Textured acorns and scaled pinecones to print as a set or as tree ornaments with hang loops. Set how many of each, their sizes, the cap bumps and the scale rows and depth. Everything stands on a flat base. Paint parts in the Color tool and export .STL.'
  },
  {
    slot: 22,
    title: 'Scarecrow Stacker',
    bundle: 'thanksgiving',
    category: 'FALL // FIGURES',
    thumbnailUrl: 'assets/thumbnails/scarecrow-stacker.svg',
    programUrl: 'programs/scarecrow-stacker.html',
    description: 'A patched-shirt scarecrow on a post with straw arms, a face and a hat: pick the hat and face style, then size the shirt, post, arms and head. Arms droop so it prints without supports. Paint every part in the Color tool and export .STL.'
  },
  {
    slot: 23,
    title: 'Gratitude Place Cards',
    bundle: 'thanksgiving',
    category: 'FALL // TABLE',
    thumbnailUrl: 'assets/thumbnails/gratitude-place-cards.svg',
    programUrl: 'programs/gratitude-place-cards.html',
    description: 'A standing name card for the Thanksgiving table: type a name and optional second line, pick a lettering style, card shape and a leaf, acorn, pumpkin or turkey motif. The easel foot is built in. Paint card, lettering and motif in the Color tool and export .STL.'
  }
];

// Group registry. A group (BUNDLES) is a region of the homepage world map. Related groups sit next to
// each other (Halloween beside Christmas), so the map reads like a heatmap of what exists.
// Add a group by appending an entry; add a generator to it with the `bundle: '<group id>'` field
// (a string, or an array for several groups) or the `generators` list.
//   id / name / description: region header and search text
//   accent: CSS hex colour of the region's tint, connectors and hover glow
//   at: [col, row] of the region's top-left cell on the world grid (one cell = one tile).
//       The region takes one header row, then `size` tile cells. Leave a spare cell or row so a
//       region can grow; regions without `at` are auto-placed in a new row below everything else.
//   size: [cols, rows] of tile cells. Rows grow automatically if there are more generators than cells.
//   planned: true for a region with no generators yet. It shows as empty slots to be filled later.
//   generators: optional ordered list of ids ('SLOT-01') to control tile order
const BUNDLES = [
  // Holidays
  { id: 'halloween', name: 'Halloween', accent: '#ff8a1f', at: [0, 0], size: [4, 2],
    description: 'A ghost, a pumpkin, a spider, a witch hat and a skull.',
    generators: ['SLOT-02', 'SLOT-03', 'SLOT-05', 'SLOT-07', 'SLOT-01'] },
  { id: 'christmas', name: 'Christmas', accent: '#ff4d6d', at: [4, 0], size: [4, 2],
    description: 'Snowmen, snowflakes, a tiered tree and gift boxes.',
    generators: ['SLOT-04', 'SLOT-13', 'SLOT-08', 'SLOT-09', 'SLOT-06'] },
  { id: 'easter', name: 'Easter & Spring', accent: '#c4f04a', at: [8, 0], size: [3, 2], planned: true,
    description: 'Eggs, bunnies and spring flowers.' },
  { id: 'valentines', name: "Valentine's", accent: '#ff6ec7', at: [0, 3], size: [3, 1], planned: true,
    description: 'Hearts, gifts and love notes.' },
  { id: 'thanksgiving', name: 'Thanksgiving & Fall', accent: '#d9822b', at: [3, 3], size: [7, 1],
    description: 'Turkeys, harvest decor, fall leaves and place cards.',
    generators: ['SLOT-17', 'SLOT-22', 'SLOT-18', 'SLOT-20', 'SLOT-19', 'SLOT-21', 'SLOT-23'] },
  { id: 'newyear', name: 'New Year & Party', accent: '#ffd400', at: [10, 3], size: [2, 1], planned: true,
    description: 'Parties, toasts and countdowns.' },
  { id: 'birthday', name: 'Birthdays', accent: '#b388ff', at: [16, 3], size: [3, 1], planned: true,
    description: 'Cake toppers and party favours.' },
  // Fidgets & personal
  { id: 'fidgets', name: 'Fidgets & Clickers', accent: '#00e5ff', at: [12, 0], size: [4, 2],
    description: 'Print-in-place clickers and keycap pads.',
    generators: ['SLOT-10', 'SLOT-12'] },
  { id: 'personal', name: 'Personalised', accent: '#ffae00', at: [12, 3], size: [4, 1],
    description: 'Name plates and keychains.',
    generators: ['SLOT-11'] },
  // Home, craft & play
  { id: 'pottery', name: 'Pottery', accent: '#00ff9d', at: [0, 5], size: [4, 2],
    description: 'Throw and sculpt clay vessels.',
    generators: ['SLOT-15'] },
  { id: 'decor', name: 'Home & Decor', accent: '#4aa3ff', at: [4, 5], size: [4, 2], planned: true,
    description: 'Vases, lamps, frames and wall art.' },
  { id: 'organization', name: 'Organisation', accent: '#38d6c4', at: [8, 5], size: [4, 2], planned: true,
    description: 'Hooks, trays, holders and storage.' },
  { id: 'toys', name: 'Toys & Games', accent: '#ff5252', at: [12, 5], size: [4, 2], planned: true,
    description: 'Puzzles, spinners and pieces to play with.' },
  { id: 'garden', name: 'Garden', accent: '#7bd34a', at: [0, 9], size: [4, 2], planned: true,
    description: 'Planters, markers and plant stands.' },
  { id: 'animals', name: 'Animals & Creatures', accent: '#ffb86b', at: [4, 9], size: [4, 2], planned: true,
    description: 'Pets, wildlife and fantasy beasts.' },
  { id: 'jewelry', name: 'Jewellery & Wearables', accent: '#f08cff', at: [8, 9], size: [4, 2], planned: true,
    description: 'Rings, pendants and charms.' },
  { id: 'tabletop', name: 'Tabletop & Gaming', accent: '#8f9bff', at: [12, 9], size: [4, 2], planned: true,
    description: 'Minis, terrain, dice and tokens.' }
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

// Anything in no group goes to an automatic last region, so a new generator always appears.
(function () {
  const grouped = new Set(BUNDLES.flatMap(b => b.members.map(p => p.id)));
  const rest = PROGRAMS.filter(p => p.programUrl && !grouped.has(p.id));
  if (rest.length) {
    rest.forEach(p => { p.bundles = (p.bundles || []).concat('more'); });
    BUNDLES.push({ id: 'more', name: 'More', description: 'Generators not in a group yet.', accent: '#7ab3ff', size: [4, 1], generators: [], members: rest });
  }
})();
