const LEGACY_CACHE_NAMES = ["monadaty-v1", "monadaty-v2"];

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    try {
      await Promise.all(
        LEGACY_CACHE_NAMES.map((cacheName) => caches.delete(cacheName)),
      );
    } catch {
      // Retirement must not add failure behavior to controlled pages.
    }

    try {
      await self.registration.unregister();
    } catch {
      // The page cleanup provides a second, silent unregistration path.
    }
  })());
});
