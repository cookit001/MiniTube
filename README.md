# 📺 MiniTube — Decentralized Video Platform on Farcaster

> **Built by 9realms Studios** | Licensed under BSL 1.1 (becomes open source August 2029)

MiniTube is a short-form video platform built entirely on the Farcaster protocol. It pulls real decentralized video casts from the Farcaster network (via Neynar), curates them with a proprietary AI-ranking algorithm, and serves them in an infinitely-scrolling, snap-scroll feed — all as a Farcaster MiniApp (Frame v2).
<br/>

## 🎯 Production Core Features

| Feature | Status |
| :--- | :--- |
| 🎬 Infinite Snap-Scroll Video Feed | ✅ Production |
| 🧠 AI Interest Engine Curation | ✅ Production |
| 👑 Creator Verification Ticks (🔴 ✦ ✓) | ✅ Production |
| 💜 Double-Tap to Like (Native fluid animation) | ✅ Production |
| 💸 100% Free Peer-to-Peer Tipping (0% Platform Fee) | ✅ Production |
| 📣 Announce Tips on Farcaster | ✅ Production |
| 🔗 Native Share via Farcaster SDK | ✅ Production |
| 👑 Creator Tip Card (@real9realms) | ✅ Production |
| 📡 Graceful "Video Unavailable" UI | ✅ Production |
| 🔐 Connect Farcaster (Neynar Auth) | 🟡 UI Ready / Backend Pending |

---

## 🏗 Architecture

```
Browser Client
    │
    ├── /farcaster-watch   → FarcasterWatchFeed.tsx (React, snap-scroll player)
    │       └── interestEngine.ts (client-side personalisation, localStorage)
    │
    ├── /api/farcaster-watch  → Neynar API → applyAutonomousCuration() → Vercel KV Cache
    │
    ├── /api/videos           → YouTube/native video proxy (fallback)
    │
    └── /api/ai-agent         → AI Agent endpoint
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A [Neynar API Key](https://neynar.com)
- A [Vercel KV](https://vercel.com/storage/kv) database (for caching)

### 1. Clone and Install

```bash
git clone https://github.com/cookit001/MiniTube.git
cd MiniTube
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
# Required
NEYNAR_API_KEY=your_neynar_key_here

# Optional: Vercel KV (for caching — highly recommended for production)
KV_REST_API_URL=https://your-kv-url.kv.vercel-storage.com
KV_REST_API_TOKEN=your_kv_token

# Optional: YouTube API (fallback videos)
YOUTUBE_API_KEY=your_youtube_key
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000/farcaster-watch](http://localhost:3000/farcaster-watch)

---

## 🧠 The Curation Algorithm

MiniTube's curation engine runs in two phases on the backend and one phase on the client:

### Server-Side (route.ts)
1. **Fetch:** Pulls up to 10 pages (1,000 raw casts) from Neynar's video feed API
2. **Filter:** Strict URL validation — blocks Twitter hotlinks, .m3u8 streams, Google-hosted content
3. **Score:** `Engagement Velocity = (likes × 1) + (recasts × 3)`
4. **Discovery Boost:** Creators with <1,000 followers get a **500× multiplier** — giving new creators a real shot at going viral
5. **Diversity:** Maximum 2 videos per creator per feed cycle
6. **Cache:** Results stored in Vercel KV for 5 minutes

### Client-Side (interestEngine.ts)
1. **Signal Tracking:** Silently records watch depth (25%, 50%, 75%), likes, tips, shares, and skips
2. **Interest Profile:** Builds a weighted topic map (crypto, NFT, music, gaming, AI, etc.) in `localStorage`
3. **Re-rank:** Blends server AI score + personal interest boost (50/50) before rendering

---

## 💰 Monetization: 0% Platform Fee

MiniTube currently operates on a **100% Free, Peer-to-Peer Tipping Model**. 
We take a 0% protocol fee. When users tip creators in DEGEN, USDC, or ETH, 100% of the funds go directly to the creator's wallet.

Our current strategy is entirely focused on **User Acquisition and Marketing**. By removing all platform friction and fees, we aim to attract the best creators and build a massive, highly engaged Farcaster audience.

### Future Business Model Summary

While the core platform is currently heavily subsidized to drive growth, future monetization avenues include:

| Section | Model | Revenue Source |
|---|---|---|
| **Home Feed** | Always Free | Promoted placements (Creators pay DEGEN to boost algorithmic reach) |
| **Shorts** | Always Free | Web3 Super Likes & Social Reactions |
| **Live** | Always Free | Live Super Chats & Web3 NFT ticket gates |
| **Farcaster Watch** | Always Free | Premium Creator subscriptions |

> **Disclaimer:** MiniTube is a decentralized social discovery interface. We do not host, re-monetize, or serve ads on third-party platform videos (like YouTube). The tipping occurs strictly through peer-to-peer social layers built *around* the content using Farcaster and base-layer crypto primitives.

---

## 📦 Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add all environment variables in your Vercel project settings.

> **Important:** Set up a [Vercel KV](https://vercel.com/storage/kv) store and link it to your project to enable caching. Without KV, every request hits the Neynar API directly.

---

## 📄 License

```
Business Source License 1.1
Licensor: real9realms (9realms Studios)
Licensed Work: MiniTube
Change Date: August 1, 2029
Change License: MIT
```

The software is free to use for personal, non-commercial purposes until August 1, 2029, after which it converts to MIT. See [LICENSE](./LICENSE) for full terms.

---

## 🤝 Contributing

MiniTube is currently closed-source under BSL 1.1. Community contributions are welcome via pull requests, but all contributors must agree that their contributions are licensed under the same BSL terms.

---

*Built with ❤️ on Farcaster by [9realms Studios](https://warpcast.com/real9realms)*
