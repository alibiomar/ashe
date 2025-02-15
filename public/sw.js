// Cache name and assets to be cached
const CACHE_NAME = 'my-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/offline.html',
  '/styles.css',
  '/script.js', // Add other assets to be cached
];

// Listen for the 'install' event to install the service worker 
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  
  // Cache essential assets during installation
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  
  // Skip waiting and activate the service worker immediately
  self.skipWaiting();
});

// Listen for the 'activate' event to activate the service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  
  // Clean up old caches during activation
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
  
  // Take control of the clients immediately
  self.clients.claim();
});

// Listen for the 'fetch' event to serve cached assets or fetch from network
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
