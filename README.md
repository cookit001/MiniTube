# 📺 MiniTube — Decentralized Video Platform on Farcaster

> **Built by 9realms Studios** | Licensed under BSL 1.1 (becomes open source August 2029)

MiniTube is a TikTok-style short-form video platform built entirely on the Farcaster protocol. It pulls real decentralized video casts from the Farcaster network (via Neynar), curates them with a proprietary AI-ranking algorithm, and serves them in an infinitely-scrolling, snap-scroll feed — all as a Farcaster MiniApp (Frame v2).

---

## ✨ Features

| Feature | Status |
|---|---|
| 📡 Live Farcaster Video Feed | ✅ Production |
| 🧠 AI Curation Engine (Engagement Velocity + Discovery Boost) | ✅ Production |
| 🎯 Personalized Interest-Based Feed (localStorage, zero backend) | ✅ Production |
| ✦ Verified Ticks (Creator / Neynar Power Badge / Whale) | ✅ Production |
| 💜 Double-Tap to Like (TikTok-style animation) | ✅ Production |
| 💸 Tip Creators (DEGEN / USDC / ETH with 2.5% Protocol Fee) | ✅ Production |
| 📣 Announce Tips on Farcaster | ✅ Production |
| 🔗 Native Share via Farcaster SDK | ✅ Production |
| 👑 Creator Tip Card (@real9realms) | ✅ Production |
| 📡 Graceful "Video Unavailable" UI | ✅ Production |
| 🔐 Connect Farcaster (Neynar Auth) | 🟡 UI Ready / Backend Pending |
| 💰 MiniTubeSplitter Smart Contract (Base) | 📝 Written / Deploy Pending |

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

## 💰 Monetization: Protocol Fee

Every tip sent through MiniTube routes through the **MiniTubeSplitter** smart contract:
- **2.5% fee** is taken from the tip amount
- **Fee is capped at $5 equivalent** regardless of tip size
- The split happens atomically — the creator and MiniTube treasury receive funds simultaneously

The contract is written in `contracts/MiniTubeSplitter.sol` and supports:
- Native ETH/DEGEN tips
- ERC-20 (USDC on Base) tips

### Business Model Summary

MiniTube operates as a Web3 social layer on top of decentralized and existing video infrastructure.

| Section | Model | Revenue Source |
|---|---|---|
| **Home Feed** | Always Free | Promoted placements (Creators pay DEGEN to boost algorithmic reach) |
| **Shorts** | Always Free | Web3 Super Likes & Social Reactions (2.5% protocol fee) |
| **Live** | Always Free | Live Super Chats & Web3 NFT ticket gates (2.5% protocol fee) |
| **Farcaster Watch** | Always Free | Creator tipping mechanism (2.5% protocol fee) |

> **Disclaimer:** MiniTube is a decentralized social discovery interface. We do not host, re-monetize, or serve ads on third-party platform videos (like YouTube). The monetization occurs strictly through the peer-to-peer social layer built *around* the content using Farcaster and base-layer crypto primitives.

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
