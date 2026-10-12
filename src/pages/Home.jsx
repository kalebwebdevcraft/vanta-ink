import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useInView, animate } from 'framer-motion';
import { ArrowUpRight, ArrowRight } from 'lucide-react';

import InkCanvas from '../components/InkCanvas';
import FlashArt from '../components/FlashArt';
import { MaskLines, Eyebrow, Reveal, Magnetic, EASE } from '../components/Motion';
import { STUDIO } from '../data/studio';
import { FLASH } from '../data/flash';

/* ------------------------------------------------------------------ */
/* 1. HERO                                                             */
/* ------------------------------------------------------------------ */
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const ghostX = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden flex items-center">
      <InkCanvas className="w-full h-full opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/40 via-transparent to-ink-950" />

      <motion.div
        style={{ x: ghostX }}
        aria-hidden
        className="absolute top-[14%] left-0 whitespace-nowrap font-display text-[34vw] leading-none outline-text opacity-40 select-none pointer-events-none"
      >
        INK INK INK
      </motion.div>

      <motion.div style={{ y, opacity: fade }} className="relative z-10 w-full max-w-7xl mx-auto px-5 md:px-10 pt-32 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.9 }}
          className="flex items-center gap-3 mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-blood opacity-70 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blood" />
          </span>
          <span className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.35em] text-bone-dim">
            Books open · {STUDIO.city} · Private studio
          </span>
        </motion.div>

        <MaskLines
          as="h1"
          trigger="mount"
          delay={1}
          stagger={0.14}
          className="font-display uppercase text-[17vw] md:text-[11.5vw] leading-[0.88] tracking-tight text-bone"
          lines={['Skin is the', 'last honest', <span key="c" className="outline-blood">canvas.</span>]}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: EASE, delay: 1.7 }}
          className="mt-10 flex flex-col md:flex-row md:items-end gap-8 md:gap-16"
        >
          <p className="max-w-md font-serif italic text-xl md:text-2xl text-bone-dim leading-snug">
            Custom work and flash by {STUDIO.artist}. Design the piece, pick the spot and lock your date, all in one place.
          </p>
          <div className="flex flex-wrap gap-3">
            <Magnetic>
              <Link to="/book" className="btn-blood" data-cursor="BOOK">
                <span>Book a consultation</span>
                <ArrowUpRight size={14} />
              </Link>
            </Magnetic>
            <Link to="/flash" className="btn-ghost">
              Browse flash
            </Link>
          </div>
        </motion.div>
      </motion.div>

      <motion.div style={{ opacity: fade }} className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 z-10">
        <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-bone-mute">Scroll</span>
        <motion.span
          animate={{ scaleY: [0.2, 1, 0.2] }}
          style={{ originY: 0 }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          className="block h-10 w-px bg-gradient-to-b from-blood to-transparent"
        />
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 2. STYLE MARQUEE                                                    */
/* ------------------------------------------------------------------ */
function StyleMarquee() {
  const items = [...STUDIO.styles, ...STUDIO.styles, ...STUDIO.styles, ...STUDIO.styles];
  const Row = ({ reverse, outline }) => (
    <div className="overflow-hidden">
      <div className={`marquee-track flex gap-10 whitespace-nowrap ${reverse ? 'marquee-reverse' : ''}`}>
        {items.map((s, i) => (
          <span
            key={i}
            className={`flex items-center gap-10 font-display uppercase text-6xl md:text-8xl leading-none ${outline ? 'outline-text' : 'text-bone'}`}
          >
            {s}
            <span className="text-blood text-3xl md:text-5xl">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
  return (
    <section className="py-10 md:py-16 border-y border-bone/10 space-y-4 overflow-hidden">
      <Row />
      <Row reverse outline />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3. MANIFESTO — words light up as you scroll                         */
/* ------------------------------------------------------------------ */
function Word({ word, progress, range }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block mr-[0.28em]">
      {word}
    </motion.span>
  );
}

function Manifesto() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.4'] });
  const text =
    'Every mark is a decision you carry for life. We design it with you, line by line, until it feels like it was always yours.';
  const words = text.split(' ');

  return (
    <section className="relative py-28 md:py-44 px-5 md:px-10 max-w-6xl mx-auto">
      <Eyebrow>The approach</Eyebrow>
      <p ref={ref} className="mt-8 font-serif font-light text-4xl sm:text-5xl md:text-7xl leading-[1.08] text-bone">
        {words.map((w, i) => (
          <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
        ))}
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 4. FLASH — pinned horizontal scroll                                 */
/* ------------------------------------------------------------------ */
function FlashScroller() {
  const section = useRef(null);
  const track = useRef(null);
  const [dist, setDist] = useState(0);
  const { scrollYProgress } = useScroll({ target: section });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    const measure = () => {
      if (track.current) setDist(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener('resize', measure);
    const t = setTimeout(measure, 600);
    return () => {
      window.removeEventListener('resize', measure);
      clearTimeout(t);
    };
  }, []);

  const pieces = FLASH.slice(0, 6);

  return (
    <section ref={section} className="relative h-[340vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden flex flex-col justify-center">
        <div className="px-5 md:px-10 max-w-7xl mx-auto w-full mb-8 md:mb-12 flex items-end justify-between">
          <div>
            <Eyebrow>Flash sheet</Eyebrow>
            <h2 className="mt-4 font-display uppercase text-5xl md:text-8xl leading-[0.9]">
              Ready to <span className="outline-blood">wear.</span>
            </h2>
          </div>
          <Link to="/flash" className="hidden md:inline-flex btn-ghost" data-cursor="ALL">
            Full sheet <ArrowRight size={14} />
          </Link>
        </div>

        <motion.div ref={track} style={{ x }} className="flex gap-5 md:gap-8 pl-5 md:pl-10 pr-[20vw] w-max">
          {pieces.map((p) => (
            <Link
              to="/flash"
              key={p.id}
              data-cursor="VIEW"
              className="group relative w-[72vw] sm:w-[44vw] md:w-[26vw] shrink-0 border border-bone/10 bg-ink-900 hover:border-blood/60 transition-colors duration-500"
            >
              <div className="relative aspect-square overflow-hidden p-8 md:p-10 text-bone">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(225,29,46,0.14),transparent_65%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <FlashArt art={p.art} className="relative w-full h-full transition-transform duration-700 group-hover:scale-110 group-hover:rotate-[-3deg]" />
                {p.status === 'claimed' && (
                  <span className="absolute inset-0 flex items-center justify-center bg-ink-950/70 font-display text-4xl uppercase text-blood rotate-[-8deg]">
                    Claimed
                  </span>
                )}
              </div>
              <div className="flex items-end justify-between p-5 border-t border-bone/10">
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-bone-mute">{p.style}</div>
                  <div className="font-display uppercase text-2xl mt-1">{p.name}</div>
                </div>
                <div className="font-serif italic text-2xl text-blood-light">${p.price}</div>
              </div>
            </Link>
          ))}

          <Link
            to="/flash"
            data-cursor="OPEN"
            className="w-[72vw] sm:w-[44vw] md:w-[26vw] shrink-0 flex flex-col items-center justify-center gap-4 bg-blood text-ink-950 aspect-[3/4] md:aspect-auto"
          >
            <span className="font-display uppercase text-6xl leading-[0.9] text-center">See the<br />full sheet</span>
            <ArrowRight size={36} />
          </Link>
        </motion.div>

        <div className="px-5 md:px-10 max-w-7xl mx-auto w-full mt-10">
          <div className="h-px bg-bone/10 relative">
            <motion.div style={{ width: bar }} className="absolute left-0 top-0 h-px bg-blood" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 5. HOW BOOKING WORKS                                                */
/* ------------------------------------------------------------------ */
const STEPS = [
  { n: '01', t: 'Share the idea', d: 'Describe what you want and upload references. No DM ping-pong.' },
  { n: '02', t: 'Pick the placement', d: 'Tap the body map to show exactly where it goes and how big.' },
  { n: '03', t: 'Get an instant estimate', d: 'See a clear price range before you commit to anything.' },
  { n: '04', t: 'Lock your date', d: 'Choose a slot, pay the deposit, and your session is held.' },
];

function Steps() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.7', 'end 0.6'] });

  return (
    <section className="relative py-28 md:py-44 px-5 md:px-10 max-w-6xl mx-auto">
      <Eyebrow>How booking works</Eyebrow>
      <MaskLines
        as="h2"
        className="mt-6 font-display uppercase text-5xl md:text-8xl leading-[0.9]"
        lines={['Four steps.', <span key="n" className="outline-blood">Zero DMs.</span>]}
      />

      <div ref={ref} className="relative mt-16 md:mt-24 pl-10 md:pl-0">
        <div className="absolute left-3 md:left-[7.5rem] top-0 bottom-0 w-px bg-bone/10" />
        <motion.div style={{ scaleY: scrollYProgress }} className="absolute left-3 md:left-[7.5rem] top-0 bottom-0 w-px bg-blood origin-top" />

        <div className="space-y-14 md:space-y-20">
          {STEPS.map((s) => (
            <Reveal key={s.n} className="relative md:grid md:grid-cols-[7.5rem_1fr] md:gap-16 items-start">
              <span className="absolute -left-[2.45rem] md:static font-display text-4xl md:text-7xl outline-blood leading-none md:text-right">{s.n}</span>
              <div className="md:pl-10">
                <h3 className="font-display uppercase text-3xl md:text-5xl">{s.t}</h3>
                <p className="mt-2 text-bone-dim max-w-md">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 6. COUNTERS                                                         */
/* ------------------------------------------------------------------ */
function Counter({ to, suffix = '', decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => v.toFixed(decimals));

  useEffect(() => {
    if (!inView) return;
    const c = animate(mv, to, { duration: 2.2, ease: EASE });
    return () => c.stop();
  }, [inView, mv, to]);

  return (
    <span ref={ref}>
      <motion.span>{text}</motion.span>
      {suffix}
    </span>
  );
}

function Stats() {
  const stats = [
    { to: 1200, suffix: '+', l: 'Pieces tattooed' },
    { to: 9, suffix: ' yrs', l: 'In the chair' },
    { to: 4.9, decimals: 1, suffix: '★', l: 'Client rating' },
    { to: 24, suffix: 'h', l: 'Reply time' },
  ];
  return (
    <section className="border-y border-bone/10">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.l} className={`px-6 py-12 md:py-16 text-center ${i % 2 === 0 ? 'border-r' : ''} ${i < 2 ? 'border-b md:border-b-0' : ''} md:border-r md:last:border-r-0 border-bone/10`}>
            <div className="font-display text-5xl md:text-7xl text-bone">
              <Counter to={s.to} suffix={s.suffix} decimals={s.decimals} />
            </div>
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-bone-mute">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 7. FINAL CTA                                                        */
/* ------------------------------------------------------------------ */
function FinalCTA() {
  return (
    <section className="relative py-32 md:py-48 px-5 md:px-10 text-center overflow-hidden">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] rounded-full bg-blood/10 blur-[140px] pointer-events-none" />
      <MaskLines
        as="h2"
        className="relative font-display uppercase text-[20vw] md:text-[14vw] leading-[0.85]"
        lines={["Let's", <span key="m" className="outline-blood">mark it.</span>]}
      />
      <Reveal delay={0.2} className="relative mt-12">
        <Magnetic strength={0.4}>
          <Link to="/book" className="btn-blood !px-12 !py-5" data-cursor="BOOK">
            <span>Start your booking</span>
            <ArrowUpRight size={15} />
          </Link>
        </Magnetic>
      </Reveal>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <StyleMarquee />
      <Manifesto />
      <FlashScroller />
      <Steps />
      <Stats />
      <FinalCTA />
    </>
  );
}