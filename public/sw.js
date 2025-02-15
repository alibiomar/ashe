// sw.js - Place this file in your public directory
const cacheName = 'ashe-cache-v1';
// Assets to cache
const contentToCache = [
  '/',
  '/offline.html', 
  '/manifest.json',
  '/favicon.ico',
  '/logo.svg',
  '/logo72.png',
  '/logo192.png',
];

self.addEventListener("install", (event) => {
  console.log("Hello world from the Service Worker 🤙");
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      console.log('[Service Worker] Caching all: app shell and content');
      return cache.addAll(contentToCache);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== cacheName) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log(`[Service Worker] Fetching resource from cache: ${event.request.url}`);
        return response;
      }
      console.log(`[Service Worker] Fetching resource from network: ${event.request.url}`);
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(cacheName).then((cache) => {
          console.log(`[Service Worker] Caching new resource: ${event.request.url}`);
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    }).catch(() => {
      return caches.match('/offline.html');
    })
  );
});
