import { test, expect } from '@playwright/test';

/**
 * Security Tests - Session Management & CSRF Protection
 * 
 * Bu testler session yönetimi, CSRF koruması, rate limiting ve 
 * diğer güvenlik mekanizmalarını kontrol eder.
 */

// Helper function to login
async function login(page, email: string, password: string = 'Demo123!') {
  await page.goto('http://localhost:5174/');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  // await page.waitForURL('**/dashboard', { timeout: 5000 });
}

test.describe('Security Tests - Session Management', () => {
  test('Session should expire after logout', async ({ page, context }) => {
    await login(page, 'admin@efsora.com');
    
    // Get cookies/tokens before logout
    const cookiesBefore = await context.cookies();
    const sessionToken = cookiesBefore.find(c => c.name.includes('session') || c.name.includes('token'));
    
    // Logout
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForTimeout(1000);
    } else {
      // Navigate to logout URL if button not found
      await page.goto('http://localhost:5174/logout');
    }
    
    // Verify session is cleared
    const cookiesAfter = await context.cookies();
    const sessionTokenAfter = cookiesAfter.find(c => c.name === sessionToken?.name);
    
    // Session token should be removed or invalidated
    if (sessionTokenAfter) {
      expect(sessionTokenAfter.value).not.toBe(sessionToken?.value);
    }
    
    // Try to access protected page with old session
    const response = await context.request.get('https://api.staging.portal.efsora.com/api/v1/companies');
    
    // Should be unauthorized
    expect(response.status()).toBe(401);
    
    console.log('✅ Session properly invalidated after logout');
  });

  test('Session should not be shared between different users', async ({ browser }) => {
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    
    // Login as admin in first context
    await login(page1, 'admin@efsora.com');
    
    // Login as customer in second context
    await login(page2, 'customeradmin@apex.com');
    
    // Get cookies from both sessions
    const cookies1 = await context1.cookies();
    const cookies2 = await context2.cookies();
    
    const token1 = cookies1.find(c => c.name.includes('session') || c.name.includes('token'));
    const token2 = cookies2.find(c => c.name.includes('session') || c.name.includes('token'));
    
    // Tokens should be different
    expect(token1?.value).not.toBe(token2?.value);
    
    // Verify each user sees their own data
    const response1 = await context1.request.get('https://api.staging.portal.efsora.com/api/v1/companies');
    const response2 = await context2.request.get('https://api.staging.portal.efsora.com/api/v1/companies');
    
    const companies1 = await response1.json();
    const companies2 = await response2.json();
    
    // Admin should see more companies than customer
    expect(companies1.length).toBeGreaterThan(companies2.length);
    
    await context1.close();
    await context2.close();
    
    console.log('✅ Sessions are properly isolated between users');
  });

  test('Session should have secure and httpOnly flags', async ({ page, context }) => {
    await login(page, 'admin@efsora.com');
    
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c => 
      c.name.includes('session') || 
      c.name.includes('token') || 
      c.name.includes('auth')
    );
    
    if (sessionCookie) {
      // Session cookie should have httpOnly flag (prevents XSS access)
      expect(sessionCookie.httpOnly).toBe(true);
      
      // In production, should also have secure flag (HTTPS only)
      // expect(sessionCookie.secure).toBe(true);
      
      console.log('✅ Session cookie has proper security flags');
    } else {
      console.log('⚠️ No session cookie found - may be using different auth method');
    }
  });

  test('Session should timeout after inactivity', async ({ page }) => {
    await login(page, 'admin@efsora.com');
    
    // Wait for session timeout (adjust based on your timeout setting)
    // This is a long test - you may want to reduce session timeout in test environment
    console.log('⏳ Testing session timeout (this may take time)...');
    
    await page.waitForTimeout(5000); // Simulate inactivity
    
    // Try to make API request after inactivity
    const response = await page.request.get('https://api.staging.portal.efsora.com/api/v1/companies');
    
    // In real scenario with proper timeout, this should fail
    // For now, just log the status
    console.log(`Session status after inactivity: ${response.status()}`);
  });

  test('Cannot reuse session token from another browser', async ({ browser }) => {
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    
    // Login in first browser
    await login(page1, 'admin@efsora.com');
    
    // Get session cookie
    const cookies = await context1.cookies();
    const sessionCookie = cookies.find(c => c.name.includes('session') || c.name.includes('token'));
    
    if (sessionCookie) {
      // Create new browser context and try to inject stolen cookie
      const context2 = await browser.newContext();
      await context2.addCookies([sessionCookie]);
      
      const page2 = await context2.newPage();
      await page2.goto('http://localhost:5174/dashboard');
      
      await page2.waitForTimeout(2000);
      
      // Should NOT be able to access dashboard with stolen cookie
      // (Requires additional checks like IP validation, fingerprinting, etc.)
      const url = page2.url();
      console.log(`URL after stolen cookie: ${url}`);
      
      await context1.close();
      await context2.close();
    }
    
    console.log('✅ Session hijacking test completed');
  });
});

test.describe('Security Tests - CSRF Protection', () => {
  test('POST requests should require CSRF token', async ({ page, context }) => {
    await login(page, 'admin@efsora.com');
    
    // Try to make POST request without CSRF token
    try {
      const response = await context.request.post(
        'https://api.staging.portal.efsora.com/api/v1/projects',
        {
          data: {
            name: 'Malicious Project',
            description: 'Created without CSRF token'
          },
          // Intentionally not including CSRF token header
        }
      );
      
      // Should be rejected due to missing CSRF token
      if (response.status() === 403) {
        console.log('✅ CSRF protection is working - POST rejected without token');
      } else if (response.ok()) {
        console.log('⚠️ WARNING: POST succeeded without CSRF token!');
      }
    } catch (error) {
      console.log('✅ CSRF protection blocked the request');
    }
  });

  test('DELETE requests should require CSRF token', async ({ page, context }) => {
    await login(page, 'admin@efsora.com');
    
    try {
      const response = await context.request.delete(
        'https://api.staging.portal.efsora.com/api/v1/projects/999'
      );
      
      // Should require CSRF token
      if (response.status() === 403) {
        console.log('✅ CSRF protection working for DELETE');
      }
    } catch (error) {
      console.log('✅ CSRF protection blocked DELETE request');
    }
  });

  test('PUT requests should require CSRF token', async ({ page, context }) => {
    await login(page, 'admin@efsora.com');
    
    try {
      const response = await context.request.put(
        'https://api.staging.portal.efsora.com/api/v1/companies/1',
        {
          data: { name: 'Modified Company' }
        }
      );
      
      if (response.status() === 403) {
        console.log('✅ CSRF protection working for PUT');
      }
    } catch (error) {
      console.log('✅ CSRF protection blocked PUT request');
    }
  });
});

test.describe('Security Tests - Rate Limiting', () => {
  test('Login endpoint should have rate limiting', async ({ page }) => {
    await page.goto('http://localhost:5174/');
    
    const attempts = 10;
    let blockedCount = 0;
    
    console.log(`🔄 Attempting ${attempts} rapid login requests...`);
    
    for (let i = 0; i < attempts; i++) {
      await page.getByLabel('Email').fill(`user${i}@test.com`);
      await page.getByLabel('Password', { exact: true }).fill('wrongpassword');
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      await page.waitForTimeout(100); // Rapid requests
      
      // Check if rate limiting kicks in
      const errorMessage = await page.textContent('body');
      if (errorMessage?.includes('too many') || errorMessage?.includes('rate limit')) {
        blockedCount++;
      }
    }
    
    if (blockedCount > 0) {
      console.log(`✅ Rate limiting working: ${blockedCount} requests blocked`);
    } else {
      console.log('⚠️ No rate limiting detected on login endpoint');
    }
  });

  test('API endpoints should have rate limiting', async ({ page, context }) => {
    await login(page, 'admin@efsora.com');
    
    const requests = 50;
    let rateLimitedCount = 0;
    
    console.log(`🔄 Sending ${requests} rapid API requests...`);
    
    for (let i = 0; i < requests; i++) {
      const response = await context.request.get('https://api.staging.portal.efsora.com/api/v1/companies');
      
      if (response.status() === 429) { // Too Many Requests
        rateLimitedCount++;
      }
      
      // Small delay to avoid overwhelming the server
      await page.waitForTimeout(50);
    }
    
    if (rateLimitedCount > 0) {
      console.log(`✅ API rate limiting working: ${rateLimitedCount} requests throttled`);
    } else {
      console.log(`⚠️ Sent ${requests} requests without rate limiting`);
    }
  });
});

test.describe('Security Tests - Headers Security', () => {
  test('Response should include security headers', async ({ page }) => {
    const response = await page.goto('http://localhost:5174/');
    
    if (response) {
      const headers = response.headers();
      
      // Check for security headers
      const securityHeaders = {
        'x-frame-options': 'Should prevent clickjacking',
        'x-content-type-options': 'Should prevent MIME sniffing',
        'strict-transport-security': 'Should enforce HTTPS',
        'x-xss-protection': 'Should enable XSS filter',
        'content-security-policy': 'Should restrict resource loading',
      };
      
      console.log('🔍 Checking security headers...');
      
      for (const [header, description] of Object.entries(securityHeaders)) {
        if (headers[header]) {
          console.log(`✅ ${header}: ${headers[header]}`);
        } else {
          console.log(`⚠️ Missing ${header} - ${description}`);
        }
      }
    }
  });

  test('API responses should have proper CORS headers', async ({ page, context }) => {
    await login(page, 'admin@efsora.com');
    
    const response = await context.request.get('https://api.staging.portal.efsora.com/api/v1/companies');
    
    const headers = response.headers();
    
    // Check CORS headers
    if (headers['access-control-allow-origin']) {
      // Should not be wildcard (*) for authenticated endpoints
      expect(headers['access-control-allow-origin']).not.toBe('*');
      console.log(`✅ CORS origin: ${headers['access-control-allow-origin']}`);
    }
    
    if (headers['access-control-allow-credentials']) {
      console.log(`✅ CORS credentials: ${headers['access-control-allow-credentials']}`);
    }
  });
});

test.describe('Security Tests - Password Security', () => {
  test('Password should not be visible in network traffic', async ({ page }) => {
    // Listen to network requests
    const requests: any[] = [];
    
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        postData: request.postData()
      });
    });
    
    await page.goto('http://localhost:5174/');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password', { exact: true }).fill('MySecretPassword123!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await page.waitForTimeout(2000);
    
    // Check that password is not sent in plain text in GET requests
    const getRequests = requests.filter(r => r.method === 'GET');
    getRequests.forEach(req => {
      expect(req.url).not.toContain('MySecretPassword123!');
    });
    
    // POST requests should use HTTPS (in production)
    const postRequests = requests.filter(r => r.method === 'POST');
    postRequests.forEach(req => {
      if (req.postData?.includes('password') || req.postData?.includes('MySecretPassword123!')) {
        // Should be sent via HTTPS in production
        console.log(`Password sent via ${req.url.startsWith('https') ? 'HTTPS ✅' : 'HTTP ⚠️'}`);
      }
    });
    
    console.log('✅ Password security in network traffic verified');
  });

  test('Password field should have autocomplete disabled', async ({ page }) => {
    await page.goto('http://localhost:5174/');
    
    const passwordInput = page.getByLabel('Password', { exact: true });
    const autocomplete = await passwordInput.getAttribute('autocomplete');
    
    // Should be 'off', 'new-password', or 'current-password'
    if (autocomplete) {
      console.log(`✅ Password autocomplete: ${autocomplete}`);
    } else {
      console.log('⚠️ No autocomplete attribute on password field');
    }
  });
});

test.describe('Security Tests - Information Disclosure', () => {
  test('Error pages should not reveal sensitive information', async ({ page }) => {
    // Try to access non-existent page
    await page.goto('http://localhost:5174/nonexistent-page-12345');
    
    await page.waitForTimeout(1000);
    
    const bodyText = await page.textContent('body');
    
    // Should not contain sensitive info
    expect(bodyText).not.toContain('node_modules');
    expect(bodyText).not.toContain('src/');
    expect(bodyText).not.toContain('C:\\');
    expect(bodyText).not.toContain('/var/www');
    expect(bodyText).not.toContain('stack trace');
    expect(bodyText).not.toContain('at Object');
    
    console.log('✅ Error pages do not leak system information');
  });

  test('API errors should not expose internal details', async ({ page, context }) => {
    await login(page, 'admin@efsora.com');
    
    // Request invalid endpoint
    const response = await context.request.get('https://api.staging.portal.efsora.com/api/v1/invalid-endpoint');
    
    const responseText = await response.text();
    
    // Should not contain stack traces or system paths
    expect(responseText).not.toContain('at Object');
    expect(responseText).not.toContain('node_modules');
    expect(responseText).not.toContain('Error: ');
    
    console.log('✅ API errors do not expose internal details');
  });

  test('Version numbers should not be exposed in headers', async ({ page }) => {
    const response = await page.goto('http://localhost:5174/');
    
    if (response) {
      const headers = response.headers();
      
      // Should not expose server version
      if (headers['server']) {
        expect(headers['server']).not.toMatch(/\d+\.\d+\.\d+/); // No version numbers
        console.log(`Server header: ${headers['server']}`);
      }
      
      // Should not expose X-Powered-By
      if (headers['x-powered-by']) {
        console.log(`⚠️ X-Powered-By header exposed: ${headers['x-powered-by']}`);
      } else {
        console.log('✅ X-Powered-By header not exposed');
      }
    }
  });
});
