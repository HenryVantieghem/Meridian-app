import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cacheUtils, emailCache, slackCache, aiCache, userCache, performanceCache, withCache } from '../cache';

// Mock Redis
vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation(() => ({
    setex: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
    keys: vi.fn()
  }))
}));

// Mock environment variables
vi.mock('@/lib/invariantEnv', () => ({
  invariantEnv: vi.fn()
}));

describe('cacheUtils', () => {
  let mockRedis: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRedis = {
      setex: vi.fn(),
      get: vi.fn(),
      del: vi.fn(),
      keys: vi.fn()
    };
    
    // Mock the Redis instance
    const { Redis } = require('@upstash/redis');
    Redis.mockImplementation(() => mockRedis);
  });

  describe('set', () => {
    it('sets cache with TTL', async () => {
      mockRedis.setex.mockResolvedValue('OK');

      await cacheUtils.set('test-key', { data: 'test' }, 300);

      expect(mockRedis.setex).toHaveBeenCalledWith('test-key', 300, JSON.stringify({ data: 'test' }));
    });

    it('handles set errors gracefully', async () => {
      mockRedis.setex.mockRejectedValue(new Error('Redis error'));

      await expect(cacheUtils.set('test-key', { data: 'test' })).resolves.toBeUndefined();
    });
  });

  describe('get', () => {
    it('gets cached value', async () => {
      const cachedData = { data: 'test' };
      mockRedis.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await cacheUtils.get('test-key');

      expect(mockRedis.get).toHaveBeenCalledWith('test-key');
      expect(result).toEqual(cachedData);
    });

    it('returns null when key not found', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await cacheUtils.get('test-key');

      expect(result).toBeNull();
    });

    it('handles get errors gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis error'));

      const result = await cacheUtils.get('test-key');

      expect(result).toBeNull();
    });
  });

  describe('del', () => {
    it('deletes cache key', async () => {
      mockRedis.del.mockResolvedValue(1);

      await cacheUtils.del('test-key');

      expect(mockRedis.del).toHaveBeenCalledWith('test-key');
    });

    it('handles delete errors gracefully', async () => {
      mockRedis.del.mockRejectedValue(new Error('Redis error'));

      await expect(cacheUtils.del('test-key')).resolves.toBeUndefined();
    });
  });

  describe('clearPattern', () => {
    it('clears cache by pattern', async () => {
      mockRedis.keys.mockResolvedValue(['key1', 'key2']);
      mockRedis.del.mockResolvedValue(2);

      await cacheUtils.clearPattern('test-*');

      expect(mockRedis.keys).toHaveBeenCalledWith('test-*');
      expect(mockRedis.del).toHaveBeenCalledWith('key1', 'key2');
    });

    it('handles empty pattern results', async () => {
      mockRedis.keys.mockResolvedValue([]);

      await cacheUtils.clearPattern('test-*');

      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('handles clear pattern errors gracefully', async () => {
      mockRedis.keys.mockRejectedValue(new Error('Redis error'));

      await expect(cacheUtils.clearPattern('test-*')).resolves.toBeUndefined();
    });
  });

  describe('isAvailable', () => {
    it('returns true when Redis is configured', () => {
      process.env.UPSTASH_REDIS_REST_URL = 'test-url';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';

      expect(cacheUtils.isAvailable()).toBe(true);
    });

    it('returns false when Redis is not configured', () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;

      expect(cacheUtils.isAvailable()).toBe(false);
    });
  });
});

describe('emailCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets emails from cache', async () => {
    const mockEmails = [{ id: '1', subject: 'Test' }];
    vi.mocked(cacheUtils.get).mockResolvedValue(mockEmails);

    const result = await emailCache.getEmails('user-1', 'unread');

    expect(cacheUtils.get).toHaveBeenCalledWith('emails:user-1:unread');
    expect(result).toEqual(mockEmails);
  });

  it('sets emails in cache', async () => {
    const emails = [{ id: '1', subject: 'Test' }];
    vi.mocked(cacheUtils.set).mockResolvedValue(undefined);

    await emailCache.setEmails('user-1', emails, 'unread');

    expect(cacheUtils.set).toHaveBeenCalledWith('emails:user-1:unread', emails, 300);
  });

  it('invalidates emails cache', async () => {
    vi.mocked(cacheUtils.clearPattern).mockResolvedValue(undefined);

    await emailCache.invalidateEmails('user-1');

    expect(cacheUtils.clearPattern).toHaveBeenCalledWith('emails:user-1:*');
  });
});

describe('slackCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets messages from cache', async () => {
    const mockMessages = [{ id: '1', text: 'Test' }];
    vi.mocked(cacheUtils.get).mockResolvedValue(mockMessages);

    const result = await slackCache.getMessages('workspace-1', 'channel-1');

    expect(cacheUtils.get).toHaveBeenCalledWith('slack:workspace-1:channel-1');
    expect(result).toEqual(mockMessages);
  });

  it('sets messages in cache', async () => {
    const messages = [{ id: '1', text: 'Test' }];
    vi.mocked(cacheUtils.set).mockResolvedValue(undefined);

    await slackCache.setMessages('workspace-1', messages, 'channel-1');

    expect(cacheUtils.set).toHaveBeenCalledWith('slack:workspace-1:channel-1', messages, 60);
  });

  it('invalidates messages cache', async () => {
    vi.mocked(cacheUtils.clearPattern).mockResolvedValue(undefined);

    await slackCache.invalidateMessages('workspace-1');

    expect(cacheUtils.clearPattern).toHaveBeenCalledWith('slack:workspace-1:*');
  });
});

describe('aiCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets analysis from cache', async () => {
    const mockAnalysis = { priority: 'high', summary: 'Test' };
    vi.mocked(cacheUtils.get).mockResolvedValue(mockAnalysis);

    const result = await aiCache.getAnalysis('email-1');

    expect(cacheUtils.get).toHaveBeenCalledWith('ai:analysis:email-1');
    expect(result).toEqual(mockAnalysis);
  });

  it('sets analysis in cache', async () => {
    const analysis = { priority: 'high', summary: 'Test' };
    vi.mocked(cacheUtils.set).mockResolvedValue(undefined);

    await aiCache.setAnalysis('email-1', analysis);

    expect(cacheUtils.set).toHaveBeenCalledWith('ai:analysis:email-1', analysis, 3600);
  });

  it('invalidates analysis cache', async () => {
    vi.mocked(cacheUtils.del).mockResolvedValue(undefined);

    await aiCache.invalidateAnalysis('email-1');

    expect(cacheUtils.del).toHaveBeenCalledWith('ai:analysis:email-1');
  });
});

describe('userCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets user data from cache', async () => {
    const mockUserData = { name: 'Test User', email: 'test@example.com' };
    vi.mocked(cacheUtils.get).mockResolvedValue(mockUserData);

    const result = await userCache.getUserData('user-1');

    expect(cacheUtils.get).toHaveBeenCalledWith('user:user-1');
    expect(result).toEqual(mockUserData);
  });

  it('sets user data in cache', async () => {
    const userData = { name: 'Test User', email: 'test@example.com' };
    vi.mocked(cacheUtils.set).mockResolvedValue(undefined);

    await userCache.setUserData('user-1', userData);

    expect(cacheUtils.set).toHaveBeenCalledWith('user:user-1', userData, 1800);
  });

  it('invalidates user data cache', async () => {
    vi.mocked(cacheUtils.del).mockResolvedValue(undefined);

    await userCache.invalidateUserData('user-1');

    expect(cacheUtils.del).toHaveBeenCalledWith('user:user-1');
  });
});

describe('performanceCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gets performance data from cache', async () => {
    const mockPerformanceData = { memory: 100, cpu: 50 };
    vi.mocked(cacheUtils.get).mockResolvedValue(mockPerformanceData);

    const result = await performanceCache.getPerformance('user-1');

    expect(cacheUtils.get).toHaveBeenCalledWith('performance:user-1');
    expect(result).toEqual(mockPerformanceData);
  });

  it('sets performance data in cache', async () => {
    const performanceData = { memory: 100, cpu: 50 };
    vi.mocked(cacheUtils.set).mockResolvedValue(undefined);

    await performanceCache.setPerformance('user-1', performanceData);

    expect(cacheUtils.set).toHaveBeenCalledWith('performance:user-1', performanceData, 300);
  });

  it('invalidates performance cache', async () => {
    vi.mocked(cacheUtils.del).mockResolvedValue(undefined);

    await performanceCache.invalidatePerformance('user-1');

    expect(cacheUtils.del).toHaveBeenCalledWith('performance:user-1');
  });
});

describe('withCache', () => {
  let mockReq: any;
  let mockRes: any;
  let mockHandler: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReq = {};
    mockRes = {
      json: vi.fn()
    };
    mockHandler = vi.fn();
  });

  it('returns cached data when available', async () => {
    const cachedData = { data: 'cached' };
    vi.mocked(cacheUtils.isAvailable).mockReturnValue(true);
    vi.mocked(cacheUtils.get).mockResolvedValue(cachedData);

    const wrappedHandler = withCache(mockHandler, 'test-key', 300);
    await wrappedHandler(mockReq, mockRes);

    expect(cacheUtils.get).toHaveBeenCalledWith('test-key');
    expect(mockRes.json).toHaveBeenCalledWith(cachedData);
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it('calls handler when cache is not available', async () => {
    vi.mocked(cacheUtils.isAvailable).mockReturnValue(false);

    const wrappedHandler = withCache(mockHandler, 'test-key', 300);
    await wrappedHandler(mockReq, mockRes);

    expect(mockHandler).toHaveBeenCalledWith(mockReq, mockRes);
  });

  it('calls handler when cache is empty', async () => {
    vi.mocked(cacheUtils.isAvailable).mockReturnValue(true);
    vi.mocked(cacheUtils.get).mockResolvedValue(null);

    const wrappedHandler = withCache(mockHandler, 'test-key', 300);
    await wrappedHandler(mockReq, mockRes);

    expect(mockHandler).toHaveBeenCalledWith(mockReq, mockRes);
  });

  it('caches handler response', async () => {
    vi.mocked(cacheUtils.isAvailable).mockReturnValue(true);
    vi.mocked(cacheUtils.get).mockResolvedValue(null);
    vi.mocked(cacheUtils.set).mockResolvedValue(undefined);

    const responseData = { data: 'response' };
    mockHandler.mockImplementation((req, res) => {
      res.json(responseData);
    });

    const wrappedHandler = withCache(mockHandler, 'test-key', 300);
    await wrappedHandler(mockReq, mockRes);

    expect(cacheUtils.set).toHaveBeenCalledWith('test-key', responseData, 300);
  });

  it('handles cache errors gracefully', async () => {
    vi.mocked(cacheUtils.isAvailable).mockReturnValue(true);
    vi.mocked(cacheUtils.get).mockRejectedValue(new Error('Cache error'));

    const wrappedHandler = withCache(mockHandler, 'test-key', 300);
    await wrappedHandler(mockReq, mockRes);

    expect(mockHandler).toHaveBeenCalledWith(mockReq, mockRes);
  });
}); 