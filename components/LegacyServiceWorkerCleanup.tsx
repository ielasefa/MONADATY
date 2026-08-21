"use client";

import { useEffect } from "react";

const LEGACY_CACHE_NAMES = new Set(["monadaty-v1", "monadaty-v2"]);

function isLegacyMonadatyRegistration(registration: ServiceWorkerRegistration): boolean {
  return [registration.installing, registration.waiting, registration.active].some((worker) => {
    if (!worker) return false;

    try {
      const scriptUrl = new URL(worker.scriptURL);
      return scriptUrl.origin === window.location.origin && scriptUrl.pathname === "/sw.js";
    } catch {
      return false;
    }
  });
}

/**
 * TEMPORARY: Remove this component after production clients have migrated away
 * from the retired MONADATY service worker.
 */
export function LegacyServiceWorkerCleanup() {
  useEffect(() => {
    async function removeLegacyServiceWorker() {
      try {
        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(
            registrations
              .filter(isLegacyMonadatyRegistration)
              .map((registration) => registration.unregister()),
          );
        }
      } catch {
        // Keep cache cleanup independent if registration access fails.
      }

      try {
        if ("caches" in window) {
          const cacheNames = await window.caches.keys();
          await Promise.all(
            cacheNames
              .filter((cacheName) => LEGACY_CACHE_NAMES.has(cacheName))
              .map((cacheName) => window.caches.delete(cacheName)),
          );
        }
      } catch {
        // Migration cleanup must never block or disrupt the application.
      }
    }

    void removeLegacyServiceWorker();
  }, []);

  return null;
}
