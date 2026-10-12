import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Plus, ArrowUpRight } from 'lucide-react';

import WorkScene from '../components/WorkScene';
import { MaskLines, Eyebrow, Reveal, Magnetic, EASE } from '../components/Motion';
import { WORK } from '../data/work';
import { STAGES, FAQ, WARNING } from '../data/aftercare';

const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

/* ---------- healing timeline ---------- */
function Healing() {
  const [day, setDay] = useState(0);
  const stage = STAGES.find((s) => day >= s.from && day <= s.to) || STAGES[STAGES.length - 1];

  // visual state of the skin over time
  const red = clamp(0.5 * (1 - day / 9), 0, 0.5);
  const haze = clamp(1 - Math.abs(day - 21) / 15, 0, 1) * 0.34;
  const piece = { ...WORK[0], tone: 'pale' };

  return (
    <section className="max-w-7xl mx-auto px-5 md:px-10 py-20 md:py-32">
      <Eyebrow>Healing timeline</Eyebrow>
      <MaskLines
        as="h2"
        className="mt-6 font-display uppercase text-5xl md:text-8xl leading-[0.9]"
        lines={['Drag through', <span key="s" className="outline-blood">six weeks.</span>]}
      />

      <div className="mt-14 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* skin simulation */}
        <div>
          <div className="relative aspect-square max-w-md mx-auto border border-bone/15 overflow-hidden">
            <WorkScene piece={piece} ratio={false} />
            <div className="absolute inset-0 bg-red-700 mix-blend-multiply transition-opacity duration-300" style={{ opacity: red }} />
            <div
              className="absolute inset-0 transition-opacity duration-300"
              style={{ opacity: red * 0.8, background: 'radial-gradient(circle at 50% 50%, rgba(255,120,110,0.5), transparent 70%)' }}
            />
            <div className="absolute inset-0 bg-[#eadfd2] mix-blend-screen blur-[2px] transition-opacity duration-300" style={{ opacity: haze }} />
            <div className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-[0.3em] bg-ink-950/70 backdrop-blur px-3 py-1.5">{stage.title}</div>
          </div>

          <div className="mt-8 max-w-md mx-auto">
            <div className="flex items-end justify-between">
              <div className="font-display text-7xl leading-none text-bone">
                {String(day).padStart(2, '0')}
                <span className="text-bone-mute text-3xl ml-2">days</span>
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood-light pb-2">{stage.range}</div>
            </div>
            <input
              type="range"
              min="0"
              max="42"
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              aria-label="Days since tattoo"
              data-cursor="DRAG"
              className="mt-5 w-full accent-[#e11d2e] cursor-pointer"
            />
            <div className="mt-1 flex justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-bone-mute">
              <span>Day 0</span>
              <span>Week 2</span>
              <span>Week 4</span>
              <span>Week 6</span>
            </div>
          </div>
        </div>

        {/* stage details */}
        <div>
          <div className="flex flex-wrap gap-2 mb-8">
            {STAGES.map((s) => (
              <button
                key={s.id}
                onClick={() => setDay(s.from)}
                className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] border transition-colors duration-500 ${
                  s.id === stage.id ? 'bg-blood border-blood text-white' : 'border-bone/15 text-bone-dim hover:text-bone hover:border-bone/40'
                }`}
              >
                {s.range}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <h3 className="font-display uppercase text-5xl md:text-6xl leading-[0.9]">{stage.title}</h3>
              <p className="mt-5 font-serif italic text-2xl text-bone-dim leading-snug">{stage.look}</p>

              <div className="mt-8 grid sm:grid-cols-2 gap-8">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood-light mb-3">Do</div>
                  <ul className="space-y-3">
                    {stage.do.map((t) => (
                      <li key={t} className="flex gap-3 text-sm text-bone-dim">
                        <Check size={16} className="text-blood shrink-0 mt-0.5" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone-mute mb-3">Don’t</div>
                  <ul className="space-y-3">
                    {stage.dont.map((t) => (
                      <li key={t} className="flex gap-3 text-sm text-bone-dim">
                        <X size={16} className="text-bone-mute shrink-0 mt-0.5" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <p className="mt-10 border-l-2 border-blood pl-4 text-sm text-bone-dim leading-relaxed">
            {WARNING} Always follow your own artist’s instructions first.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
function FaqItem({ item, open, onToggle }) {
  return (
    <div className="border-b border-bone/10">
      <button onClick={onToggle} aria-expanded={open} className="w-full flex items-center justify-between gap-6 py-6 md:py-8 text-left group">
        <span className={`font-display uppercase text-2xl md:text-4xl leading-none transition-colors duration-500 ${open ? 'text-bone' : 'text-bone-dim group-hover:text-bone'}`}>
          {item.q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className={`shrink-0 w-10 h-10 border flex items-center justify-center transition-colors duration-500 ${open ? 'border-blood bg-blood' : 'border-bone/20'}`}
        >
          <Plus size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="pb-8 max-w-2xl text-bone-dim leading-relaxed">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="border-t border-bone/10 max-w-5xl mx-auto px-5 md:px-10 py-24 md:py-36">
      <Eyebrow>Questions</Eyebrow>
      <MaskLines
        as="h2"
        className="mt-6 mb-14 font-display uppercase text-5xl md:text-8xl leading-[0.9]"
        lines={['Before you', <span key="b" className="outline-blood">book.</span>]}
      />
      <div className="border-t border-bone/10">
        {FAQ.map((item, i) => (
          <FaqItem key={item.q} item={item} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
        ))}
      </div>
    </section>
  );
}

/* ---------- page ---------- */
export default function Aftercare() {
  return (
    <>
      <section className="relative pt-36 md:pt-48 pb-6 px-5 md:px-10 max-w-7xl mx-auto overflow-hidden">
        <div aria-hidden className="absolute -top-4 right-0 font-display text-[30vw] leading-none outline-text opacity-30 select-none pointer-events-none">
          CARE
        </div>
        <Eyebrow>Aftercare & FAQ</Eyebrow>
        <MaskLines
          as="h1"
          trigger="mount"
          delay={0.7}
          className="relative mt-6 font-display uppercase text-[19vw] md:text-[12vw] leading-[0.88]"
          lines={['Heal', <span key="r" className="outline-blood">right.</span>]}
        />
      </section>

      <Healing />
      <Faq />

      <section className="border-t border-bone/10 px-5 md:px-10 py-24 md:py-36 text-center">
        <MaskLines
          as="h2"
          className="font-display uppercase text-6xl md:text-9xl leading-[0.88]"
          lines={['Still', <span key="u" className="outline-blood">curious?</span>]}
        />
        <Reveal delay={0.2} className="mt-10">
          <Magnetic>
            <Link to="/book" className="btn-blood" data-cursor="BOOK">
              <span>Book a consultation</span>
              <ArrowUpRight size={14} />
            </Link>
          </Magnetic>
        </Reveal>
      </section>
    </>
  );
}