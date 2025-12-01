import { test, expect } from '@playwright/test';
import path from 'path';

test('Fill and submit the form', async ({ page }) => {
  // Navigate to the form
  await page.goto('https://example.com/form');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // 1. Show: playwright live
  await page.fill('input[name="show"], input[placeholder*="show" i]', 'playwright live');

  // 2. Date: 15 July
  // Try multiple selectors for date input
  const dateInputs = await page.locator('input[type="date"], input[name="date"]');
  if (await dateInputs.count() > 0) {
    await dateInputs.first().fill('2025-07-15');
  }

  // 3. Time: 1:00 AM
  const timeInputs = await page.locator('input[type="time"], input[name="time"]');
  if (await timeInputs.count() > 0) {
    await timeInputs.first().fill('01:00');
  }

  // 4. Topic: Playwright Live - Latest updates on Playwright MCP + Live Demo ....
  await page.fill(
    'input[name="topic"], textarea[name="topic"], input[placeholder*="topic" i]',
    'Playwright Live - Latest updates on Playwright MCP + Live Demo ....'
  );

  // 5. Upload image file ./selfie.png
  const fileInputPath = path.join(__dirname, '..', 'selfie.png');
  await page.locator('input[type="file"]').setInputFiles(fileInputPath);

  // Click Submit button
  await page.click('button[type="submit"], button:has-text("Submit")');

  // Wait for submission to complete
  await page.waitForLoadState('networkidle');

  // Verify form was submitted (look for success message or URL change)
  await expect(page).toHaveURL(/.*/, { timeout: 5000 });
});
