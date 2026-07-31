'use client';

import { useState, useEffect } from 'react';

export default function ShortsPlayer() {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch('/api/videos?q=%23shorts&type=shorts')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          const formattedShorts = data.data.map((v: any) => ({
            id: v.id,
            author: v.channelTitle,
            title: v.title,
            thumbnail: v.thumbnail
          }));
          setShorts(formattedShorts);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load shorts:", err);
        setLoading(false);
      });
  }, []);

  const handleNext = () => {
    if (currentIndex < shorts.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return <div style={{ color: 'white', padding: '2rem', textAlign: 'center', height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Decrypting Shorts Engine...</div>;
  }

  if (shorts.length === 0) {
    return <div style={{ color: 'white', padding: '2rem', textAlign: 'center', height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No shorts found right now. Check back later!</div>;
  }

  const short = shorts[currentIndex] as any;

  return (
    <div className="shorts-container" style={{ position: 'relative', width: '100%', height: '100dvh', overflow: 'hidden' }}>
      
      {/* Player Viewport */}
      <div key={short.id} className="short-viewport" style={{ width: '100%', height: '100%', background: '#000' }}>
        <iframe 
          src={`https://www.youtube-nocookie.com/embed/${short.id}?autoplay=1&loop=1&playlist=${short.id}`} 
          style={{ width: '100%', height: '100%', border: 'none', objectFit: 'cover' }}
          allowFullScreen
          allow="autoplay; encrypted-media"
        ></iframe>
        
        {/* Info Overlay */}
        <div className="short-info" style={{ position: 'absolute', bottom: '2rem', left: '1rem', right: '4rem', zIndex: 10, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '2rem 1rem 1rem 1rem', borderRadius: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>@{short.author}</h2>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{short.title}</p>
        </div>
      </div>

      {/* Navigation Controls */}
      <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 20 }}>
        <button 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
          className="glass"
          style={{ 
            width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '1.5rem', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentIndex === 0 ? 0.3 : 1
          }}
        >
          ↑
        </button>
        <button 
          onClick={handleNext} 
          disabled={currentIndex === shorts.length - 1}
          className="glass"
          style={{ 
            width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '1.5rem', cursor: currentIndex === shorts.length - 1 ? 'not-allowed' : 'pointer', opacity: currentIndex === shorts.length - 1 ? 0.3 : 1
          }}
        >
          ↓
        </button>
      </div>

    </div>
  );
}
