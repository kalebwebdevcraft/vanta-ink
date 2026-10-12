import React, { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'framer-motion';
import { MoveHorizontal } from 'lucide-react';
import WorkScene from './WorkScene';
import { WORK } from '../data/work';
import { EASE } from './Motion';

// Drag to compare a fresh tattoo (left) with the same piece healed (right).
// For a real artist, pass two photos: pieceFresh.img and pieceHealed.img.
export default function HealSlider() {
  const base = WORK[0];
  const ref = useRef(null);
  const dragging = useRef(false);
  const touched = useRef(false);
  const [pos, setPos] = useState(50);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  const update = (clientX) => {
    const r = ref.current.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  // one gentle intro sweep so people notice it is draggable
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, 1, {
      duration: 2.6,
      ease: EASE,
      onUpdate: (t) => {
        if (touched.current) return;
        // 50 -> 14 -> 86 -> 50
        const k = t * 3;
        const v = k < 1 ? 50 - 36 * k : k < 2 ? 14 + 72 * (k - 1) : 86 - 36 * (k - 2);
        setPos(v);
      },
    });
    return () => c.stop();
  }, [inView]);

  return (
    <div
      ref={ref}
      data-cursor="DRAG"
      onPointerDown={(e) => {
        dragging.current = true;
        touched.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && update(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
      style={{ touchAction: 'pan-y' }}
      className="relative w-full aspect-[4/3] md:aspect-[16/9] select-none overflow-hidden border border-bone/15"
    >
      {/* healed (bottom) */}
      <div className="absolute inset-0">
        <WorkScene piece={{ ...base, tone: 'pale' }} ratio={false} />
      </div>

      {/* fresh (top, clipped) */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <WorkScene piece={{ ...base, tone: 'pale' }} ratio={false} fresh />
      </div>

      <span className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-[0.3em] bg-ink-950/70 backdrop-blur px-3 py-1.5 text-blood-light">Fresh · Day 0</span>
      <span className="absolute top-4 right-4 font-mono text-[10px] uppercase tracking-[0.3em] bg-ink-950/70 backdrop-blur px-3 py-1.5 text-bone">Healed · Week 6</span>

      {/* handle */}
      <div className="absolute top-0 bottom-0 w-px bg-bone" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-blood border border-bone/60 flex items-center justify-center shadow-[0_0_40px_rgba(225,29,46,0.6)]">
          <MoveHorizontal size={18} className="text-white" />
        </div>
      </div>
    </div>
  );
}