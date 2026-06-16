const CACHE_NAME = "lens-ar-offline-v2";
const ASSETS_TO_PRECACHE = [
  "/",
  "/index.html",
  "/src/main.tsx",
  "/src/App.tsx",
  "/src/index.css"
];

// Installs and caches initial app shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching core app shell...");
      return cache.addAll(ASSETS_TO_PRECACHE).catch((err) => {
        console.warn("[Service Worker] Pre-cache warning (safe to ignore in development):", err);
      });
    })
  );
  // Force the waiting service worker to become active
  self.skipWaiting();
});

// Clean up stale legacy caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log("[Service Worker] Destroying legacy cache:", name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Intercept file requests for offline capability
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 1. Bypass Service Worker for all AI live API routes (chat, translation, tts, vision)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({
            error: "Offline",
            message: "Satellite linkage unavailable. You are currently offline.",
            offline: true
          }),
          {
            headers: { "Content-Type": "application/json" },
            status: 503
          }
        );
      })
    );
    return;
  }

  // 2. Stale-While-Revalidate strategy for static web assets, scripts, stylesheets, and images
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Initiate background fetch to refresh cache
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (event.request.method === "GET" || event.request.method === "HEAD")
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Silent catch for offline fetch failures (we will use the cache instead)
        });

      // Return the cached asset immediately if available, or wait for the network response
      return cachedResponse || fetchPromise;
    })
  );
});
