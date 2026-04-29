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
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
