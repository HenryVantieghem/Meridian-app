import { 
  formatDate, 
  formatRelativeTime,
  truncateText, 
  isValidEmail, 
  generateId,
  capitalizeWords,
  formatBytes,
  sleep,
  retry
} from '@/lib/utils';

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDate(date);
      expect(formatted).toBe('Jan 15, 2024');
    });

    it('should handle string dates', () => {
      const dateString = '2024-01-15T10:30:00Z';
      const formatted = formatDate(dateString);
      expect(formatted).toBe('Jan 15, 2024');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format recent times correctly', () => {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
      const formatted = formatRelativeTime(oneMinuteAgo);
      expect(formatted).toBe('1m ago');
    });

    it('should format older times correctly', () => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const formatted = formatRelativeTime(oneDayAgo);
      expect(formatted).toBe('1d ago');
    });

    it('should handle just now', () => {
      const now = new Date();
      const formatted = formatRelativeTime(now);
      expect(formatted).toBe('just now');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const longText = 'This is a very long text that should be truncated';
      const truncated = truncateText(longText, 20);
      expect(truncated).toBe('This is a very long...');
    });

    it('should not truncate short text', () => {
      const shortText = 'Short text';
      const truncated = truncateText(shortText, 20);
      expect(truncated).toBe('Short text');
    });

    it('should handle empty text', () => {
      const truncated = truncateText('', 20);
      expect(truncated).toBe('');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        '',
      ];

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with correct format', () => {
      const id = generateId();
      expect(id).toMatch(/^[a-zA-Z0-9]{8,}$/);
    });
  });

  describe('capitalizeWords', () => {
    it('should capitalize first letter of each word', () => {
      expect(capitalizeWords('hello world')).toBe('Hello World');
      expect(capitalizeWords('john doe')).toBe('John Doe');
      expect(capitalizeWords('single')).toBe('Single');
    });

    it('should handle empty string', () => {
      expect(capitalizeWords('')).toBe('');
    });
  });

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(0)).toBe('0 Bytes');
    });

    it('should handle custom decimals', () => {
      expect(formatBytes(1024, 0)).toBe('1 KB');
      expect(formatBytes(1024, 3)).toBe('1.000 KB');
    });
  });

  describe('sleep', () => {
    it('should wait for specified time', async () => {
      const start = Date.now();
      await sleep(100);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(90);
    });
  });

  describe('retry', () => {
    it('should retry failed operations', async () => {
      let attempts = 0;
      const failingFn = async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Failed');
        }
        return 'success';
      };

      const result = await retry(failingFn, 3, 10);
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('should throw error after max retries', async () => {
      const failingFn = async () => {
        throw new Error('Always fails');
      };

      await expect(retry(failingFn, 2, 10)).rejects.toThrow('Always fails');
    });
  });
});

describe('Performance Tests', () => {
  it('should format date within performance threshold', async () => {
    const start = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      formatDate(new Date());
    }
    
    const end = performance.now();
    const duration = end - start;
    
    expect(duration).toBeLessThan(100); // 100ms threshold
  });

  it('should validate emails within performance threshold', async () => {
    const emails = Array.from({ length: 1000 }, (_, i) => `user${i}@example.com`);
    
    const start = performance.now();
    
    emails.forEach(email => {
      isValidEmail(email);
    });
    
    const end = performance.now();
    const duration = end - start;
    
    expect(duration).toBeLessThan(50); // 50ms threshold
  });
});

describe('Edge Cases', () => {
  it('should handle null and undefined values', () => {
    expect(formatDate(null as any)).toBe('Invalid date');
    expect(formatDate(undefined as any)).toBe('Invalid date');
    expect(truncateText(null as any, 10)).toBe('');
    expect(isValidEmail(null as any)).toBe(false);
  });

  it('should handle extreme values', () => {
    const veryLongText = 'a'.repeat(10000);
    const truncated = truncateText(veryLongText, 10);
    expect(truncated.length).toBeLessThanOrEqual(13); // 10 + '...'
  });
}); 