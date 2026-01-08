import { test, expect } from '@playwright/test';

test('StandardFlow – open page and navigate tabs', async ({ page }) => {
  await page.goto('https://standardflow.onrender.com/');

  // Sayfa açıldı mı
  await expect(page).toHaveTitle(/StandardFlow/i);

  // Sekmeler (buton / link olarak varsayıyoruz)
  const tabs = [
    'Fundraising',
    'Features',
    'Pricing',
    'About',
    'Contact'
  ];

  for (const tab of tabs) {
    const tabElement = page.getByRole('link', { name: tab });

    await expect(tabElement).toBeVisible();
    await tabElement.click();

    // Navigasyon sonrası sayfa stabil mi
    await expect(page.locator('body')).toBeVisible();
  }
});
