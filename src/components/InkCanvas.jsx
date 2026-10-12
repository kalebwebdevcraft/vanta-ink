import React, { useEffect, useRef } from 'react';

/**
 * Interactive ink: move your mouse (or finger) and blood-red / bone ink
 * splatters across the dark, then slowly dries away.
 */
export default function InkCanvas({ className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf;
    let last = null;

    const resize = () => {
      const r = canvas.parentElement.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#070606';
      ctx.fillRect(0, 0, w, h);
    };
    resize();

    const blob = (x, y, speed) => {
      const n = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const d = Math.random() * 14;
        const r = Math.min(30, 7 + speed * 0.25) * (0.5 + Math.random() * 0.9);
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r, 0, Math.PI * 2);
        ctx.fillStyle = Math.random() < 0.78 ? 'rgba(225,29,46,0.55)' : 'rgba(236,230,218,0.32)';
        ctx.fill();
      }
    };

    const move = (e) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (y < 0 || y > h || x < 0 || x > w) {
        last = null;
        return;
      }
      if (!last) {
        blob(x, y, 0);
      } else {
        const dist = Math.hypot(x - last.x, y - last.y);
        const steps = Math.max(1, Math.floor(dist / 12));
        for (let s = 1; s <= steps; s++) {
          const t = s / steps;
          blob(last.x + (x - last.x) * t, last.y + (y - last.y) * t, dist);
        }
      }
      last = { x, y };
    };

    const tick = () => {
      ctx.fillStyle = 'rgba(7,6,6,0.05)';
      ctx.fillRect(0, 0, w, h);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className={`absolute inset-0 pointer-events-none ${className}`} style={{ filter: 'blur(1.5px)' }} />;
}