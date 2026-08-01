// Cache Version: 6 (Farcaster connect-src Fix)
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Force activate new service worker immediately
  e.waitUntil(
    caches.open('minitube-store').then((cache) => cache.addAll([
      '/',
      '/farcaster-watch',
      '/live',
      '/shorts'
    ])),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim()); // Take control of all open pages immediately
});

self.addEventListener('fetch', (e) => {
  // Use Network-First strategy for HTML navigation requests (fixes Next.js dev refresh loop)
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Bypass cross-origin or video requests to avoid range-header stream failures
  if (e.request.destination === 'video' || e.request.destination === 'audio' || e.request.url.includes('.mp4') || e.request.url.includes('.m3u8')) {
    return;
  }

  // Cache-First for static assets (CSS, JS, Images)
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
