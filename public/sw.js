self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('flocus-cache-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((networkResponse) => {
        return caches.open('flocus-cache-v1').then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // Fallback for offline (optional: return an offline page here)
      });
    })
  );
});
