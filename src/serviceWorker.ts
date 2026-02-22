// src/serviceWorker.ts
// Service Worker for PWA functionality and offline support

// Make this a module for isolatedModules support
export {};

// Types for service worker
declare const self: any;

const CACHE_NAME = "booth-level-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json"
];

// Install event
self.addEventListener("install", (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event
self.addEventListener("activate", (event: any) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event with network-first strategy
self.addEventListener("fetch", (event: any) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Don't cache Firebase requests
        if (
          event.request.url.includes("firebaseio.com") ||
          event.request.url.includes("googleapis.com")
        ) {
          return response;
        }

        // Cache successful responses
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Return cached version if offline
        return caches.match(event.request).then((response) => {
          return response || new Response("Offline - Please check your connection", {
            status: 503,
            statusText: "Service Unavailable"
          });
        });
      })
  );
});
