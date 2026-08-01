/**
 * MiniTube Interest Engine
 * Runs 100% client-side (localStorage). Zero backend needed.
 * Tracks what users watch, like, tip, and skip — then re-ranks feeds accordingly.
 */

// Topic keyword map for lightweight text-based topic detection
const TOPIC_KEYWORDS: Record<string, string[]> = {
  crypto: ['crypto', 'bitcoin', 'btc', 'ethereum', 'eth', 'defi', 'blockchain', 'web3', 'wallet', 'token', 'coin'],
  nft: ['nft', 'opensea', 'mint', 'collection', 'pfp', 'generative', 'art', 'rare'],
  degen: ['degen', 'base', 'meme', 'shitpost', 'ape', 'yolo', 'wagmi', 'ngmi', 'farcaster', 'warpcast'],
  music: ['music', 'song', 'beat', 'rap', 'track', 'album', 'singer', 'artist', 'band', 'guitar', 'piano'],
  gaming: ['game', 'gaming', 'play', 'stream', 'twitch', 'gamer', 'fps', 'rpg', 'esports', 'pc'],
  ai: ['ai', 'gpt', 'llm', 'machine learning', 'model', 'openai', 'claude', 'gemini', 'neural'],
  comedy: ['funny', 'lol', 'meme', 'hilarious', 'humor', 'joke', 'comedy', 'laugh'],
  tech: ['tech', 'startup', 'saas', 'developer', 'coding', 'software', 'hardware', 'product'],
  finance: ['finance', 'stock', 'market', 'invest', 'trade', 'money', 'wealth', 'fund'],
};

const STORAGE_KEY = 'minitube_interest_profile_v1';
const SIGNALS_KEY = 'minitube_signals_v1';

export type SignalType = 'watch_25' | 'watch_50' | 'watch_75' | 'liked' | 'tipped' | 'shared' | 'skipped' | 'followed';

// Signal weights: positive = show more like this, negative = show less
const SIGNAL_WEIGHTS: Record<SignalType, number> = {
  watch_25: 0.5,
  watch_50: 1.0,
  watch_75: 2.0,
  liked: 3.0,
  tipped: 5.0,
  shared: 4.0,
  followed: 3.0,
  skipped: -1.5,
};

/** Extract topic tags from a video's text content */
function extractTopics(text: string): string[] {
  const lower = text.toLowerCase();
  const matched: string[] = [];
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      matched.push(topic);
    }
  }
  return matched.length > 0 ? matched : ['general'];
}

/** Record a behavioral signal for a piece of content */
export function trackSignal(hash: string, text: string, signalType: SignalType): void {
  if (typeof window === 'undefined') return;

  try {
    const topics = extractTopics(text);
    const weight = SIGNAL_WEIGHTS[signalType];

    const raw = localStorage.getItem(STORAGE_KEY);
    const profile: Record<string, number> = raw ? JSON.parse(raw) : {};

    for (const topic of topics) {
      profile[topic] = (profile[topic] || 0) + weight;
      // Clamp between -50 and 200 to prevent runaway scores
      profile[topic] = Math.max(-50, Math.min(200, profile[topic]));
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));

    // Also log the raw signal for debugging
    const signals = JSON.parse(localStorage.getItem(SIGNALS_KEY) || '[]');
    signals.push({ hash, signalType, topics, ts: Date.now() });
    // Keep only last 200 signals
    if (signals.length > 200) signals.splice(0, signals.length - 200);
    localStorage.setItem(SIGNALS_KEY, JSON.stringify(signals));
  } catch (e) {
    // localStorage unavailable (private mode etc) — silently fail
  }
}

/** Build the current user interest profile */
export function getInterestProfile(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Re-rank a feed of casts based on user interest profile */
export function rerankFeed(casts: any[]): any[] {
  const profile = getInterestProfile();

  // If no profile yet (cold start), return feed unchanged
  if (Object.keys(profile).length === 0) return casts;

  const scored = casts.map(cast => {
    const topics = extractTopics(cast.text || '');
    let boost = 0;
    for (const topic of topics) {
      boost += profile[topic] || 0;
    }
    return { ...cast, _interestBoost: boost };
  });

  // Sort: blend server AI score + personal interest boost (50/50)
  return scored.sort((a, b) => {
    const scoreA = (a.aiRankScore || 0) + a._interestBoost * 0.5;
    const scoreB = (b.aiRankScore || 0) + b._interestBoost * 0.5;
    return scoreB - scoreA;
  });
}
