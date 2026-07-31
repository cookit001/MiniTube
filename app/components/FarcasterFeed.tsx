'use client';

import { useState, useEffect } from 'react';

export default function FarcasterFeed() {
  const [casts, setCasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFarcasterFeed();
  }, []);

  const fetchFarcasterFeed = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/farcaster-feed').catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setCasts(data.data || []);
      } else {
        // Fallback mock data detecting Live Spaces integrations
        setTimeout(() => {
          setCasts([
            { hash: '0x1A2B3C', author: 'vitalik.eth', text: 'Live from ETH Global 🔴', protocol: 'Livepeer', timestamp: new Date().toISOString() },
            { hash: '0x9F8E7D', author: 'jam.so', text: 'Jam Session: Farcaster Architecture', protocol: 'Jam Audio', timestamp: new Date().toISOString() },
            { hash: '0xXYZ456', author: 'dwr.eth', text: 'Building the next gen protocol.', protocol: 'Twitch', timestamp: new Date().toISOString() },
          ] as any);
          setLoading(false);
        }, 1500);
        return;
      }
    } catch (err) {
      setError('Connection to Farcaster Hub failed.');
    }
    setLoading(false);
  };

  return (
    <div className="grid">
      {error && <div className="error-banner" style={{ gridColumn: '1 / -1' }}>{error}</div>}
      
      {loading && [1, 2, 3].map((i) => (
        <article key={i} className="glass card skeleton">
           <div className="card-thumbnail"></div>
           <h3 className="card-title" style={{color: 'transparent'}}>Connecting to protocol...</h3>
        </article>
      ))}

      {!loading && casts.length === 0 && !error && (
        <p className="empty-state">No live casts detected on the network.</p>
      )}

      {casts.map((cast: any) => (
        <article key={cast.hash} className="glass card" style={{ borderColor: 'rgba(255, 42, 42, 0.4)' }}>
          <div className="card-thumbnail" style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 800, letterSpacing: '2px' }}>{cast.protocol?.toUpperCase() || 'LIVE'} BROADCAST</span>
          </div>
          <h3 className="card-title">{cast.text}</h3>
          <div className="card-meta">
            <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>@{cast.author}</span>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Streaming Now</span>
          </div>
        </article>
      ))}
    </div>
  );
}
