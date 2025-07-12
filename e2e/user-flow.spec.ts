import { test, expect } from '@playwright/test';
import { testAccessibility } from '@/lib/test/utils';

test.describe('User Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Authentication Flow', () => {
    test('should complete sign up flow', async ({ page }) => {
      // Navigate to sign up
      await page.click('text=Sign Up');
      await expect(page).toHaveURL(/.*sign-up/);

      // Fill sign up form
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');

      // Should redirect to onboarding
      await expect(page).toHaveURL(/.*onboarding/);
    });

    test('should complete sign in flow', async ({ page }) => {
      // Navigate to sign in
      await page.click('text=Sign In');
      await expect(page).toHaveURL(/.*sign-in/);

      // Fill sign in form
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should handle authentication errors', async ({ page }) => {
      await page.goto('/sign-in');

      // Try invalid credentials
      await page.fill('input[name="email"]', 'invalid@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');

      // Should show error message
      await expect(page.locator('text=Invalid credentials')).toBeVisible();
    });
  });

  test.describe('Onboarding Flow', () => {
    test('should complete onboarding process', async ({ page }) => {
      await page.goto('/onboarding');

      // Step 1: Persona selection
      await page.click('text=Professional');
      await page.click('button:has-text("Continue")');

      // Step 2: Preferences
      await page.check('input[name="gmail"]');
      await page.check('input[name="slack"]');
      await page.click('button:has-text("Continue")');

      // Step 3: Preview
      await expect(page.locator('text=Preview')).toBeVisible();
      await page.click('button:has-text("Get Started")');

      // Should redirect to dashboard
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should validate onboarding form', async ({ page }) => {
      await page.goto('/onboarding');

      // Try to continue without selection
      await page.click('button:has-text("Continue")');

      // Should show validation error
      await expect(page.locator('text=Please select a persona')).toBeVisible();
    });
  });

  test.describe('Dashboard Flow', () => {
    test('should display email list', async ({ page }) => {
      await page.goto('/dashboard');

      // Should show email list
      await expect(page.locator('[data-testid="email-list"]')).toBeVisible();
      
      // Should show email items
      await expect(page.locator('[data-testid="email-item"]')).toHaveCount(5);
    });

    test('should filter emails', async ({ page }) => {
      await page.goto('/dashboard');

      // Click priority filter
      await page.click('text=High Priority');
      
      // Should filter emails
      await expect(page.locator('[data-testid="email-item"]')).toHaveCount(2);
    });

    test('should open email detail', async ({ page }) => {
      await page.goto('/dashboard');

      // Click first email
      await page.click('[data-testid="email-item"]:first-child');

      // Should show email detail
      await expect(page.locator('[data-testid="email-detail"]')).toBeVisible();
    });

    test('should generate AI reply', async ({ page }) => {
      await page.goto('/dashboard');

      // Open email detail
      await page.click('[data-testid="email-item"]:first-child');

      // Click generate reply
      await page.click('text=Generate Reply');

      // Should show AI reply
      await expect(page.locator('[data-testid="ai-reply"]')).toBeVisible();
    });
  });

  test.describe('Email Processing Flow', () => {
    test('should analyze email with AI', async ({ page }) => {
      await page.goto('/dashboard');

      // Open email
      await page.click('[data-testid="email-item"]:first-child');

      // Click analyze
      await page.click('text=Analyze');

      // Should show analysis
      await expect(page.locator('[data-testid="email-analysis"]')).toBeVisible();
      await expect(page.locator('text=Priority:')).toBeVisible();
      await expect(page.locator('text=Sentiment:')).toBeVisible();
    });

    test('should batch process emails', async ({ page }) => {
      await page.goto('/dashboard');

      // Select multiple emails
      await page.click('[data-testid="email-checkbox"]:first-child');
      await page.click('[data-testid="email-checkbox"]:nth-child(2)');

      // Click batch analyze
      await page.click('text=Batch Analyze');

      // Should show progress
      await expect(page.locator('[data-testid="batch-progress"]')).toBeVisible();
    });
  });

  test.describe('Payment Flow', () => {
    test('should navigate to pricing', async ({ page }) => {
      await page.goto('/pricing');

      // Should show pricing plans
      await expect(page.locator('[data-testid="pricing-card"]')).toHaveCount(3);
    });

    test('should start checkout process', async ({ page }) => {
      await page.goto('/pricing');

      // Click upgrade button
      await page.click('text=Upgrade to Pro');

      // Should redirect to Stripe
      await expect(page).toHaveURL(/.*stripe\.com/);
    });
  });

  test.describe('Settings Flow', () => {
    test('should update user preferences', async ({ page }) => {
      await page.goto('/settings');

      // Update theme
      await page.selectOption('select[name="theme"]', 'dark');

      // Update notifications
      await page.uncheck('input[name="notifications"]');

      // Save changes
      await page.click('button:has-text("Save Changes")');

      // Should show success message
      await expect(page.locator('text=Settings updated')).toBeVisible();
    });

    test('should manage integrations', async ({ page }) => {
      await page.goto('/settings/integrations');

      // Should show integration cards
      await expect(page.locator('[data-testid="integration-card"]')).toBeVisible();

      // Disconnect integration
      await page.click('text=Disconnect');

      // Should show confirmation
      await expect(page.locator('text=Are you sure?')).toBeVisible();
    });
  });

  test.describe('Performance Tests', () => {
    test('should load dashboard within performance threshold', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // 3 seconds
    });

    test('should handle large email lists efficiently', async ({ page }) => {
      await page.goto('/dashboard');

      // Scroll through email list
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      // Should maintain performance
      await expect(page.locator('[data-testid="email-item"]')).toHaveCount(5);
    });
  });

  test.describe('Accessibility Tests', () => {
    test('should meet WCAG guidelines', async ({ page }) => {
      await page.goto('/dashboard');

      // Test accessibility
      const accessibilityReport = await page.accessibility.snapshot();
      expect(accessibilityReport).toBeDefined();
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/dashboard');

      // Navigate with keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');

      // Should open email detail
      await expect(page.locator('[data-testid="email-detail"]')).toBeVisible();
    });

    test('should have proper focus management', async ({ page }) => {
      await page.goto('/dashboard');

      // Check focus indicators
      await page.keyboard.press('Tab');
      
      const focusedElement = await page.evaluate(() => document.activeElement);
      expect(focusedElement).toBeDefined();
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/dashboard');

      // Should show mobile layout
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    });

    test('should handle different screen sizes', async ({ page }) => {
      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/dashboard');
      await expect(page.locator('[data-testid="email-list"]')).toBeVisible();

      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/dashboard');
      await expect(page.locator('[data-testid="email-list"]')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Mock network error
      await page.route('**/api/emails', route => route.abort());

      await page.goto('/dashboard');

      // Should show error state
      await expect(page.locator('text=Failed to load emails')).toBeVisible();
    });

    test('should handle API timeouts', async ({ page }) => {
      // Mock slow API response
      await page.route('**/api/emails', route => 
        route.fulfill({ 
          status: 200, 
          body: '[]',
          contentType: 'application/json'
        })
      );

      await page.goto('/dashboard');

      // Should show loading state
      await expect(page.locator('[data-testid="loading"]')).toBeVisible();
    });
  });
}); 