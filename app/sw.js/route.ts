const RETIREMENT_WORKER = `
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
`;

export const dynamic = "force-dynamic";

export function GET() {
  return new Response(RETIREMENT_WORKER, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      "Content-Type": "application/javascript; charset=utf-8",
      Expires: "0",
      Pragma: "no-cache",
      "Service-Worker-Allowed": "/",
    },
  });
}
