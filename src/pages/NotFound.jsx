import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { MaskLines, Eyebrow, Reveal, Magnetic } from '../components/Motion';

export default function NotFound() {
  return (
    <section className="relative min-h-[100svh] flex flex-col justify-center px-5 md:px-10 max-w-7xl mx-auto overflow-hidden">
      <div aria-hidden className="absolute right-0 top-1/2 -translate-y-1/2 font-display text-[55vw] leading-none outline-text opacity-25 select-none pointer-events-none">
        404
      </div>
      <Eyebrow>Page not found</Eyebrow>
      <MaskLines
        as="h1"
        trigger="mount"
        delay={0.7}
        className="relative mt-6 font-display uppercase text-[20vw] md:text-[13vw] leading-[0.86]"
        lines={['Lost', <span key="i" className="outline-blood">ink.</span>]}
      />
      <Reveal delay={1} className="relative mt-8 max-w-md text-bone-dim">
        That page doesn’t exist, or it was wiped clean. Let’s get you back to the work.
      </Reveal>
      <Reveal delay={1.15} className="relative mt-10 flex flex-wrap gap-3">
        <Magnetic>
          <Link to="/" className="btn-blood" data-cursor="HOME">
            <span>Back home</span>
            <ArrowUpRight size={14} />
          </Link>
        </Magnetic>
        <Link to="/flash" className="btn-ghost">Browse flash</Link>
      </Reveal>
    </section>
  );
}