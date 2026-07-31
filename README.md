# MiniTube 🎥✨

**The Decentralized Media Powerhouse built on Farcaster.**

MiniTube is a Farcaster-native Frame v2 application designed to bring the highly addictive, full-screen vertical video experience (like TikTok or Shorts) directly into the decentralized Web3 ecosystem. It connects seamlessly with Warpcast, ensuring that you control your data, your media, and your monetization.

---

## 🌟 Core Features

- **Farcaster Watch Feed**: A buttery-smooth, infinite-scrolling vertical video feed pulling real media from the Farcaster protocol via Neynar. Accelerated by ultra-fast **Vercel KV (Redis)** edge caching to instantly load videos and dramatically reduce API costs.
- **YouTube Media Proxy**: A high-speed, dual-engine backend that elegantly falls back to a global video extractor when native Web3 media isn't available, providing users with the ultimate hybrid media experience (combining Web2 and Web3 catalogs seamlessly).
- **100% Non-Custodial Tipping**: Web3 native. Tip your favorite creators directly in ETH, DEGEN, or **USDC (Stablecoins)**. MiniTube dynamically fetches your live balance before tipping. The transaction is signed securely by your local Farcaster Wallet—MiniTube never touches your keys or your funds.
- **Native Frame Interactions**: Likes, Comments, and Follows trigger Warpcast native profile overlays (`sdk.actions.viewProfile`) and dialogs directly inside the MiniApp. You can also securely share (Cast) videos natively. No more getting kicked out to external browser tabs.
- **Cross-Platform Auto Layout**: A dynamic, fully fluid, liquid-smooth interface that automatically detects your screen size and expands edge-to-edge on iOS and Android, while optimizing for large desktop monitors.

## 🚀 Quick Start

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up Environment Variables:**
   Copy `.env.example` to `.env.local` and add your keys:
   ```env
   NEYNAR_API_KEY="your-neynar-api-key"
   ```
4. **Run the development server:**
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Documentation Structure

To ensure transparency and foster community development, our core documentation is available in the `docs/` folder:

- [ROADMAP.md](./docs/ROADMAP.md) - Our feature timeline and future trajectory.
- [WHITEPAPER.md](./docs/WHITEPAPER.md) - Our philosophy on data sovereignty, monetization, and trust.
- [API.md](./docs/API.md) - How to leverage our Farcaster Watch `/api` for your own frontends.

---

*Built with ❤️ for the Farcaster Ecosystem.*
