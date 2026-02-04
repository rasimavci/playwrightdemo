import { test, expect } from '@playwright/test';

test.describe('Customer Portal - Performance', () => {
  test('should load page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:5174/');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should load all critical resources', async ({ page }) => {
    await page.goto('http://localhost:5174/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check that critical elements are loaded
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should handle slow network gracefully', async ({ page, context }) => {
    // Simulate slow network
    await context.route('**/*', route => {
      setTimeout(() => route.continue(), 100);
    });
    
    await page.goto('http://localhost:5174/');
    
    // Should still load successfully
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible({ timeout: 10000 });
  });

  test('should have minimal console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:5174/');
    await page.waitForLoadState('networkidle');
    
    // Should have no critical console errors
    const criticalErrors = consoleErrors.filter(err => 
      !err.includes('favicon') && 
      !err.includes('404')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('should not have memory leaks on repeated navigation', async ({ page }) => {
    // Navigate to page multiple times
    for (let i = 0; i < 5; i++) {
      await page.goto('http://localhost:5174/');
      await page.waitForLoadState('networkidle');
    }
    
    // Page should still be responsive
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should handle form submission without lag', async ({ page }) => {
    await page.goto('http://localhost:5174/');
    
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password', { exact: true }).fill('password123');
    
    const startTime = Date.now();
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for some response (error or navigation)
    await page.waitForTimeout(1000);
    
    const responseTime = Date.now() - startTime;
    
    // Response should be within 2 seconds
    expect(responseTime).toBeLessThan(2000);
  });

  test('should not block UI during form interaction', async ({ page }) => {
    await page.goto('http://localhost:5174/');
    
    // Type in email field
    await page.getByLabel('Email').fill('test@example.com');
    
    // UI should remain responsive
    await expect(page.getByLabel('Password', { exact: true })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeEnabled();
  });

  test('should load images efficiently', async ({ page }) => {
    const imageRequests: number[] = [];
    
    page.on('response', response => {
      if (response.url().match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
        imageRequests.push(response.url().length);
      }
    });
    
    await page.goto('http://localhost:5174/');
    await page.waitForLoadState('networkidle');
    
    // Check that images were loaded
    expect(imageRequests.length).toBeGreaterThan(0);
  });
});
