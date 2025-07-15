import { NextRequest, NextResponse } from "next/server";

// Cache configuration
export const CACHE_CONFIG = {
  // API response caching
  API: {
    SHORT: 60, // 1 minute
    MEDIUM: 300, // 5 minutes
    LONG: 3600, // 1 hour
    STATIC: 86400, // 24 hours
  },

  // Database query caching
  DATABASE: {
    QUERY: 300, // 5 minutes
    USER_DATA: 60, // 1 minute
    ANALYTICS: 3600, // 1 hour
  },

  // Static asset caching
  STATIC: {
    IMAGES: 86400 * 7, // 7 days
    FONTS: 86400 * 30, // 30 days
    CSS_JS: 86400, // 24 hours
  },
} as const;

// Cache types
export type CacheType = "memory" | "redis" | "database" | "cdn";

// Cache interface
export interface CacheEntry {
  key: string;
  value: unknown;
  ttl: number;
  createdAt: number;
}

// Memory cache implementation
class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 1000;

  set<T>(key: string, value: T, ttl: number = CACHE_CONFIG.API.MEDIUM): void {
    // Clean up expired entries
    this.cleanup();

    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (typeof oldestKey === "string") {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      key,
      value,
      ttl,
      createdAt: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.createdAt > entry.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.createdAt > entry.ttl * 1000) {
        this.cache.delete(key);
      }
    }
  }

  getStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses
    };
  }
}

// Cache manager
export class CacheManager {
  private static instance: CacheManager;
  private memoryCache = new MemoryCache();
  private redisClient: unknown = null; // Would be Redis client

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Set cache entry
  async set<T>(
    key: string,
    value: T,
    ttl: number = CACHE_CONFIG.API.MEDIUM,
    type: CacheType = "memory",
  ): Promise<void> {
    const cacheKey = this.generateKey(key);

    switch (type) {
      case "memory":
        this.memoryCache.set(cacheKey, value, ttl);
        break;
      case "redis":
        if (this.redisClient) {
          // @ts-expect-error - Redis types may not be available
          await (this.redisClient as unknown).setex(
            cacheKey,
            ttl,
            JSON.stringify(value),
          );
        }
        break;
      case "database":
        // Store in database cache table
        await this.storeInDatabase(cacheKey, value, ttl);
        break;
    }
  }

  // Get cache entry
  async get<T>(key: string, type: CacheType = "memory"): Promise<T | null> {
    const cacheKey = this.generateKey(key);

    switch (type) {
      case "memory":
        return this.memoryCache.get<T>(cacheKey);
      case "redis":
        if (this.redisClient) {
          // @ts-expect-error - Redis types may not be available
          const value = await (this.redisClient as unknown).get(cacheKey);
          return value ? JSON.parse(value) : null;
        }
        return null;
      case "database":
        return await this.getFromDatabase<T>(cacheKey);
      default:
        return null;
    }
  }

  // Delete cache entry
  async delete(key: string, type: CacheType = "memory"): Promise<boolean> {
    const cacheKey = this.generateKey(key);

    switch (type) {
      case "memory":
        return this.memoryCache.delete(cacheKey);
      case "redis":
        if (this.redisClient) {
          // @ts-expect-error - Redis types may not be available
          return (await (this.redisClient as unknown).del(cacheKey)) > 0;
        }
        return false;
      case "database":
        return await this.deleteFromDatabase(cacheKey);
      default:
        return false;
    }
  }

  // Clear cache by pattern
  async clear(pattern: string, type: CacheType = "memory"): Promise<void> {
    switch (type) {
      case "memory":
        this.memoryCache.clear();
        break;
      case "redis":
        if (this.redisClient) {
          // @ts-expect-error - Redis types may not be available
          const keys = await (this.redisClient as unknown).keys(pattern);
          if (keys.length > 0) {
            // @ts-expect-error - Redis types may not be available
            await (this.redisClient as unknown).del(...keys);
          }
        }
        break;
      case "database":
        await this.clearDatabasePattern(pattern);
        break;
    }
  }

  // Cache decorator for functions
  static cache<T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    options: {
      key: string | ((...args: Parameters<T>) => string);
      ttl?: number;
      type?: CacheType;
    },
  ): T {
    const cacheManager = CacheManager.getInstance();

    return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      const cacheKey =
        typeof options.key === "function" ? options.key(...args) : options.key;

      // Try to get from cache
      const cached = await cacheManager.get(cacheKey, options.type);
      if (cached !== null) {
        return cached as ReturnType<T>;
      }

      // Execute function and cache result
      const result = await fn(...args);
      await cacheManager.set(cacheKey, result, options.ttl, options.type);

      return result;
    }) as T;
  }

  // Generate cache key
  private generateKey(key: string): string {
    return `napoleon:${key}`;
  }

  // Database cache methods (placeholder implementations)
  private async storeInDatabase(
    key: string,
    _value: unknown,
    _ttl: number,
  ): Promise<void> {
    // Implementation would store in database cache table
    console.log(`Storing in database cache: ${key}`);
  }

  private async getFromDatabase<T>(key: string): Promise<T | null> {
    // Implementation would retrieve from database cache table
    console.log(`Getting from database cache: ${key}`);
    return null;
  }

  private async deleteFromDatabase(key: string): Promise<boolean> {
    // Implementation would delete from database cache table
    console.log(`Deleting from database cache: ${key}`);
    return true;
  }

  private async clearDatabasePattern(pattern: string): Promise<void> {
    // Implementation would clear database cache by pattern
    console.log(`Clearing database cache pattern: ${pattern}`);
  }

  // Get cache statistics
  getStats(): { memory: unknown; redis: unknown; database: unknown } {
    return {
      memory: this.memoryCache.getStats(),
      redis: null, // Would return Redis stats
      database: null, // Would return database cache stats
    };
  }
}

// Next.js API response caching
export const withApiCaching = (
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: {
    ttl?: number;
    key?: string | ((req: NextRequest) => string);
    type?: CacheType;
  } = {},
) => {
  return async (req: NextRequest): Promise<NextResponse> => {
    const cacheManager = CacheManager.getInstance();
    const cacheKey =
      typeof options.key === "function"
        ? options.key(req)
        : options.key || req.url;

    // Try to get from cache
    const cached = await cacheManager.get(cacheKey, options.type);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "X-Cache": "HIT",
          "Cache-Control": `public, max-age=${options.ttl || CACHE_CONFIG.API.MEDIUM}`,
        },
      });
    }

    // Execute handler
    const response = await handler(req);

    // Cache successful responses
    if (response.status === 200) {
      const data = await response.json();
      await cacheManager.set(cacheKey, data, options.ttl, options.type);
    }

    return response;
  };
};

// Database query caching
export const withQueryCaching = <
  T extends (...args: unknown[]) => Promise<unknown>,
>(
  queryFn: T,
  options: {
    key: string;
    ttl?: number;
    type?: CacheType;
  },
): T => {
  return CacheManager.cache(queryFn, {
    key: options.key,
    ttl: options.ttl || CACHE_CONFIG.DATABASE.QUERY,
    type: options.type || "memory",
  });
};

// Static asset caching middleware
export const staticAssetCaching = (req: NextRequest): NextResponse | null => {
  const url = new URL(req.url);

  // Cache static assets
  if (
    url.pathname.match(
      /\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/,
    )
  ) {
    const response = NextResponse.next();

    // Set appropriate cache headers
    if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)) {
      response.headers.set(
        "Cache-Control",
        `public, max-age=${CACHE_CONFIG.STATIC.IMAGES}`,
      );
    } else if (url.pathname.match(/\.(woff|woff2|ttf|eot)$/)) {
      response.headers.set(
        "Cache-Control",
        `public, max-age=${CACHE_CONFIG.STATIC.FONTS}`,
      );
    } else {
      response.headers.set(
        "Cache-Control",
        `public, max-age=${CACHE_CONFIG.STATIC.CSS_JS}`,
      );
    }

    return response;
  }

  return null;
};

// Cache invalidation utilities
export const invalidateCache = async (
  pattern: string,
  type: CacheType = "memory",
): Promise<void> => {
  const cacheManager = CacheManager.getInstance();
  await cacheManager.clear(pattern, type);
};

export const invalidateUserCache = async (userId: string): Promise<void> => {
  await invalidateCache(`user:${userId}:*`);
};

export const invalidateEmailCache = async (emailId: string): Promise<void> => {
  await invalidateCache(`email:${emailId}:*`);
};

// Export singleton
export const cacheManager = CacheManager.getInstance();
