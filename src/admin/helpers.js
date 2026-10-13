export const STATUS = {
  new: { label: 'New', cls: 'bg-blood/15 text-blood-light border-blood/40' },
  reviewing: { label: 'Reviewing', cls: 'bg-amber-500/10 text-amber-300 border-amber-400/30' },
  approved: { label: 'Awaiting deposit', cls: 'bg-sky-500/10 text-sky-300 border-sky-400/30' },
  confirmed: { label: 'Confirmed', cls: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/30' },
  completed: { label: 'Completed', cls: 'bg-bone/10 text-bone-dim border-bone/20' },
  declined: { label: 'Declined', cls: 'bg-bone/5 text-bone-mute border-bone/15' },
  cancelled: { label: 'Cancelled', cls: 'bg-bone/5 text-bone-mute border-bone/15' },
};

export const KIND = { flash: 'Flash', custom: 'Custom', coverup: 'Cover-up' };

export const money = (n) => (n === null || n === undefined ? '—' : `$${Number(n).toLocaleString('en-US')}`);

export const shortDate = (iso) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export const timeAgo = (iso) => {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};