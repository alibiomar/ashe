// service-worker.js
self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('offline-cache').then((cache) => {
        return cache.addAll([
          '/',
          '/_offline',
          '/bg.jpg',
        '/compressaPRO-GX.woff2',]);
      })
    );
  });
  
  self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
      event.respondWith(
        fetch(event.request).catch(() => {
          return caches.open('offline-cache').then((cache) => {
            return cache.match('/_offline');
          });
        })
      );
    }
  });
  