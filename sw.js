const CACHE_NAME = 'treningsdagbok-v1';
const urlsToCache = [
  '/treningsdagbok/',
  '/treningsdagbok/index.html',
  '/treningsdagbok/start.html',
  '/treningsdagbok/css/style.css',
  '/treningsdagbok/js/main.js',
  '/treningsdagbok/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});