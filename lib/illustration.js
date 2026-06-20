import { typeColor } from './utils';

// Simple deterministic hash so the same plant name always generates the same icon
function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// Body shape silhouettes loosely themed by type, drawn as simple blob/creature shapes.
const BODY_SHAPES = {
  Tropical: 'M100,40 C140,40 165,75 165,110 C165,150 135,170 100,170 C65,170 35,150 35,110 C35,75 60,40 100,40 Z',
  Vine: 'M100,30 C120,50 150,60 150,95 C150,140 125,175 100,175 C75,175 50,140 50,95 C50,60 80,50 100,30 Z',
  Tree: 'M100,35 L130,80 L145,140 C145,160 125,175 100,175 C75,175 55,160 55,140 L70,80 Z',
  Succulent: 'M100,45 C150,45 160,90 150,120 C140,155 115,175 100,175 C85,175 60,155 50,120 C40,90 50,45 100,45 Z',
  Cactus: 'M100,40 C130,40 140,70 140,110 C140,150 125,175 100,175 C75,175 60,150 60,110 C60,70 70,40 100,40 Z',
  Fern: 'M100,30 C160,50 170,100 140,140 C120,165 80,165 60,140 C30,100 40,50 100,30 Z',
  Structural: 'M100,35 L150,60 L150,150 L100,175 L50,150 L50,60 Z',
  Flowering: 'M100,40 C145,40 165,80 155,115 C145,155 120,175 100,175 C80,175 55,155 45,115 C35,80 55,40 100,40 Z',
  Compact: 'M100,55 C140,55 155,90 150,120 C145,155 125,175 100,175 C75,175 55,155 50,120 C45,90 60,55 100,55 Z',
  Trailing: 'M100,40 C135,40 155,70 150,105 C145,150 120,175 100,175 C80,175 55,150 50,105 C45,70 65,40 100,40 Z',
  Unclassified: 'M100,45 C140,45 155,85 150,115 C145,155 120,175 100,175 C80,175 55,155 50,115 C45,85 60,45 100,45 Z',
};

// Spot/accessory placement patterns, also seeded by type, to give variety
function decorations(type, seed, accent) {
  const n = seed % 4;
  switch (type) {
    case 'Cactus':
      return Array.from({ length: 5 + (seed % 4) }, (_, i) => {
        const angle = (i / (5 + (seed % 4))) * Math.PI * 2;
        const cx = 100 + Math.cos(angle) * (35 + (seed % 10));
        const cy = 110 + Math.sin(angle) * (45 + (seed % 10));
        return `<line x1="${cx}" y1="${cy}" x2="${cx + 4}" y2="${cy + 6}" stroke="${accent}" stroke-width="2" stroke-linecap="round"/>`;
      }).join('');
    case 'Succulent':
      return Array.from({ length: 4 }, (_, i) => {
        const cx = 70 + i * 22;
        const cy = 95 + (i % 2) * 15;
        return `<ellipse cx="${cx}" cy="${cy}" rx="14" ry="9" fill="${accent}" opacity="0.35"/>`;
      }).join('');
    case 'Flowering':
      return Array.from({ length: 3 + n }, (_, i) => {
        const angle = (i / (3 + n)) * Math.PI * 2;
        const cx = 100 + Math.cos(angle) * 45;
        const cy = 75 + Math.sin(angle) * 20;
        return `<circle cx="${cx}" cy="${cy}" r="7" fill="${accent}"/>`;
      }).join('');
    case 'Fern':
      return Array.from({ length: 5 }, (_, i) => {
        const x = 60 + i * 20;
        return `<path d="M${x},150 Q${x + 10},110 ${x},70" stroke="${accent}" stroke-width="3" fill="none" opacity="0.5"/>`;
      }).join('');
    default:
      return Array.from({ length: 3 + n }, (_, i) => {
        const cx = 70 + ((seed + i * 37) % 60);
        const cy = 90 + ((seed + i * 53) % 60);
        const r = 4 + (i % 3) * 2;
        return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${accent}" opacity="0.4"/>`;
      }).join('');
  }
}

// Simple deterministic "eyes" so every icon reads as a creature
function eyes(seed) {
  const spacing = 16 + (seed % 10);
  const cy = 100 + (seed % 10);
  return `
    <circle cx="${100 - spacing}" cy="${cy}" r="7" fill="#1f2a17"/>
    <circle cx="${100 + spacing}" cy="${cy}" r="7" fill="#1f2a17"/>
    <circle cx="${100 - spacing + 2}" cy="${cy - 2}" r="2" fill="white"/>
    <circle cx="${100 + spacing + 2}" cy="${cy - 2}" r="2" fill="white"/>
  `;
}

// Generates a full SVG string (as a data: URI) for a given plant type + name seed.
export function generateIllustration(type, seedString) {
  const seed = hashSeed(seedString || type || 'plant');
  const base = typeColor(type);
  const shape = BODY_SHAPES[type] || BODY_SHAPES.Unclassified;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="${base}22"/>
      <path d="${shape}" fill="${base}" stroke="#1f2a17" stroke-width="3"/>
      ${decorations(type, seed, '#ffffff')}
      ${eyes(seed)}
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
