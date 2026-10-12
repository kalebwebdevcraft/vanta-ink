import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * Custom cursor: a small dot plus a trailing ring.
 * Hover any <a>/<button> and the ring grows.
 * Add data-cursor="VIEW" to any element to show a label inside the ring.
 */
export default function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 220, damping: 26, mass: 0.5 });
  const ry = useSpring(y, { stiffness: 220, damping: 26, mass: 0.5 });

  const [enabled, setEnabled] = useState(false);
  const [hover, setHover] = useState(false);
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    setEnabled(true);
    document.documentElement.classList.add('has-cursor');

    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target.closest ? e.target.closest('a, button, [data-cursor]') : null;
      setHover(!!t);
      setLabel(t ? t.getAttribute('data-cursor') || '' : '');
    };
    const leave = () => {
      x.set(-100);
      y.set(-100);
    };

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      document.documentElement.classList.remove('has-cursor');
    };
  }, [x, y]);

  if (!enabled) return null;

  const size = label ? 92 : hover ? 56 : 34;

  return (
    <>
      {/* trailing ring */}
      <motion.div style={{ x: rx, y: ry }} className="fixed top-0 left-0 z-[300] pointer-events-none">
        <motion.div
          animate={{
            width: size,
            height: size,
            backgroundColor: label ? 'rgba(225,29,46,0.95)' : hover ? 'rgba(225,29,46,0.18)' : 'rgba(225,29,46,0)',
            borderColor: label ? 'rgba(225,29,46,1)' : 'rgba(236,230,218,0.55)',
          }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border flex items-center justify-center"
        >
          {label && <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white">{label}</span>}
        </motion.div>
      </motion.div>

      {/* precise dot */}
      <motion.div style={{ x, y }} className="fixed top-0 left-0 z-[301] pointer-events-none">
        <div className={`absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blood transition-all duration-300 ${label ? 'w-0 h-0' : 'w-1.5 h-1.5'}`} />
      </motion.div>
    </>
  );
}
