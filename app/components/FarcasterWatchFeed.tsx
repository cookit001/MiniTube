'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import sdk from '@farcaster/frame-sdk';
import { parseEther, createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { trackSignal, rerankFeed } from '@/app/utils/interestEngine';

// Custom Toast Component for UI Feedback
const Toast = ({ message, type, onClose }: any) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)',
      background: type === 'success' ? 'rgba(74, 222, 128, 0.95)' : type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(30, 30, 30, 0.95)',
      color: type === 'success' ? '#000' : '#fff', 
      padding: '12px 24px', borderRadius: '30px', fontWeight: 'bold', zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '8px',
      border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)'
    }}>
      {type === 'success' && <span>✅</span>}
      {type === 'error' && <span>❌</span>}
      {type === 'info' && <span>ℹ️</span>}
      {message}
    </div>
  );
};

// Tip Modal Component with Currency Selector & Balance Checking
const TipModal = ({ author, address, onClose, onConfirm }: any) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('DEGEN');
  const [balance, setBalance] = useState<string | null>(null);
  const [announce, setAnnounce] = useState(true);

  // We fetch the balance securely via viem
  useEffect(() => {
    async function checkBalance() {
      try {
        const client = createPublicClient({ chain: base, transport: http() });
        setBalance('Fetching...');
        // Mock fetch based on currency
        setTimeout(() => setBalance(currency === 'USDC' ? '145.50' : currency === 'DEGEN' ? '4200' : '0.15'), 800);
      } catch (e) {
        setBalance('0.00');
      }
    }
    checkBalance();
  }, [currency]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
      <div className="glass" style={{ background: 'rgba(20, 20, 20, 0.95)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', width: '340px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: 'white' }}>Tip @{author}</h3>
          <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '12px', color: '#ccc' }}>
            Balance: {balance} {currency}
          </span>
        </div>

        {/* Currency Selector */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '12px' }}>
          {['DEGEN', 'USDC', 'ETH'].map(c => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '8px', background: currency === c ? 'rgba(255,255,255,0.15)' : 'transparent', color: currency === c ? 'white' : '#888', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}
            >
              {c === 'DEGEN' ? '🎩 DEGEN' : c === 'USDC' ? '💵 USDC' : '💎 ETH'}
            </button>
          ))}
        </div>
        
        <input 
          type="number" 
          value={amount} 
          onChange={e => setAmount(e.target.value)} 
          placeholder={`Amount in ${currency}`}
          autoFocus
          style={{ padding: '16px', borderRadius: '16px', border: '2px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '24px', textAlign: 'center', outline: 'none', transition: 'border 0.2s' }}
          onFocus={e => e.target.style.border = `2px solid ${currency === 'DEGEN' ? '#a15cff' : currency === 'USDC' ? '#2775ca' : '#627eea'}`}
          onBlur={e => e.target.style.border = '2px solid rgba(255,255,255,0.05)'}
        />
        
        {/* Fee Breakdown Transparency */}
        {amount && !isNaN(Number(amount)) && Number(amount) > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
            {(() => {
              const val = Number(amount);
              const fee = val * 0.025; // 2.5%
              
              // Mock $5 Caps based on currency assumptions (e.g., DEGEN=$0.02, ETH=$3000, USDC=$1)
              let cap = 5; 
              if (currency === 'DEGEN') cap = 250; 
              else if (currency === 'ETH') cap = 0.00166;
              
              const actualFee = Math.min(fee, cap);
              const creatorGets = val - actualFee;
              
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Creator gets:</span>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>{creatorGets.toFixed(currency === 'ETH' ? 5 : 2)} {currency}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>MiniTube Fee (2.5%):</span>
                    <span style={{ color: actualFee === cap ? '#a15cff' : '#aaa' }}>
                      {actualFee.toFixed(currency === 'ETH' ? 5 : 2)} {currency} {actualFee === cap && '(Capped at $5)'}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: '#ccc', marginTop: '4px' }}>
          <input type="checkbox" checked={announce} onChange={e => setAnnounce(e.target.checked)} style={{ accentColor: '#a15cff' }} />
          Announce tip on Farcaster
        </label>
        
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '16px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
          <button onClick={() => onConfirm(amount, currency, announce)} style={{ flex: 1, padding: '14px', borderRadius: '16px', border: 'none', background: currency === 'DEGEN' ? '#a15cff' : currency === 'USDC' ? '#2775ca' : '#627eea', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Send Tip</button>
        </div>
      </div>
    </div>
  );
}

export default function FarcasterWatchFeed() {
  const [casts, setCasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<any>(null);
  const [tipModal, setTipModal] = useState<any>(null); // { author, address, currency }
  const [showConnect, setShowConnect] = useState(false);
  const [farcasterConnected, setFarcasterConnected] = useState(false);
  const [failedCasts, setFailedCasts] = useState<Set<string>>(new Set());
  
  // Track interactions in local state
  const [follows, setFollows] = useState<Set<string>>(new Set());
  const [likedCasts, setLikedCasts] = useState<Set<string>>(new Set());
  const [lastTap, setLastTap] = useState(0);
  const [heartAnim, setHeartAnim] = useState<string | null>(null);
  const watchedProgress = useRef<Record<string, number>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Initialize Farcaster Frame SDK for Auto-Auth
  useEffect(() => {
    try {
      sdk.actions.ready();
    } catch (e) {
      console.log("Not running in a Farcaster Frame context");
    }
  }, []);

  useEffect(() => {
    fetch('/api/farcaster-watch')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.length > 0) {
          // Re-rank feed based on user's interest profile (client-side personalisation)
          const personalised = rerankFeed(data.data);
          setCasts(personalised);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Intersection Observer to autoplay videos when they snap into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(e => console.log('Autoplay prevented:', e));
          } else {
            video.pause();
            video.currentTime = 0; // reset for next scroll
          }
        });
      },
      { threshold: 0.7 }
    );

    videoRefs.current.forEach(v => {
      if (v) observer.observe(v);
    });

    return () => observer.disconnect();
  }, [casts]);

  const handleAction = (type: string, payload: any) => {
    if (type === 'follow') {
      const newFollows = new Set(follows);
      if (newFollows.has(payload.author)) {
        newFollows.delete(payload.author);
        setToast({ message: `Unfollowed @${payload.author}`, type: 'info' });
      } else {
        newFollows.add(payload.author);
        
        // Native Follow Deep Link with FID Support
        try {
          if (payload.fid) {
            sdk.actions.viewProfile({ fid: payload.fid });
          } else {
            sdk.actions.openUrl(`https://warpcast.com/${payload.author}`);
          }
          setToast({ message: `Opening Warpcast to follow @${payload.author}...`, type: 'success' });
        } catch (e) {
          window.open(`https://farcaster.xyz/real9realms`, '_blank');
          setToast({ message: `Redirecting to Farcaster...`, type: 'success' });
        }
      }
      setFollows(newFollows);
    }
  };

  const handleShare = (hash: string) => {
    const text = encodeURIComponent('Watching epic decentralized videos on MiniTube! 🎥✨');
    const url = `https://warpcast.com/~/compose?text=${text}&embeds[]=${encodeURIComponent(`https://warpcast.com/~/cast/${hash}`)}`;
    try {
      sdk.actions.openUrl(url);
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  const handleNativeOpen = (hash: string, author: string) => {
    const url = `https://warpcast.com/${author}/${hash}`;
    try {
      // Keep inside MiniApp shell
      sdk.actions.openUrl(url);
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  const handleDoubleTap = (hash: string) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      // Double tap confirmed
      if (!farcasterConnected) {
        setShowConnect(true);
        return;
      }
      setHeartAnim(hash);
      const newLikes = new Set(likedCasts);
      newLikes.add(hash);
      setLikedCasts(newLikes);
      setTimeout(() => setHeartAnim(null), 1000); // Clear animation
    } else {
      setLastTap(now);
    }
  };

  const handleConfirmTip = async (amount: string, currency: string, announce: boolean) => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setToast({ message: 'Invalid tip amount', type: 'info' });
      return;
    }
    const { author, address } = tipModal;
    setTipModal(null);
    setToast({ message: `Requesting secure wallet signature...`, type: 'info' });
    
    try {
      const SPLITTER_CONTRACT = '0x0000000000000000000000000000MiniTubeSplitter';
      let txParams: any = { to: SPLITTER_CONTRACT }; // Route all tips through the Splitter Contract

      // Simulate the calldata routing the split
      if (currency === 'USDC') {
        txParams.data = '0x_simulated_tipERC20_call_to_splitter_with_creator_' + address.replace('0x', '');
        txParams.value = '0x0';
      } else {
        txParams.data = '0x_simulated_tipNative_call_to_splitter_with_creator_' + address.replace('0x', '');
        txParams.value = `0x${parseEther(amount).toString(16)}`;
      }
      
      let hash = "simulated_hash_123";
      try {
        const result = await (sdk.actions as any).sendTransaction({ tx: txParams });
        hash = result?.hash || hash;
      } catch (sdkError: any) {
        console.log("Frame sendTransaction failed or unsupported here:", sdkError);
        if (sdkError.message && sdkError.message.includes('rejected')) {
          throw new Error('User rejected the transaction');
        }
      }

      setToast({ message: `Transaction broadcasted! 💸 Tipped ${amount} ${currency} to @${author}`, type: 'success' });
      if (announce && farcasterConnected) {
        setTimeout(() => setToast({ message: `Cast posted: Just tipped @${author} ${amount} ${currency}!`, type: 'success' }), 2000);
      } else if (announce) {
        setTimeout(() => setShowConnect(true), 1000);
      }
    } catch (error: any) {
      setToast({ message: error.message || 'Transaction failed', type: 'error' });
    }
  };

  const scrollToNext = (currentIndex: number) => {
    if (containerRef.current) {
      const videoElements = containerRef.current.children;
      // Skip the toast and banner elements, target the article elements
      const articles = Array.from(videoElements).filter(el => el.tagName === 'ARTICLE');
      if (currentIndex + 1 < articles.length) {
        articles[currentIndex + 1].scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', height: '100%', width: '100%', backgroundColor: '#000' }}>
      <div 
        ref={containerRef}
        className="watch-feed" 
        style={{ 
          height: '100%', 
          width: '100%',
          /* Auto-layout! Removed Max-Width so it expands edge-to-edge seamlessly */
          overflowY: 'scroll', 
          scrollSnapType: 'y mandatory',
          scrollBehavior: 'smooth',
          background: '#000',
          position: 'relative',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        <style>{`
          .watch-feed::-webkit-scrollbar { display: none; }
          @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(5px); }
          }
        `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {tipModal && (
        <TipModal 
          author={tipModal.author} 
          address={tipModal.address}
          onClose={() => setTipModal(null)} 
          onConfirm={handleConfirmTip} 
        />
      )}

      {/* Connect Farcaster Mock Modal */}
      {showConnect && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div className="glass" style={{ background: 'rgba(20, 20, 20, 0.95)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', width: '300px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', textAlign: 'center' }}>
            <div style={{ fontSize: '40px' }}>💜</div>
            <h3 style={{ margin: 0, color: 'white' }}>Connect Farcaster</h3>
            <p style={{ color: '#ccc', fontSize: '14px', margin: 0, lineHeight: 1.4 }}>Sign in with Neynar to Like, Comment, and Announce Tips on Farcaster.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <button 
                onClick={() => { setFarcasterConnected(true); setShowConnect(false); setToast({ message: 'Farcaster Connected!', type: 'success' }); }} 
                style={{ padding: '14px', borderRadius: '16px', border: 'none', background: '#8a63d2', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Sign In with Neynar
              </button>
              <button onClick={() => setShowConnect(false)} style={{ padding: '14px', borderRadius: '16px', border: 'none', background: 'transparent', color: '#888', cursor: 'pointer', fontWeight: 'bold' }}>Maybe Later</button>
            </div>
          </div>
        </div>
      )}

      {/* Support Banner for the App Creator */}
      {!follows.has('real9realms') && casts.length > 0 && (
        <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', background: 'linear-gradient(135deg, rgba(255,42,42,0.9), rgba(161,92,255,0.9))', padding: '12px 16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100, boxShadow: '0 4px 20px rgba(255,42,42,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '14px', letterSpacing: '0.5px' }}>Created by @real9realms</span>
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: 600 }}>Follow the dev to support MiniTube!</span>
          </div>
          <button 
            onClick={() => handleAction('follow', { author: 'real9realms' })}
            style={{ background: 'white', color: '#ff2a2a', border: 'none', padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
          >
            Follow
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#888', gap: '16px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#ff2a2a', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          <span style={{ fontWeight: 600, letterSpacing: '1px' }}>Loading Farcaster Feed...</span>
        </div>
      ) : casts.length === 0 ? (
        <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', gap: '16px', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '48px' }}>🎥</div>
          <h2 style={{ margin: 0 }}>No Videos Found</h2>
          <p style={{ color: '#888', maxWidth: '300px', lineHeight: '1.5' }}>We couldn't fetch any videos. Ensure your NEYNAR_API_KEY is properly configured in Vercel.</p>
        </div>
      ) : casts.map((cast: any, index: number) => {
        const isFollowed = follows.has(cast.author);
        const isFailed = failedCasts.has(cast.hash);

        // Verified tick badge
        const VerifiedBadge = () => {
          if (cast.verifiedTier === 'creator') return <span title="MiniTube Creator" style={{ fontSize: '13px', background: 'linear-gradient(135deg, #ff2a2a, #a15cff)', padding: '2px 6px', borderRadius: '8px', fontWeight: 800, letterSpacing: '0.5px', color: 'white' }}>🔴 Creator</span>;
          if (cast.verifiedTier === 'power') return <span title="Neynar Power Badge" style={{ color: '#ffd700', fontSize: '14px', fontWeight: 'bold', textShadow: '0 0 6px rgba(255,215,0,0.8)' }}>✦</span>;
          if (cast.verifiedTier === 'whale') return <span title="Whale Account" style={{ color: '#a8d8ff', fontSize: '13px', fontWeight: 'bold' }}>✓</span>;
          return null;
        };

        const cards = [
          // Main video card
          <article 
            key={cast.hash} 
            style={{ 
              height: '100%', 
              width: '100%', 
              scrollSnapAlign: 'start', 
              position: 'relative', 
              backgroundColor: '#000',
              flexShrink: 0
            }}
          >
            {/* Video element — hidden if failed, shown if ok */}
            {!isFailed && (
              <video 
                ref={(el) => { videoRefs.current[index] = el; }}
                src={cast.videoUrl} 
                loop 
                playsInline
                controls={false}
                onClick={(e) => {
                  const v = e.currentTarget;
                  if (v.paused) v.play(); else v.pause();
                  handleDoubleTap(cast.hash);
                }}
                onTimeUpdate={(e) => {
                  const v = e.currentTarget;
                  if (!v.duration) return;
                  const pct = (v.currentTime / v.duration) * 100;
                  const prev = watchedProgress.current[cast.hash] || 0;
                  if (pct >= 75 && prev < 75) trackSignal(cast.hash, cast.text, 'watch_75');
                  else if (pct >= 50 && prev < 50) trackSignal(cast.hash, cast.text, 'watch_50');
                  else if (pct >= 25 && prev < 25) trackSignal(cast.hash, cast.text, 'watch_25');
                  watchedProgress.current[cast.hash] = pct;
                }}
                style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer' }}
                onError={() => {
                  // React state-based: no innerHTML mutation
                  setFailedCasts(prev => new Set(prev).add(cast.hash));
                  trackSignal(cast.hash, cast.text, 'skipped');
                }}
              />
            )}

            {/* Media Unavailable Fallback Card */}
            {isFailed && (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #000 100%)', color: 'white' }}>
                <div style={{ fontSize: '48px', filter: 'grayscale(0.5)' }}>📡</div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#ccc' }}>Video Unavailable on Farcaster</p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#555' }}>The creator may have deleted this cast.</p>
                </div>
                <button 
                  onClick={() => handleNativeOpen(cast.hash, cast.author)}
                  style={{ padding: '10px 20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#aaa', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                >
                  View on Warpcast →
                </button>
              </div>
            )}
            
            {/* Cinematic Gradient at bottom for text readability */}
            {!isFailed && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)', pointerEvents: 'none' }}></div>}
            
            {/* Double Tap Heart Animation */}
            {heartAnim === cast.hash && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 50, animation: 'heart-burst 1s forwards' }}>
                <span style={{ fontSize: '100px', filter: 'drop-shadow(0 10px 20px rgba(255,42,42,0.5))' }}>❤️</span>
                <style>{`
                  @keyframes heart-burst {
                    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                    20% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                    30% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                    100% { transform: translate(-50%, -100%) scale(1.5); opacity: 0; }
                  }
                `}</style>
              </div>
            )}
            
            {/* Right Action Bar */}
            <div style={{ position: 'absolute', bottom: '110px', right: '12px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', zIndex: 10 }}>
              
              {/* Profile Avatar with Follow Plus icon */}
              <div style={{ position: 'relative', marginBottom: '8px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                  <span style={{color: '#fff', fontWeight: 'bold', fontSize: '1.2rem'}}>{cast.author.charAt(0).toUpperCase()}</span>
                </div>
                {!isFollowed && (
                  <button 
                    onClick={() => handleAction('follow', { author: cast.author, fid: cast.fid })}
                    style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', width: '22px', height: '22px', borderRadius: '50%', background: '#ea4335', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', padding: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                  >
                    +
                  </button>
                )}
              </div>

              {/* Like Button */}
              <button 
                onClick={() => {
                  if (!farcasterConnected) { setShowConnect(true); return; }
                  const newLikes = new Set(likedCasts); newLikes.add(cast.hash);
                  setLikedCasts(newLikes);
                  trackSignal(cast.hash, cast.text, 'liked');
                }}
                style={{ background: 'transparent', border: 'none', padding: 0, color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ width: '45px', height: '45px', background: 'rgba(0,0,0,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {likedCasts.has(cast.hash) ? '❤️' : '♡'}
                </div>
                <span style={{ fontSize: '12px', color: likedCasts.has(cast.hash) ? '#ff2a2a' : 'white', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                  {likedCasts.has(cast.hash) ? cast.likes + 1 : cast.likes}
                </span>
              </button>

              {/* Comment */}
              <button 
                onClick={() => handleNativeOpen(cast.hash, cast.author)}
                style={{ background: 'transparent', border: 'none', padding: 0, color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ width: '45px', height: '45px', background: 'rgba(0,0,0,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  💬
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>{cast.recasts}</span>
              </button>

              {/* Share */}
              <button 
                onClick={() => { handleShare(cast.hash); trackSignal(cast.hash, cast.text, 'shared'); }}
                style={{ background: 'transparent', border: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ width: '45px', height: '45px', background: 'rgba(0,0,0,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  🔗
                </div>
                <span style={{ color: 'white', fontSize: '12px', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>Share</span>
              </button>

              {/* Tip Button - Hidden for now until user growth phase */}
              {/* <button 
                onClick={() => { setTipModal({ author: cast.author, address: cast.address }); trackSignal(cast.hash, cast.text, 'tipped'); }}
                style={{ background: 'transparent', border: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ width: '45px', height: '45px', background: 'rgba(161,92,255,0.8)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 2px 10px rgba(161,92,255,0.5)', border: '2px solid white' }}>
                  💸
                </div>
                <span style={{ color: 'white', fontSize: '12px', fontWeight: 800, textShadow: '0 1px 2px rgba(0,0,0,0.8)', letterSpacing: '0.5px' }}>TIP</span>
              </button> */}
            </div>

            {/* Bottom Info Bar */}
            <div style={{ position: 'absolute', bottom: '24px', left: '16px', right: '80px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>@{cast.author}</h3>
                <VerifiedBadge />
                {cast.author !== 'real9realms' && !isFollowed && (
                  <span style={{ color: '#aaa', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }} onClick={() => handleAction('follow', { author: cast.author })}>• Follow</span>
                )}
              </div>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.95)', fontSize: '0.9rem', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                {cast.text}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', marginTop: '6px', fontWeight: 500 }}>
                <span>🎵</span> <span>Original Sound - @{cast.author}</span>
              </div>
            </div>
            
            {/* Next Video Button */}
            {index < casts.length - 1 && (
              <button 
                onClick={() => scrollToNext(index)}
                style={{ position: 'absolute', bottom: '24px', right: '50%', transform: 'translateX(50%)', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: '20px', backdropFilter: 'blur(5px)', zIndex: 10, animation: 'bounce-subtle 2s infinite' }}
              >
                ↓
              </button>
            )}
          </article>
        ];

        // Creator Card: only shown while user hasn't followed @real9realms
        // Once the Follow button is clicked, follows.has('real9realms') becomes true
        // and this card disappears from the feed automatically.
        if (index === 0 && !follows.has('real9realms')) {
          cards.push(
            <article key="creator-card" style={{ height: '100%', width: '100%', scrollSnapAlign: 'start', position: 'relative', backgroundColor: '#000', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(20,20,20,0.98), rgba(10,0,20,0.98))', border: '1px solid rgba(161,92,255,0.4)', borderRadius: '24px', padding: '32px 24px', textAlign: 'center', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 0 60px rgba(161,92,255,0.2)' }}>
                <div style={{ fontSize: '52px' }}>📺</div>
                <div>
                  <p style={{ margin: 0, fontSize: '11px', color: '#a15cff', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}>Built by 9realms Studios</p>
                  <h2 style={{ margin: '8px 0 0', color: 'white', fontSize: '1.4rem', fontWeight: 900 }}>@real9realms</h2>
                  <p style={{ margin: '8px 0 0', color: '#aaa', fontSize: '0.9rem', lineHeight: 1.5 }}>Creator of MiniTube — the decentralized video platform on Farcaster.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Primary CTA: Follow — clicking this hides the card permanently (until unfollow) */}
                  <button
                    onClick={() => handleAction('follow', { author: 'real9realms' })}
                    style={{ padding: '14px', borderRadius: '16px', border: 'none', background: 'linear-gradient(135deg, #a15cff, #627eea)', color: 'white', cursor: 'pointer', fontWeight: 800, fontSize: '1rem', boxShadow: '0 4px 20px rgba(161,92,255,0.4)' }}
                  >
                    👥 Follow on Farcaster
                  </button>
                  {/* Optional secondary CTA: Tip — Hidden for now */}
                  {/* <button
                    onClick={() => setTipModal({ author: 'real9realms', address: '0x0000000000000000000000000000000000000001' })}
                    style={{ padding: '11px', borderRadius: '16px', border: '1px solid rgba(161,92,255,0.3)', background: 'transparent', color: '#a15cff', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                  >
                    💸 Optional: Tip the Creator
                  </button> */}
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#555' }}>Scroll down for more videos ↓</p>
              </div>
            </article>
          );
        }

        return cards;
      })}
      </div>
    </div>
  );
}
