import { test, expect } from '@playwright/test';
import { openDropdown, waitForOptions, selectOptionByIndex } from './map-cascade.spec';

test.describe('Posternity Map – Cascaded dropdowns', () => {
  test('Region → Country → State/Province cascade', async ({ page }) => {
    await page.goto('https://posternity.ai/map', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');

    const regionDropdown = page.getByLabel('Region', { exact: true });
    const countryDropdown = page.getByLabel('Country', { exact: true });
    const stateDropdown = page.getByLabel('State/Province', { exact: true });

    // 🔁 REGIONS
    await openDropdown(regionDropdown);
    const regions = await waitForOptions(page);
    const regionCount = await regions.count();

    for (let r = 0; r < regionCount; r++) {
      const region = await selectOptionByIndex(page, regionDropdown, r);
      console.log('Region:', region);

      // ⏳ Country dropdown reload olur
      await expect(countryDropdown).toBeEnabled();

      await openDropdown(countryDropdown);
      const countries = await waitForOptions(page);
      const countryCount = await countries.count();

      for (let c = 0; c < countryCount; c++) {
        const country = await selectOptionByIndex(page, countryDropdown, c);
        console.log('  Country:', country);

        // ⏳ State dropdown reload olur
        await expect(stateDropdown).toBeEnabled();

        await openDropdown(stateDropdown);
        const states = page.getByRole('option');
        const stateCount = await states.count();

        // ⚠️ Bazı ülkelerde state olmayabilir
        if (stateCount === 0) {
          console.log('    No states');
          continue;
        }

        for (let s = 0; s < stateCount; s++) {
          const state = await selectOptionByIndex(page, stateDropdown, s);
          console.log('    State:', state);

          // 🔍 Burada sonuç/harita/galeri assert’i yapabilirsin
          await expect(page.locator('[data-testid="map-container"]'))
            .toBeVisible();
        }
      }
    }
  });
});
