import { supabase } from './supabase';

// ---------- availability ----------
// With the backend connected, a slot is "taken" only when the artist has
// approved or confirmed a booking for it (the database tells us).
// Without the backend (demo mode) availability is generated so the demo is stable.
const hash = (str) => [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

export const SLOT_TIMES = ['11:00', '14:00', '17:00'];

/** taken = Set of "YYYY-MM-DD|HH:MM" from the database, or null for demo mode */
export function slotsFor(iso, taken) {
  if (taken) {
    return SLOT_TIMES.map((time) => ({ time, free: !taken.has(`${iso}|${time}`) }));
  }
  const h = hash(iso);
  const slots = SLOT_TIMES.map((time, i) => ({ time, free: (h + i * 7) % 3 !== 0 }));
  if (h % 6 === 0) return slots.map((s) => ({ ...s, free: false }));
  return slots;
}

export const dayFull = (iso, taken) => slotsFor(iso, taken).every((s) => !s.free);

export const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const prettyDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

/** Loads already-booked slots for the next ~4 months. Returns a Set, or null in demo mode. */
export async function fetchTakenSlots() {
  if (!supabase) return null;
  const from = new Date();
  const to = new Date();
  to.setDate(to.getDate() + 130);
  const { data, error } = await supabase.rpc('get_taken_slots', { d_from: toISO(from), d_to: toISO(to) });
  if (error) return null; // fall back to demo availability instead of blocking the form
  return new Set(data.map((r) => `${r.session_date}|${r.session_time}`));
}

// ---------- sending the request ----------
// Backend connected: images go to private storage, the request goes to the database.
// No backend: the request is only saved in this browser (demo mode).
export async function submitBooking(p, files) {
  const code = `VNT-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;

  if (!supabase) {
    const record = { code, ...p, createdAt: new Date().toISOString() };
    try {
      const all = JSON.parse(localStorage.getItem('vanta-bookings') || '[]');
      all.push(record);
      localStorage.setItem('vanta-bookings', JSON.stringify(all));
    } catch {
      /* storage unavailable, ignore */
    }
    await new Promise((r) => setTimeout(r, 1200));
    return { code, name: p.name, date: p.date, time: p.time, skippedFiles: 0 };
  }

  const id = crypto.randomUUID();

  // 1) upload reference images (a failed image never blocks the booking)
  const paths = [];
  let skipped = 0;
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const safe = f.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${id}/${i}-${safe}`;
    const { error } = await supabase.storage.from('references').upload(path, f, { contentType: f.type });
    if (error) skipped++;
    else paths.push(path);
  }

  // 2) save the booking
  const row = {
    id,
    code,
    kind: p.type,
    flash_id: p.flashId || null,
    description: p.description || null,
    style: p.style || null,
    reference_id: p.refId || null,
    placement: p.placement || null,
    size: p.size || null,
    detail: p.detail || null,
    color: p.color || null,
    session_date: p.date,
    session_time: p.time,
    estimate_low: p.estimateLow ?? null,
    estimate_high: p.estimateHigh ?? null,
    deposit_amount: p.deposit ?? null,
    name: p.name.trim(),
    email: p.email.trim(),
    phone: p.phone.trim(),
    notes: p.notes || null,
    files: paths,
  };

  const { error } = await supabase.from('bookings').insert(row);
  if (error) throw new Error('We could not send your request. Please check your details and try again.');

  return { code, name: p.name, date: p.date, time: p.time, skippedFiles: skipped };
}

// ---------- add to calendar (.ics) ----------
export function downloadICS({ code, date, time, hours, title, location }) {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const start = new Date(y, m - 1, d, hh, mm);
  const end = new Date(start.getTime() + Math.min(hours, 6) * 3600 * 1000);
  const f = (dt) =>
    `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, '0')}${String(dt.getDate()).padStart(2, '0')}T${String(dt.getHours()).padStart(2, '0')}${String(dt.getMinutes()).padStart(2, '0')}00`;
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VANTA//Booking//EN',
    'BEGIN:VEVENT',
    `UID:${code}@vanta.ink`,
    `DTSTAMP:${f(new Date())}`,
    `DTSTART:${f(start)}`,
    `DTEND:${f(end)}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    `DESCRIPTION:Booking ${code}. Pending confirmation from the studio.`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${code}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}