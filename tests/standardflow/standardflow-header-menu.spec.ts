import { test, expect } from '@playwright/test';

test('StandardFlow – navigate header menu items', async ({ page }) => {
  await page.goto('https://standardflow.onrender.com/');

  // Ensure page is loaded
  await expect(page.locator('header')).toBeVisible();

  // Header menu item names
  const menuItems = [
    'Home',
    'Features',
    'Pricing',
    'About',
    'Contact'
  ];

  for (const item of menuItems) {
    // Locate menu item in header
    const menuItem = page.locator('header').getByRole('link', { name: item });

    // Verify menu item is visible
    await expect(menuItem).toBeVisible();

    // Click menu item
    await menuItem.click();

    // Basic assertion after navigation
    await expect(page.locator('body')).toBeVisible();
  }
});
