import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Mail, Camera as Instagram } from 'lucide-react';
import { Reveal } from './Motion';
import { STUDIO, NAV_LINKS } from '../data/studio';

export default function Footer() {
  return (
    <footer className="relative z-10 overflow-hidden border-t border-bone/10 pt-20 md:pt-28">
      <div className="max-w-7xl mx-auto px-5 md:px-10 grid md:grid-cols-12 gap-12 pb-16">
        <Reveal className="md:col-span-5 space-y-4">
          <div className="font-display text-4xl tracking-[0.15em]">
            {STUDIO.name}
            <span className="text-blood">.</span>
          </div>
          <p className="text-sm text-bone-dim leading-relaxed max-w-sm">
            Custom tattoos, designed with you. Private studio, one artist, one client at a time.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="md:col-span-3 space-y-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood-light">Navigate</div>
          <ul className="space-y-2">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-sm text-bone-dim hover:text-bone transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.2} className="md:col-span-4 space-y-3 text-sm text-bone-dim">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood-light">Studio</div>
          <div className="flex items-start gap-3">
            <MapPin size={15} className="text-blood shrink-0 mt-0.5" /> {STUDIO.address}
          </div>
          <div className="flex items-start gap-3">
            <Clock size={15} className="text-blood shrink-0 mt-0.5" /> {STUDIO.hours}
          </div>
          <div className="flex items-start gap-3">
            <Mail size={15} className="text-blood shrink-0 mt-0.5" /> {STUDIO.email}
          </div>
          <div className="flex items-start gap-3">
            <Instagram size={15} className="text-blood shrink-0 mt-0.5" /> {STUDIO.instagram}
          </div>
        </Reveal>
      </div>

      <div aria-hidden className="font-display text-center leading-[0.8] text-[30vw] outline-text select-none -mb-[4vw]">
        {STUDIO.name}
      </div>

      <div className="relative bg-ink-950 border-t border-bone/10">
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-bone-mute">
          <div>© {new Date().getFullYear()} {STUDIO.full}. All rights reserved.</div>
          <div>You must be 18+ to be tattooed.</div>
        </div>
      </div>
    </footer>
  );
}