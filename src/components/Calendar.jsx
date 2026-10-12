import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { slotsFor, dayFull, toISO } from '../lib/booking';
import { EASE } from './Motion';

const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Calendar({ date, time, onDate, onTime, taken = null }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const min = new Date(today);
  min.setDate(min.getDate() + 3); // earliest bookable day

  const [offset, setOffset] = useState(0);
  const base = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const label = base.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const lead = (base.getDay() + 6) % 7; // Monday first
  const count = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const cells = [
    ...Array(lead).fill(null),
    ...Array.from({ length: count }, (_, i) => new Date(base.getFullYear(), base.getMonth(), i + 1)),
  ];

  const status = (d) => {
    const dow = d.getDay(); // 0 Sun .. 6 Sat — studio is open Tue-Sat
    if (d < min || dow === 0 || dow === 1) return 'closed';
    return dayFull(toISO(d), taken) ? 'full' : 'open';
  };

  const slots = date ? slotsFor(date, taken) : [];

  return (
    <div className="grid md:grid-cols-[1.3fr_1fr] gap-10">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="font-display uppercase text-3xl">{label}</div>
          <div className="flex gap-2">
            <button onClick={() => setOffset((o) => Math.max(0, o - 1))} disabled={offset === 0} aria-label="Previous month" className="p-2 border border-bone/20 hover:border-blood disabled:opacity-30 disabled:pointer-events-none transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setOffset((o) => Math.min(2, o + 1))} disabled={offset === 2} aria-label="Next month" className="p-2 border border-bone/20 hover:border-blood disabled:opacity-30 disabled:pointer-events-none transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEK.map((w) => (
            <div key={w} className="text-center font-mono text-[9px] uppercase tracking-[0.2em] text-bone-mute py-2">{w}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <div key={`e${i}`} />;
            const iso = toISO(d);
            const st = status(d);
            const sel = date === iso;
            return (
              <button
                key={iso}
                disabled={st !== 'open'}
                onClick={() => {
                  onDate(iso);
                  onTime(null);
                }}
                className={`relative aspect-square flex flex-col items-center justify-center border text-sm transition-colors duration-300 ${
                  sel
                    ? 'bg-blood border-blood text-white'
                    : st === 'open'
                    ? 'border-bone/20 text-bone hover:border-blood'
                    : 'border-transparent text-bone-mute/50 line-through cursor-not-allowed'
                }`}
              >
                {d.getDate()}
                {st === 'full' && <span className="absolute bottom-1 font-mono text-[7px] uppercase tracking-widest no-underline">full</span>}
              </button>
            );
          })}
        </div>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-bone-mute">Open Tue — Sat · earliest date is 3 days out</p>
      </div>

      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood-light mb-4">Start time</div>
        <AnimatePresence mode="wait">
          {date ? (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="space-y-3"
            >
              {slots.map((s) => (
                <button
                  key={s.time}
                  disabled={!s.free}
                  onClick={() => onTime(s.time)}
                  className={`w-full flex items-center justify-between border px-5 py-4 transition-colors duration-300 ${
                    time === s.time
                      ? 'bg-blood border-blood text-white'
                      : s.free
                      ? 'border-bone/20 hover:border-blood'
                      : 'border-bone/10 text-bone-mute/50 line-through cursor-not-allowed'
                  }`}
                >
                  <span className="font-display text-3xl">{s.time}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em]">{s.free ? 'Available' : 'Taken'}</span>
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.p key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-serif italic text-2xl text-bone-dim">
              Pick a day first.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}