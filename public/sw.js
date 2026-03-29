const CACHE_NAME = "tc-admin-v6"; // Bumping version to force clear
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
      fetch(request).catch(async () => {
        // Fallback to network if possible, or clear cache and fail
        const response = await fetch(request);
        if (!response || response.status !== 200) {
           // If we can't get index.html, clear all caches to be safe
           const names = await caches.keys();
           for (let name of names) await caches.delete(name);
        }
        return response;
      })
    );
    return;
  }

  // 2. For JS/CSS assets, use Cache First but update in background
  // Only cache if it's a successful response and NOT a redirect (which index.html often is)
  if (url.pathname.includes("/assets/")) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((response) => {
          // IMPORTANT: Only cache if it's actually a JS/CSS file, not a redirected index.html
          const contentType = response.headers.get("content-type");
          if (!response || response.status !== 200 || (contentType && contentType.includes("text/html"))) {
            return response;
          }
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
