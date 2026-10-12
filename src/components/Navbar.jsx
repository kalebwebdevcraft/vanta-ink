import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { EASE } from './Motion';
import { STUDIO, NAV_LINKS } from '../data/studio';

export default function Navbar() {
  const { scrollY } = useScroll();
  const location = useLocation();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // hide on scroll down, show on scroll up
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(latest > 40);
    setHidden(latest > prev && latest > 160 && !open);
  });

  // close mobile menu on navigation
  useEffect(() => setOpen(false), [location.pathname]);

  // freeze page scroll while the menu is open
  useEffect(() => {
    if (open) window.__lenis?.stop();
    else window.__lenis?.start();
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -90, opacity: 0 }}
        animate={{ y: hidden ? -110 : 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="fixed top-0 left-0 right-0 z-[80] px-5 md:px-10 py-4"
      >
        <nav
          className={`mx-auto max-w-7xl flex items-center justify-between px-5 md:px-7 py-3 transition-all duration-700 ${
            scrolled ? 'bg-ink-950/75 backdrop-blur-xl border border-bone/10' : 'border border-transparent'
          }`}
        >
          <Link to="/" className="font-display text-2xl md:text-3xl tracking-[0.18em] text-bone leading-none">
            {STUDIO.name}
            <span className="text-blood">.</span>
          </Link>

          <ul className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) =>
                    `group relative font-mono text-[11px] uppercase tracking-[0.28em] transition-colors ${
                      isActive ? 'text-bone' : 'text-bone-dim hover:text-bone'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {l.label}
                      <span
                        className={`absolute -bottom-1.5 left-0 h-px w-full origin-left bg-blood transition-transform duration-500 ${
                          isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Link to="/book" className="btn-blood hidden sm:inline-flex !py-2.5 !px-5">
              <span>Book consult</span>
              <ArrowUpRight size={13} />
            </Link>
            <button onClick={() => setOpen(true)} className="md:hidden p-2 text-bone" aria-label="Open menu">
              <Menu size={24} />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: 'circle(0% at 90% 5%)' }}
            animate={{ clipPath: 'circle(150% at 90% 5%)' }}
            exit={{ clipPath: 'circle(0% at 90% 5%)' }}
            transition={{ duration: 0.8, ease: EASE }}
            className="fixed inset-0 z-[95] bg-ink-950 flex flex-col justify-center px-8"
          >
            <button onClick={() => setOpen(false)} className="absolute top-6 right-6 p-2 text-bone" aria-label="Close menu">
              <X size={28} />
            </button>
            <ul className="space-y-2">
              {NAV_LINKS.map((l, i) => (
                <motion.li
                  key={l.to}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.08, duration: 0.8, ease: EASE }}
                >
                  <Link to={l.to} className="font-display text-7xl uppercase text-bone hover:text-blood transition-colors">
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <p className="absolute bottom-8 left-8 font-mono text-[10px] uppercase tracking-[0.3em] text-bone-mute">
              {STUDIO.instagram} · {STUDIO.city}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
