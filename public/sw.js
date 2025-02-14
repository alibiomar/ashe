// sw.js - Place this file in your public directory
const CACHE_NAME = 'ashe-cache-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache
const ASSETS_TO_CACHE = [
  '/',
  OFFLINE_URL, 
  '/manifest.json',
  '/favicon.ico',
  '/logo.svg',
  '/logo72.png',
  '/logo192.png',
];

// Install event - Cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // Remove this line if you don't want to force immediate activation
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // Remove old caches not related to the current version
          }
        })
      );
    })
    .then(() => {
      // Call `clients.claim()` only if you want the new SW to take control immediately
      self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;  // Ignore non-GET requests (e.g., POST, PUT)

  event.respondWith(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        
        // Return cached response if exists
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from the network
        const networkResponse = await fetch(event.request);

        // Cache successful responses (only for GET requests)
        if (networkResponse && networkResponse.ok) {
          const responseToCache = networkResponse.clone();
          await cache.put(event.request, responseToCache);
        }

        return networkResponse; // Return the network response

      } catch (error) {
        console.error('[Service Worker] Fetch failed:', error);

        // Serve offline.html for navigation requests if network fails
        if (event.request.mode === 'navigate' || event.request.destination === 'document') {
          return caches.match(OFFLINE_URL); // Serve offline page if the user is trying to load a page
        }
      }
    })()
  );
});


