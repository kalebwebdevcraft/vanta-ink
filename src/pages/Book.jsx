import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Upload, X, Download } from 'lucide-react';

import FlashArt from '../components/FlashArt';
import BodyMap from '../components/BodyMap';
import Calendar from '../components/Calendar';
import { Eyebrow, MaskLines, Magnetic, EASE } from '../components/Motion';
import { STUDIO } from '../data/studio';
import { FLASH } from '../data/flash';
import { WORK } from '../data/work';
import { zoneMeta } from '../data/zones';
import { SIZES, DETAILS, COLORS, estimate, depositFor, money } from '../lib/pricing';
import { submitBooking, fetchTakenSlots, downloadICS, prettyDate } from '../lib/booking';

const STEPS = ['Idea', 'Placement', 'Size', 'Date', 'You', 'Review'];
const TYPES = [
  { id: 'flash', t: 'Flash piece', d: 'Pick a ready-made design from the sheet.' },
  { id: 'custom', t: 'Custom design', d: 'Drawn from scratch, only for you.' },
  { id: 'coverup', t: 'Cover-up / rework', d: 'Turn an old tattoo into something new.' },
];

const field =
  'w-full bg-transparent border-b border-bone/25 focus:border-blood outline-none py-3 text-bone placeholder:text-bone-mute transition-colors duration-300';

/* ---------- small helpers ---------- */
function Option({ active, onClick, children, className = '', disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`text-left border px-4 py-3 transition-colors duration-300 disabled:opacity-40 disabled:pointer-events-none ${
        active ? 'border-blood bg-blood/10' : 'border-bone/15 hover:border-bone/40'
      } ${className}`}
    >
      {children}
    </button>
  );
}

function AnimatedNumber({ value }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => Math.round(v).toLocaleString('en-US'));
  useEffect(() => {
    const c = animate(mv, value, { duration: 0.8, ease: EASE });
    return () => c.stop();
  }, [value, mv]);
  return <motion.span>{text}</motion.span>;
}

/* ---------- steps ---------- */
function StepIdea({ form, set, files, setFiles }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const urls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);

  const addFiles = (list) => {
    const ok = [...list].filter((f) => f.type.startsWith('image/') && f.size <= 8 * 1024 * 1024);
    setFiles((prev) => [...prev, ...ok].slice(0, 3));
  };

  const refPiece = WORK.find((w) => w.id === form.refId);

  return (
    <div className="space-y-10">
      <div className="grid sm:grid-cols-3 gap-3">
        {TYPES.map((t) => (
          <Option key={t.id} active={form.type === t.id} onClick={() => set({ type: t.id })}>
            <div className="font-display uppercase text-2xl">{t.t}</div>
            <div className="mt-1 text-xs text-bone-dim leading-relaxed">{t.d}</div>
          </Option>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {form.type === 'flash' && (
          <motion.div key="flash" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood-light mb-4">Choose your flash</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {FLASH.filter((f) => f.status === 'available').map((f) => (
                <Option key={f.id} active={form.flashId === f.id} onClick={() => set({ flashId: f.id })} className="!p-3">
                  <div className="aspect-square p-3 text-bone">
                    <FlashArt art={f.art} className="w-full h-full" />
                  </div>
                  <div className="mt-2 font-display uppercase text-lg leading-none">{f.name}</div>
                  <div className="font-mono text-[10px] text-blood-light mt-1">{money(f.price)}</div>
                </Option>
              ))}
            </div>
          </motion.div>
        )}

        {(form.type === 'custom' || form.type === 'coverup') && (
          <motion.div key="custom" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }} className="space-y-8">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood-light">Describe your idea</label>
              <textarea
                value={form.description}
                onChange={(e) => set({ description: e.target.value })}
                rows={5}
                placeholder="What is it, what does it mean, what mood are you after?"
                className="mt-3 w-full bg-ink-900 border border-bone/15 focus:border-blood outline-none p-4 text-bone placeholder:text-bone-mute transition-colors"
              />
              <div className="mt-1 text-right font-mono text-[10px] text-bone-mute">{form.description.trim().length} / min 10</div>
            </div>

            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood-light mb-3">Style (optional)</div>
              <div className="flex flex-wrap gap-2">
                {STUDIO.styles.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set({ style: form.style === s ? null : s })}
                    className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] border transition-colors ${
                      form.style === s ? 'bg-blood border-blood text-white' : 'border-bone/15 text-bone-dim hover:text-bone hover:border-bone/40'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood-light mb-3">References (up to 3 images)</div>

              {refPiece && (
                <div className="mb-3 inline-flex items-center gap-3 border border-blood/50 bg-blood/10 px-4 py-2 text-sm">
                  Reference from the work: <b className="font-display uppercase text-lg">{refPiece.title}</b>
                  <button onClick={() => set({ refId: null })} aria-label="Remove reference"><X size={14} /></button>
                </div>
              )}

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDrag(true);
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDrag(false);
                  addFiles(e.dataTransfer.files);
                }}
                onClick={() => inputRef.current?.click()}
                data-cursor="UPLOAD"
                className={`cursor-pointer border border-dashed p-8 text-center transition-colors duration-300 ${drag ? 'border-blood bg-blood/10' : 'border-bone/25 hover:border-bone/50'}`}
              >
                <Upload className="mx-auto text-blood-light" size={22} />
                <p className="mt-3 text-sm text-bone-dim">Drop images here or click to browse</p>
                <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-bone-mute mt-1">JPG / PNG · max 8 MB each</p>
                <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
              </div>

              {files.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {urls.map((u, i) => (
                    <div key={u} className="relative aspect-square border border-bone/15 overflow-hidden">
                      <img src={u} alt="reference" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                        aria-label="Remove image"
                        className="absolute top-1 right-1 p-1 bg-ink-950/80 hover:text-blood"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepSize({ form, set, flash }) {
  if (flash) {
    return (
      <div className="border border-bone/15 bg-ink-900 p-8 flex flex-col sm:flex-row items-center gap-8">
        <div className="w-40 h-40 text-bone shrink-0">
          <FlashArt art={flash.art} className="w-full h-full" />
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood-light">Flash pricing is fixed</div>
          <div className="mt-2 font-display uppercase text-5xl">{flash.name}</div>
          <p className="mt-3 text-bone-dim">
            {flash.size} · {money(flash.price)}. Size and detail are already decided, so you can go straight to picking a date.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood-light mb-4">How big?</div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {SIZES.map((s) => (
            <Option key={s.id} active={form.size === s.id} onClick={() => set({ size: s.id })} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 flex items-end justify-center">
                <motion.div
                  animate={{ width: 10 + s.scale * 44, height: 10 + s.scale * 44 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className={`border ${form.size === s.id ? 'border-blood bg-blood/30' : 'border-bone/40'}`}
                />
              </div>
              <div className="mt-3 font-display uppercase text-xl leading-none">{s.label}</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-bone-mute mt-1">{s.cm}</div>
            </Option>
          ))}
        </div>
      </div>

      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood-light mb-4">How detailed?</div>
        <div className="grid sm:grid-cols-3 gap-3">
          {DETAILS.map((d) => (
            <Option key={d.id} active={form.detail === d.id} onClick={() => set({ detail: d.id })}>
              <div className="font-display uppercase text-xl">{d.label}</div>
              <div className="text-xs text-bone-dim mt-1">{d.desc}</div>
            </Option>
          ))}
        </div>
      </div>

      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood-light mb-4">Colour</div>
        <div className="grid sm:grid-cols-3 gap-3">
          {COLORS.map((c) => (
            <Option key={c.id} active={form.color === c.id} onClick={() => set({ color: c.id })}>
              <div className="font-display uppercase text-xl">{c.label}</div>
            </Option>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepYou({ form, set, touched }) {
  const emailOk = /^\S+@\S+\.\S+$/.test(form.email);
  const err = (cond) => touched && cond && 'text-blood-light';
  return (
    <div className="space-y-8 max-w-xl">
      <div>
        <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood-light">Full name</label>
        <input className={field} value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Your name" autoComplete="name" />
        {err(form.name.trim().length < 2) && <p className="mt-1 text-xs text-blood-light">Please enter your name.</p>}
      </div>
      <div className="grid sm:grid-cols-2 gap-8">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood-light">Email</label>
          <input type="email" className={field} value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="you@email.com" autoComplete="email" />
          {err(!emailOk) && <p className="mt-1 text-xs text-blood-light">Enter a valid email.</p>}
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood-light">Phone / WhatsApp</label>
          <input type="tel" className={field} value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+251 ..." autoComplete="tel" />
          {err(form.phone.replace(/\D/g, '').length < 6) && <p className="mt-1 text-xs text-blood-light">Enter a phone number.</p>}
        </div>
      </div>
      <div>
        <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood-light">Anything else we should know? (optional)</label>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => set({ notes: e.target.value })}
          className="mt-3 w-full bg-ink-900 border border-bone/15 focus:border-blood outline-none p-4 text-bone placeholder:text-bone-mute transition-colors"
          placeholder="Previous tattoos in the area, deadlines, questions..."
        />
      </div>
      <label className="flex items-start gap-3 cursor-pointer select-none text-sm text-bone-dim">
        <input type="checkbox" checked={form.adult} onChange={(e) => set({ adult: e.target.checked })} className="mt-1 accent-[#e11d2e] w-4 h-4" />
        I confirm I am 18 or older and can show valid ID at the studio.
      </label>
      {touched && !form.adult && <p className="text-xs text-blood-light -mt-4">Required to continue.</p>}
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex items-start justify-between gap-6 py-3 border-b border-bone/10">
      <dt className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone-mute pt-1">{k}</dt>
      <dd className="text-right font-serif italic text-xl">{v}</dd>
    </div>
  );
}

function StepReview({ form, set, flash, est, deposit }) {
  const z = zoneMeta(form.zone);
  const size = SIZES.find((s) => s.id === form.size);
  return (
    <div className="grid md:grid-cols-2 gap-10">
      <dl>
        <Row k="Piece" v={flash ? flash.name : form.type === 'coverup' ? 'Cover-up / rework' : 'Custom design'} />
        <Row k="Placement" v={z ? `${z.label} (${form.zone.view})` : '-'} />
        <Row k="Size" v={flash ? flash.size : size ? `${size.label} · ${size.cm}` : '-'} />
        {!flash && <Row k="Style" v={`${DETAILS.find((d) => d.id === form.detail)?.label}, ${COLORS.find((c) => c.id === form.color)?.label}`} />}
        <Row k="Date" v={form.date ? `${prettyDate(form.date)} · ${form.time}` : '-'} />
        <Row k="Client" v={form.name} />
        <Row k="Contact" v={form.email} />
      </dl>

      <div className="space-y-6">
        <div className="border border-blood/50 bg-blood/5 p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood-light">Estimate</div>
          <div className="mt-2 font-display text-6xl">
            {est ? (est.fixed ? money(est.low) : `${money(est.low)} – ${money(est.high)}`) : '-'}
          </div>
          <div className="mt-4 flex justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-bone-dim">
            <span>Deposit to secure</span>
            <span className="text-bone">{money(deposit)}</span>
          </div>
        </div>

        <p className="text-sm text-bone-dim leading-relaxed">
          This sends a booking request. The studio reviews your idea, confirms the final price, and sends a secure link to pay the deposit. Your deposit is applied to the total.
        </p>

        <label className="flex items-start gap-3 cursor-pointer select-none text-sm text-bone-dim">
          <input type="checkbox" checked={form.agree} onChange={(e) => set({ agree: e.target.checked })} className="mt-1 accent-[#e11d2e] w-4 h-4" />
          I understand the deposit secures my date and is non-refundable if I cancel with less than 48 hours notice.
        </label>
      </div>
    </div>
  );
}

/* ---------- live summary ---------- */
function Summary({ form, flash, est }) {
  const z = zoneMeta(form.zone);
  const size = SIZES.find((s) => s.id === form.size);
  return (
    <div className="border border-bone/15 bg-ink-900 p-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone-mute">Your piece</div>

      <div className="mt-4 flex items-center gap-4">
        <div className="w-20 h-20 border border-bone/10 text-bone p-3 shrink-0 flex items-center justify-center">
          {flash ? <FlashArt art={flash.art} className="w-full h-full" /> : <span className="font-display text-3xl text-bone-mute">?</span>}
        </div>
        <div>
          <div className="font-display uppercase text-2xl leading-none">{flash ? flash.name : form.type === 'coverup' ? 'Cover-up' : form.type === 'custom' ? 'Custom piece' : 'Not chosen yet'}</div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-bone-mute">
            {[z && z.label, flash ? flash.size : size && size.cm].filter(Boolean).join(' · ') || 'Details pending'}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-bone/10">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood-light">Estimate</div>
        {est ? (
          <div className="mt-1 font-display text-5xl leading-none">
            $<AnimatedNumber value={est.low} />
            {!est.fixed && (
              <>
                <span className="text-bone-mute"> – </span>$<AnimatedNumber value={est.high} />
              </>
            )}
          </div>
        ) : (
          <p className="mt-2 font-serif italic text-bone-dim">Choose a flash or a size to see your price.</p>
        )}
        {est && <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-bone-mute">≈ {est.hours} h in the chair · deposit {money(depositFor(est))}</div>}
      </div>

      {form.date && form.time && (
        <div className="mt-5 pt-5 border-t border-bone/10 font-serif italic text-lg">
          {prettyDate(form.date)} · {form.time}
        </div>
      )}
    </div>
  );
}

/* ---------- confirmation ---------- */
function Confirmation({ result, flash, est }) {
  return (
    <div className="relative max-w-3xl mx-auto text-center py-10 md:py-20">
      <div className="relative mx-auto w-28 h-28 mb-10">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            initial={{ scale: 0.4, opacity: 0.7 }}
            animate={{ scale: 2.4 + i * 0.5, opacity: 0 }}
            transition={{ duration: 1.8, delay: 0.3 + i * 0.25, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border border-blood"
          />
        ))}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 16 }}
          className="relative w-28 h-28 rounded-full bg-blood flex items-center justify-center shadow-[0_0_80px_rgba(225,29,46,0.6)]"
        >
          <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.4 }} />
          </svg>
        </motion.div>
      </div>

      <MaskLines
        as="h1"
        trigger="mount"
        delay={0.5}
        className="font-display uppercase text-6xl md:text-8xl leading-[0.9]"
        lines={['Request', <span key="s" className="outline-blood">received.</span>]}
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.8 }}>
        <p className="mt-8 text-bone-dim">
          Thank you, {result.name.split(' ')[0]}. Your booking code is
        </p>
        <div className="mt-3 inline-block border border-blood px-8 py-3 font-mono text-2xl tracking-[0.3em] text-blood-light">{result.code}</div>
        {result.skippedFiles > 0 && (
          <p className="mt-4 text-sm text-bone-dim">
            {result.skippedFiles} reference image{result.skippedFiles > 1 ? 's' : ''} could not be uploaded (use JPG, PNG or WebP under 8 MB). You can send {result.skippedFiles > 1 ? 'them' : 'it'} to the studio by message.
          </p>
        )}

        <div className="mt-10 grid sm:grid-cols-3 gap-4 text-left">
          {[
            ['01', 'Review', `${STUDIO.artist} looks at your idea within 24 hours.`],
            ['02', 'Confirm', 'You get an email with the final price and a deposit link.'],
            ['03', 'Locked', `Pay the deposit and ${prettyDate(result.date)} is yours.`],
          ].map(([n, t, d]) => (
            <div key={n} className="border border-bone/10 bg-ink-900 p-5">
              <div className="font-display text-3xl outline-blood">{n}</div>
              <div className="mt-2 font-display uppercase text-xl">{t}</div>
              <p className="mt-1 text-sm text-bone-dim">{d}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button
            onClick={() =>
              downloadICS({
                code: result.code,
                date: result.date,
                time: result.time,
                hours: est ? est.hours : 2,
                title: `Tattoo session · ${STUDIO.full} (pending)`,
                location: STUDIO.address,
              })
            }
            className="btn-blood"
          >
            <Download size={14} />
            <span>Add to calendar</span>
          </button>
          <Link to="/" className="btn-ghost">Back home</Link>
          <Link to="/flash" className="btn-ghost">Browse flash</Link>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- page ---------- */
export default function Book() {
  const [params] = useSearchParams();

  const [form, setForm] = useState(() => {
    const flashP = FLASH.find((f) => f.id === params.get('flash'));
    const customP = FLASH.find((f) => f.id === params.get('custom'));
    const refP = WORK.find((w) => w.id === params.get('ref'));
    const flashOk = flashP && flashP.status === 'available';
    return {
      type: flashOk ? 'flash' : customP || refP ? 'custom' : null,
      flashId: flashOk ? flashP.id : null,
      description: customP ? `A fresh variation of "${customP.name}" (${customP.style}). ` : '',
      style: refP ? refP.style : customP ? customP.style : null,
      refId: refP ? refP.id : null,
      zone: null,
      size: null,
      detail: 'detailed',
      color: 'blackwork',
      date: null,
      time: null,
      name: '',
      email: '',
      phone: '',
      notes: '',
      adult: false,
      agree: false,
    };
  });
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [files, setFiles] = useState([]);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const top = useRef(null);

  // real availability from the database (null = demo mode / still loading)
  const [taken, setTaken] = useState(null);
  useEffect(() => {
    let alive = true;
    fetchTakenSlots().then((s) => alive && setTaken(s));
    return () => {
      alive = false;
    };
  }, []);

  const flash = form.type === 'flash' ? FLASH.find((f) => f.id === form.flashId) : null;
  const est = estimate({ flash, size: form.size, detail: form.detail, color: form.color, zone: form.zone });
  const deposit = depositFor(est);

  const valid = [
    form.type === 'flash' ? !!form.flashId : !!form.type && form.description.trim().length >= 10,
    !!form.zone,
    flash ? true : !!form.size,
    !!form.date && !!form.time,
    form.name.trim().length >= 2 && /^\S+@\S+\.\S+$/.test(form.email) && form.phone.replace(/\D/g, '').length >= 6 && form.adult,
    form.agree,
  ];

  const toTop = () => {
    const el = top.current;
    if (!el) return;
    if (window.__lenis) window.__lenis.scrollTo(el, { offset: -110, duration: 1.2 });
    else el.scrollIntoView({ behavior: 'smooth' });
  };

  const go = (n) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
    setTouched(false);
    setTimeout(toTop, 50);
  };

  const next = async () => {
    if (!valid[step]) {
      setTouched(true);
      return;
    }
    if (step < STEPS.length - 1) return go(step + 1);

    setSubmitting(true);
    setError('');
    try {
      const rec = await submitBooking(
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          type: form.type,
          flashId: flash ? flash.id : null,
          description: form.description || (flash ? `Flash: ${flash.name}` : ''),
          style: form.style || (flash ? flash.style : ''),
          refId: form.refId || '',
          placement: zoneMeta(form.zone) ? `${zoneMeta(form.zone).label} (${form.zone.view})` : '',
          size: flash ? flash.size : form.size,
          detail: flash ? '' : form.detail,
          color: flash ? '' : form.color,
          date: form.date,
          time: form.time,
          estimateLow: est ? est.low : null,
          estimateHigh: est ? est.high : null,
          deposit,
          notes: form.notes,
        },
        files
      );
      setResult(rec);
      setTimeout(toTop, 50);
    } catch (e) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const stepTitles = [
    ['What are we', 'making?'],
    ['Where does', 'it go?'],
    ['How big,', 'how bold?'],
    ['Pick your', 'day.'],
    ['Who are', 'you?'],
    ['Last', 'look.'],
  ];

  return (
    <div ref={top} className="pt-32 md:pt-40 pb-32 lg:pb-24 px-5 md:px-10 max-w-7xl mx-auto min-h-[100svh]">
      {result ? (
        <Confirmation result={result} flash={flash} est={est} />
      ) : (
        <>
          {/* progress */}
          <div className="flex gap-2 mb-12">
            {STEPS.map((s, i) => (
              <button
                key={s}
                onClick={() => i < step && go(i)}
                disabled={i >= step}
                className="group flex-1 text-left disabled:cursor-default"
              >
                <div className="h-[3px] bg-bone/10 relative overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ scaleX: i <= step ? 1 : 0 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="absolute inset-0 bg-blood origin-left"
                  />
                </div>
                <div className={`mt-2 font-mono text-[9px] uppercase tracking-[0.25em] ${i === step ? 'text-bone' : 'text-bone-mute hidden sm:block'}`}>
                  {String(i + 1).padStart(2, '0')} {s}
                </div>
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={step}
                  custom={dir}
                  initial={{ opacity: 0, x: 50 * dir }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 * dir }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <Eyebrow>
                    Step {String(step + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
                  </Eyebrow>
                  <h1 className="mt-5 mb-10 font-display uppercase text-6xl md:text-8xl leading-[0.9]">
                    {stepTitles[step][0]} <span className="outline-blood">{stepTitles[step][1]}</span>
                  </h1>

                  {step === 0 && <StepIdea form={form} set={set} files={files} setFiles={setFiles} />}
                  {step === 1 && <BodyMap value={form.zone} onChange={(zone) => set({ zone })} />}
                  {step === 2 && <StepSize form={form} set={set} flash={flash} />}
                  {step === 3 && <Calendar date={form.date} time={form.time} taken={taken} onDate={(date) => set({ date })} onTime={(time) => set({ time })} />}
                  {step === 4 && <StepYou form={form} set={set} touched={touched} />}
                  {step === 5 && <StepReview form={form} set={set} flash={flash} est={est} deposit={deposit} />}
                </motion.div>
              </AnimatePresence>

              {touched && !valid[step] && step !== 4 && (
                <p className="mt-6 text-sm text-blood-light">
                  {step === 0 && (form.type === 'flash' ? 'Choose a flash design to continue.' : 'Pick a type and describe your idea (at least 10 characters).')}
                  {step === 1 && 'Tap a zone on the body to continue.'}
                  {step === 2 && 'Choose a size to continue.'}
                  {step === 3 && 'Pick a day and a start time.'}
                  {step === 5 && 'Please accept the deposit terms.'}
                </p>
              )}
              {error && <p className="mt-6 text-sm text-blood-light">{error}</p>}

              <div className="mt-12 flex items-center justify-between">
                <button
                  onClick={() => go(step - 1)}
                  className={`btn-ghost ${step === 0 ? 'invisible' : ''}`}
                >
                  <ArrowLeft size={14} /> Back
                </button>

                <Magnetic>
                  <button
                    onClick={next}
                    disabled={submitting}
                    data-cursor={step === STEPS.length - 1 ? 'SEND' : 'NEXT'}
                    className={`btn-blood ${!valid[step] ? 'opacity-60' : ''}`}
                  >
                    {submitting ? (
                      <>
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                        <span>Sending…</span>
                      </>
                    ) : step === STEPS.length - 1 ? (
                      <>
                        <Check size={14} />
                        <span>Send request</span>
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </Magnetic>
              </div>
            </div>

            {/* live summary (desktop) */}
            <aside className="hidden lg:block lg:col-span-4">
              <div className="sticky top-28">
                <Summary form={form} flash={flash} est={est} />
              </div>
            </aside>
          </div>

          {/* live estimate bar (mobile) */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-bone/15 bg-ink-950/90 backdrop-blur-xl px-5 py-3 flex items-center justify-between">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone-mute">Estimate</div>
            <div className="font-display text-3xl leading-none">
              {est ? (est.fixed ? money(est.low) : `${money(est.low)} – ${money(est.high)}`) : '—'}
            </div>
          </div>
        </>
      )}
    </div>
  );
}