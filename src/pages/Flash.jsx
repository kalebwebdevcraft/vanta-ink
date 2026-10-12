import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Heart, X, ArrowUpRight, ArrowRight } from 'lucide-react';

import FlashArt from '../components/FlashArt';
import { MaskLines, Eyebrow, Reveal, Magnetic, EASE } from '../components/Motion';
import { FLASH } from '../data/flash';

const STYLES = ['All', ...Array.from(new Set(FLASH.map((f) => f.style)))];
const SAVED_KEY = 'vanta-saved-flash';

/* ---------- saved designs (remembered in the browser) ---------- */
function useSaved() {
  const [saved, setSaved] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SAVED_KEY)) || [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
    } catch {
      /* storage unavailable, ignore */
    }
  }, [saved]);
  const toggle = (id) => setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  return [saved, toggle];
}

/* ---------- one flash card with 3D tilt ---------- */
function FlashCard({ piece, isSaved, onToggleSave, onOpen }) {
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 180, damping: 18 });
  const sry = useSpring(ry, { stiffness: 180, damping: 18 });

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 14);
    rx.set(-py * 14);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  const claimed = piece.status === 'claimed';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <motion.div
        ref={ref}
        role="button"
        tabIndex={0}
        data-cursor="OPEN"
        onClick={() => onOpen(piece)}
        onKeyDown={(e) => e.key === 'Enter' && onOpen(piece)}
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
        className="group relative border border-bone/10 bg-ink-900 hover:border-blood/60 transition-colors duration-500 outline-none focus-visible:border-blood"
      >
        <div className="relative aspect-square p-8 md:p-10 text-bone overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(225,29,46,0.16),transparent_65%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <motion.div layoutId={`art-${piece.id}`} className="relative w-full h-full">
            <FlashArt art={piece.art} className="w-full h-full transition-transform duration-700 group-hover:scale-105" />
          </motion.div>

          {claimed && (
            <span className="absolute inset-0 flex items-center justify-center bg-ink-950/65 font-display text-4xl uppercase text-blood rotate-[-8deg] pointer-events-none">
              Claimed
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(piece.id);
            }}
            aria-label={isSaved ? 'Remove from saved' : 'Save design'}
            className="absolute top-3 right-3 p-2 rounded-full border border-bone/15 bg-ink-950/60 backdrop-blur-sm hover:border-blood transition-colors"
          >
            <Heart size={15} className={isSaved ? 'fill-blood text-blood' : 'text-bone-dim'} />
          </button>

          <span className="absolute top-4 left-4 font-mono text-[9px] uppercase tracking-[0.3em] text-bone-mute">{piece.id.toUpperCase()}</span>
        </div>

        <div className="flex items-end justify-between p-5 border-t border-bone/10">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-bone-mute">
              {piece.style} · {piece.size}
            </div>
            <div className="font-display uppercase text-2xl mt-1">{piece.name}</div>
          </div>
          <div className="font-serif italic text-2xl text-blood-light">${piece.price}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------- detail modal ---------- */
function FlashModal({ piece, isSaved, onToggleSave, onClose }) {
  const navigate = useNavigate();
  const claimed = piece.status === 'claimed';
  const deposit = Math.round(piece.price * 0.3);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    window.__lenis?.stop();
    return () => {
      window.removeEventListener('keydown', onKey);
      window.__lenis?.start();
    };
  }, [onClose]);

  const claim = () => {
    onClose();
    setTimeout(() => navigate(claimed ? `/book?custom=${piece.id}` : `/book?flash=${piece.id}`), 250);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-10 bg-ink-950/85 backdrop-blur-md"
      onClick={onClose}
      data-lenis-prevent
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl max-h-[92svh] overflow-y-auto grid md:grid-cols-2 bg-ink-900 border border-bone/15"
      >
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 z-10 p-2 text-bone hover:text-blood transition-colors">
          <X size={24} />
        </button>

        <div className="relative aspect-square md:aspect-auto md:min-h-[520px] p-12 md:p-16 text-bone border-b md:border-b-0 md:border-r border-bone/10 bg-[radial-gradient(circle_at_50%_45%,rgba(225,29,46,0.18),transparent_70%)]">
          <motion.div layoutId={`art-${piece.id}`} className="w-full h-full">
            <FlashArt art={piece.art} className="w-full h-full" />
          </motion.div>
          {claimed && (
            <span className="absolute left-6 bottom-6 font-display text-3xl uppercase text-blood rotate-[-6deg]">Claimed</span>
          )}
        </div>

        <div className="p-7 md:p-12 flex flex-col">
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-blood-light">{piece.id.toUpperCase()} · {piece.style}</span>
          <h3 className="mt-3 font-display uppercase text-5xl md:text-6xl leading-[0.9]">{piece.name}</h3>

          <dl className="mt-8 grid grid-cols-2 gap-y-5 gap-x-6 text-sm">
            {[
              ['Size', piece.size],
              ['Best on', piece.placement],
              ['Price', `$${piece.price}`],
              ['Deposit', `$${deposit}`],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-[9px] uppercase tracking-[0.3em] text-bone-mute">{k}</dt>
                <dd className="mt-1 font-serif italic text-xl text-bone">{v}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-8 text-sm text-bone-dim leading-relaxed">
            {claimed
              ? 'This flash has already been tattooed and is retired. You can request a custom variation: same spirit, drawn fresh for you.'
              : 'Flash is drawn once and tattooed once. Claim it and it is yours exclusively, removed from the sheet the moment your deposit lands.'}
          </p>

          <div className="mt-auto pt-10 flex flex-wrap gap-3">
            <Magnetic>
              <button onClick={claim} className="btn-blood" data-cursor={claimed ? 'ASK' : 'CLAIM'}>
                <span>{claimed ? 'Request a variation' : 'Claim this flash'}</span>
                <ArrowUpRight size={14} />
              </button>
            </Magnetic>
            <button onClick={() => onToggleSave(piece.id)} className="btn-ghost">
              <Heart size={14} className={isSaved ? 'fill-blood text-blood' : ''} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------- page ---------- */
export default function Flash() {
  const [style, setStyle] = useState('All');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [sort, setSort] = useState('default');
  const [open, setOpen] = useState(null);
  const [saved, toggleSaved] = useSaved();

  const list = useMemo(() => {
    let out = FLASH.filter(
      (f) => (style === 'All' || f.style === style) && (!onlyAvailable || f.status === 'available') && (!savedOnly || saved.includes(f.id))
    );
    if (sort === 'price-asc') out = [...out].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') out = [...out].sort((a, b) => b.price - a.price);
    return out;
  }, [style, onlyAvailable, savedOnly, sort, saved]);

  const available = FLASH.filter((f) => f.status === 'available').length;
  const claimed = FLASH.length - available;

  return (
    <>
      {/* header */}
      <section className="relative pt-36 md:pt-48 pb-12 px-5 md:px-10 max-w-7xl mx-auto overflow-hidden">
        <div aria-hidden className="absolute -top-4 right-0 font-display text-[30vw] leading-none outline-text opacity-30 select-none pointer-events-none">
          FLASH
        </div>
        <Eyebrow>Flash sheet · Vol. 01</Eyebrow>
        <MaskLines
          as="h1"
          trigger="mount"
          delay={0.7}
          className="relative mt-6 font-display uppercase text-[19vw] md:text-[12vw] leading-[0.88]"
          lines={['The', <span key="s" className="outline-blood">sheet.</span>]}
        />
        <Reveal delay={0.9} className="relative mt-8 flex flex-wrap items-center gap-x-8 gap-y-2 font-mono text-[11px] uppercase tracking-[0.25em] text-bone-dim">
          <span><span className="text-blood-light">{available}</span> available</span>
          <span><span className="text-blood-light">{claimed}</span> claimed</span>
          <span><span className="text-blood-light">{saved.length}</span> saved</span>
        </Reveal>
      </section>

      {/* filters */}
      <section className="sticky top-[68px] z-30 border-y border-bone/10 bg-ink-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-4 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0 -mx-1 px-1" data-lenis-prevent-wheel>
            {STYLES.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`relative shrink-0 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] border transition-colors duration-500 ${
                  style === s ? 'text-white border-blood' : 'text-bone-dim border-bone/15 hover:text-bone hover:border-bone/40'
                }`}
              >
                {style === s && (
                  <motion.span layoutId="style-pill" transition={{ type: 'spring', stiffness: 320, damping: 32 }} className="absolute inset-0 bg-blood" />
                )}
                <span className="relative">{s}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:ml-auto font-mono text-[10px] uppercase tracking-[0.22em] text-bone-dim">
            <label className="flex items-center gap-2 cursor-pointer select-none" data-cursor="">
              <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} className="accent-[#e11d2e] w-3.5 h-3.5" />
              Available only
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={savedOnly} onChange={(e) => setSavedOnly(e.target.checked)} className="accent-[#e11d2e] w-3.5 h-3.5" />
              Saved only
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-ink-900 border border-bone/15 px-3 py-2 text-bone-dim outline-none focus:border-blood"
            >
              <option value="default">Sort: Featured</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>
        </div>
      </section>

      {/* grid */}
      <section className="max-w-7xl mx-auto px-5 md:px-10 py-12 md:py-16 min-h-[60svh]">
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
          <AnimatePresence mode="popLayout">
            {list.map((p) => (
              <FlashCard key={p.id} piece={p} isSaved={saved.includes(p.id)} onToggleSave={toggleSaved} onOpen={setOpen} />
            ))}
          </AnimatePresence>
        </motion.div>

        {list.length === 0 && (
          <div className="py-24 text-center">
            <div className="font-display uppercase text-5xl text-bone-mute">Nothing here.</div>
            <p className="mt-3 text-bone-dim">Try another style, or clear a filter.</p>
          </div>
        )}
      </section>

      {/* custom CTA */}
      <section className="border-t border-bone/10 px-5 md:px-10 py-24 md:py-36 text-center">
        <Eyebrow className="justify-center">Nothing on the sheet?</Eyebrow>
        <MaskLines
          as="h2"
          className="mt-6 font-display uppercase text-6xl md:text-9xl leading-[0.88]"
          lines={['Draw it', <span key="f" className="outline-blood">for me.</span>]}
        />
        <Reveal delay={0.2} className="mt-10">
          <Link to="/book" className="btn-ghost" data-cursor="BOOK">
            Start a custom piece <ArrowRight size={14} />
          </Link>
        </Reveal>
      </section>

      <AnimatePresence>
        {open && (
          <FlashModal
            key={open.id}
            piece={open}
            isSaved={saved.includes(open.id)}
            onToggleSave={toggleSaved}
            onClose={() => setOpen(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}