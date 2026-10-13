import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { STUDIO } from '../data/studio';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (err) setError('Wrong email or password.');
  };

  const field =
    'w-full bg-transparent border-b border-bone/25 focus:border-blood outline-none py-3 text-bone placeholder:text-bone-mute transition-colors';

  return (
    <div className="min-h-[100svh] flex items-center justify-center px-5 bg-ink-950">
      <div className="absolute w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-blood/10 blur-[140px] pointer-events-none" />
      <form onSubmit={submit} className="relative w-full max-w-sm border border-bone/15 bg-ink-900/80 backdrop-blur p-8">
        <div className="font-display text-4xl tracking-[0.15em]">
          {STUDIO.name}
          <span className="text-blood">.</span>
        </div>
        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-bone-mute">Studio dashboard</div>

        <div className="mt-10 space-y-7">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood-light">Email</label>
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} placeholder="you@studio.com" />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood-light">Password</label>
            <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} placeholder="••••••••" />
          </div>
        </div>

        {error && <p className="mt-5 text-sm text-blood-light">{error}</p>}

        <button type="submit" disabled={busy} className="btn-blood w-full justify-center mt-8 disabled:opacity-60">
          <span>{busy ? 'Signing in…' : 'Sign in'}</span>
        </button>

        <p className="mt-6 text-xs text-bone-mute leading-relaxed">Artist access only. Forgot your password? Ask the person who set up your studio site to reset it.</p>
        <Link to="/" className="mt-4 inline-block font-mono text-[10px] uppercase tracking-[0.25em] text-bone-dim hover:text-bone">
          ← Back to site
        </Link>
      </form>
    </div>
  );
}