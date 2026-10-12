// Body-map zones. Coordinates are for an SVG with viewBox "0 0 200 350".
// mult = price multiplier (harder/more painful areas cost a little more)
// pain = 1 (easy) .. 5 (intense)
const R = (x, y, w, h, r = 8) => ({ t: 'r', x, y, w, h, r });
const E = (x, y, rx, ry) => ({ t: 'e', x, y, rx, ry });

export const ZONES = {
  front: [
    { id: 'neck', label: 'Neck', mult: 1.2, pain: 3, shapes: [R(91, 54, 18, 16, 6)] },
    { id: 'shoulder', label: 'Shoulder', mult: 1, pain: 2, shapes: [E(62, 88, 14, 11), E(138, 88, 14, 11)] },
    { id: 'chest', label: 'Chest', mult: 1.15, pain: 3, shapes: [R(74, 80, 52, 32, 8)] },
    { id: 'stomach', label: 'Stomach', mult: 1.1, pain: 3, shapes: [R(76, 114, 48, 44, 8)] },
    { id: 'ribs', label: 'Ribs', mult: 1.25, pain: 5, shapes: [R(65, 112, 9, 42, 4), R(126, 112, 9, 42, 4)] },
    { id: 'upperarm', label: 'Upper arm', mult: 1, pain: 2, shapes: [R(44, 100, 16, 48, 8), R(140, 100, 16, 48, 8)] },
    { id: 'forearm', label: 'Forearm', mult: 1, pain: 2, shapes: [R(38, 150, 14, 52, 7), R(148, 150, 14, 52, 7)] },
    { id: 'hand', label: 'Hand', mult: 1.2, pain: 4, shapes: [E(41, 214, 9, 13), E(159, 214, 9, 13)] },
    { id: 'thigh', label: 'Thigh', mult: 1, pain: 2, shapes: [R(76, 164, 22, 76, 10), R(102, 164, 22, 76, 10)] },
    { id: 'calf', label: 'Calf', mult: 1, pain: 2, shapes: [R(78, 244, 18, 70, 9), R(104, 244, 18, 70, 9)] },
    { id: 'foot', label: 'Foot', mult: 1.15, pain: 4, shapes: [E(87, 328, 11, 8), E(113, 328, 11, 8)] },
  ],
  back: [
    { id: 'neck', label: 'Back of neck', mult: 1.2, pain: 3, shapes: [R(91, 54, 18, 16, 6)] },
    { id: 'upperback', label: 'Upper back', mult: 1.05, pain: 2, shapes: [R(74, 80, 52, 40, 8)] },
    { id: 'spine', label: 'Spine', mult: 1.25, pain: 5, shapes: [R(96, 76, 8, 86, 4)] },
    { id: 'lowerback', label: 'Lower back', mult: 1.1, pain: 3, shapes: [R(76, 122, 48, 36, 8)] },
    { id: 'upperarm', label: 'Upper arm', mult: 1, pain: 2, shapes: [R(44, 100, 16, 48, 8), R(140, 100, 16, 48, 8)] },
    { id: 'forearm', label: 'Forearm', mult: 1, pain: 2, shapes: [R(38, 150, 14, 52, 7), R(148, 150, 14, 52, 7)] },
    { id: 'thigh', label: 'Back of thigh', mult: 1.05, pain: 3, shapes: [R(76, 164, 22, 76, 10), R(102, 164, 22, 76, 10)] },
    { id: 'calf', label: 'Calf', mult: 1, pain: 2, shapes: [R(78, 244, 18, 70, 9), R(104, 244, 18, 70, 9)] },
  ],
};

export function zoneMeta(zone) {
  if (!zone) return null;
  return ZONES[zone.view].find((z) => z.id === zone.id) || null;
}