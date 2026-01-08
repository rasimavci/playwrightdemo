import { test, expect } from '@playwright/test';

test('Map page opens', async ({ page }) => {
  await page.goto('https://posternity.ai/map');

  // Sayfa gerçekten açıldı mı?
  await expect(page).toHaveURL(/map/);

  // Ana içerik görünüyor mu (en güvenli minimum assert)
  await expect(page.locator('body')).toBeVisible();
});
