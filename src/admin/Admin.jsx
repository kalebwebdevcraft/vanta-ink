import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Login from './Login';
import Dashboard from './Dashboard';

function Message({ title, children, action }) {
  return (
    <div className="min-h-[100svh] flex items-center justify-center px-5 text-center">
      <div className="max-w-md">
        <div className="font-display uppercase text-5xl">{title}</div>
        <p className="mt-4 text-bone-dim leading-relaxed">{children}</p>
        <div className="mt-8 flex justify-center gap-3">{action}</div>
      </div>
    </div>
  );
}

/**
 * Gate for /admin:
 *  loading → not signed in (Login) → signed in but not an admin (denied) → Dashboard
 */
export default function Admin() {
  const [state, setState] = useState('loading'); // loading | out | denied | in | nobackend
  const [session, setSession] = useState(null);

  // keep admin pages out of search engines
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    document.title = 'Dashboard — VANTA';
    return () => meta.remove();
  }, []);

  useEffect(() => {
    if (!supabase) {
      setState('nobackend');
      return;
    }
    let alive = true;

    async function check(s) {
      if (!s) {
        if (alive) {
          setSession(null);
          setState('out');
        }
        return;
      }
      const { data } = await supabase.from('admins').select('user_id').eq('user_id', s.user.id).maybeSingle();
      if (!alive) return;
      setSession(s);
      setState(data ? 'in' : 'denied');
    }

    supabase.auth.getSession().then(({ data }) => check(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      // run outside the callback so the auth client is never blocked
      setTimeout(() => check(s), 0);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = () => supabase.auth.signOut();

  if (state === 'loading') {
    return (
      <div className="min-h-[100svh] flex items-center justify-center">
        <span className="w-6 h-6 rounded-full border-2 border-bone/20 border-t-blood animate-spin" />
      </div>
    );
  }

  if (state === 'nobackend') {
    return (
      <Message
        title="Not connected"
        action={<Link to="/" className="btn-ghost">Back to site</Link>}
      >
        The database keys are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and rebuild the site.
      </Message>
    );
  }

  if (state === 'out') return <Login />;

  if (state === 'denied') {
    return (
      <Message
        title="No access"
        action={
          <button onClick={signOut} className="btn-ghost">
            Sign out
          </button>
        }
      >
        You are signed in, but this account is not set up as the studio admin.
      </Message>
    );
  }

  return <Dashboard session={session} onSignOut={signOut} />;
}