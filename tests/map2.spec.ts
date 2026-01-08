import { test, expect, Page } from '@playwright/test';

test.describe('Posternity Map dropdown loops', () => {
/*
  // Genel bir yardımcı fonksiyon
  const selectAllOptions = async (page: Page, dropdownLabel: string) => {
    // Dropdowngu aç
    const dropdown = page.getByLabel(dropdownLabel);
    await dropdown.click();

    // Tüm seçenekleri bul
    const options = page.locator('role=option'); // altern. getByRole('option')
    const count = await options.count();

    for (let i = 0; i < count; i++) {
      const option = options.nth(i);

      // Seçeneğe tıklayıp bekleme
      await option.click();
      await page.waitForTimeout(500); // yavaş animasyon için kısa bekleme

      // İsteğe bağlı: seçim sonrası assert
      const selectedText = await dropdown.textContent();
      console.log(`Selected ${dropdownLabel}: `, selectedText);

      // Dropdownu tekrar aç
      await dropdown.click();
    }
  };*/

  test('Loop through all filters and select each option', async ({ page }) => {
    await page.goto('https://posternity.ai/map');

    // Her dropdown için döngü
    const dropdowns = [
      'Region',
      'Country',
      'State/Province',
      'City',
      'Theme',
      'Content Type',
      'Style'
    ];
/*
   for (const label of dropdowns) {
      console.log(`Testing dropdown: ${label}`);
      await selectAllOptions(page, label);
    }

    // Galeri veya başka bir sonuç alanının beklenmesi
    await expect(page.locator('text="Loading..."')).toBeVisible();
    
  }); */
});
