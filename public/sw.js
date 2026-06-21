self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('plannora-v2').then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/plannora-app-icon-v2.png',
        '/plannora-logo.png'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Bypass Next.js RSC and prefetch requests so they don't get served HTML from cache
  if (
    request.headers.get('RSC') === '1' ||
    request.headers.get('Next-Router-Prefetch') === '1' ||
    request.url.includes('/_next/') ||
    request.url.includes('/api/')
  ) {
    return; // let the browser handle it naturally
  }

  // Network-first strategy for everything else
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request).then((response) => {
        return response || caches.match('/');
      });
    })
  );
});
