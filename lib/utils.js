// Maps plant "type" (derived from genus) to a display color, similar to Pokemon type colors.
export const TYPE_COLORS = {
  Tropical: '#16a34a',
  Vine: '#22c55e',
  Tree: '#854d0e',
  Succulent: '#06b6d4',
  Cactus: '#d97706',
  Fern: '#15803d',
  Structural: '#475569',
  Flowering: '#db2777',
  Compact: '#7c3aed',
  Trailing: '#0891b2',
  Unclassified: '#6b7280',
};

export function typeColor(type) {
  return TYPE_COLORS[type] || TYPE_COLORS.Unclassified;
}

export function daysSince(dateString) {
  if (!dateString) return null;
  const diff = Date.now() - new Date(dateString).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
