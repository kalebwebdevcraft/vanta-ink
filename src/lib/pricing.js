import { zoneMeta } from '../data/zones';

// Edit these numbers to match the real artist's rates.
export const SIZES = [
  { id: 'tiny', label: 'Tiny', cm: 'up to 5 cm', base: 80, hours: 1, scale: 0.22 },
  { id: 'small', label: 'Small', cm: '5 – 10 cm', base: 150, hours: 2, scale: 0.36 },
  { id: 'medium', label: 'Medium', cm: '10 – 20 cm', base: 300, hours: 4, scale: 0.55 },
  { id: 'large', label: 'Large', cm: '20 – 30 cm', base: 550, hours: 7, scale: 0.78 },
  { id: 'xl', label: 'Extra large', cm: '30 cm +', base: 900, hours: 12, scale: 1 },
];

export const DETAILS = [
  { id: 'simple', label: 'Simple', mult: 1, desc: 'Clean lines, little shading' },
  { id: 'detailed', label: 'Detailed', mult: 1.25, desc: 'Shading and texture' },
  { id: 'intricate', label: 'Intricate', mult: 1.55, desc: 'Dense, fine, complex' },
];

export const COLORS = [
  { id: 'blackwork', label: 'Blackwork', mult: 1 },
  { id: 'greyscale', label: 'Black & grey', mult: 1.1 },
  { id: 'color', label: 'Full colour', mult: 1.3 },
];

const round10 = (n) => Math.round(n / 10) * 10;

/** Returns { low, high, hours, fixed } or null when there isn't enough info yet. */
export function estimate({ flash, size, detail, color, zone }) {
  if (flash) {
    return { low: flash.price, high: flash.price, hours: Math.max(1, Math.round(parseInt(flash.size, 10) / 4)), fixed: true };
  }
  const s = SIZES.find((x) => x.id === size);
  if (!s) return null;
  const d = DETAILS.find((x) => x.id === detail) || DETAILS[1];
  const c = COLORS.find((x) => x.id === color) || COLORS[0];
  const z = zoneMeta(zone);
  const raw = s.base * d.mult * c.mult * (z ? z.mult : 1);
  return {
    low: Math.max(80, round10(raw * 0.9)),
    high: Math.max(100, round10(raw * 1.15)),
    hours: Math.max(1, Math.round(s.hours * d.mult)),
    fixed: false,
  };
}

export function depositFor(est) {
  if (!est) return 50;
  return Math.max(50, Math.round(((est.low + est.high) / 2) * 0.3 / 5) * 5);
}

export const money = (n) => `$${n.toLocaleString('en-US')}`;