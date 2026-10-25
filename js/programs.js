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
