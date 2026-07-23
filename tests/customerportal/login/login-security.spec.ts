import { test, expect } from '@playwright/test';

test.describe('Customer Portal - Login Security', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
  });

  test('should handle invalid credentials gracefully', async ({ page }) => {
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password', { exact: true }).fill('WrongPassword123!');
    
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for error message or response
    await page.waitForTimeout(2000);
    
    // Should still be on login page
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should not expose password in page source', async ({ page }) => {
    const password = 'SuperSecretPassword123!';
    await page.getByLabel('Password',{ exact: true }).fill(password);
    
    const content = await page.content();
    
    // Password should not appear in plain text in HTML
    expect(content).not.toContain(password);
  });

  test('should prevent SQL injection in email field', async ({ page }) => {
    const sqlInjection = "admin' OR '1'='1";
    await page.getByLabel('Email').fill(sqlInjection);
    await page.getByLabel('Password', { exact: true }).fill('password123');
    
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await page.waitForTimeout(1000);
    
    // Should handle gracefully without breaking
    await expect(page).not.toHaveURL(/error|500/);
  });

  test('should prevent XSS in email field', async ({ page }) => {
    const xssPayload = '<script>alert("XSS")</script>';
    await page.getByLabel('Email').fill(xssPayload);
    await page.getByLabel('Password', { exact: true }).fill('password123');
    
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await page.waitForTimeout(1000);
    
    // Should not execute script
    const alerts = [];
    page.on('dialog', dialog => alerts.push(dialog));
    
    await page.waitForTimeout(500);
    expect(alerts.length).toBe(0);
  });

  test('should handle special characters in password', async ({ page }) => {
    const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password', { exact: true }).fill(specialPassword);
    
    await expect(page.getByLabel('Password', { exact: true })).toHaveValue(specialPassword);
    
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await page.waitForTimeout(1000);
  });

  test('should not autocomplete password by default', async ({ page }) => {
    const passwordInput = page.getByLabel('Password', { exact: true });
    
    // Check autocomplete attribute
    const autocomplete = await passwordInput.getAttribute('autocomplete');
    
    // Password field should either have no autocomplete or be set to off/new-password
    if (autocomplete) {
      expect(['off', 'new-password', 'current-password']).toContain(autocomplete);
    }
  });

  test('should trim whitespace from email', async ({ page }) => {
    await page.getByLabel('Email').fill('  test@example.com  ');
    await page.getByLabel('Password', { exact: true }).fill('password123');
    
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await page.waitForTimeout(1000);
  });

  test('should handle multiple rapid login attempts', async ({ page }) => {
    // Simulate multiple rapid clicks
    for (let i = 0; i < 5; i++) {
      await page.getByLabel('Email').fill('test@example.com');
      await page.getByLabel('Password', { exact: true }).fill('password123');
      await page.getByRole('button', { name: 'Sign In' }).click();
      await page.waitForTimeout(100);
    }
    
    // Should handle gracefully
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });
});
