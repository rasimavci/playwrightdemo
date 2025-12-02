import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www.booking.com/index.tr.html?aid=304142&label=gen173nr-10CAEoggI46AdIM1gEaOQBiAEBmAEzuAEXyAEM2AED6AEB-AEBiAIBqAIBuALWgrfJBsACAdICJGFlMjE5MmEzLTE0ZTYtNDFlNi1hMzY1LWFiMjIwNDJkNzA1NdgCAeACAQ&chal_t=1764606291804&force_referer=');
  await page.getByRole('menuitem', { name: 'Uçuşlar' }).click();
  await page.getByRole('combobox', { name: 'Hedef konum' }).click();
  await page.getByRole('combobox', { name: 'Hedef konum' }).fill('new york');
  await page.waitForTimeout(3000);
  /*
  await page.locator('button').filter({ hasText: 'Kapat' }).click();
  await page.getByRole('combobox', { name: 'Hedef konum' }).click();
  await page.getByRole('combobox', { name: 'Hedef konum' }).click();
  await page.getByRole('combobox', { name: 'Hedef konum' }).press('Enter');
  await page.getByText('Ç').nth(3).click();
  */
  await page.getByRole('button', { name: '3 Aralık 2025', exact: true }).click();
  await page.getByRole('button', { name: '5 Aralık 2025. Seçildi.' }).click();

await page.getByRole('button', { name: 'Ara' }).click();
});