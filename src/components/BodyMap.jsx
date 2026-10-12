import React, { useState } from 'react';
import { ZONES } from '../data/zones';

function Shape({ s, ...rest }) {
  return s.t === 'e' ? (
    <ellipse cx={s.x} cy={s.y} rx={s.rx} ry={s.ry} {...rest} />
  ) : (
    <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.r} {...rest} />
  );
}

/** Tap a body zone to choose where the tattoo goes. value = { id, view } | null */
export default function BodyMap({ value, onChange }) {
  const [view, setView] = useState(value?.view || 'front');
  const [hover, setHover] = useState(null);
  const zones = ZONES[view];

  const selected = value && value.view === view ? zones.find((z) => z.id === value.id) : null;
  const shown = (hover && zones.find((z) => z.id === hover)) || selected;

  return (
    <div className="grid md:grid-cols-2 gap-8 items-center">
      <div className="relative mx-auto w-full max-w-[250px] border border-bone/10 bg-ink-900 p-6">
        <span className="absolute top-3 left-3 font-mono text-[9px] uppercase tracking-[0.3em] text-bone-mute">{view}</span>
        <svg viewBox="0 0 200 350" className="w-full h-auto" role="group" aria-label="Body map">
          <circle cx="100" cy="34" r="18" fill="none" stroke="rgba(236,230,218,0.18)" />
          <rect x="74" y="158" width="52" height="12" rx="5" fill="none" stroke="rgba(236,230,218,0.12)" />
          {zones.map((z) => {
            const isSel = value && value.view === view && value.id === z.id;
            const isHover = hover === z.id;
            return (
              <g
                key={z.id}
                role="button"
                tabIndex={0}
                aria-label={z.label}
                onClick={() => onChange({ id: z.id, view })}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onChange({ id: z.id, view })}
                onPointerEnter={() => setHover(z.id)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(z.id)}
                onBlur={() => setHover(null)}
                style={{ outline: 'none' }}
              >
                {z.shapes.map((s, i) => (
                  <Shape
                    key={i}
                    s={s}
                    fill={isSel ? 'rgba(225,29,46,0.6)' : isHover ? 'rgba(225,29,46,0.28)' : 'rgba(236,230,218,0.05)'}
                    stroke={isSel || isHover ? '#e11d2e' : 'rgba(236,230,218,0.25)'}
                    strokeWidth={isSel ? 1.6 : 1}
                    style={{ transition: 'all .35s ease' }}
                  />
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      <div>
        <div className="inline-flex border border-bone/15">
          {['front', 'back'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-6 py-2.5 font-mono text-[10px] uppercase tracking-[0.25em] transition-colors duration-500 ${
                view === v ? 'bg-blood text-white' : 'text-bone-dim hover:text-bone'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="mt-8 min-h-[110px]">
          {shown ? (
            <>
              <div className="font-display uppercase text-5xl leading-none">{shown.label}</div>
              <div className="mt-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-bone-dim">
                Pain
                <span className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={`w-5 h-1.5 ${n <= shown.pain ? 'bg-blood' : 'bg-bone/15'}`} />
                  ))}
                </span>
              </div>
            </>
          ) : (
            <p className="font-serif italic text-2xl text-bone-dim">Tap a zone on the body to choose where it goes.</p>
          )}
        </div>
      </div>
    </div>
  );
}