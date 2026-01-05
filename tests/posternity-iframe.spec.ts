import { test, expect } from '@playwright/test';

test('Interact with elements inside iframe', async ({ page }) => {
  // Go to main page
  await page.goto('http://localhost:3000/test-iframe.html'); // adjust path if needed

  // Get the iframe
  const iframe = await page.frameLocator('#demo-iframe');

  // Fill input inside iframe
  await iframe.locator('#name-input').fill('Rasim');

  // Click the button inside iframe
  await iframe.locator('#greet-btn').click();

  // Assert greeting text
  await expect(iframe.locator('#greeting-msg')).toHaveText('Hello, Rasim!');
});
