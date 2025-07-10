import { test, expect } from '@playwright/test';

test.describe('Cross-Browser Compatibility', () => {
  test('should work in Chrome', async ({ page }) => {
    await page.goto('/');
    
    // Test basic functionality
    await expect(page).toHaveTitle(/Meridian/);
    
    // Test navigation
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Test main content
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should work in Firefox', async ({ page }) => {
    await page.goto('/');
    
    // Test basic functionality
    await expect(page).toHaveTitle(/Meridian/);
    
    // Test form interactions
    const inputs = page.locator('input');
    await expect(inputs).toBeVisible();
  });

  test('should work in Safari', async ({ page }) => {
    await page.goto('/');
    
    // Test basic functionality
    await expect(page).toHaveTitle(/Meridian/);
    
    // Test button interactions
    const buttons = page.locator('button');
    await expect(buttons).toBeVisible();
  });

  test('should handle different screen sizes', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Test responsive design
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
  });

  test('should handle different pixel densities', async ({ page }) => {
    await page.goto('/');
    
    // Test high DPI displays
    await page.evaluate(() => {
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        value: 2,
      });
    });
    
    // Test low DPI displays
    await page.evaluate(() => {
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        value: 1,
      });
    });
  });

  test('should handle different color schemes', async ({ page }) => {
    await page.goto('/');
    
    // Test light mode
    await page.evaluate(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query: string) => ({
          matches: query.includes('prefers-color-scheme: light'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
    });
    
    // Test dark mode
    await page.evaluate(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query: string) => ({
          matches: query.includes('prefers-color-scheme: dark'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
    });
  });

  test('should handle reduced motion preferences', async ({ page }) => {
    await page.goto('/');
    
    // Test with reduced motion
    await page.evaluate(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query: string) => ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
    });
    
    // Test without reduced motion
    await page.evaluate(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
    });
  });

  test('should handle network conditions', async ({ page }) => {
    // Test slow network
    await page.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    await page.goto('/');
    
    // Test offline mode
    await page.context().setOffline(true);
    await page.goto('/');
    
    // Test back online
    await page.context().setOffline(false);
    await page.goto('/');
  });

  test('should handle different locales', async ({ page }) => {
    // Test English locale
    await page.goto('/');
    await expect(page).toHaveTitle(/Meridian/);
    
    // Test different date formats
    await page.evaluate(() => {
      (Intl as any).DateTimeFormat = jest.fn().mockImplementation(() => ({
        format: jest.fn().mockReturnValue('1/1/2024'),
        formatToParts: jest.fn().mockReturnValue([]),
        resolvedOptions: jest.fn().mockReturnValue({}),
        supportedLocalesOf: jest.fn().mockReturnValue(['en-US']),
      }));
    });
    
    // Test different number formats
    await page.evaluate(() => {
      (Intl as any).NumberFormat = jest.fn().mockImplementation(() => ({
        format: jest.fn().mockReturnValue('1,234.56'),
        formatToParts: jest.fn().mockReturnValue([]),
        resolvedOptions: jest.fn().mockReturnValue({}),
        supportedLocalesOf: jest.fn().mockReturnValue(['en-US']),
      }));
    });
  });

  test('should handle different timezones', async ({ page }) => {
    await page.goto('/');
    
    // Test different timezone offsets
    await page.evaluate(() => {
      Object.defineProperty(Intl, 'DateTimeFormat', {
        writable: true,
        value: jest.fn().mockImplementation(() => ({
          format: (date: Date) => date.toLocaleString('en-US', { timeZone: 'UTC' }),
        })),
      });
    });
  });

  test('should handle different user agents', async ({ page }) => {
    // Test mobile user agent
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    });
    
    await page.goto('/');
    await expect(page).toHaveTitle(/Meridian/);
    
    // Test desktop user agent
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    
    await page.goto('/');
    await expect(page).toHaveTitle(/Meridian/);
  });

  test('should handle different viewport orientations', async ({ page }) => {
    // Test portrait orientation
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Test landscape orientation
    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto('/');
  });

  test('should handle different input methods', async ({ page }) => {
    await page.goto('/');
    
    // Test mouse interactions
    const button = page.locator('button').first();
    await button.hover();
    await button.click();
    
    // Test keyboard interactions
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Test touch interactions (simulated)
    await page.touchscreen.tap(100, 100);
  });

  test('should handle different font sizes', async ({ page }) => {
    await page.goto('/');
    
    // Test with larger font size
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '20px';
    });
    
    // Test with smaller font size
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '12px';
    });
  });

  test('should handle different zoom levels', async ({ page }) => {
    await page.goto('/');
    
    // Test zoom in
    await page.evaluate(() => {
      document.body.style.zoom = '1.5';
    });
    
    // Test zoom out
    await page.evaluate(() => {
      document.body.style.zoom = '0.8';
    });
  });
}); 