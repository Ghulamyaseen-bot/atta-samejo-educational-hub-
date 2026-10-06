/**
 * ATTA SAMEJO EDUCATIONAL HUB
 * Service Worker & Offline Cache Strategy
 * Ensures the dashboard and recent results remain fully accessible offline.
 */

const STATIC_CACHE_NAME = 'aseh-static-v2';
const DATA_CACHE_NAME = 'aseh-data-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/student_avatar.svg',
  '/student_avatar.svg',
];

// 1. Install Event: Precaching core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Some assets failed to precache during sw install', err);
      });
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Cleanup stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE_NAME && key !== DATA_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event: Intelligent offline caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests or browser extension schemes
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Strategy A: API requests -> Network-First with Cache Fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(DATA_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback from cached API data
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Custom offline JSON response
          return new Response(
            JSON.stringify({
              success: true,
              offline: true,
              message: 'Serving offline data from local device storage.',
            }),
            {
              headers: { 'Content-Type': 'application/json' },
            }
          );
        })
    );
    return;
  }

  // Strategy B: Navigation requests -> Network-First falling back to /index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(STATIC_CACHE_NAME);
        const cachedIndex = await cache.match('/index.html') || await cache.match('/');
        if (cachedIndex) {
          return cachedIndex;
        }
        return new Response('Offline - Atta Samejo Educational Hub', {
          headers: { 'Content-Type': 'text/html' },
        });
      })
    );
    return;
  }

  // Strategy C: Static Assets & Images -> Cache-First with Network Revalidation
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache (stale-while-revalidate)
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(STATIC_CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse);
              });
            }
          })
          .catch(() => {
            // device is offline, cachedResponse is already served
          });
        return cachedResponse;
      }

      // Fetch from network and save to cache
      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback if image fails offline
          if (request.destination === 'image') {
            return caches.match('/assets/student_avatar.svg');
          }
          return new Response('Resource unavailable offline', { status: 503 });
        });
    })
  );
});
