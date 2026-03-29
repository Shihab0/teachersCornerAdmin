const CACHE_NAME = "tc-admin-v5"; // Bumping version to force clear
const ASSETS_TO_CACHE = [
  "/manifest.json",
];

// Install Event - Pre-cache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }),
  );
  self.skipWaiting();
});

// Activate Event - Clean up ALL old caches immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Service Worker: Clearing Old Cache", cache);
            return caches.delete(cache);
          }
        }),
      );
    }),
  );
  return self.clients.claim();
});

// Fetch Event
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. NEVER cache the index.html or root path. 
  // This is the most important fix for the "MIME type" error.
  if (request.mode === "navigate" || url.pathname === "/" || url.pathname.endsWith(".html")) {
    event.respondWith(
      fetch(request).catch(() => caches.match("/"))
    );
    return;
  }

  // 2. For JS/CSS assets, use Cache First but update in background
  if (url.pathname.includes("/assets/")) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((response) => {
          if (!response || response.status !== 200) return response;
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        });
      })
    );
    return;
  }

  // 3. Default strategy: Cache First
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return cachedResponse || fetch(request);
    })
  );
});
