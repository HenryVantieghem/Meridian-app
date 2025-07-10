import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

// Mock matchMedia for accessibility testing
const mockMatchMedia = (matches: boolean = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock matchMedia before each test
    await page.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => {},
        }),
      });
    });
  });

  test('should meet WCAG 2.1 AA standards', async ({ page }) => {
    await page.goto('/');
    
    // Test for proper heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
    
    // Test for proper alt text on images
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
    
    // Test for proper form labels
    const inputs = await page.locator('input, textarea, select').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      if (id) {
        const label = await page.locator(`label[for="${id}"]`).first();
        expect(await label.count()).toBeGreaterThan(0);
      }
    }
    
    // Test for proper ARIA attributes
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaDescribedby = await button.getAttribute('aria-describedby');
      // At least one accessibility attribute should be present
      expect(ariaLabel || ariaDescribedby).toBeTruthy();
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/');
    
    // Test text color contrast
    const textElements = await page.locator('p, span, div, h1, h2, h3, h4, h5, h6').all();
    
    for (const element of textElements) {
      const color = await element.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.color;
      });
      
      // Basic color contrast check - ensure text is not white on white background
      expect(color).not.toBe('rgb(255, 255, 255)');
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Check if focus is visible
    const focusedElement = await page.locator(':focus').first();
    expect(await focusedElement.count()).toBeGreaterThan(0);
    
    // Test that all interactive elements are reachable
    const interactiveElements = await page.locator('button, a, input, textarea, select').all();
    
    for (const element of interactiveElements) {
      await element.focus();
      const isFocused = await element.evaluate((el) => document.activeElement === el);
      expect(isFocused).toBe(true);
    }
  });

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/');
    
    // Test that focus is properly managed
    const buttons = await page.locator('button').all();
    
    for (const button of buttons) {
      await button.focus();
      
      // Check if focus is visible
      const focusVisible = await button.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.outline !== 'none' || style.boxShadow !== 'none';
      });
      
      expect(focusVisible).toBe(true);
    }
  });

  test('should have proper screen reader support', async ({ page }) => {
    await page.goto('/');
    
    // Test for proper ARIA roles
    const elementsWithRoles = await page.locator('[role]').all();
    expect(elementsWithRoles.length).toBeGreaterThan(0);
    
    // Test for proper ARIA labels
    const elementsWithAriaLabels = await page.locator('[aria-label]').all();
    expect(elementsWithAriaLabels.length).toBeGreaterThan(0);
    
    // Test for proper heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    let previousLevel = 0;
    
    for (const heading of headings) {
      const tagName = await heading.evaluate((el) => el.tagName.toLowerCase());
      const level = parseInt(tagName.charAt(1));
      
      // Check that heading levels don't skip more than one level
      expect(level - previousLevel).toBeLessThanOrEqual(1);
      previousLevel = level;
    }
  });

  test('should handle reduced motion preferences', async ({ page }) => {
    await page.goto('/');
    
    // Test that animations respect reduced motion
    const animatedElements = await page.locator('[class*="animate"], [class*="transition"]').all();
    
    for (const element of animatedElements) {
      const computedStyle = await element.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          animationDuration: style.animationDuration,
          transitionDuration: style.transitionDuration,
        };
      });
      
      // Check that animations are reasonable (not too fast)
      const animationDuration = parseFloat(computedStyle.animationDuration);
      const transitionDuration = parseFloat(computedStyle.transitionDuration);
      
      if (animationDuration > 0) {
        expect(animationDuration).toBeLessThan(1000); // Less than 1 second
      }
      
      if (transitionDuration > 0) {
        expect(transitionDuration).toBeLessThan(1000); // Less than 1 second
      }
    }
  });

  test('should have proper error handling for screen readers', async ({ page }) => {
    await page.goto('/');
    
    // Test for proper error announcements
    const errorElements = await page.locator('[role="alert"], [aria-live="assertive"]').all();
    
    for (const error of errorElements) {
      const ariaLive = await error.getAttribute('aria-live');
      expect(ariaLive).toBeTruthy();
    }
  });

  test('should have proper form validation announcements', async ({ page }) => {
    await page.goto('/');
    
    // Test form validation
    const forms = await page.locator('form').all();
    
    for (const form of forms) {
      const inputs = await form.locator('input, textarea, select').all();
      
      for (const input of inputs) {
        const required = await input.getAttribute('required');
        const ariaRequired = await input.getAttribute('aria-required');
        
        if (required) {
          expect(ariaRequired).toBe('true');
        }
      }
    }
  });

  test('should have proper skip links', async ({ page }) => {
    await page.goto('/');
    
    // Test for skip links
    const skipLinks = await page.locator('a[href^="#"]').all();
    
    for (const link of skipLinks) {
      const href = await link.getAttribute('href');
      const targetId = href?.substring(1);
      
      if (targetId) {
        const target = await page.locator(`#${targetId}`).first();
        expect(await target.count()).toBeGreaterThan(0);
      }
    }
  });

  test('should have proper language attributes', async ({ page }) => {
    await page.goto('/');
    
    // Test for proper lang attribute
    const html = await page.locator('html').first();
    const lang = await html.getAttribute('lang');
    expect(lang).toBeTruthy();
    
    // Test for proper dir attribute if needed
    const dir = await html.getAttribute('dir');
    if (dir) {
      expect(['ltr', 'rtl'].includes(dir)).toBe(true);
    }
  });

  test('should have proper landmark regions', async ({ page }) => {
    await page.goto('/');
    
    // Test for proper landmark roles
    const landmarks = await page.locator('main, nav, header, footer, aside, section[role="main"]').all();
    expect(landmarks.length).toBeGreaterThan(0);
    
    // Test for proper navigation
    const nav = await page.locator('nav').first();
    expect(await nav.count()).toBeGreaterThan(0);
    
    // Test for proper main content
    const main = await page.locator('main, [role="main"]').first();
    expect(await main.count()).toBeGreaterThan(0);
  });
}); 