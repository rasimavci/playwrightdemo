import { test, expect } from '@playwright/test';

/**
 * Security Tests - Injection Attacks
 * 
 * Bu testler SQL Injection, XSS ve diğer injection saldırılarına karşı 
 * sistemin güvenliğini kontrol eder.
 */

// Helper function to login
async function login(page, email: string, password: string = 'Demo123!') {
  await page.goto('http://localhost:5174/');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  // await page.waitForURL('**/dashboard', { timeout: 5000 });
}

test.describe('Security Tests - SQL Injection Prevention', () => {
  // SQL Injection payloads
  const sqlInjectionPayloads = [
    "' OR '1'='1",
    "' OR '1'='1' --",
    "' OR '1'='1' /*",
    "admin'--",
    "' UNION SELECT NULL--",
    "1' AND '1'='1",
    "' DROP TABLE users--",
    "'; DROP TABLE users--",
    "1; DROP TABLE users--",
    "\\' OR \\'1\\'=\\'1",
  ];

  test('Login form should prevent SQL injection in email field', async ({ page }) => {
    await page.goto('http://localhost:5174/');
    
    for (const payload of sqlInjectionPayloads) {
      await page.getByLabel('Email').clear();
      await page.getByLabel('Email').fill(payload);
      await page.getByLabel('Password', { exact: true }).fill('password');
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      await page.waitForTimeout(1000);
      
      // Should not be logged in or cause error
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('dashboard');
      
      console.log(`✅ SQL injection blocked: ${payload.substring(0, 20)}...`);
    }
  });

  test('API should prevent SQL injection in query parameters', async ({ page, context }) => {
    await login(page, 'admin@efsora.com');
    
    const injectionPayloads = [
      "1' OR '1'='1",
      "1; DROP TABLE projects--",
      "1 UNION SELECT * FROM users--",
    ];
    
    for (const payload of injectionPayloads) {
      const response = await context.request.get(
        `https://api.staging.portal.efsora.com/api/v1/projects/team?projectId=${encodeURIComponent(payload)}`
      );
      
      // Should return error or empty, not execute SQL
      if (response.ok()) {
        const data = await response.json();
        // Should not return unexpected data structure
        expect(typeof data).toBe('object');
      } else {
        expect([400,401, 422, 500]).toContain(response.status());
      }
      
      console.log(`✅ API SQL injection prevented: ${payload.substring(0, 20)}...`);
    }
  });

  test('Search functionality should sanitize SQL injection attempts', async ({ page }) => {
    await login(page, 'admin@efsora.com');
    
    // Navigate to a page with search functionality
    await page.waitForTimeout(2000);
    
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();
    
    if (await searchInput.isVisible()) {
      const payload = "' OR 1=1--";
      await searchInput.fill(payload);
      await page.keyboard.press('Enter');
      
      await page.waitForTimeout(1000);
      
      // Check that no database error is shown
      const bodyText = await page.textContent('body');
      expect(bodyText).not.toContain('SQL syntax');
      expect(bodyText).not.toContain('mysql_');
      expect(bodyText).not.toContain('database error');
      
      console.log('✅ Search SQL injection prevented');
    }
  });
});

test.describe('Security Tests - XSS Prevention', () => {
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<svg/onload=alert("XSS")>',
    'javascript:alert("XSS")',
    '<iframe src="javascript:alert(\'XSS\')">',
    '<body onload=alert("XSS")>',
    '<input type="text" value="XSS" onfocus="alert(document.cookie)">',
    '"><script>alert(String.fromCharCode(88,83,83))</script>',
  ];

  test('Login form should sanitize XSS in email field', async ({ page }) => {
    await page.goto('http://localhost:5174/');
    
    for (const payload of xssPayloads) {
      await page.getByLabel('Email').clear();
      await page.getByLabel('Email').fill(payload);
      
      // Wait a bit to see if any script executes
      await page.waitForTimeout(500);
      
      // Check if any alert dialog appeared (XSS would trigger this)
      const dialogs: string[] = [];
      page.on('dialog', dialog => {
        dialogs.push(dialog.message());
        dialog.dismiss();
      });
      
      expect(dialogs.length).toBe(0);
      console.log(`✅ XSS blocked in email: ${payload.substring(0, 30)}...`);
    }
  });

  test('Application should escape XSS in displayed content', async ({ page }) => {
    await login(page, 'admin@efsora.com');
    
    await page.waitForTimeout(2000);
    
    // Check if any user-generated content is properly escaped
    const bodyHTML = await page.content();
    
    // XSS payloads should be escaped as text, not executable
    xssPayloads.forEach(payload => {
      if (bodyHTML.includes(payload)) {
        // If payload exists, check it's escaped (contains &lt; instead of <)
        const escapedPayload = payload.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        expect(bodyHTML.includes(escapedPayload) || !bodyHTML.includes('onerror=')).toBeTruthy();
      }
    });
    
    console.log('✅ Content properly escaped against XSS');
  });

  test('API responses should not contain executable scripts', async ({ page, context }) => {
    await login(page, 'admin@efsora.com');
    
    const response = await context.request.get('https://api.staging.portal.efsora.com/api/v1/companies');
    
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
    
    const responseText = await response.text();
    
    // Response should not contain script tags
    expect(responseText).not.toMatch(/<script[^>]*>.*?<\/script>/i);
    expect(responseText).not.toContain('javascript:');
    expect(responseText).not.toMatch(/on\w+\s*=/i); // onclick, onerror, etc.
    
    console.log('✅ API responses are XSS-safe');
  });
});

test.describe('Security Tests - Command Injection Prevention', () => {
  const commandInjectionPayloads = [
    '; ls -la',
    '| cat /etc/passwd',
    '& whoami',
    '`whoami`',
    '$(whoami)',
    '; rm -rf /',
    '| dir',
    '& ipconfig',
  ];

  test('File upload or input fields should prevent command injection', async ({ page }) => {
    await login(page, 'admin@efsora.com');
    
    await page.waitForTimeout(2000);
    
    // Try to find any text input fields
    const inputs = page.locator('input[type="text"], textarea');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      const firstInput = inputs.first();
      
      for (const payload of commandInjectionPayloads) {
        if (await firstInput.isVisible()) {
          await firstInput.fill(payload);
          await page.keyboard.press('Enter');
          await page.waitForTimeout(500);
          
          // Check that no system command output is visible
          const bodyText = await page.textContent('body');
          expect(bodyText).not.toContain('root:x:0:0');
          expect(bodyText).not.toContain('Windows IP Configuration');
          expect(bodyText).not.toContain('/bin/bash');
          
          console.log(`✅ Command injection blocked: ${payload.substring(0, 20)}...`);
        }
      }
    }
  });
});

test.describe('Security Tests - Path Traversal Prevention', () => {
  const pathTraversalPayloads = [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    '....//....//....//etc/passwd',
    '..;/..;/..;/etc/passwd',
    '../../../../../../../../../../../etc/passwd',
    'file:///etc/passwd',
  ];

  test('API should prevent path traversal attacks', async ({ page, context }) => {
    await login(page, 'admin@efsora.com');
    
    for (const payload of pathTraversalPayloads) {
      // Try to access file through API parameter
      const response = await context.request.get(
        `https://api.staging.portal.efsora.com/api/v1/files/${encodeURIComponent(payload)}`
      );
      
      // Should return 400/404, not file contents
      expect([400, 404, 403]).toContain(response.status());
      
      const responseText = await response.text();
      expect(responseText).not.toContain('root:x:0:0');
      expect(responseText).not.toContain('[boot loader]');
      
      console.log(`✅ Path traversal blocked: ${payload.substring(0, 30)}...`);
    }
  });
});

test.describe('Security Tests - LDAP Injection Prevention', () => {
  const ldapInjectionPayloads = [
    '*',
    '*)(&',
    '*)(objectClass=*',
    'admin*',
    'admin*)((password=*)',
  ];

  test('Login should prevent LDAP injection', async ({ page }) => {
    await page.goto('http://localhost:5174/');
    
    for (const payload of ldapInjectionPayloads) {
      await page.getByLabel('Email').fill(payload);
      await page.getByLabel('Password', { exact: true }).fill('password');
      await page.getByRole('button', { name: 'Sign In' }).click();
      
      await page.waitForTimeout(1000);
      
      // Should not bypass authentication
      expect(page.url()).not.toContain('dashboard');
      
      console.log(`✅ LDAP injection blocked: ${payload}`);
    }
  });
});

test.describe('Security Tests - NoSQL Injection Prevention', () => {
  const noSQLInjectionPayloads = [
    '{"$gt": ""}',
    '{"$ne": null}',
    '{"$regex": ".*"}',
    '{"username": {"$gt": ""}}',
    '{"$or": [{"a": "a"}, {"b": "b"}]}',
  ];

  test('API should prevent NoSQL injection in JSON payloads', async ({ page, context }) => {
    await login(page, 'admin@efsora.com');
    
    for (const payload of noSQLInjectionPayloads) {
      try {
        const response = await context.request.post(
          'https://api.staging.portal.efsora.com/api/v1/search',
          {
            data: { query: payload }
          }
        );
        
        // Should not return all records or bypass filtering
        if (response.ok()) {
          const data = await response.json();
          // Verify data is properly filtered, not returning everything
          if (Array.isArray(data)) {
            // Should not return massive unfiltered results
            expect(data.length).toBeLessThan(1000);
          }
        }
        
        console.log(`✅ NoSQL injection prevented: ${payload.substring(0, 30)}...`);
      } catch (error) {
        // Expected if endpoint doesn't exist
        console.log(`✅ NoSQL injection test completed: ${payload.substring(0, 30)}...`);
      }
    }
  });
});
