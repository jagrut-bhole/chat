import { redis } from "./redis";

// ─── Cache Key Builders ─────────────────────────────────────────────────────

export const CacheKeys = {
  // User data
  user: (userId: string) => `user:${userId}`,
  userStatus: (userId: string) => `user:status:${userId}`,

  // Group data
  group: (groupId: string) => `group:${groupId}`,
  groupMembers: (groupId: string) => `group:members:${groupId}`,

  // Matching queue
  matchingQueue: "matching:queue",

  // Rate limiting
  rateLimit: (identifier: string, action: string) => `ratelimit:${action}:${identifier}`,
};

// Default TTLs (in seconds)
export const CacheTTL = {
  user: 60 * 10, // 10 minutes
  userStatus: 60 * 5, // 5 minutes
  group: 60 * 10, // 10 minutes
  groupMembers: 60 * 5, // 5 minutes
};

// ─── Helper: race against a timeout so Redis never blocks the app ──────────

function withTimeout<T>(promise: Promise<T>, ms = 1000): Promise<T | null> {
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), ms));
  return Promise.race([promise, timeout]);
}

// ─── Disabled check ────────────────────────────────────────────────────────

function isRedisDisabled(): boolean {
  return process.env.REDIS_ENABLED === "false";
}

// ─── GET ────────────────────────────────────────────────────────────────────

/**
 * Retrieve cached data by key.
 * Returns `null` when the key doesn't exist, Redis is disabled, or on error.
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  if (isRedisDisabled()) return null;

  try {
    const data = await withTimeout(redis.get<T>(key));
    return data ?? null;
  } catch (error) {
    console.error(`[Cache GET] key=${key}`, error);
    return null;
  }
}

// ─── SET ────────────────────────────────────────────────────────────────────

/**
 * Store data in the cache.
 * @param key   - Cache key (use `CacheKeys.*` helpers)
 * @param data  - Serialisable value
 * @param ttl   - Time-to-live in **seconds** (default: 600 = 10 min)
 */
export async function setCachedData<T>(
  key: string,
  data: T,
  ttl: number = CacheTTL.user
): Promise<void> {
  if (isRedisDisabled()) return;

  try {
    await withTimeout(redis.set(key, JSON.stringify(data), { ex: ttl }));
  } catch (error) {
    console.error(`[Cache SET] key=${key}`, error);
  }
}

// ─── DELETE ─────────────────────────────────────────────────────────────────

/**
 * Remove one or more keys from the cache.
 * Accepts a single key or an array of keys.
 */
export async function deleteCachedData(keys: string | string[]): Promise<void> {
  if (isRedisDisabled()) return;

  try {
    const keyList = Array.isArray(keys) ? keys : [keys];
    await withTimeout(redis.del(...keyList));
  } catch (error) {
    console.error(`[Cache DEL] keys=${String(keys)}`, error);
  }
}

// ─── RATE LIMITER (Redis-backed) ────────────────────────────────────────────

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Distributed rate limiter backed by Redis.
 *
 * Uses a sliding-window counter per `identifier + action`.
 *
 * @param identifier   - Unique key, e.g. IP address or userId
 * @param action       - Action name, e.g. "login", "message", "matchRequest"
 * @param maxAttempts  - Max requests allowed in the window (default 5)
 * @param windowSeconds - Window duration in seconds (default 900 = 15 min)
 */
export async function rateLimit(
  identifier: string,
  action: string,
  maxAttempts: number = 5,
  windowSeconds: number = 900
): Promise<RateLimitResult> {
  // If Redis is off, allow everything
  if (isRedisDisabled()) {
    return { allowed: true, remaining: maxAttempts, resetInSeconds: 0 };
  }

  const key = CacheKeys.rateLimit(identifier, action);

  try {
    // Atomically increment and set expiry on first hit
    const current = await redis.incr(key);

    // First request in windows — set the TTL
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }

    const ttl = await redis.ttl(key);
    const allowed = current <= maxAttempts;
    const remaining = Math.max(0, maxAttempts - current);

    return {
      allowed,
      remaining,
      resetInSeconds: ttl > 0 ? ttl : windowSeconds,
    };
  } catch (error) {
    console.error(`[RateLimit] identifier=${identifier} action=${action}`, error);
    // Fail open — don't block users when Redis is unreachable
    return { allowed: true, remaining: maxAttempts, resetInSeconds: 0 };
  }
}
