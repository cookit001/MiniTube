'use client';

import { useState, useEffect } from 'react';
import DOMPurify from 'isomorphic-dompurify';

export default function YouTubeLiveFeed() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  useEffect(() => {
    fetchLiveFeed();
  }, []);

  const fetchLiveFeed = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/videos?q=news&type=live');
      const data = await res.json();
      
      if (data.success) {
        setVideos(data.data);
      } else {
        setError(data.error || 'Failed to fetch live videos.');
      }
    } catch (err: any) {
      setError('Connection to protocol failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Decrypting Live Network...</div>
      ) : error ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>
      ) : (
        <div className="video-grid">
          {videos.map((video: any) => (
            <div key={video.id} className="video-card glass" onClick={() => setSelectedVideo(video)} style={{ cursor: 'pointer' }}>
              <div 
                className="thumbnail-placeholder" 
                style={{ backgroundImage: `url(${video.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}
              >
                <div style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', background: 'red', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  LIVE
                </div>
              </div>
              <div className="video-info">
                <h3>{video.title}</h3>
                <p>{video.channelTitle}</p>
                <p style={{ opacity: 0.6, fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  {DOMPurify.sanitize(video.description).substring(0, 80)}...
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedVideo && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>{selectedVideo.title}</h3>
            <button 
              onClick={() => setSelectedVideo(null)} 
              className="glass"
              style={{ border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
            >
              Close ✕
            </button>
          </div>
          <div style={{ width: '100%', maxWidth: '1200px', aspectRatio: '16/9', background: 'black', borderRadius: '16px', overflow: 'hidden' }}>
            <iframe 
              src={`https://www.youtube-nocookie.com/embed/${selectedVideo.id}?autoplay=1`} 
              style={{ width: '100%', height: '100%', border: 'none' }}
              allowFullScreen
              allow="autoplay; encrypted-media"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
