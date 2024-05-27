const CACHE_NAME = 'amanda-cache-v1';
const urlsToCache = [
  '/',
  '/amanda.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  // Добавьте другие файлы, которые вы хотите кэшировать
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
