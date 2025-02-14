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

// Install event - cache essential assets
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

// Activate event - clean up old caches
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
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    (async () => {
      try {
        // Try to get from cache first
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // If not in cache, try network
        const networkResponse = await fetch(event.request);
        
        // Cache successful responses
        if (networkResponse.ok) {
          // Clone the response before caching
          const responseToCache = networkResponse.clone();
          await cache.put(event.request, responseToCache);
        }
        
        return networkResponse;
      } catch (error) {
        // Network failure - show offline page for navigation requests
        if (event.request.mode === 'navigate') {
          const offlineResponse = await caches.match(OFFLINE_URL);
          if (offlineResponse) {
            return offlineResponse;
          }
        }
        
        // If offline page is not available, throw the error
        throw error;
      }
    })() // <-- Missing closing parenthesis was added here
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
