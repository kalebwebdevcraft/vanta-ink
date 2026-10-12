import React, { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';
import { EASE } from './Motion';
import { STUDIO } from '../data/studio';

/**
 * Loading intro: letters rise, a counter runs to 100, then the curtain lifts.
 * App shows it once per browser session.
 */
export default function Intro({ onDone }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';

    const c = animate(0, 100, {
      duration: 2.2,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => setCount(Math.round(v)),
      onComplete: () => setTimeout(onDone, 300),
    });

    return () => {
      c.stop();
      html.style.overflow = prev;
    };
  }, [onDone]);

  return (
    <motion.div
      initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      exit={{ clipPath: 'inset(0% 0% 100% 0%)', transition: { duration: 1, ease: EASE } }}
      className="fixed inset-0 z-[400] bg-ink-950 flex items-center justify-center"
    >
      <div className="flex overflow-hidden">
        {STUDIO.name.split('').map((ch, i) => (
          <motion.span
            key={i}
            initial={{ y: '110%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 1, ease: EASE, delay: 0.15 + i * 0.09 }}
            className="font-display text-[26vw] md:text-[16vw] leading-[0.95] text-bone"
          >
            {ch}
          </motion.span>
        ))}
        <motion.span
          initial={{ y: '110%' }}
          animate={{ y: '0%' }}
          transition={{ duration: 1, ease: EASE, delay: 0.15 + STUDIO.name.length * 0.09 }}
          className="font-display text-[26vw] md:text-[16vw] leading-[0.95] text-blood"
        >
          .
        </motion.span>
      </div>

      <div className="absolute bottom-8 left-5 md:left-10 right-5 md:right-10 flex items-end justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-bone-mute">{STUDIO.full}</span>
        <span className="font-display text-6xl md:text-8xl leading-none text-bone tabular-nums">{String(count).padStart(3, '0')}</span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-bone/10">
        <div className="h-full bg-blood" style={{ width: `${count}%` }} />
      </div>
    </motion.div>
  );
}