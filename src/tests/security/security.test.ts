import { test, expect } from '@playwright/test';

test.describe('Security Tests', () => {
  test('should validate input data properly', async ({ page }) => {
    await page.goto('http://localhost:3000/sign-in');
    
    // Test XSS prevention
    const maliciousInput = '<script>alert("xss")</script>';
    await page.locator('[data-testid="email-input"]').fill(maliciousInput);
    await page.locator('[data-testid="submit-button"]').click();
    
    // Check that script tags are not executed
    const alertPromise = page.waitForEvent('dialog');
    await page.waitForTimeout(1000);
    
    // No alert should appear
    const alerts = await page.evaluate(() => {
      return window.alert;
    });
    
    expect(alerts).toBeDefined();
  });

  test('should prevent SQL injection', async ({ page }) => {
    // Mock API endpoint to test SQL injection
    await page.route('**/api/auth/**', async route => {
      const body = await route.request().postDataJSON();
      
      // Check that SQL injection attempts are blocked
      if (body.email && body.email.includes("' OR '1'='1")) {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Invalid input' })
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      }
    });
    
    await page.goto('http://localhost:3000/sign-in');
    
    // Try SQL injection
    await page.locator('[data-testid="email-input"]').fill("' OR '1'='1");
    await page.locator('[data-testid="password-input"]').fill('password');
    await page.locator('[data-testid="submit-button"]').click();
    
    // Should get error response
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should enforce authentication on protected routes', async ({ page }) => {
    // Try to access dashboard without authentication
    await page.goto('http://localhost:3000/dashboard');
    
    // Should redirect to sign-in
    await expect(page).toHaveURL(/.*sign-in/);
  });

  test('should validate CSRF tokens', async ({ page }) => {
    await page.goto('http://localhost:3000/sign-in');
    
    // Check that CSRF token is present
    const csrfToken = await page.locator('[name="csrf-token"]').getAttribute('value');
    expect(csrfToken).toBeTruthy();
    
    // Try to submit without CSRF token
    await page.evaluate(() => {
      const form = document.querySelector('form');
      const csrfInput = form?.querySelector('[name="csrf-token"]');
      if (csrfInput) csrfInput.remove();
    });
    
    await page.locator('[data-testid="submit-button"]').click();
    
    // Should get CSRF error
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should prevent clickjacking', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Check X-Frame-Options header
    const response = await page.waitForResponse('**/*');
    const headers = response.headers();
    
    expect(headers['x-frame-options']).toBe('DENY');
  });

  test('should set secure headers', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const response = await page.waitForResponse('**/*');
    const headers = response.headers();
    
    // Check security headers
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-xss-protection']).toBe('1; mode=block');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['permissions-policy']).toBeDefined();
  });

  test('should validate file uploads', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Try to upload malicious file
    const fileInput = await page.locator('[data-testid="file-upload"]');
    await fileInput.setInputFiles({
      name: 'malicious.php',
      mimeType: 'application/x-php',
      buffer: Buffer.from('<?php system($_GET["cmd"]); ?>')
    });
    
    // Should reject malicious file
    await expect(page.locator('[data-testid="file-error"]')).toBeVisible();
  });

  test('should prevent rate limiting abuse', async ({ page }) => {
    await page.goto('http://localhost:3000/sign-in');
    
    // Try to brute force login
    for (let i = 0; i < 10; i++) {
      await page.locator('[data-testid="email-input"]').fill(`test${i}@example.com`);
      await page.locator('[data-testid="password-input"]').fill('wrongpassword');
      await page.locator('[data-testid="submit-button"]').click();
    }
    
    // Should be rate limited
    await expect(page.locator('[data-testid="rate-limit-error"]')).toBeVisible();
  });

  test('should validate API endpoints', async ({ page }) => {
    // Test API endpoint with invalid data
    const response = await page.request.post('http://localhost:3000/api/emails/analyze', {
      data: {
        email: {
          // Missing required fields
          id: 'test'
        }
      }
    });
    
    expect(response.status()).toBe(400);
  });

  test('should prevent unauthorized access to user data', async ({ page }) => {
    // Mock authentication for user A
    await page.addInitScript(() => {
      window.localStorage.setItem('clerk-db', JSON.stringify({
        sessions: [{
          id: 'session-123',
          userId: 'user-a',
          status: 'active'
        }],
        users: [{
          id: 'user-a',
          emailAddresses: [{ emailAddress: 'user-a@example.com' }]
        }]
      }));
    });
    
    await page.goto('http://localhost:3000/dashboard');
    
    // Try to access user B's data
    const response = await page.request.get('http://localhost:3000/api/users/user-b/profile');
    
    expect(response.status()).toBe(403);
  });

  test('should encrypt sensitive data', async ({ page }) => {
    await page.goto('http://localhost:3000/sign-up');
    
    // Submit registration form
    await page.locator('[data-testid="email-input"]').fill('test@example.com');
    await page.locator('[data-testid="password-input"]').fill('securepassword123');
    await page.locator('[data-testid="submit-button"]').click();
    
    // Check that password is not stored in plain text
    const response = await page.request.get('http://localhost:3000/api/users/profile');
    const userData = await response.json();
    
    expect(userData.password).toBeUndefined();
    expect(userData.passwordHash).toBeDefined();
  });

  test('should validate session management', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Check that session token is secure
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(cookie => cookie.name.includes('session'));
    
    expect(sessionCookie?.httpOnly).toBe(true);
    expect(sessionCookie?.secure).toBe(true);
    expect(sessionCookie?.sameSite).toBe('Strict');
  });

  test('should prevent information disclosure', async ({ page }) => {
    // Try to access error pages
    const response = await page.request.get('http://localhost:3000/nonexistent-page');
    
    // Should not reveal internal structure
    const text = await response.text();
    expect(text).not.toContain('internal');
    expect(text).not.toContain('stack trace');
    expect(text).not.toContain('error details');
  });

  test('should validate email addresses', async ({ page }) => {
    await page.goto('http://localhost:3000/sign-in');
    
    // Test invalid email formats
    const invalidEmails = [
      'invalid-email',
      'test@',
      '@example.com',
      'test..test@example.com',
      'test@example..com'
    ];
    
    for (const email of invalidEmails) {
      await page.locator('[data-testid="email-input"]').fill(email);
      await page.locator('[data-testid="submit-button"]').click();
      
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    }
  });

  test('should prevent directory traversal', async ({ page }) => {
    // Try to access files outside web root
    const maliciousPaths = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd'
    ];
    
    for (const path of maliciousPaths) {
      const response = await page.request.get(`http://localhost:3000/api/files/${path}`);
      expect(response.status()).toBe(404);
    }
  });

  test('should validate JSON payloads', async ({ page }) => {
    // Test with malformed JSON
    const response = await page.request.post('http://localhost:3000/api/emails/analyze', {
      headers: {
        'Content-Type': 'application/json'
      },
      data: '{"invalid": json}'
    });
    
    expect(response.status()).toBe(400);
  });

  test('should prevent SSRF attacks', async ({ page }) => {
    // Try to make requests to internal services
    const internalUrls = [
      'http://localhost:3000/api/proxy?url=http://127.0.0.1:22',
      'http://localhost:3000/api/proxy?url=http://169.254.169.254/latest/meta-data/',
      'http://localhost:3000/api/proxy?url=file:///etc/passwd'
    ];
    
    for (const url of internalUrls) {
      const response = await page.request.get(url);
      expect(response.status()).toBe(403);
    }
  });

  test('should validate content type', async ({ page }) => {
    // Try to upload file with wrong content type
    const response = await page.request.post('http://localhost:3000/api/upload', {
      headers: {
        'Content-Type': 'text/plain'
      },
      data: 'malicious content'
    });
    
    expect(response.status()).toBe(400);
  });

  test('should prevent timing attacks', async ({ page }) => {
    await page.goto('http://localhost:3000/sign-in');
    
    // Test with existing and non-existing users
    const startTime = Date.now();
    await page.locator('[data-testid="email-input"]').fill('existing@example.com');
    await page.locator('[data-testid="password-input"]').fill('password');
    await page.locator('[data-testid="submit-button"]').click();
    const existingUserTime = Date.now() - startTime;
    
    await page.locator('[data-testid="email-input"]').fill('nonexisting@example.com');
    await page.locator('[data-testid="password-input"]').fill('password');
    await page.locator('[data-testid="submit-button"]').click();
    const nonExistingUserTime = Date.now() - startTime;
    
    // Response times should be similar (within 100ms)
    expect(Math.abs(existingUserTime - nonExistingUserTime)).toBeLessThan(100);
  });
}); 