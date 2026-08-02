# MiniTube Development Roadmap 🗺️

MiniTube's goal is to become the definitive decentralized vertical video platform within the Farcaster ecosystem. We are building in public, and this roadmap outlines our trajectory.

## Phase 1: MVP & Foundation (Current)
- [x] Integrate Neynar API to fetch chronological video casts.
- [x] Build infinite scroll short-form video UI (Mobile & Desktop).
- [x] Native Profile Follow Deep Links.
- [x] **YouTube Media Proxy:** Fallback extractor to seamlessly blend Web2 and Web3 catalogs.
- [x] **Edge Caching & CDN:** Implemented Vercel KV/Redis to cache Farcaster video URLs and metadata, dramatically improving load times and reducing Neynar API costs.

## Phase 2: Creator Tools & Analytics (Next)
- [ ] **Creator Analytics Dashboard:** View watch-time and engagement per video.
- [ ] **Basic Content Curation:** Enhance the algorithm to filter spam and highlight quality creators.

## Phase 3: Web3 Monetization & Ecosystem (Future)
*Note: All advanced Web3 and smart contract features are deferred to this future phase.*
- [ ] **Farcaster Frame v2 SDK:** Deep integration for Auto-Authentication.
- [ ] **Non-Custodial Web3 Tipping:** Enable 100% peer-to-peer tipping via `viem`.
- [ ] **Web3 Live Chat:** Parallel chat interface with Super Chats over YouTube Live feeds.
- [ ] **Smart Contract Tipping Protocol:** Deploy a minimal proxy contract for tipping that allows MiniTube to take a sustainable 2.5% protocol fee while routing 97.5% instantly to the creator.
- [ ] **Promoted Video Slots:** Allow creators to pay ETH/DEGEN to have their video featured in the first 5 slots of the feed for a specific timeframe.
- [ ] **Tokenomics Design:** Finalize the utility of the $TUBE token (Governance, Promoted Video discounts). *Note: No token is launched yet. We are prioritizing platform stability first.*
- [ ] **Airdrop Snapshot:** Reward early adopters who tipped creators using the MiniApp.
- [ ] **Public Curation API:** Open up our curated `/api/farcaster-watch` endpoints so other Farcaster clients can embed the MiniTube feed natively.
- [ ] **Cross-Client Support:** Ensure full compatibility beyond Warpcast (Supercast, Nook, etc.).

## Phase 4: Decentralized Storage 
- [ ] Support for IPFS/Arweave video uploads directly through the MiniApp.
- [ ] Fully decentralized video transcoding pipeline via Livepeer.

---
*Roadmap subject to change based on community feedback and platform stability.*
