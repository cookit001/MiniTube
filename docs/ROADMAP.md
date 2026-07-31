# MiniTube Development Roadmap 🗺️

MiniTube's goal is to become the definitive decentralized vertical video platform within the Farcaster ecosystem. We are building in public, and this roadmap outlines our trajectory.

## Phase 1: MVP & Foundation (Current)
- [x] Integrate Neynar API to fetch chronological video casts.
- [x] Build infinite scroll TikTok-style UI (Mobile & Desktop).
- [x] Integrate Farcaster Frame v2 SDK for Auto-Authentication.
- [x] Enable 100% Non-Custodial Web3 Tipping via `viem`.
- [x] Native Profile Follow Deep Links.
- [x] **YouTube Media Proxy:** Fallback extractor to seamlessly blend Web2 and Web3 catalogs.
- [x] **Edge Caching & CDN:** Implemented Vercel KV/Redis to cache Farcaster video URLs and metadata, dramatically improving load times and reducing Neynar API costs.

## Phase 2: Creator Tools & Monetization (Next)
- [ ] **Creator Analytics Dashboard:** View watch-time, engagement, and tips earned per video.
- [ ] **Smart Contract Tipping Protocol:** Deploy a minimal proxy contract for tipping that allows MiniTube to take a sustainable 1% protocol fee while routing 99% instantly to the creator.
- [ ] **Promoted Video Slots:** Allow creators to pay ETH/DEGEN to have their video featured in the first 5 slots of the feed for a specific timeframe.

## Phase 3: The $TUBE Token & Ecosystem (Future)
- [ ] **Tokenomics Design:** Finalize the utility of the $TUBE token (Governance, Promoted Video discounts). *Note: No token is launched yet. We are prioritizing platform stability first.*
- [ ] **Airdrop Snapshot:** Reward early adopters who tipped creators using the MiniApp.
- [ ] **Public Curation API:** Open up our curated `/api/farcaster-watch` endpoints so other Farcaster clients can embed the MiniTube feed natively.
- [ ] **Cross-Client Support:** Ensure full compatibility beyond Warpcast (Supercast, Nook, etc.).

## Phase 4: Decentralized Storage 
- [ ] Support for IPFS/Arweave video uploads directly through the MiniApp.
- [ ] Fully decentralized video transcoding pipeline via Livepeer.

---
*Roadmap subject to change based on Farcaster protocol upgrades and community governance.*
