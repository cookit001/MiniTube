'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';

export default function LandingPage() {
  useEffect(() => {
    // Dismiss Farcaster splash screen if loaded in a frame
    setTimeout(() => {
      try {
        sdk.actions.ready();
      } catch (e) {}
    }, 500);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '-10%',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(138,99,210,0.3) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(80px)',
        zIndex: 0,
        animation: 'float 10s ease-in-out infinite alternate'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        right: '-10%',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(255,42,42,0.2) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(80px)',
        zIndex: 0,
        animation: 'float 12s ease-in-out infinite alternate-reverse'
      }} />

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) scale(1); }
          100% { transform: translateY(50px) scale(1.1); }
        }
        @keyframes glow {
          0% { box-shadow: 0 0 20px rgba(138,99,210,0.4); }
          50% { box-shadow: 0 0 40px rgba(138,99,210,0.8); }
          100% { box-shadow: 0 0 20px rgba(138,99,210,0.4); }
        }
        .launch-btn {
          background: linear-gradient(135deg, #8a63d2, #ff2a2a);
          color: white;
          padding: 16px 48px;
          border-radius: 30px;
          font-size: 1.2rem;
          font-weight: 800;
          text-decoration: none;
          letter-spacing: 1px;
          transition: all 0.3s ease;
          animation: glow 3s infinite;
          border: 1px solid rgba(255,255,255,0.2);
          position: relative;
          z-index: 10;
        }
        .launch-btn:hover {
          transform: translateY(-2px) scale(1.05);
          filter: brightness(1.2);
        }
      `}</style>

      {/* Main Content */}
      <div style={{ zIndex: 10, textAlign: 'center', maxWidth: '800px' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: 'rgba(255,255,255,0.05)', 
          padding: '8px 16px', 
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '2rem'
        }}>
          <span style={{ color: '#8a63d2', fontWeight: 'bold' }}>✦</span>
          <span style={{ fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Built on Farcaster</span>
        </div>

        <h1 style={{ 
          fontSize: 'clamp(3rem, 8vw, 5rem)', 
          fontWeight: 900, 
          lineHeight: 1.1, 
          marginBottom: '1.5rem',
          background: 'linear-gradient(to right, #ffffff, #a0a0a0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-1px'
        }}>
          The Decentralized <br/> Media Powerhouse.
        </h1>
        
        <p style={{ 
          fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', 
          color: '#aaa', 
          lineHeight: 1.6, 
          marginBottom: '3rem',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Experience lightning-fast video streaming and uncensorable social media. Zero-Knowledge curation, 100% non-custodial tipping, and infinite scrolling.
        </p>

        <Link href="/home" className="launch-btn">
          LAUNCH APP
        </Link>
      </div>

      {/* Feature Grid */}
      <div style={{
        display: 'flex',
        gap: '24px',
        marginTop: '6rem',
        zIndex: 10,
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '1000px'
      }}>
        {[
          { title: 'Zero-Knowledge Curation', desc: 'Provably fair AI algorithms.' },
          { title: 'Non-Custodial Tipping', desc: 'Direct DEGEN & USDC splits.' },
          { title: 'Farcaster Native', desc: 'Seamless Frame v2 auto-login.' }
        ].map((feat, i) => (
          <div key={i} style={{
            background: 'rgba(20,20,20,0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.05)',
            padding: '24px',
            borderRadius: '16px',
            flex: '1 1 250px',
            minWidth: '250px',
            textAlign: 'left'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', color: '#fff' }}>{feat.title}</h3>
            <p style={{ margin: 0, color: '#888', fontSize: '0.95rem' }}>{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
