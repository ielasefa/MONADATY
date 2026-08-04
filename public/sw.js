const CACHE_NAME = "monadaty-v2";
const PRECACHE = [
  "/",
  "/shop",
  "/about",
  "/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

function shouldCache(response) {
  if (!response.ok) return false;
  if (!response.url) return false;
  const cacheControl = response.headers.get("Cache-Control") || "";
  const pragma = response.headers.get("Pragma") || "";
  return !/(no-store|no-cache|must-revalidate|max-age=0)/i.test(cacheControl) && !/no-cache/i.test(pragma);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Never intercept POST / Delete / etc.  Server action payloads, flight uploads,
  // and mutation requests MUST always hit the network.
  if (req.method !== "GET") return;

  const url = new URL(req.url, req.url);

  // ── NEVER cache / NEVER serve from cache ──────────────────────────────────

  // 1) Admin pages and API routes: stale HTML or flight payloads contain dead
  //    Server Action IDs and produce "Failed to find Server Action" on POST.
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api/admin")) return;

  // 2) RSC / Flight request responses carry action wiring – they are bound to a
  //    specific server build.  Caching them causes intermittent 404 / unauthorized
  //    errors after any deployment or server restart.
  if (req.headers.has("RSC") || req.headers.has("Next-Router-State-Tree")) return;
  if (url.searchParams.has("_rsc") || url.searchParams.has("__next-data")) return;

  // 3) Next.js internal runtime chunks and data routes (hashed, but served from
  //    the runtime CDN cache, not the SW cache).
  if (url.pathname.startsWith("/_next/") && !url.pathname.startsWith("/_next/static/")) return;

  // 4) Server Action POST payload (keyed by Next-Action header).  Already
  //    filtered by method !== GET above; kept as a defensive check.
  if (req.headers.has("Next-Action")) return;

  // ── Strategy per request kind ──────────────────────────────────────────────

  const isDocument = req.destination === "document";

  if (isDocument) {
    // Navigation: network-first (avoid stale RSC / action references)
    event.respondWith(
      fetch(req)
        .then((response) => {
          if (shouldCache(response)) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(req).then((cached) => {
            if (cached) return cached;
            return caches.match("/offline");
          }),
        ),
    );
    return;
  }

  // Static assets, images, etc.: stale-while-revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetched = fetch(req)
        .then((response) => {
          if (shouldCache(response)) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        })
        .catch(() => cached || new Response("Offline", { status: 503, statusText: "Offline" }));

      return cached || fetched;
    }),
  );
});
