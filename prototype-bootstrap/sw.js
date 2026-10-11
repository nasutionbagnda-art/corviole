/**
 * Service Worker - Opti'Noisy Pizza (Cache & Offline Support PWA)
 * TP Web Mobile MMI3 - Octobre 2026
 */

const CACHE_NAME = 'optinoisy-bs-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/custom.css',
  './js/app.js',
  '../shared/data.js',
  '../shared/storage.js',
  '../assets/logo-opti-noisy.svg',
  '../assets/picto-pizza-junior-26.svg',
  '../assets/picto-pizza-moyenne-31.svg',
  '../assets/picto-pizza-familiale-40.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Echec partiel pre-caching PWA:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
