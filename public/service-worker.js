// Cache name and assets to be cached
const CACHE_NAME = 'my-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/offline.html',
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
    event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
    event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
    self.clients.claim();
});
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If we have a cached response, return it, otherwise fetch from network
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        // Cache the newly fetched response
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      }).catch(() => {
        // If both network and cache fail, serve an offline page
        return caches.match('/offline.html');
      });
    })
  );
});
