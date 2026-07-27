/**
 * Simple in-memory rate limiter.
 * Not suitable for multi-instance deployments (use Redis in production).
 */

const store = new Map<string, { count: number; resetAt: number }>();
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 10;      // 10 requests per window
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
  if (typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

export function checkRateLimit(key: string, maxAttempts = MAX_ATTEMPTS, windowMs = WINDOW_MS): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    ensureCleanup();
    return { allowed: true, remaining: maxAttempts - 1, resetAt: now + windowMs };
  }

  entry.count += 1;
  const remaining = Math.max(0, maxAttempts - entry.count);

  if (entry.count > maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining, resetAt: entry.resetAt };
}

/** Convenience wrapper that returns `true` if the request should be rejected (rate limited). */
export function rateLimit(key: string, maxAttempts = MAX_ATTEMPTS, windowMs = WINDOW_MS): boolean {
  return !checkRateLimit(key, maxAttempts, windowMs).allowed;
}
