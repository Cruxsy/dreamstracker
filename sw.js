/* ── Service Worker: Belajar 2029 ── */
const CACHE = 'belajar-2029-v1';

/* Files to cache for full offline use */
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
];

/* External CDN scripts (React, Babel) — cache on first fetch */
const CDN_HOSTS = [
  'unpkg.com',
];

/* ── Install: pre-cache app shell ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: clean old caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch: offline-first for app files, network-first for CDN ── */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  /* CDN resources: network-first, fall back to cache */
  if (CDN_HOSTS.some(h => url.hostname.includes(h))) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  /* App files: cache-first (offline capable) */
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, clone));
        return response;
      }))
  );
});
