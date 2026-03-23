self.addEventListener('fetch', (event) => {
  // A minimum empty fetch event handler is required to pass the PWA criteria.
  // We aren't fully intercepting requests since it's an online-first pos app.
});

self.addEventListener('install', (event) => {
  self.skipWaiting();
});
