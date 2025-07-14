import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Cache configuration
const CACHE_TTL = {
  EMAILS: 300, // 5 minutes
  SLACK_MESSAGES: 60, // 1 minute
  AI_ANALYSIS: 3600, // 1 hour
  USER_DATA: 1800, // 30 minutes
  PERFORMANCE: 300, // 5 minutes
};

// Cache keys
const CACHE_KEYS = {
  EMAILS: (userId: string, status?: string) => `emails:${userId}:${status || 'all'}`,
  SLACK_MESSAGES: (workspaceId: string, channelId?: string) => 
    `slack:${workspaceId}:${channelId || 'all'}`,
  AI_ANALYSIS: (emailId: string) => `ai:analysis:${emailId}`,
  USER_DATA: (userId: string) => `user:${userId}`,
  PERFORMANCE: (userId: string) => `performance:${userId}`,
};

// Cache utilities
export const cacheUtils = {
  // Set cache with TTL
  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  // Get cache value
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value as string) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  // Delete cache key
  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  },

  // Clear cache by pattern
  async clearPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache clear pattern error:', error);
    }
  },

  // Check if cache is available
  isAvailable(): boolean {
    return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
  },
};

// Email cache hooks
export const emailCache = {
  async getEmails(userId: string, status?: string) {
    const key = CACHE_KEYS.EMAILS(userId, status);
    return cacheUtils.get(key);
  },

  async setEmails(userId: string, emails: any[], status?: string) {
    const key = CACHE_KEYS.EMAILS(userId, status);
    await cacheUtils.set(key, emails, CACHE_TTL.EMAILS);
  },

  async invalidateEmails(userId: string) {
    await cacheUtils.clearPattern(`emails:${userId}:*`);
  },
};

// Slack cache hooks
export const slackCache = {
  async getMessages(workspaceId: string, channelId?: string) {
    const key = CACHE_KEYS.SLACK_MESSAGES(workspaceId, channelId);
    return cacheUtils.get(key);
  },

  async setMessages(workspaceId: string, messages: any[], channelId?: string) {
    const key = CACHE_KEYS.SLACK_MESSAGES(workspaceId, channelId);
    await cacheUtils.set(key, messages, CACHE_TTL.SLACK_MESSAGES);
  },

  async invalidateMessages(workspaceId: string) {
    await cacheUtils.clearPattern(`slack:${workspaceId}:*`);
  },
};

// AI analysis cache hooks
export const aiCache = {
  async getAnalysis(emailId: string) {
    const key = CACHE_KEYS.AI_ANALYSIS(emailId);
    return cacheUtils.get(key);
  },

  async setAnalysis(emailId: string, analysis: any) {
    const key = CACHE_KEYS.AI_ANALYSIS(emailId);
    await cacheUtils.set(key, analysis, CACHE_TTL.AI_ANALYSIS);
  },

  async invalidateAnalysis(emailId: string) {
    const key = CACHE_KEYS.AI_ANALYSIS(emailId);
    await cacheUtils.del(key);
  },
};

// User data cache hooks
export const userCache = {
  async getUserData(userId: string) {
    const key = CACHE_KEYS.USER_DATA(userId);
    return cacheUtils.get(key);
  },

  async setUserData(userId: string, data: any) {
    const key = CACHE_KEYS.USER_DATA(userId);
    await cacheUtils.set(key, data, CACHE_TTL.USER_DATA);
  },

  async invalidateUserData(userId: string) {
    const key = CACHE_KEYS.USER_DATA(userId);
    await cacheUtils.del(key);
  },
};

// Performance cache hooks
export const performanceCache = {
  async getPerformance(userId: string) {
    const key = CACHE_KEYS.PERFORMANCE(userId);
    return cacheUtils.get(key);
  },

  async setPerformance(userId: string, data: any) {
    const key = CACHE_KEYS.PERFORMANCE(userId);
    await cacheUtils.set(key, data, CACHE_TTL.PERFORMANCE);
  },

  async invalidatePerformance(userId: string) {
    const key = CACHE_KEYS.PERFORMANCE(userId);
    await cacheUtils.del(key);
  },
};

// Cache middleware for API routes
export const withCache = (handler: Function, cacheKey: string, ttl: number = 300) => {
  return async (req: any, res: any) => {
    if (!cacheUtils.isAvailable()) {
      return handler(req, res);
    }

    try {
      // Try to get from cache first
      const cached = await cacheUtils.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      // If not in cache, call handler and cache result
      const originalJson = res.json;
      res.json = function(data: any) {
        cacheUtils.set(cacheKey, data, ttl);
        return originalJson.call(this, data);
      };

      return handler(req, res);
    } catch (error) {
      console.error('Cache middleware error:', error);
      return handler(req, res);
    }
  };
};

export default cacheUtils; 