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
      .then(() => self.skipWaiting())
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // If not in cache, fetch from network
        const networkResponse = await fetch(event.request);

        // Cache successful responses
        if (networkResponse && networkResponse.ok) {
          const responseToCache = networkResponse.clone();
          await cache.put(event.request, responseToCache);
        }

        return networkResponse;
      } catch (error) {
        console.error('[Service Worker] Fetch failed:', error);

        // Serve offline.html for navigation requests
        if (event.request.mode === 'navigate' || event.request.destination === 'document') {
          return caches.match(OFFLINE_URL);
        }
      }
    })() // ✅ Corrected missing closing parenthesis
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/logo192.png',
    badge: '/logo72.png'
  };

  event.waitUntil(
    self.registration.showNotification('ASHE™', options)
  );
});
