import React, { useCallback, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import Lenis from 'lenis';

import Cursor from './components/Cursor';
import Navbar from './components/Navbar';
import PageTransition from './components/PageTransition';
import Footer from './components/Footer';
import Intro from './components/Intro';
import Home from './pages/Home';
import Flash from './pages/Flash';
import Portfolio from './pages/Portfolio';
import Book from './pages/Book';
import Aftercare from './pages/Aftercare';
import NotFound from './pages/NotFound';
import Admin from './admin/Admin';

const TITLES = {
  '/': 'VANTA — Tattoo Atelier',
  '/flash': 'Flash Sheet — VANTA',
  '/portfolio': 'Work — VANTA',
  '/aftercare': 'Aftercare & FAQ — VANTA',
  '/book': 'Book a Consultation — VANTA',
};

const INTRO_KEY = 'vanta-intro-seen';

function shouldShowIntro() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    return !sessionStorage.getItem(INTRO_KEY);
  } catch {
    return true;
  }
}

function PublicSite() {
  const location = useLocation();
  const [intro, setIntro] = useState(shouldShowIntro);

  const finishIntro = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      /* ignore */
    }
    setIntro(false);
  }, []);

  // ---------- Buttery smooth scroll (Lenis) ----------
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
    });
    window.__lenis = lenis;

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  // ---------- Page titles ----------
  useEffect(() => {
    document.title = TITLES[location.pathname] || 'Page not found — VANTA';
  }, [location.pathname]);

  // ---------- Scroll progress line ----------
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 90, damping: 28, restDelta: 0.0005 });

  // jump to top once the old page has fully exited
  const resetScroll = () => {
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  };

  return (
    <div className="relative bg-ink-950 text-bone min-h-screen overflow-x-clip">
      <AnimatePresence>{intro && <Intro key="intro" onDone={finishIntro} />}</AnimatePresence>

      <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-[2px] bg-blood z-[100] origin-left" />
      <div className="grain-overlay" />
      <Cursor />

      {/* the site mounts as the intro curtain lifts, so hero animations play on reveal */}
      {!intro && (
        <>
          <Navbar />

          <AnimatePresence mode="wait" onExitComplete={resetScroll}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/flash" element={<PageTransition><Flash /></PageTransition>} />
              <Route path="/portfolio" element={<PageTransition><Portfolio /></PageTransition>} />
              <Route path="/aftercare" element={<PageTransition><Aftercare /></PageTransition>} />
              <Route path="/book" element={<PageTransition><Book /></PageTransition>} />
              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </AnimatePresence>

          <Footer />
        </>
      )}
    </div>
  );
}

// The artist dashboard lives at /admin and skips all the public-site effects.
export default function App() {
  const { pathname } = useLocation();
  return pathname.startsWith('/admin') ? <Admin /> : <PublicSite />;
}