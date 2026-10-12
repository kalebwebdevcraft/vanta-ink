import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';

import WorkScene from '../components/WorkScene';
import HealSlider from '../components/HealSlider';
import { MaskLines, Eyebrow, Reveal, Magnetic, EASE } from '../components/Motion';
import { WORK, WORK_STYLES, WORK_PLACEMENTS } from '../data/work';

/* ---------- gallery tile ---------- */
function Tile({ piece, index, onOpen }) {
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(piece)}
      data-cursor="VIEW"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: EASE, delay: (index % 6) * 0.07 }}
      className="group relative block w-full mb-5 md:mb-6 break-inside-avoid border border-bone/10 hover:border-blood/60 transition-colors duration-500 text-left overflow-hidden"
    >
      <div className="transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]">
        <WorkScene piece={piece} />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="absolute left-0 right-0 bottom-0 p-5 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
        <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-blood-light">
          {piece.style} · {piece.placement}
        </div>
        <div className="font-display uppercase text-3xl leading-none mt-1">{piece.title}</div>
      </div>

      <span className="absolute top-3 left-3 font-mono text-[9px] uppercase tracking-[0.3em] text-bone/70 mix-blend-difference">
        {String(index + 1).padStart(2, '0')}
      </span>
    </motion.button>
  );
}

/* ---------- lightbox ---------- */
function Lightbox({ list, index, setIndex, onClose }) {
  const navigate = useNavigate();
  const piece = list[index];
  const dir = useRef(1);

  const go = useCallback(
    (d) => {
      dir.current = d;
      setIndex((i) => (i + d + list.length) % list.length);
    },
    [list.length, setIndex]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    window.__lenis?.stop();
    return () => {
      window.removeEventListener('keydown', onKey);
      window.__lenis?.start();
    };
  }, [go, onClose]);

  const book = () => {
    onClose();
    setTimeout(() => navigate(`/book?ref=${piece.id}`), 250);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[120] bg-ink-950/92 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
      onClick={onClose}
      data-lenis-prevent
    >
      <button onClick={onClose} aria-label="Close" className="absolute top-5 right-5 z-10 p-2 text-bone hover:text-blood transition-colors">
        <X size={28} />
      </button>

      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-6xl max-h-[92svh] overflow-y-auto grid md:grid-cols-[1.2fr_1fr] bg-ink-900 border border-bone/15">
        <div className="relative bg-ink-950 flex items-center justify-center p-4 md:p-8 min-h-[320px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={piece.id}
              initial={{ opacity: 0, x: 60 * dir.current }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 * dir.current }}
              transition={{ duration: 0.5, ease: EASE }}
              className="w-full max-w-md md:max-w-lg"
            >
              <WorkScene piece={piece} />
            </motion.div>
          </AnimatePresence>

          <button onClick={() => go(-1)} aria-label="Previous" className="absolute left-3 top-1/2 -translate-y-1/2 p-3 border border-bone/20 bg-ink-950/70 hover:border-blood hover:text-blood transition-colors">
            <ArrowLeft size={18} />
          </button>
          <button onClick={() => go(1)} aria-label="Next" className="absolute right-3 top-1/2 -translate-y-1/2 p-3 border border-bone/20 bg-ink-950/70 hover:border-blood hover:text-blood transition-colors">
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="p-7 md:p-10 flex flex-col">
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-blood-light">
            {String(index + 1).padStart(2, '0')} / {String(list.length).padStart(2, '0')}
          </span>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={piece.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <h3 className="mt-3 font-display uppercase text-5xl md:text-6xl leading-[0.9]">{piece.title}</h3>
              <dl className="mt-8 grid grid-cols-2 gap-y-5 gap-x-6">
                {[
                  ['Style', piece.style],
                  ['Placement', piece.placement],
                  ['Time', piece.time],
                  ['Year', piece.year],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-mono text-[9px] uppercase tracking-[0.3em] text-bone-mute">{k}</dt>
                    <dd className="mt-1 font-serif italic text-xl">{v}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </AnimatePresence>

          <p className="mt-8 text-sm text-bone-dim leading-relaxed">
            Want something in this spirit? Start a booking and this piece is attached as your reference.
          </p>

          <div className="mt-auto pt-8">
            <Magnetic>
              <button onClick={book} className="btn-blood" data-cursor="BOOK">
                <span>Book something like this</span>
                <ArrowUpRight size={14} />
              </button>
            </Magnetic>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- process timeline ---------- */
const PROCESS = [
  { n: '01', t: 'Consult', d: 'We talk idea, placement and size. Online or in studio.' },
  { n: '02', t: 'Design', d: 'Your piece is drawn from scratch. One revision included.' },
  { n: '03', t: 'Stencil', d: 'We place it on your body and adjust until it flows.' },
  { n: '04', t: 'Session', d: 'Clean, calm, unhurried. Breaks whenever you need.' },
  { n: '05', t: 'Aftercare', d: 'A day-by-day healing plan and a free touch-up check.' },
];

function Process() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.75', 'end 0.7'] });

  return (
    <section className="px-5 md:px-10 py-28 md:py-40 max-w-7xl mx-auto">
      <Eyebrow>The process</Eyebrow>
      <MaskLines
        as="h2"
        className="mt-6 font-display uppercase text-5xl md:text-8xl leading-[0.9]"
        lines={['From idea', <span key="s" className="outline-blood">to skin.</span>]}
      />

      <div ref={ref} className="relative mt-16 md:mt-24">
        <div className="hidden md:block absolute top-[1.1rem] left-0 right-0 h-px bg-bone/10" />
        <motion.div style={{ scaleX: scrollYProgress }} className="hidden md:block absolute top-[1.1rem] left-0 right-0 h-px bg-blood origin-left" />

        <div className="grid md:grid-cols-5 gap-10 md:gap-6">
          {PROCESS.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.08}>
              <div className="relative flex md:block items-start gap-5">
                <span className="relative z-10 inline-flex items-center justify-center w-9 h-9 bg-ink-950 border border-blood text-blood-light font-mono text-xs shrink-0">{p.n}</span>
                <div className="md:mt-6">
                  <h3 className="font-display uppercase text-3xl">{p.t}</h3>
                  <p className="mt-2 text-sm text-bone-dim leading-relaxed">{p.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- page ---------- */
export default function Portfolio() {
  const [style, setStyle] = useState('All');
  const [place, setPlace] = useState('Anywhere');
  const [openIndex, setOpenIndex] = useState(null);

  const list = useMemo(
    () => WORK.filter((w) => (style === 'All' || w.style === style) && (place === 'Anywhere' || w.placement === place)),
    [style, place]
  );

  const close = useCallback(() => setOpenIndex(null), []);

  return (
    <>
      {/* header */}
      <section className="relative pt-36 md:pt-48 pb-12 px-5 md:px-10 max-w-7xl mx-auto overflow-hidden">
        <div aria-hidden className="absolute -top-4 right-0 font-display text-[30vw] leading-none outline-text opacity-30 select-none pointer-events-none">
          WORK
        </div>
        <Eyebrow>Selected work · 2024 — 2026</Eyebrow>
        <MaskLines
          as="h1"
          trigger="mount"
          delay={0.7}
          className="relative mt-6 font-display uppercase text-[19vw] md:text-[12vw] leading-[0.88]"
          lines={['The', <span key="w" className="outline-blood">work.</span>]}
        />
      </section>

      {/* filters */}
      <section className="sticky top-[68px] z-30 border-y border-bone/10 bg-ink-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-4 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0 -mx-1 px-1">
            {WORK_STYLES.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`relative shrink-0 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] border transition-colors duration-500 ${
                  style === s ? 'text-white border-blood' : 'text-bone-dim border-bone/15 hover:text-bone hover:border-bone/40'
                }`}
              >
                {style === s && (
                  <motion.span layoutId="work-pill" transition={{ type: 'spring', stiffness: 320, damping: 32 }} className="absolute inset-0 bg-blood" />
                )}
                <span className="relative">{s}</span>
              </button>
            ))}
          </div>
          <select
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            className="lg:ml-auto w-full lg:w-auto bg-ink-900 border border-bone/15 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-bone-dim outline-none focus:border-blood"
          >
            {WORK_PLACEMENTS.map((p) => (
              <option key={p} value={p}>
                {p === 'Anywhere' ? 'Placement: Anywhere' : `Placement: ${p}`}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* gallery */}
      <section className="max-w-7xl mx-auto px-5 md:px-10 py-12 md:py-16 min-h-[60svh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={style + place}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="columns-1 sm:columns-2 lg:columns-3 gap-5 md:gap-6"
          >
            {list.map((p, i) => (
              <Tile key={p.id} piece={p} index={i} onOpen={() => setOpenIndex(i)} />
            ))}
          </motion.div>
        </AnimatePresence>

        {list.length === 0 && (
          <div className="py-24 text-center">
            <div className="font-display uppercase text-5xl text-bone-mute">Nothing yet.</div>
            <p className="mt-3 text-bone-dim">No pieces match, try another filter.</p>
          </div>
        )}
      </section>

      {/* healed slider */}
      <section className="border-t border-bone/10 px-5 md:px-10 py-24 md:py-36 max-w-6xl mx-auto">
        <Eyebrow>Fresh vs healed</Eyebrow>
        <MaskLines
          as="h2"
          className="mt-6 font-display uppercase text-5xl md:text-8xl leading-[0.9]"
          lines={['Built to', <span key="h" className="outline-blood">heal clean.</span>]}
        />
        <p className="mt-6 max-w-lg text-bone-dim">
          Fresh ink always looks louder. Drag the line to see the same piece at day zero and after six weeks.
        </p>
        <Reveal className="mt-12">
          <HealSlider />
        </Reveal>
      </section>

      <Process />

      {/* CTA */}
      <section className="border-t border-bone/10 px-5 md:px-10 py-24 md:py-36 text-center">
        <MaskLines
          as="h2"
          className="font-display uppercase text-6xl md:text-9xl leading-[0.88]"
          lines={['Your skin.', <span key="y" className="outline-blood">Next.</span>]}
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

      <AnimatePresence>
        {openIndex !== null && <Lightbox list={list} index={openIndex} setIndex={setOpenIndex} onClose={close} />}
      </AnimatePresence>
    </>
  );
}