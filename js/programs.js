// Slot registry. Add a generator by adding an entry to GENERATORS with the next free slot number.
// The grid grows by itself: it always shows at least MIN_SLOTS sockets, plus one spare row of
// empty sockets after the highest filled slot, so the page just gets longer as slots are used.
const MIN_SLOTS = 40;
const GRID_COLUMNS = 4;

const GENERATORS = [
  {
    slot: 1,
    title: 'Ghost Builder',
    category: 'SPOOKY // FIGURES',
    thumbnailUrl: 'assets/thumbnails/ghost-builder.svg',
    programUrl: 'programs/ghost-builder.html',
    description: 'Parametric ghost with folds, arms, a face and embossed stamps and carved jack-o-lantern faces. Paint parts in the Color tool and export .STL or .3MF with colors.'
  },
  {
    slot: 2,
    title: 'Pumpkin Plotter',
    category: 'SPOOKY // HARVEST',
    thumbnailUrl: 'assets/thumbnails/pumpkin-plotter.svg',
    programUrl: 'programs/pumpkin-plotter.html',
    description: 'Parametric pumpkin with adjustable ribs, texture, a curly stem, an optional hollow inside and embossed stamps and carved jack-o-lantern faces. Paint parts in the Color tool and export .STL or .3MF with colors.'
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
    featured: index < 3,
    thumbnailUrl: '',
    programUrl: '',
    description: '',
    ...GENERATORS.find(g => g.slot === index + 1)
  };
});
