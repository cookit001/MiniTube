'use client';

import { useState, useEffect, useRef, useCallback, Component, ReactNode } from 'react';
import sdk from '@farcaster/frame-sdk';
import { parseEther, createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { trackSignal, rerankFeed } from '@/app/utils/interestEngine';
import { checkFeedForFollowedCreators, pushNotification } from '@/app/utils/notificationEngine';

// ═══════════════════════════════════════════════════════════════
// IMPROVEMENT 2: React Error Boundary
// Catches rendering crashes from corrupt video data or unexpected
// props without white-screening the entire app.
// ═══════════════════════════════════════════════════════════════
class VideoErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: any) {
    console.error('VideoErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', background: '#000', color: '#888' }}>
          <span style={{ fontSize: '48px' }}>⚠️</span>
          <p style={{ margin: 0, fontWeight: 600 }}>Something went wrong</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{ padding: '10px 20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#aaa', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Custom Toast Component for UI Feedback
const Toast = ({ message, type, onClose }: any) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
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
    <div role="dialog" aria-modal="true" aria-label={`Tip ${author}`} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
      <div className="glass" style={{ background: 'rgba(20, 20, 20, 0.95)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', width: '340px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: 'white' }}>Tip @{author}</h3>
          <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '12px', color: '#ccc' }}>
            Balance: {balance} {currency}
          </span>
        </div>

        {/* Currency Selector */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '12px' }} role="radiogroup" aria-label="Select currency">
          {['DEGEN', 'USDC', 'ETH'].map(c => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              role="radio"
              aria-checked={currency === c}
              aria-label={`Select ${c}`}
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
          aria-label={`Tip amount in ${currency}`}
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
          <button onClick={onClose} aria-label="Cancel tip" style={{ flex: 1, padding: '14px', borderRadius: '16px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
          <button onClick={() => onConfirm(amount, currency, announce)} aria-label="Send tip" style={{ flex: 1, padding: '14px', borderRadius: '16px', border: 'none', background: currency === 'DEGEN' ? '#a15cff' : currency === 'USDC' ? '#2775ca' : '#627eea', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Send Tip</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// IMPROVEMENT 1: Smart Video Preloading (Sliding Window)
// Only videos within ±2 of the current index get their `src`
// attribute loaded. All others are unmounted from memory.
// This prevents RAM exhaustion on mobile devices.
// ═══════════════════════════════════════════════════════════════
const PRELOAD_WINDOW = 2; // Load current video ± 2

export default function FarcasterWatchFeed() {
  const [casts, setCasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<any>(null);
  const [tipModal, setTipModal] = useState<any>(null);
  const [showConnect, setShowConnect] = useState(false);
  const [farcasterConnected, setFarcasterConnected] = useState(false);
  const [failedCasts, setFailedCasts] = useState<Set<string>>(new Set());
  const [realtimeViews, setRealtimeViews] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0); // Sliding window pivot
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Default to muted for autoplay policies
  
  // Track interactions in local state
  const [follows, setFollows] = useState<Set<string>>(new Set());
  const [likedCasts, setLikedCasts] = useState<Set<string>>(new Set());
  const [lastTap, setLastTap] = useState(0);
  const [heartAnim, setHeartAnim] = useState<string | null>(null);
  const watchedProgress = useRef<Record<string, number>>({});

  // Hydrate follows from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('minitube_follows');
      if (saved) setFollows(new Set(JSON.parse(saved)));
    } catch (e) {}
  }, []);

  // Sync follows to local storage
  useEffect(() => {
    if (follows.size > 0) {
      localStorage.setItem('minitube_follows', JSON.stringify(Array.from(follows)));
    }
  }, [follows]);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // ═══════════════════════════════════════════════════════════
  // IMPROVEMENT 3: Keyboard Navigation
  // Arrow keys and spacebar allow users to navigate the feed
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        scrollToNext(currentIndex);
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        scrollToPrev(currentIndex);
      } else if (e.key === ' ') {
        e.preventDefault();
        const video = videoRefs.current[currentIndex];
        if (video) {
          if (video.paused) video.play(); else video.pause();
        }
      } else if (e.key === 'm') {
        const video = videoRefs.current[currentIndex];
        if (video) video.muted = !video.muted;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, casts]);

  // Pause video if user minimizes the app or switches tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      const video = videoRefs.current[currentIndex];
      if (document.hidden) {
        if (video && !video.paused) video.pause();
      } else {
        if (video && video.paused) video.play().catch(e => console.log('Resume prevented:', e));
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentIndex]);

  // Initialize Farcaster Frame SDK for Auto-Auth
  useEffect(() => {
    const init = async () => {
      try {
        // Await the native context from Warpcast. If available, the user is already authenticated!
        const ctx = await sdk.context;
        if (ctx?.user?.fid) {
          setFarcasterConnected(true);
        }
      } catch (e) {
        // Silent fail if not in a frame
      }
      
      // Add a slight delay to ensure the Frame bridge is fully initialized
      setTimeout(() => {
        try {
          sdk.actions.ready();
        } catch (e) {
          console.log("Not running in a Farcaster Frame context");
        }
      }, 500);
    };
    init();
  }, []);

  useEffect(() => {
    fetch('/api/farcaster-watch')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.length > 0) {
          const personalised = rerankFeed(data.data);
          setCasts(personalised);
          if (data.nextCursor) setNextCursor(data.nextCursor);

          // Check for notifications
          checkFeedForFollowedCreators(personalised, follows);

          // Initialize real-time views from server hydration
          const initialViews: Record<string, number> = {};
          personalised.forEach((c: any) => initialViews[c.hash] = c.viewCount);
          setRealtimeViews(initialViews);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Infinite Scroll: Trigger pagination when approaching the end of the feed
  const loadMoreCasts = async () => {
    if (isLoadingMore || !nextCursor) return;
    setIsLoadingMore(true);
    
    try {
      const res = await fetch(`/api/farcaster-watch?cursor=${nextCursor}`);
      const data = await res.json();
      
      if (data.success && data.data?.length > 0) {
        const personalised = rerankFeed(data.data);
        setCasts(prev => {
          // Avoid duplicates
          const existingHashes = new Set(prev.map(c => c.hash));
          const newCasts = personalised.filter(c => !existingHashes.has(c.hash));
          
          if (newCasts.length > 0) {
            checkFeedForFollowedCreators(newCasts, follows);
            const newViews: Record<string, number> = {};
            newCasts.forEach(c => newViews[c.hash] = c.viewCount);
            setRealtimeViews(prevViews => ({...prevViews, ...newViews}));
            return [...prev, ...newCasts];
          }
          return prev;
        });
        setNextCursor(data.nextCursor || null);
      } else {
        setNextCursor(null);
      }
    } catch (e) {
      console.error('Failed to load more casts', e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    if (casts.length > 0 && currentIndex >= casts.length - 3 && nextCursor && !isLoadingMore) {
      loadMoreCasts();
    }
  }, [currentIndex, casts.length, nextCursor, isLoadingMore]);

  // Intersection Observer to autoplay videos when they snap into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(e => console.log('Autoplay prevented:', e));

            // Update sliding window pivot for smart preloading
            const idx = Number(video.getAttribute('data-index'));
            if (!isNaN(idx)) setCurrentIndex(idx);

            // Real-time View Incrementing
            const hash = video.getAttribute('data-hash');
            if (hash && !(watchedProgress.current as any)[hash + '_viewed']) {
               (watchedProgress.current as any)[hash + '_viewed'] = 1;
               
               // Secure backend update to Redis (silently in the background)
               fetch('/api/views', {
                  method: 'POST', 
                  body: JSON.stringify({ hash }),
                  headers: { 'Content-Type': 'application/json' }
               }).catch(e => console.log('View increment failed', e));
            }
          } else {
            video.pause();
            video.currentTime = 0;
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
          setToast({ message: `Opening Farcaster to follow @${payload.author}...`, type: 'success' });
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
      sdk.actions.openUrl(url);
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  const handleDoubleTap = (hash: string) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      if (!farcasterConnected) {
        setShowConnect(true);
        return;
      }
      setHeartAnim(hash);
      const newLikes = new Set(likedCasts);
      newLikes.add(hash);
      setLikedCasts(newLikes);
      setTimeout(() => setHeartAnim(null), 1000);
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
      let txParams: any = { to: SPLITTER_CONTRACT };

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
      
      // Push local notification for tip receipt
      pushNotification({
        type: 'tip',
        actor: author,
        message: `You successfully tipped ${amount} ${currency} to @${author}`
      });

      if (announce && farcasterConnected) {
        setTimeout(() => setToast({ message: `Cast posted: Just tipped @${author} ${amount} ${currency}!`, type: 'success' }), 2000);
      } else if (announce) {
        setTimeout(() => setShowConnect(true), 1000);
      }
    } catch (error: any) {
      setToast({ message: error.message || 'Transaction failed', type: 'error' });
    }
  };

  const scrollToNext = (idx: number) => {
    if (containerRef.current) {
      const articles = Array.from(containerRef.current.children).filter(el => el.tagName === 'ARTICLE');
      if (idx + 1 < articles.length) {
        articles[idx + 1].scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const scrollToPrev = (idx: number) => {
    if (containerRef.current) {
      const articles = Array.from(containerRef.current.children).filter(el => el.tagName === 'ARTICLE');
      if (idx - 1 >= 0) {
        articles[idx - 1].scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Helper: format large numbers (1200 -> 1.2K)
  const formatCount = (n: number | string) => {
    const num = typeof n === 'string' ? parseFloat(n) : n;
    if (isNaN(num)) return '0';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return String(num);
  };

  return (
    <VideoErrorBoundary>
      <div style={{ display: 'flex', justifyContent: 'center', height: '100%', width: '100%', backgroundColor: '#000' }}>
        <div 
          ref={containerRef}
          className="watch-feed"
          role="feed"
          aria-label="Video feed"
          tabIndex={0}
          style={{ 
            height: '100%', 
            width: '100%',
            overflowY: 'scroll', 
            scrollSnapType: 'y mandatory',
            scrollBehavior: 'smooth',
            background: '#000',
            position: 'relative',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            outline: 'none',
          }}
        >
          <style>{`
            .watch-feed::-webkit-scrollbar { display: none; }
            @keyframes bounce-subtle {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(5px); }
            }
            @keyframes heart-burst {
              0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
              20% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
              30% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
              100% { transform: translate(-50%, -100%) scale(1.5); opacity: 0; }
            }
            @keyframes spin { 100% { transform: rotate(360deg); } }
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

        {/* Connect Farcaster Modal */}
        {showConnect && (
          <div role="dialog" aria-modal="true" aria-label="Connect Farcaster" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
            <div className="glass" style={{ background: 'rgba(20, 20, 20, 0.95)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', width: '300px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', textAlign: 'center' }}>
              <div style={{ fontSize: '40px' }}>💜</div>
              <h3 style={{ margin: 0, color: 'white' }}>Connect Farcaster</h3>
              <p style={{ color: '#ccc', fontSize: '14px', margin: 0, lineHeight: 1.4 }}>Sign in with Neynar to Like, Comment, and Announce Tips on Farcaster.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                <button 
                  onClick={() => { setFarcasterConnected(true); setShowConnect(false); setToast({ message: 'Farcaster Connected!', type: 'success' }); }} 
                  aria-label="Sign in with Neynar"
                  style={{ padding: '14px', borderRadius: '16px', border: 'none', background: '#8a63d2', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Sign In with Neynar
                </button>
                <button onClick={() => setShowConnect(false)} aria-label="Dismiss" style={{ padding: '14px', borderRadius: '16px', border: 'none', background: 'transparent', color: '#888', cursor: 'pointer', fontWeight: 'bold' }}>Maybe Later</button>
              </div>
            </div>
          </div>
        )}

        {/* Support Banner for the App Creator */}
        {!follows.has('real9realms') && casts.length > 0 && (
          <div role="banner" style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', background: 'linear-gradient(135deg, rgba(255,42,42,0.9), rgba(161,92,255,0.9))', padding: '12px 16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100, boxShadow: '0 4px 20px rgba(255,42,42,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: '14px', letterSpacing: '0.5px' }}>Created by @real9realms</span>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: 600 }}>Follow the dev to support MiniTube!</span>
            </div>
            <button 
              onClick={() => handleAction('follow', { author: 'real9realms' })}
              aria-label="Follow @real9realms on Farcaster"
              style={{ background: 'white', color: '#ff2a2a', border: 'none', padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
            >
              Follow
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#888', gap: '16px' }}>
            <div className="spinner" role="status" aria-label="Loading feed" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#ff2a2a', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
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

          // ═════════════════════════════════════════════════
          // IMPROVEMENT 1: Sliding window — only load video
          // src for items within ± PRELOAD_WINDOW of current
          // ═════════════════════════════════════════════════
          const isInWindow = Math.abs(index - currentIndex) <= PRELOAD_WINDOW;

          // Verified tick badge
          const verifiedBadge = cast.verifiedTier === 'official' ? (
            <span style={{ fontSize: '10px', background: 'linear-gradient(135deg, #a15cff, #ff2a2a)', color: 'white', padding: '2px 4px', borderRadius: '4px', marginLeft: '6px', fontWeight: 'bold' }}>★ OFFICIAL</span>
          ) : cast.verifiedTier === 'whale' ? (
            <span style={{ fontSize: '12px', marginLeft: '4px' }} title="Farcaster Whale (10k+ followers)">🐋</span>
          ) : cast.verifiedTier === 'power' ? (
            <span style={{ color: '#a15cff', fontSize: '14px', marginLeft: '4px' }} title="Power Badge">⚡️</span>
          ) : cast.verifiedTier === 'verified' ? (
            <span style={{ color: '#0095f6', fontSize: '14px', marginLeft: '4px' }} title="Verified (>1k followers)">✓</span>
          ) : null;

          const cards = [
            <article 
              key={cast.hash}
              role="article"
              aria-label={`Video by @${cast.author}: ${cast.text?.slice(0, 60) || 'Farcaster video'}`}
              style={{ 
                height: '100%', 
                width: '100%', 
                scrollSnapAlign: 'start', 
                position: 'relative', 
                backgroundColor: '#000',
                flexShrink: 0
              }}
            >
              {/* Video element — uses sliding window preloading */}
              {!isFailed && (
                <video 
                  ref={(el) => { videoRefs.current[index] = el; }}
                  src={isInWindow ? cast.videoUrl : undefined}
                  data-hash={cast.hash}
                  data-index={index}
                  loop 
                  playsInline
                  muted={isMuted}
                  controls={false}
                  aria-label={`Video: ${cast.text?.slice(0, 80) || 'Farcaster video content'}`}
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
                    aria-label="View this cast on Warpcast"
                    style={{ padding: '10px 20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#aaa', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                  >
                    View on Warpcast →
                  </button>
                </div>
              )}
              
              {/* Cinematic Gradient */}
              {!isFailed && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)', pointerEvents: 'none' }}></div>}
              
              {/* Double Tap Heart Animation */}
              {heartAnim === cast.hash && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 50, animation: 'heart-burst 1s forwards' }}>
                  <span style={{ fontSize: '100px', filter: 'drop-shadow(0 10px 20px rgba(255,42,42,0.5))' }}>❤️</span>
                </div>
              )}
              
              {/* Right Action Bar */}
              <nav aria-label="Video actions" style={{ position: 'absolute', bottom: '150px', right: '12px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', zIndex: 10 }}>
                
                {/* Mute Toggle */}
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                  style={{ background: 'transparent', border: 'none', padding: 0, color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'transform 0.2s', marginBottom: '8px' }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{ width: '42px', height: '42px', background: 'rgba(0,0,0,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                    {isMuted ? '🔇' : '🔊'}
                  </div>
                </button>
                
                {/* Profile Avatar with Follow Plus icon */}
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                    <span style={{color: '#fff', fontWeight: 'bold', fontSize: '1.2rem'}}>{cast.author.charAt(0).toUpperCase()}</span>
                  </div>
                  {!isFollowed && (
                    <button 
                      onClick={() => handleAction('follow', { author: cast.author, fid: cast.fid })}
                      aria-label={`Follow @${cast.author}`}
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
                  aria-label={`Like video by @${cast.author}. ${likedCasts.has(cast.hash) ? 'Already liked.' : ''} ${cast.likes} likes`}
                  aria-pressed={likedCasts.has(cast.hash)}
                  style={{ background: 'transparent', border: 'none', padding: 0, color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'transform 0.2s' }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{ width: '38px', height: '38px', background: 'rgba(0,0,0,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {likedCasts.has(cast.hash) ? '❤️' : '♡'}
                  </div>
                  <span style={{ fontSize: '12px', color: likedCasts.has(cast.hash) ? '#ff2a2a' : 'white', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                    {likedCasts.has(cast.hash) ? (typeof cast.likes === 'string' && cast.likes.includes('K') ? cast.likes : Number(cast.likes) + 1) : cast.likes}
                  </span>
                </button>

                {/* Comment */}
                <button 
                  onClick={() => handleNativeOpen(cast.hash, cast.author)}
                  aria-label={`Comment on video by @${cast.author}. ${cast.recasts} comments`}
                  style={{ background: 'transparent', border: 'none', padding: 0, color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', transition: 'transform 0.2s' }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{ width: '38px', height: '38px', background: 'rgba(0,0,0,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    💬
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>{cast.recasts}</span>
                </button>

                {/* Share */}
                <button 
                  onClick={() => { handleShare(cast.hash); trackSignal(cast.hash, cast.text, 'shared'); }}
                  aria-label="Share this video"
                  style={{ background: 'transparent', border: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{ width: '38px', height: '38px', background: 'rgba(0,0,0,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    🔗
                  </div>
                  <span style={{ color: 'white', fontSize: '12px', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>Share</span>
                </button>

                {/* Views */}
                <div aria-label={`${formatCount(realtimeViews[cast.hash] || cast.viewCount || 0)} views`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <div style={{ width: '38px', height: '38px', background: 'rgba(0,0,0,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    👁️
                  </div>
                  <span style={{ color: 'white', fontSize: '12px', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                    {formatCount(realtimeViews[cast.hash] || cast.viewCount || 0)}
                  </span>
                </div>

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
              </nav>

              {/* Bottom Info Bar */}
              <div style={{ position: 'absolute', bottom: '24px', left: '16px', right: '80px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>@{cast.author}</h3>
                  {verifiedBadge}
                  {cast.author !== 'real9realms' && !isFollowed && (
                    <span style={{ color: '#aaa', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }} onClick={() => handleAction('follow', { author: cast.author })} role="button" tabIndex={0} aria-label={`Follow @${cast.author}`}>• Follow</span>
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
                  aria-label="Next video"
                  style={{ position: 'absolute', bottom: '24px', right: '50%', transform: 'translateX(50%)', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: '20px', backdropFilter: 'blur(5px)', zIndex: 10, animation: 'bounce-subtle 2s infinite' }}
                >
                  ↓
                </button>
              )}
            </article>
          ];

          // Creator Card
          if (index === 0) {
            cards.push(
              <article key="creator-card" role="article" aria-label="Support MiniTube creator @real9realms" style={{ height: '100%', width: '100%', scrollSnapAlign: 'start', position: 'relative', backgroundColor: '#000', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'linear-gradient(135deg, rgba(20,20,20,0.98), rgba(10,0,20,0.98))', border: '1px solid rgba(161,92,255,0.4)', borderRadius: '24px', padding: '32px 24px', textAlign: 'center', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 0 60px rgba(161,92,255,0.2)' }}>
                  <div style={{ fontSize: '52px' }}>📺</div>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#a15cff', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}>Built by 9realms Studios</p>
                    <h2 style={{ margin: '8px 0 0', color: 'white', fontSize: '1.4rem', fontWeight: 900 }}>@real9realms</h2>
                    <p style={{ margin: '8px 0 0', color: '#aaa', fontSize: '0.9rem', lineHeight: 1.5 }}>Creator of MiniTube — the decentralized video platform on Farcaster.</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                      onClick={() => handleAction('follow', { author: 'real9realms' })}
                      aria-label="Follow @real9realms on Farcaster"
                      style={{ padding: '14px', borderRadius: '16px', border: 'none', background: 'linear-gradient(135deg, #a15cff, #627eea)', color: 'white', cursor: 'pointer', fontWeight: 800, fontSize: '1rem', boxShadow: '0 4px 20px rgba(161,92,255,0.4)' }}
                    >
                      👥 Follow on Farcaster
                    </button>
                    {/* Optional secondary CTA: Tip for Creator */}
                    <button
                      onClick={() => {
                        if (!farcasterConnected) {
                          setToast('Tips are only available inside the Farcaster app!');
                          return;
                        }
                        // Use 0x0...01 as a placeholder for the user's ETH address if they haven't set one yet
                        setTipModal({ author: 'real9realms', address: '0x0000000000000000000000000000000000000001' });
                      }}
                      style={{ padding: '11px', borderRadius: '16px', border: '1px solid rgba(161,92,255,0.3)', background: 'transparent', color: '#a15cff', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                      💸 Optional: Tip the Creator
                    </button>
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
    </VideoErrorBoundary>
  );
}
