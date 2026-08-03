import FarcasterWatchFeed from '../../components/FarcasterWatchFeed';
import type { Metadata } from 'next';

// ═══════════════════════════════════════════════════════════════
// IMPROVEMENT 4: Page-Specific OpenGraph SEO Tags
// When users share /farcaster-watch links on Warpcast or Twitter,
// it unfurls into a large, eye-catching preview card.
// ═══════════════════════════════════════════════════════════════
export const metadata: Metadata = {
  title: 'Farcaster Watch | MiniTube — Decentralized Video Feed',
  description: 'Scroll through the hottest video content on Farcaster. AI-curated, zero-knowledge ranked, and 100% decentralized. Built by 9realms Studios.',
  openGraph: {
    title: 'Farcaster Watch | MiniTube',
    description: 'AI-curated decentralized video feed from Farcaster. Scroll, discover, and support creators.',
    url: 'https://minitube.9realmsstudios.name.ng/farcaster-watch',
    siteName: 'MiniTube',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MiniTube Farcaster Watch — Decentralized Video Feed',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Farcaster Watch | MiniTube',
    description: 'AI-curated decentralized video feed. Scroll, discover, and support creators on Farcaster.',
    images: ['/og-image.png'],
  },
};

export default function FarcasterWatchPage() {
  return (
    <div style={{ height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
      <FarcasterWatchFeed />
    </div>
  );
}
