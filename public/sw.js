import {precacheAndRoute} from 'workbox-precaching';

// Filter out problematic manifests
const manifest = self.__WB_MANIFEST.filter(entry => {
  return !entry.url.includes('dynamic-css-manifest.json');
});

precacheAndRoute(manifest);

// Add fallback network-first strategy for CSS
registerRoute(
  ({request}) => request.destination === 'style',
  new NetworkFirst()
);
const CACHE_PREFIX = 'my-app';
const CACHE_VERSION = 'v2';
const CACHE_NAME = `${CACHE_PREFIX}-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Core assets to cache during installation
const CORE_ASSETS = [
  '/',
  OFFLINE_URL,
  '/styles/main.css',
  '/scripts/app.js'
];

// Install event: Cache core assets
self.addEventListener('install', (event) => {
  console.log(`Service Worker installed (${CACHE_NAME})`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log(`Service Worker activated (${CACHE_NAME})`);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME) {
            console.log(`Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Stale-While-Revalidate strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and chrome-extension URLs
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension:')) {
    return;
  }
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request);

      // Always try to update from network in the background
      if (event.request.cache !== 'only-if-cached') {
        const fetchPromise = fetch(event.request).then(async (networkResponse) => {
          // Clone response for potential caching
          const clone = networkResponse.clone();
          
          // Cache valid network responses
          if (networkResponse.ok && isCacheable(event.request)) {
            await cache.put(event.request, clone);
          }
          return networkResponse;
        }).catch(() => {}); // Silent catch for background updates

        // Warm the cache for non-navigation requests
        if (event.request.mode !== 'navigate') {
          event.waitUntil(fetchPromise);
        }
      }

      // Return cached response if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Try network request for missing resources
      try {
        const networkResponse = await fetch(event.request);
        
        // Cache valid responses (excluding navigation requests)
        if (networkResponse.ok && isCacheable(event.request)) {
          const clone = networkResponse.clone();
          await cache.put(event.request, clone);
        }
        return networkResponse;
      } catch (error) {
        // Fallback to offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
        
        // Return generic offline response for other requests
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      }
    })()
  );
});

// Helper function to determine cacheability
function isCacheable(request) {
  return (
    request.url.startsWith(self.location.origin) &&  // Same-origin only
    !request.url.includes('/api/') &&                 // Exclude API calls
    !request.url.endsWith('.webmanifest')             // Example exclusion
  );
}
