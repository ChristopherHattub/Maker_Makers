// Slot registry: fill in title, thumbnailUrl and programUrl to activate a slot.
const PROGRAMS = Array.from({ length: 40 }, (_, index) => {
  const slotNum = String(index + 1).padStart(2, '0');
  return {
    id: `SLOT-${slotNum}`,
    slot: index + 1,
    title: '',
    category: '',
    featured: index < 3,
    thumbnailUrl: '',
    programUrl: '',
    description: ''
  };
});

// Slot 1: Ghost Builder. Other slots are still blank until they get a generator.
Object.assign(PROGRAMS[0], {
  title: 'Ghost Builder',
  category: 'SPOOKY // FIGURES',
  programUrl: 'programs/ghost-builder.html',
  description: 'Parametric ghost with folds, arms, a face and embossed stamps. Paint parts in the Color tool and export .STL or .3MF with colors.'
});
