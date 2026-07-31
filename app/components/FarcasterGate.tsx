'use client';

import { useState, useEffect } from 'react';

export default function FarcasterGate() {
  const [isUnlocked, setIsUnlocked] = useState(true); // Default true during SSR

  useEffect(() => {
    // Check if user has already unlocked the app via Farcaster follow
    const unlocked = localStorage.getItem('minitube_fc_unlocked');
    if (!unlocked) {
      setIsUnlocked(false);
    }
  }, []);

  const handleFollowClick = () => {
    // In a real app, this would verify the follow via Farcaster API using Neynar or similar.
    // For now, we simulate the verification after they click the intent link.
    window.open('https://warpcast.com/real9realms', '_blank');
    
    // Simulate verification delay, then unlock
    setTimeout(() => {
      localStorage.setItem('minitube_fc_unlocked', 'true');
      setIsUnlocked(true);
    }, 3000);
  };

  if (isUnlocked) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="glass card" style={{
        maxWidth: '400px',
        width: '90%',
        padding: '2.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        border: '1px solid rgba(161, 92, 255, 0.3)',
        boxShadow: '0 0 40px rgba(161, 92, 255, 0.15)'
      }}>
        <div style={{ fontSize: '3rem' }}>🛡️</div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(90deg, #A15CFF, #FF5C8A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Access Restricted
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.5 }}>
            MiniTube is an exclusive decentralized media platform. You must follow the founder on Farcaster to unlock full video playback.
          </p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <button 
            onClick={handleFollowClick}
            className="glass" 
            style={{ 
              padding: '1rem', 
              borderRadius: '12px', 
              border: 'none', 
              color: 'white', 
              cursor: 'pointer', 
              background: 'linear-gradient(90deg, #A15CFF, #FF5C8A)', 
              fontWeight: 800, 
              fontSize: '1.1rem',
              boxShadow: '0 0 15px rgba(161, 92, 255, 0.4)',
              transition: 'transform 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Follow @real9realms on Warpcast
          </button>
          
          <button 
            onClick={() => setIsUnlocked(true)}
            style={{
              padding: '0.8rem',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'underline'
            }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
