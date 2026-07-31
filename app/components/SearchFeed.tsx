'use client';

import { useState, useEffect } from 'react';
import DOMPurify from 'isomorphic-dompurify';

export default function SearchFeed() {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedType, setFeedType] = useState('Trending Homefeed');
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  // Load Homefeed on mount
  useEffect(() => {
    fetchFeed('/api/videos?q=trending', 'Trending Homefeed');
  }, []);

  const fetchFeed = async (url: string, type: string) => {
    setLoading(true);
    setError('');
    setFeedType(type);
    
    try {
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setVideos(data.data);
      } else {
        setError(data.error || 'Failed to fetch streams');
      }
    } catch (err) {
      setError('Critical infrastructure error. Proxy unavailable.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Strict Advanced Defense: Client-side sanitization of inputs
    const sanitizedQuery = DOMPurify.sanitize(query.trim());
    await fetchFeed(`/api/videos?q=${encodeURIComponent(sanitizedQuery)}`, `Search: ${sanitizedQuery}`);
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSearch} className="search-form">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search encrypted media streams..."
          className="search-input glass"
          maxLength={100}
          required
        />
        <button type="submit" disabled={loading} className="search-button">
          {loading ? 'Decrypting...' : 'Search'}
        </button>
      </form>

      {error && <div className="error-banner">{error}</div>}

      <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>{feedType}</h2>
      </div>

      <div className="grid">
        {videos.length === 0 && !loading && !error && (
          <p className="empty-state">No streams active. Initialize a search.</p>
        )}
        
        {loading && [1, 2, 3].map((i) => (
          <article key={i} className="glass card skeleton">
             <div className="card-thumbnail"></div>
             <h3 className="card-title" style={{color: 'transparent'}}>Loading...</h3>
          </article>
        ))}

        {videos.map((vid: any) => (
          <article 
            key={vid.id} 
            className="glass card" 
            style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }} 
            onClick={() => setSelectedVideo(vid)}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {vid.thumbnail ? (
              <div 
                className="card-thumbnail" 
                style={{ backgroundImage: `url(${vid.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              ></div>
            ) : vid.videoUrl ? (
              <div className="card-thumbnail" style={{ overflow: 'hidden' }}>
                <video src={vid.videoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} preload="metadata" muted />
              </div>
            ) : (
              <div className="card-thumbnail" style={{ background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{color: '#888'}}>No Image</span>
              </div>
            )}
            <h3 className="card-title">{vid.title || vid.text}</h3>
            <div className="card-meta">
              <span>{vid.channelTitle || vid.author}</span>
              <span>{new Date(vid.publishedAt).toLocaleDateString()}</span>
            </div>
            <span className="source-badge">{vid.source === 'official_api' ? 'OFFICIAL' : 'FALLBACK'}</span>
          </article>
        ))}
      </div>

      {selectedVideo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
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
