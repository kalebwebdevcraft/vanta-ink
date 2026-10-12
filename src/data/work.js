// Portfolio data.
// For a real artist: put photos in /public/work/ and set  img: '/work/piece-01.jpg'
// When `img` is set it is shown instead of the drawn placeholder.
// tone: 'warm' | 'deep' | 'pale'  (skin tone of the placeholder)
// ratio: 'tall' | 'square' | 'wide' | 'portrait'
export const WORK = [
  { id: 'w01', title: 'Funeral Moth', style: 'Fine Line', placement: 'Torso', art: 'moth', tone: 'pale', ratio: 'tall', time: '3 h · 1 session', year: 2026, img: null },
  { id: 'w02', title: 'The Watcher', style: 'Blackwork', placement: 'Hand', art: 'eye', tone: 'deep', ratio: 'square', time: '2 h · 1 session', year: 2026, img: null },
  { id: 'w03', title: 'Last Rites', style: 'Neo-Traditional', placement: 'Arm', art: 'dagger', tone: 'warm', ratio: 'portrait', time: '4 h · 1 session', year: 2025, img: null },
  { id: 'w04', title: 'Solar Hex', style: 'Ornamental', placement: 'Arm', art: 'sun', tone: 'pale', ratio: 'square', time: '5 h · 2 sessions', year: 2025, img: null },
  { id: 'w05', title: 'Coil', style: 'Neo-Traditional', placement: 'Leg', art: 'serpent', tone: 'warm', ratio: 'tall', time: '6 h · 2 sessions', year: 2025, img: null },
  { id: 'w06', title: 'Waning', style: 'Fine Line', placement: 'Arm', art: 'moon', tone: 'deep', ratio: 'wide', time: '1.5 h · 1 session', year: 2026, img: null },
  { id: 'w07', title: 'Iron Cross', style: 'Blackwork', placement: 'Torso', art: 'cross', tone: 'warm', ratio: 'portrait', time: '4 h · 1 session', year: 2024, img: null },
  { id: 'w08', title: 'Skeleton Key', style: 'Ornamental', placement: 'Leg', art: 'key', tone: 'pale', ratio: 'square', time: '3 h · 1 session', year: 2024, img: null },
  { id: 'w09', title: 'Night Garden', style: 'Realism', placement: 'Arm', art: 'moth', tone: 'deep', ratio: 'wide', time: '7 h · 2 sessions', year: 2024, img: null },
];

export const WORK_STYLES = ['All', ...Array.from(new Set(WORK.map((w) => w.style)))];
export const WORK_PLACEMENTS = ['Anywhere', ...Array.from(new Set(WORK.map((w) => w.placement)))];