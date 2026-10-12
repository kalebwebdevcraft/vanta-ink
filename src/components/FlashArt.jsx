import React from 'react';

// Hand-built line-art flash designs (pure SVG, no image files needed).
// Swap these for the artist's real flash photos when you sell the site.
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

const rays = (n, r1, r2, r3) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const r = i % 2 === 0 ? r3 : r2;
    return (
      <line
        key={i}
        x1={100 + Math.cos(a) * r1}
        y1={100 + Math.sin(a) * r1}
        x2={100 + Math.cos(a) * r}
        y2={100 + Math.sin(a) * r}
      />
    );
  });

const ART = {
  dagger: (
    <g {...S}>
      <path d="M100 12 L113 118 L100 130 L87 118 Z" />
      <path d="M100 12 V130" />
      <path d="M60 134 Q100 118 140 134" />
      <path d="M60 134 Q55 148 69 149 M140 134 Q145 148 131 149" />
      <rect x="93" y="138" width="14" height="32" rx="3" />
      <circle cx="100" cy="181" r="8" />
    </g>
  ),
  eye: (
    <g {...S}>
      <path d="M16 104 Q100 30 184 104 Q100 178 16 104 Z" />
      <circle cx="100" cy="104" r="31" />
      <circle cx="100" cy="104" r="12" fill="currentColor" />
      <path d="M100 20 V42 M60 32 L68 50 M140 32 L132 50 M28 58 L44 70 M172 58 L156 70" />
      <path d="M100 188 V170 M70 182 L76 166 M130 182 L124 166" />
    </g>
  ),
  moth: (
    <g {...S}>
      {[false, true].map((m) => (
        <g key={String(m)} transform={m ? 'translate(200 0) scale(-1 1)' : undefined}>
          <path d="M97 92 C70 36 22 36 14 70 C10 98 50 112 97 110 Z" />
          <path d="M97 112 C58 114 38 144 54 170 C76 180 96 146 97 112 Z" />
          <circle cx="48" cy="72" r="9" />
          <circle cx="62" cy="142" r="5" />
          <path d="M96 76 Q84 50 70 42" />
        </g>
      ))}
      <ellipse cx="100" cy="112" rx="5" ry="36" />
      <circle cx="100" cy="72" r="6" />
    </g>
  ),
  sun: (
    <g {...S}>
      <circle cx="100" cy="100" r="34" />
      <circle cx="100" cy="100" r="22" />
      {rays(24, 44, 62, 84)}
      <path d="M88 96 Q92 90 98 96 M102 96 Q108 90 112 96 M90 112 Q100 120 110 112" />
    </g>
  ),
  serpent: (
    <g {...S}>
      <path d="M44 176 C30 128 164 142 160 94 C156 56 76 74 88 42" />
      <path d="M52 176 C42 140 152 152 150 98 C146 66 86 84 98 50" />
      <path d="M88 42 L74 26 L102 28 Z" />
      <path d="M44 176 L52 176" />
      <circle cx="90" cy="34" r="2.5" fill="currentColor" />
      <path d="M95 25 L100 14 M91 24 L90 12" />
    </g>
  ),
  moon: (
    <g {...S}>
      <path d="M124 26 A74 74 0 1 0 124 174 A56 56 0 1 1 124 26 Z" />
      <path d="M150 62 v14 M143 69 h14" />
      <path d="M168 118 v10 M163 123 h10" />
      <path d="M138 150 v8 M134 154 h8" />
    </g>
  ),
  cross: (
    <g {...S}>
      <path d="M100 14 L112 42 L112 78 L150 78 L178 90 L178 110 L150 122 L112 122 L112 160 L100 188 L88 160 L88 122 L50 122 L22 110 L22 90 L50 78 L88 78 L88 42 Z" />
      <circle cx="100" cy="100" r="14" />
      <path d="M100 14 V60 M100 140 V188 M22 100 H62 M138 100 H178" />
    </g>
  ),
  key: (
    <g {...S}>
      <circle cx="62" cy="62" r="34" />
      <circle cx="62" cy="62" r="16" />
      <path d="M86 86 L172 172" />
      <path d="M150 150 L134 166 M168 168 L152 184" />
      <path d="M118 118 L102 134" />
    </g>
  ),
};

export const ART_KEYS = Object.keys(ART);

export default function FlashArt({ art, className = '' }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={`${art} flash design`}>
      {ART[art]}
    </svg>
  );
}