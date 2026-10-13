import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { SLOT_TIMES, toISO } from '../lib/booking';
import { STATUS, shortDate, todayISO } from './helpers';

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Schedule({ rows, onPick }) {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [blocked, setBlocked] = useState([]);
  const [day, setDay] = useState(todayISO());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('blocked_slots').select('*');
    if (error) setErr('Could not load days off. Did you run b3-calendar.sql?');
    else {
      setErr('');
      setBlocked(data);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const live = useMemo(() => rows.filter((r) => ['approved', 'confirmed'].includes(r.status) && r.session_date), [rows]);
  const pending = useMemo(() => rows.filter((r) => ['new', 'reviewing'].includes(r.status) && r.session_date), [rows]);

  const dayBlock = (iso) => blocked.find((b) => b.day === iso && !b.slot_time);
  const slotBlock = (iso, t) => blocked.find((b) => b.day === iso && b.slot_time === t);

  const toggle = async (iso, t) => {
    setBusy(true);
    setErr('');
    const existing = t ? slotBlock(iso, t) : dayBlock(iso);
    const q = existing
      ? supabase.from('blocked_slots').delete().eq('id', existing.id)
      : supabase.from('blocked_slots').insert({ day: iso, slot_time: t || null });
    const { error } = await q;
    setBusy(false);
    if (error) setErr('Could not save that change.');
    else load();
  };

  // month grid
  const y = month.getFullYear();
  const m = month.getMonth();
  const lead = (new Date(y, m, 1).getDay() + 6) % 7;
  const total = new Date(y, m + 1, 0).getDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: total }, (_, i) => toISO(new Date(y, m, i + 1)))];
  const today = todayISO();

  const dayRows = [...live, ...pending].filter((r) => r.session_date === day);

  return (
    <div className="mt-4 border border-bone/10 grid lg:grid-cols-[1fr_380px]">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <button onClick={() => setMonth(new Date(y, m - 1, 1))} className="px-3 py-1 border border-bone/15 hover:border-bone/40">←</button>
          <div className="font-display text-2xl uppercase tracking-wide">
            {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <button onClick={() => setMonth(new Date(y, m + 1, 1))} className="px-3 py-1 border border-bone/15 hover:border-bone/40">→</button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-bone-mute">
          {DOW.map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((iso, i) => {
            if (!iso) return <div key={i} />;
            const n = live.filter((r) => r.session_date === iso).length;
            const p = pending.filter((r) => r.session_date === iso).length;
            const off = dayBlock(iso);
            const sel = iso === day;
            return (
              <button
                key={iso}
                onClick={() => setDay(iso)}
                className={`aspect-square p-1 text-left border text-xs transition-colors ${
                  sel ? 'border-blood bg-blood/10' : 'border-bone/10 hover:border-bone/40'
                } ${iso < today ? 'opacity-40' : ''} ${off ? 'bg-bone/5' : ''}`}
              >
                <div className={iso === today ? 'text-blood-light font-bold' : ''}>{Number(iso.slice(8))}</div>
                <div className="mt-1 flex gap-[3px] flex-wrap">
                  {Array.from({ length: n }).map((_, k) => <span key={k} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />)}
                  {Array.from({ length: p }).map((_, k) => <span key={`p${k}`} className="w-1.5 h-1.5 rounded-full bg-amber-400" />)}
                </div>
                {off && <div className="mt-1 font-mono text-[8px] uppercase text-bone-mute">Off</div>}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex gap-5 text-[11px] text-bone-mute">
          <span><span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1" />Approved / confirmed</span>
          <span><span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1" />Waiting for you</span>
        </div>
        <p className="mt-2 text-[11px] text-bone-mute">The public site is open Tuesday to Saturday. Use the controls to close extra days or single slots.</p>
      </div>

      <div className="border-t lg:border-t-0 lg:border-l border-bone/10 p-4 md:p-6">
        <div className="font-display text-3xl uppercase">{shortDate(day)}</div>

        <button
          disabled={busy}
          onClick={() => toggle(day, null)}
          className={`${dayBlock(day) ? 'btn-blood' : 'btn-ghost'} !py-2 !px-4 mt-4 disabled:opacity-50`}
        >
          <span>{dayBlock(day) ? 'Day is closed — reopen' : 'Close this whole day'}</span>
        </button>

        <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-blood-light">Slots</div>
        <div className="mt-2 space-y-2">
          {SLOT_TIMES.map((t) => {
            const b = dayRows.find((r) => r.session_time === t && ['approved', 'confirmed'].includes(r.status));
            const blk = slotBlock(day, t) || dayBlock(day);
            return (
              <div key={t} className="flex items-center justify-between border border-bone/10 px-3 py-2 text-sm">
                <span className="font-mono">{t}</span>
                {b ? (
                  <button onClick={() => onPick(b.id)} className="text-emerald-300 hover:underline truncate ml-3">
                    {b.name} · {STATUS[b.status].label}
                  </button>
                ) : (
                  <button
                    disabled={busy || Boolean(dayBlock(day))}
                    onClick={() => toggle(day, t)}
                    className={`font-mono text-[10px] uppercase tracking-[0.2em] disabled:opacity-40 ${blk ? 'text-blood-light' : 'text-bone-dim hover:text-bone'}`}
                  >
                    {blk ? 'Blocked — open' : 'Free — block'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {dayRows.some((r) => ['new', 'reviewing'].includes(r.status)) && (
          <div className="mt-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-300">Requests for this day</div>
            {dayRows
              .filter((r) => ['new', 'reviewing'].includes(r.status))
              .map((r) => (
                <button key={r.id} onClick={() => onPick(r.id)} className="mt-2 w-full text-left border border-bone/10 px-3 py-2 text-sm hover:border-blood">
                  {r.name} · {r.session_time}
                </button>
              ))}
          </div>
        )}
        {err && <p className="mt-4 text-sm text-blood-light">{err}</p>}
      </div>
    </div>
  );
}