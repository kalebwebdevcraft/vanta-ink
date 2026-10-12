    import React from 'react';
import { motion } from 'framer-motion';
import { EASE } from './Motion';
import { STUDIO } from '../data/studio';

/**
 * Wrap every page with this. On navigation a blood-red curtain
 * rises over the old page, then drops away to reveal the new one.
 */
export default function PageTransition({ children }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.6, delay: 0.55 } }}
        exit={{ opacity: 0, transition: { duration: 0.4 } }}
      >
        {children}
      </motion.div>

      {/* curtain */}
      <motion.div
        initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
        animate={{ clipPath: 'inset(100% 0% 0% 0%)', transition: { duration: 0.9, ease: EASE, delay: 0.15 } }}
        exit={{ clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 0.7, ease: EASE } }}
        className="fixed inset-0 z-[250] bg-blood flex items-center justify-center pointer-events-none"
      >
        <span className="font-display text-[22vw] md:text-[14vw] leading-none text-ink-950 tracking-tight">{STUDIO.name}</span>
      </motion.div>
    </>
  );
}
