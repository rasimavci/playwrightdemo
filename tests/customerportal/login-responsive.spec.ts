import { test, expect, devices } from '@playwright/test';

test.describe('Customer Portal - Responsive Design', () => {
  test('should display correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:5174/');

    await expect(page.getByText('Welcome')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:5174/');

    await expect(page.getByText('Welcome')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:5174/');

    await expect(page.getByText('Welcome')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should display correctly on iPhone 12', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    });
    const page = await context.newPage();
    
    await page.goto('http://localhost:5174/');

    await expect(page.getByText('Welcome')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();

    await context.close();
  });

  test('should display correctly on iPad', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPad Pro'],
    });
    const page = await context.newPage();
    
    await page.goto('http://localhost:5174/');

    await expect(page.getByText('Welcome')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

    await context.close();
  });

  test('should be usable on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('http://localhost:5174/');

    // All elements should still be visible and clickable
    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password', { exact: true });
    const signInButton = page.getByRole('button', { name: 'Sign In' });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(signInButton).toBeVisible();

    // Should be able to interact
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    await signInButton.click();
  });

  test('should not have horizontal scrollbar on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:5174/');

    // Check if page width exceeds viewport
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // Allow 1px tolerance
  });

  test('should scale images appropriately', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:5174/');

    const logo = page.locator('img').first();
    const box = await logo.boundingBox();

    // Logo should not be larger than viewport
    if (box) {
      expect(box.width).toBeLessThanOrEqual(375);
    }
  });
});
