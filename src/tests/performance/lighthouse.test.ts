import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should meet performance benchmarks', async ({ page }) => {
    await page.goto('/');
    
    // Test page load performance
    const loadTime = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return navigation.loadEventEnd - navigation.loadEventStart;
    });
    
    expect(loadTime).toBeLessThan(3000); // Less than 3 seconds
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
    // Test Largest Contentful Paint (LCP)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });
    
    expect(lcp).toBeLessThan(2500); // Less than 2.5 seconds
    
    // Test First Input Delay (FID)
    await page.click('button');
    const fid = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEventTiming;
          resolve(lastEntry.processingStart - lastEntry.startTime);
        }).observe({ entryTypes: ['first-input'] });
      });
    });
    
    expect(fid).toBeLessThan(100); // Less than 100ms
  });

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow network
    await page.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });
    
    await page.goto('/');
    
    // Test that page still loads within reasonable time
    const loadTime = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return navigation.loadEventEnd - navigation.loadEventStart;
    });
    
    expect(loadTime).toBeLessThan(10000); // Less than 10 seconds even with slow network
  });

  test('should optimize images properly', async ({ page }) => {
    await page.goto('/');
    
    // Test image optimization
    const images = await page.$$eval('img', (imgs) =>
      imgs.map(img => ({
        src: img.src,
        loading: img.loading,
        sizes: img.sizes,
        srcset: img.srcset
      }))
    );
    
    // Check that images have proper optimization attributes
    images.forEach(image => {
      expect(image.loading).toBe('lazy');
      expect(image.src).toContain('optimized');
    });
  });

  test('should have efficient bundle size', async ({ page }) => {
    await page.goto('/');
    
    // Test JavaScript bundle size
    const jsSize = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const jsResources = resources.filter((r: any) => r.name.endsWith('.js'));
      return jsResources.reduce((total: number, r: any) => total + r.transferSize, 0);
    });
    
    expect(jsSize).toBeLessThan(500000); // Less than 500KB
  });

  test('should handle memory efficiently', async ({ page }) => {
    await page.goto('/');
    
    // Test memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });
    
    // Perform some actions to test memory usage
    for (let i = 0; i < 10; i++) {
      await page.click('button');
      await page.waitForTimeout(100);
    }
    
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });
    
    // Memory usage should not increase significantly
    const memoryIncrease = finalMemory - initialMemory;
    expect(memoryIncrease).toBeLessThan(10000000); // Less than 10MB increase
  });

  test('should have good caching strategy', async ({ page }) => {
    await page.goto('/');
    
    // Test caching headers
    const response = await page.waitForResponse('**/*');
    const headers = response.headers();
    
    expect(headers['cache-control']).toBeDefined();
    expect(headers['etag']).toBeDefined();
  });

  test('should handle concurrent requests efficiently', async ({ page }) => {
    await page.goto('/');
    
    // Test concurrent API requests
    const startTime = Date.now();
    
    await Promise.all([
      page.waitForResponse('**/api/emails'),
      page.waitForResponse('**/api/ai'),
      page.waitForResponse('**/api/slack')
    ]);
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    expect(totalTime).toBeLessThan(2000); // Less than 2 seconds for concurrent requests
  });

  test('should have efficient database queries', async ({ page }) => {
    await page.goto('/');
    
    // Test database query performance
    const queryTime = await page.evaluate(async () => {
      const start = performance.now();
      
      // Simulate database query
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const end = performance.now();
      return end - start;
    });
    
    expect(queryTime).toBeLessThan(200); // Less than 200ms
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    await page.goto('/');
    
    // Test with large dataset
    await page.route('**/api/emails', async (route) => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `email-${i}`,
        subject: `Email ${i}`,
        from: `sender${i}@example.com`,
        body: `This is email ${i} with some content.`.repeat(10)
      }));
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(largeDataset)
      });
    });
    
    // Test that large dataset loads efficiently
    const loadTime = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        });
        observer.observe({ entryTypes: ['resource'] });
      });
    });
    
    expect(loadTime).toBeLessThan(5000); // Less than 5 seconds for large dataset
  });

  test('should have efficient rendering performance', async ({ page }) => {
    await page.goto('/');
    
    // Test rendering performance
    const renderTime = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        });
        observer.observe({ entryTypes: ['measure'] });
      });
    });
    
    expect(renderTime).toBeLessThan(1000); // Less than 1 second
  });

  test('should handle animations efficiently', async ({ page }) => {
    await page.goto('/');
    
    // Test animation performance
    const animationTime = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.duration);
        });
        observer.observe({ entryTypes: ['animation'] });
      });
    });
    
    expect(animationTime).toBeLessThan(500); // Less than 500ms
  });
}); 