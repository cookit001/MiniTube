import './globals.css';
import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: 'MiniTube | The Decentralized Media Powerhouse',
  description: 'Experience lightning-fast YouTube and uncensorable Farcaster Video feeds in one hyper-optimized platform.',
  keywords: ['MiniTube', 'Farcaster', 'Decentralized Video', 'YouTube Alternative', 'Web3 Media', '9realms Studios'],
  authors: [{ name: '9realms Studios', url: 'https://github.com/cookit001' }],
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'MiniTube | Decentralized Media',
    description: 'Watch YouTube and Farcaster Live streams without limits. By 9realms Studios.',
    url: 'https://minitube.app',
    siteName: 'MiniTube',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MiniTube — The Decentralized Media Powerhouse by 9realms Studios',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MiniTube | The Future of Media',
    description: 'Decentralized, lightning fast, uncensorable. By 9realms Studios.',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  other: {
    'fc:frame': JSON.stringify({
      version: 'next',
      imageUrl: 'https://minitube.9realmsstudios.name.ng/og-image.png',
      button: {
        title: 'Check this out',
        action: {
          type: 'launch_frame',
          name: 'MiniTube',
          url: 'https://minitube.9realmsstudios.name.ng',
          splashImageUrl: 'https://minitube.9realmsstudios.name.ng/splash.png',
          splashBackgroundColor: '#000000'
        }
      }
    })
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `
        }} />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
