import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

// Silky easing used everywhere so the whole site moves with one personality
export const EASE = [0.22, 1, 0.36, 1];

/** Fade + rise + de-blur when scrolled into view */
export function Reveal({ children, delay = 0, y = 40, className = '', once = true, amount = 0.25 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, amount }}
      transition={{ duration: 1.1, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Masked line-by-line text reveal. Each line slides up from behind a mask.
 * lines: array of strings or React nodes.
 */
export function MaskLines({ lines, className = '', lineClassName = '', delay = 0, stagger = 0.12, trigger = 'view', as = 'div' }) {
  const Tag = motion[as] || motion.div;
  const when =
    trigger === 'mount'
      ? { animate: 'show' }
      : { whileInView: 'show', viewport: { once: true, amount: 0.4 } };

  return (
    <Tag initial="hidden" {...when} transition={{ staggerChildren: stagger, delayChildren: delay }} className={className}>
      {lines.map((line, i) => (
        <span key={i} className={`block overflow-hidden pb-[0.1em] -mb-[0.1em] ${lineClassName}`}>
          <motion.span
            className="block will-change-transform"
            variants={{
              hidden: { y: '118%', rotate: 3 },
              show: { y: '0%', rotate: 0, transition: { duration: 1.2, ease: EASE } },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Small label with a red rule */
export function Eyebrow({ children, className = '' }) {
  return (
    <Reveal y={16} className={`flex items-center gap-3 ${className}`}>
      <span className="h-px w-8 bg-blood" />
      <span className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.35em] text-blood-light">{children}</span>
    </Reveal>
  );
}

/** Element that gently pulls toward the cursor (great for buttons) */
export function Magnetic({ children, strength = 0.35, className = '' }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} style={{ x: sx, y: sy }} className={`inline-block ${className}`}>
      {children}
    </motion.div>
  );
}
