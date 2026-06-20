'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AuthGate({ children }) {
  const [session, setSession] = useState(undefined); // undefined = loading, null = logged out
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setSending(true);

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });

    setSending(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }
    setSent(true);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  // Still checking for an existing session
  if (session === undefined) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    );
  }

  // Logged out: show login form, no app content
  if (session === null) {
    return (
      <div className="container" style={{ maxWidth: 420, marginTop: 60 }}>
        <h1 style={{ textAlign: 'center' }}>🌿 Plant Pokedex</h1>
        <p style={{ textAlign: 'center', color: '#666' }}>
          Sign in to view and manage your plant collection.
        </p>

        {sent ? (
          <p style={{ textAlign: 'center' }}>
            Check <strong>{email}</strong> for a login link, then click it to come back here.
          </p>
        ) : (
          <form onSubmit={handleLogin}>
            <div>
              <label>Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            {error && <p style={{ color: '#c0392b' }}>{error}</p>}
            <button type="submit" disabled={sending}>
              {sending ? 'Sending link...' : 'Send me a login link'}
            </button>
          </form>
        )}
      </div>
    );
  }

  // Logged in: show the app
  return (
    <>
      <header className="topbar">
        <a href="/" className="logo">🌿 Plant Pokedex</a>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <a href="/add" className="add-btn">+ Add Plant</a>
          <button className="secondary" onClick={handleLogout}>Log out</button>
        </div>
      </header>
      <main className="container">{children}</main>
    </>
  );
}
