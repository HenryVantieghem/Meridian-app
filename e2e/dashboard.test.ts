import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      window.localStorage.setItem('clerk-db', JSON.stringify({
        sessions: [{
          id: 'session-123',
          userId: 'user-123',
          status: 'active'
        }],
        users: [{
          id: 'user-123',
          emailAddresses: [{ emailAddress: 'test@example.com' }],
          firstName: 'Test',
          lastName: 'User'
        }]
      }));
    });

    await page.goto('/dashboard');
  });

  test('should load dashboard with three-panel layout', async ({ page }) => {
    // Check that all three panels are present
    await expect(page.locator('[data-testid="left-sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="right-sidebar"]')).toBeVisible();

    // Check navigation elements
    await expect(page.locator('[data-testid="nav-inbox"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-sent"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-drafts"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-archive"]')).toBeVisible();
  });

  test('should display user profile information', async ({ page }) => {
    await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-name"]')).toContainText('Test User');
    await expect(page.locator('[data-testid="user-email"]')).toContainText('test@example.com');
  });

  test('should show email list with AI analysis', async ({ page }) => {
    // Mock email data
    await page.addInitScript(() => {
      window.localStorage.setItem('mock-emails', JSON.stringify([
        {
          id: 'email-1',
          subject: 'Important Meeting Tomorrow',
          from: 'boss@company.com',
          date: new Date().toISOString(),
          priority: 'high',
          summary: 'Meeting about Q4 goals',
          isVIP: true
        },
        {
          id: 'email-2',
          subject: 'Weekly Newsletter',
          from: 'newsletter@company.com',
          date: new Date().toISOString(),
          priority: 'low',
          summary: 'Weekly company updates',
          isVIP: false
        }
      ]));
    });

    await page.reload();

    // Check email list
    await expect(page.locator('[data-testid="email-item"]')).toHaveCount(2);
    await expect(page.locator('[data-testid="email-subject"]').first()).toContainText('Important Meeting Tomorrow');
    await expect(page.locator('[data-testid="priority-badge"]').first()).toContainText('High');
  });

  test('should allow email selection and display details', async ({ page }) => {
    // Click on first email
    await page.locator('[data-testid="email-item"]').first().click();

    // Check that email details are displayed
    await expect(page.locator('[data-testid="email-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-subject"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-sender"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-body"]')).toBeVisible();
  });

  test('should show AI analysis in right sidebar', async ({ page }) => {
    // Select an email first
    await page.locator('[data-testid="email-item"]').first().click();

    // Check AI analysis panel
    await expect(page.locator('[data-testid="ai-analysis"]')).toBeVisible();
    await expect(page.locator('[data-testid="priority-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="sentiment-analysis"]')).toBeVisible();
    await expect(page.locator('[data-testid="suggested-actions"]')).toBeVisible();
  });

  test('should allow email actions (reply, delegate, archive)', async ({ page }) => {
    // Select an email
    await page.locator('[data-testid="email-item"]').first().click();

    // Test reply action
    await page.locator('[data-testid="action-reply"]').click();
    await expect(page.locator('[data-testid="reply-composer"]')).toBeVisible();

    // Test delegate action
    await page.locator('[data-testid="action-delegate"]').click();
    await expect(page.locator('[data-testid="delegate-modal"]')).toBeVisible();

    // Test archive action
    await page.locator('[data-testid="action-archive"]').click();
    await expect(page.locator('[data-testid="archive-confirmation"]')).toBeVisible();
  });

  test('should handle AI reply generation', async ({ page }) => {
    // Select an email and open reply
    await page.locator('[data-testid="email-item"]').first().click();
    await page.locator('[data-testid="action-reply"]').click();

    // Check reply composer
    await expect(page.locator('[data-testid="reply-composer"]')).toBeVisible();
    await expect(page.locator('[data-testid="ai-suggested-reply"]')).toBeVisible();

    // Test confidence meter
    await expect(page.locator('[data-testid="confidence-meter"]')).toBeVisible();
    await page.locator('[data-testid="confidence-slider"]').fill('0.8');

    // Test tone adjustment
    await page.locator('[data-testid="tone-selector"]').click();
    await page.locator('[data-testid="tone-professional"]').click();

    // Test sending reply
    await page.locator('[data-testid="send-reply"]').click();
    await expect(page.locator('[data-testid="reply-sent"]')).toBeVisible();
  });

  test('should handle swipe-to-delegate gesture', async ({ page }) => {
    // Mock touch events for swipe gesture
    await page.locator('[data-testid="email-item"]').first().hover();
    
    // Simulate swipe gesture
    await page.locator('[data-testid="email-item"]').first().dragTo(
      page.locator('[data-testid="delegate-zone"]')
    );

    // Check delegate options appear
    await expect(page.locator('[data-testid="delegate-options"]')).toBeVisible();
  });

  test('should show AI shadow tooltip on hover', async ({ page }) => {
    // Hover over email sender
    await page.locator('[data-testid="email-sender"]').first().hover();

    // Check AI shadow tooltip appears
    await expect(page.locator('[data-testid="ai-shadow-tooltip"]')).toBeVisible();
    await expect(page.locator('[data-testid="sender-context"]')).toBeVisible();
    await expect(page.locator('[data-testid="communication-history"]')).toBeVisible();
  });

  test('should handle completion ritual', async ({ page }) => {
    // Complete an action (e.g., archive an email)
    await page.locator('[data-testid="email-item"]').first().click();
    await page.locator('[data-testid="action-archive"]').click();
    await page.locator('[data-testid="confirm-archive"]').click();

    // Check completion ritual animation
    await expect(page.locator('[data-testid="completion-ritual"]')).toBeVisible();
    await expect(page.locator('[data-testid="celebration-animation"]')).toBeVisible();
    await expect(page.locator('[data-testid="inspirational-message"]')).toBeVisible();
  });

  test('should show ambient time zone awareness', async ({ page }) => {
    // Check time zone indicators
    await expect(page.locator('[data-testid="time-zone-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="freshness-indicator"]')).toBeVisible();

    // Check sun/moon icons based on time
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 18) {
      await expect(page.locator('[data-testid="sun-icon"]')).toBeVisible();
    } else {
      await expect(page.locator('[data-testid="moon-icon"]')).toBeVisible();
    }
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that sidebars collapse on mobile
    await expect(page.locator('[data-testid="left-sidebar"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="right-sidebar"]')).not.toBeVisible();

    // Check mobile menu button
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="left-sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="right-sidebar"]')).not.toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('[data-testid="left-sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="right-sidebar"]')).toBeVisible();
  });

  test('should handle loading states', async ({ page }) => {
    // Mock slow loading
    await page.route('**/api/emails/**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ emails: [] }),
        contentType: 'application/json'
      });
    });

    await page.reload();

    // Check loading indicators
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    await expect(page.locator('[data-testid="skeleton-email-item"]')).toHaveCount(3);
  });

  test('should handle error states', async ({ page }) => {
    // Mock API error
    await page.route('**/api/emails/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.reload();

    // Check error state
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('should maintain accessibility standards', async ({ page }) => {
    // Check keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="nav-inbox"]')).toBeFocused();

    // Check ARIA labels
    await expect(page.locator('[data-testid="email-item"]').first()).toHaveAttribute('aria-label');

    // Check color contrast (basic check)
    const emailItem = page.locator('[data-testid="email-item"]').first();
    const backgroundColor = await emailItem.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    const color = await emailItem.evaluate(el => 
      window.getComputedStyle(el).color
    );
    
    // Basic contrast check (simplified)
    expect(backgroundColor).not.toBe(color);
  });
}); 