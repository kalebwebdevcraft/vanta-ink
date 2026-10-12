import React from 'react';
import { MaskLines, Eyebrow } from '../components/Motion';

// Temporary page used until each real page is built in the next stages.
export default function Placeholder({ title, stage }) {
  return (
    <section className="min-h-[100svh] flex flex-col justify-center px-5 md:px-10 max-w-7xl mx-auto">
      <Eyebrow>{stage}</Eyebrow>
      <MaskLines
        as="h1"
        trigger="mount"
        delay={0.7}
        className="mt-6 font-display uppercase text-[22vw] md:text-[16vw] leading-[0.85] text-bone"
        lines={[title, <span key="s" className="outline-blood">coming.</span>]}
      />
    </section>
  );
}
