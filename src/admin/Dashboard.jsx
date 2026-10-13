import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { STUDIO } from '../data/studio';
import { FLASH } from '../data/flash';
import { WORK } from '../data/work';
import Schedule from './Schedule';
import { STATUS, KIND, money, shortDate, timeAgo, todayISO } from './helpers';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'reviewing', label: 'Reviewing' },
  { id: 'approved', label: 'Awaiting deposit' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'completed', label: 'Completed' },
  { id: 'closed', label: 'Closed' },
];

const matches = (b, f) => {
  if (f === 'all') return true;
  if (f === 'closed') return b.status === 'declined' || b.status === 'cancelled';
  return b.status === f;
};

function Badge({ status }) {
  const s = STATUS[status] || STATUS.new;
  return (
    <span className={`inline-block border px-2 py-[2px] font-mono text-[9px] uppercase tracking-[0.2em] ${s.cls}`}>{s.label}</span>
  );
}

function Stat({ label, value, hot }) {
  return (
    <div className="border border-bone/10 bg-ink-900/60 p-4">
      <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-bone-mute">{label}</div>
      <div className={`mt-2 font-display text-4xl ${hot ? 'text-blood' : ''}`}>{value}</div>
    </div>
  );
}

function Row({ k, children }) {
  if (children === null || children === undefined || children === '' || children === false) return null;
  return (
    <div className="flex gap-4 py-2 border-b border-bone/10 text-sm">
      <div className="w-28 shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-bone-mute pt-[2px]">{k}</div>
      <div className="text-bone break-words min-w-0">{children}</div>
    </div>
  );
}

/* ---------------- Detail pane ---------------- */
function Detail({ b, onUpdate, onBack }) {
  const [final, setFinal] = useState(b.final_price ?? b.estimate_high ?? '');
  const [deposit, setDeposit] = useState(b.deposit_amount ?? '');
  const [notes, setNotes] = useState(b.artist_notes || '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [images, setImages] = useState([]);
  const [big, setBig] = useState(null);

  const flash = b.flash_id ? FLASH.find((f) => f.id === b.flash_id) : null;
  const ref = b.reference_id ? WORK.find((w) => w.id === b.reference_id) : null;

  // signed links for private reference images
  useEffect(() => {
    let alive = true;
    const files = b.files || [];
    if (!files.length) return;
    supabase.storage
      .from('references')
      .createSignedUrls(files, 3600)
      .then(({ data }) => {
        if (alive && data) setImages(data.filter((d) => d.signedUrl).map((d) => d.signedUrl));
      });
    return () => {
      alive = false;
    };
  }, [b.files]);

  const apply = async (patch, okText) => {
    setBusy(true);
    setErr('');
    setMsg('');
    const { error } = await onUpdate(b.id, patch);
    setBusy(false);
    if (error) {
      setErr(error.code === '23505' ? 'That date and time is already taken by another approved or confirmed booking.' : 'Could not save. Check your connection and try again.');
    } else if (okText) {
      setMsg(okText);
      setTimeout(() => setMsg(''), 2500);
    }
  };

  const num = (v) => (v === '' || v === null ? null : Number(v));

  const go = (status, ask) => {
    if (ask && !window.confirm(ask)) return;
    const patch = { status };
    if (status === 'approved' || status === 'confirmed') {
      if (num(final) !== null) patch.final_price = num(final);
      if (num(deposit) !== null) patch.deposit_amount = num(deposit);
    }
    if (status === 'confirmed') patch.payment_status = 'paid';
    apply(patch, 'Saved');
  };

  const actions = {
    new: [
      ['Mark reviewing', () => go('reviewing'), 'ghost'],
      ['Approve', () => go('approved'), 'blood'],
      ['Decline', () => go('declined', 'Decline this request?'), 'ghost'],
    ],
    reviewing: [
      ['Approve', () => go('approved'), 'blood'],
      ['Decline', () => go('declined', 'Decline this request?'), 'ghost'],
    ],
    approved: [
      ['Deposit received → Confirm', () => go('confirmed'), 'blood'],
      ['Cancel', () => go('cancelled', 'Cancel this booking?'), 'ghost'],
    ],
    confirmed: [
      ['Mark completed', () => go('completed'), 'blood'],
      ['Cancel', () => go('cancelled', 'Cancel this booking?'), 'ghost'],
    ],
    completed: [['Reopen', () => go('reviewing'), 'ghost']],
    declined: [['Reopen', () => go('reviewing'), 'ghost']],
    cancelled: [['Reopen', () => go('reviewing'), 'ghost']],
  }[b.status] || [];

  const phone = (b.phone || '').replace(/[^\d+]/g, '');
  const wa = phone
    ? `https://wa.me/${phone.replace(/^\+/, '')}?text=${encodeURIComponent(`Hi ${b.name}, it's ${STUDIO.artist || 'the studio'} from ${STUDIO.name} about your tattoo request (${b.code}).`)}`
    : null;

  const input =
    'w-full bg-transparent border border-bone/20 focus:border-blood outline-none px-3 py-2 text-bone text-sm transition-colors';

  return (
    <div className="p-5 md:p-8">
      <button onClick={onBack} className="md:hidden mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-bone-dim">
        ← Back to list
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-display text-4xl uppercase leading-none">{b.name}</div>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-bone-mute">
            {b.code} · {timeAgo(b.created_at)}
          </div>
        </div>
        <Badge status={b.status} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-sm">
        <a href={`mailto:${b.email}`} className="btn-ghost !py-2 !px-4"><span>Email</span></a>
        {phone && <a href={`tel:${phone}`} className="btn-ghost !py-2 !px-4"><span>Call</span></a>}
        {wa && <a href={wa} target="_blank" rel="noreferrer" className="btn-ghost !py-2 !px-4"><span>WhatsApp</span></a>}
      </div>

      <div className="mt-7">
        <Row k="Type">{KIND[b.kind] || b.kind}</Row>
        <Row k="Flash piece">{flash ? `${flash.name} (${money(flash.price)})` : b.flash_id}</Row>
        <Row k="Inspired by">{ref ? ref.title : b.reference_id}</Row>
        <Row k="Style">{b.style}</Row>
        <Row k="Placement">{b.placement}</Row>
        <Row k="Size">{b.size}</Row>
        <Row k="Detail">{b.detail}</Row>
        <Row k="Colour">{b.color}</Row>
        <Row k="Requested">{b.session_date ? `${shortDate(b.session_date)} · ${b.session_time}` : null}</Row>
        <Row k="Estimate">{b.estimate_low || b.estimate_high ? `${money(b.estimate_low)} – ${money(b.estimate_high)}` : null}</Row>
        <Row k="Deposit asked">{money(b.deposit_amount)}</Row>
        <Row k="Email">{b.email}</Row>
        <Row k="Phone">{b.phone}</Row>
      </div>

      {b.description && (
        <div className="mt-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-blood-light">Idea</div>
          <p className="mt-2 text-bone leading-relaxed whitespace-pre-wrap">{b.description}</p>
        </div>
      )}
      {b.notes && (
        <div className="mt-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-blood-light">Client notes</div>
          <p className="mt-2 text-bone-dim leading-relaxed whitespace-pre-wrap">{b.notes}</p>
        </div>
      )}

      {(b.files || []).length > 0 && (
        <div className="mt-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-blood-light">References ({b.files.length})</div>
          <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
            {images.map((u) => (
              <button key={u} onClick={() => setBig(u)} className="aspect-square overflow-hidden border border-bone/15 hover:border-blood">
                <img src={u} alt="reference" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* money */}
      <div className="mt-8 border-t border-bone/15 pt-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-blood-light">Price & deposit</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="text-xs text-bone-mute">
            Final price ($)
            <input type="number" min="0" value={final} onChange={(e) => setFinal(e.target.value)} className={`${input} mt-1`} />
          </label>
          <label className="text-xs text-bone-mute">
            Deposit ($)
            <input type="number" min="0" value={deposit} onChange={(e) => setDeposit(e.target.value)} className={`${input} mt-1`} />
          </label>
        </div>
        <div className="mt-2 text-xs text-bone-mute">Payment status: {b.payment_status}</div>
      </div>

      <div className="mt-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-blood-light">Private notes</div>
        <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${input} mt-2`} placeholder="Only you can see this…" />
        <button
          disabled={busy || notes === (b.artist_notes || '')}
          onClick={() => apply({ artist_notes: notes, final_price: num(final), deposit_amount: num(deposit) }, 'Saved')}
          className="btn-ghost !py-2 !px-4 mt-2 disabled:opacity-40"
        >
          <span>Save notes & prices</span>
        </button>
      </div>

      <div className="mt-8 flex flex-wrap gap-2 items-center">
        {actions.map(([label, fn, kind]) => (
          <button key={label} disabled={busy} onClick={fn} className={`${kind === 'blood' ? 'btn-blood' : 'btn-ghost'} !py-3 !px-5 disabled:opacity-50`}>
            <span>{label}</span>
          </button>
        ))}
        {msg && <span className="text-sm text-emerald-300">{msg}</span>}
      </div>
      {err && <p className="mt-3 text-sm text-blood-light">{err}</p>}

      {big && (
        <div onClick={() => setBig(null)} className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out">
          <img src={big} alt="reference large" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
}

/* ---------------- Dashboard ---------------- */
export default function Dashboard({ session, onSignOut }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState('');
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState('requests');
  const [toast, setToast] = useState('');
  const seen = useRef(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (error) {
      setLoadErr('Could not load bookings.');
    } else {
      setLoadErr('');
      setRows(data);
      seen.current = seen.current || new Set(data.map((r) => r.id));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const poll = setInterval(load, 60000);
    const ch = supabase
      .channel('bookings-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        if (payload.eventType === 'INSERT' && payload.new && seen.current && !seen.current.has(payload.new.id)) {
          seen.current.add(payload.new.id);
          setToast(`New request from ${payload.new.name}`);
          setTimeout(() => setToast(''), 5000);
        }
        load();
      })
      .subscribe();
    return () => {
      clearInterval(poll);
      supabase.removeChannel(ch);
    };
  }, [load]);

  const newCount = rows.filter((r) => r.status === 'new').length;
  useEffect(() => {
    document.title = newCount ? `(${newCount}) Dashboard — VANTA` : 'Dashboard — VANTA';
  }, [newCount]);

  const update = async (id, patch) => {
    const { data, error } = await supabase.from('bookings').update(patch).eq('id', id).select().single();
    if (!error && data) setRows((rs) => rs.map((r) => (r.id === id ? data : r)));
    return { error };
  };

  const today = todayISO();
  const stats = useMemo(
    () => ({
      fresh: rows.filter((r) => r.status === 'new').length,
      deposit: rows.filter((r) => r.status === 'approved').length,
      upcoming: rows.filter((r) => r.status === 'confirmed' && r.session_date >= today).length,
      value: rows
        .filter((r) => r.status === 'approved' || r.status === 'confirmed' || r.status === 'completed')
        .reduce((s, r) => s + Number(r.final_price ?? r.estimate_high ?? 0), 0),
    }),
    [rows, today]
  );

  const counts = useMemo(() => Object.fromEntries(FILTERS.map((f) => [f.id, rows.filter((r) => matches(r, f.id)).length])), [rows]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows.filter((r) => matches(r, filter) && (!t || [r.name, r.email, r.code].some((v) => (v || '').toLowerCase().includes(t))));
  }, [rows, filter, q]);

  const current = rows.find((r) => r.id === selected);

  return (
    <div className="min-h-[100svh] bg-ink-950 text-bone">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 md:px-8 py-4 border-b border-bone/10">
        <div>
          <div className="font-display text-2xl tracking-[0.15em]">
            {STUDIO.name}
            <span className="text-blood">.</span>
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-bone-mute">Studio dashboard</div>
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.2em] text-bone-dim">
          <span className="hidden md:inline normal-case tracking-normal text-bone-mute">{session?.user?.email}</span>
          <button onClick={load} className="hover:text-bone">Refresh</button>
          <Link to="/" className="hover:text-bone">View site</Link>
          <button onClick={onSignOut} className="hover:text-blood-light">Sign out</button>
        </div>
      </header>

      <div className="px-5 md:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="New requests" value={stats.fresh} hot={stats.fresh > 0} />
          <Stat label="Awaiting deposit" value={stats.deposit} />
          <Stat label="Confirmed upcoming" value={stats.upcoming} />
          <Stat label="Booked value" value={money(stats.value)} />
        </div>

        <div className="mt-6 flex gap-6 border-b border-bone/10 font-mono text-[11px] uppercase tracking-[0.25em]">
          {[['requests', 'Requests'], ['calendar', 'Calendar']].map(([id, label]) => (
            <button key={id} onClick={() => setView(id)} className={`pb-3 -mb-px border-b-2 ${view === id ? 'border-blood text-bone' : 'border-transparent text-bone-mute hover:text-bone'}`}>
              {label}
            </button>
          ))}
        </div>

        {view === 'calendar' && (
          <Schedule rows={rows} onPick={(id) => { setSelected(id); setView('requests'); setFilter('all'); }} />
        )}

        {view === 'requests' && (<>
        <div className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${
                filter === f.id ? 'border-blood bg-blood/15 text-bone' : 'border-bone/15 text-bone-dim hover:border-bone/40'
              }`}
            >
              {f.label} <span className="text-bone-mute">{counts[f.id]}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 border border-bone/10 grid md:grid-cols-[360px_1fr] min-h-[60vh]">
          {/* list */}
          <div className={`${current ? 'hidden md:block' : 'block'} md:border-r border-bone/10 md:max-h-[70vh] overflow-y-auto`}>
            <div className="p-3 border-b border-bone/10">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, email or code"
                className="w-full bg-transparent border border-bone/15 focus:border-blood outline-none px-3 py-2 text-sm"
              />
            </div>
            {loading && <div className="p-6 text-bone-mute text-sm">Loading…</div>}
            {loadErr && <div className="p-6 text-blood-light text-sm">{loadErr}</div>}
            {!loading && !loadErr && list.length === 0 && <div className="p-6 text-bone-mute text-sm">Nothing here yet.</div>}
            {list.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelected(r.id)}
                className={`w-full text-left px-4 py-3 border-b border-bone/10 transition-colors ${
                  selected === r.id ? 'bg-blood/10' : 'hover:bg-bone/5'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium truncate">{r.name}</span>
                  <Badge status={r.status} />
                </div>
                <div className="mt-1 flex justify-between gap-2 text-xs text-bone-mute">
                  <span className="truncate">
                    {KIND[r.kind] || r.kind}
                    {r.session_date ? ` · ${shortDate(r.session_date)}` : ''}
                  </span>
                  <span className="shrink-0">{timeAgo(r.created_at)}</span>
                </div>
              </button>
            ))}
          </div>

          {/* detail */}
          <div className={`${current ? 'block' : 'hidden md:flex'} md:max-h-[70vh] overflow-y-auto`}>
            {current ? (
              <div className="w-full">
                <Detail key={current.id} b={current} onUpdate={update} onBack={() => setSelected(null)} />
              </div>
            ) : (
              <div className="m-auto text-bone-mute text-sm p-10 text-center">Select a request to see the details.</div>
            )}
          </div>
        </div>
        </>)}
      </div>

      {toast && (
        <div className="fixed bottom-5 right-5 z-[150] bg-blood text-white px-5 py-3 text-sm shadow-xl">{toast}</div>
      )}
    </div>
  );
}