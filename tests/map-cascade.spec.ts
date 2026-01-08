import { Page, Locator, expect } from '@playwright/test';

export async function openDropdown(dropdown: Locator) {
  await dropdown.scrollIntoViewIfNeeded();
  await dropdown.click();
  await dropdown.page().waitForTimeout(300);
}

export async function waitForOptions(page: Page) {
  const options = page.getByRole('option').filter({ hasNotText: /^Select/ });
  await expect(options.first()).toBeVisible({ timeout: 5000 });
  return options;
}

export async function selectOptionByIndex(
  page: Page,
  dropdown: Locator,
  index: number
) {
  await openDropdown(dropdown);
  const options = await waitForOptions(page);
  const option = options.nth(index);
  const text = await option.textContent();
  await option.click();
  await page.waitForTimeout(500);
  return text?.trim();
}
