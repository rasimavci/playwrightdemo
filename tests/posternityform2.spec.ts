import { test, expect } from '@playwright/test';

test('Posternity form - Fill form with specified details', async ({ page }) => {
  // Navigate to the contact page
  await page.goto('https://posternity.ai/contact');

  // Wait for page to load
  // await page.waitForLoadState('domcontentloaded');

  // 1. Show: playwright live
  const showDropdown = page.locator('[data-testid="show-select"], select[name="show"], #show');
  await showDropdown.selectOption({ label: 'playwright live' });

  // 5. Name: John Doe
  const nameInput = page.locator('[data-testid="name"], input[name="name"], #name');
  await nameInput.fill('John Doe');

  // 6. Email: jonh@gmail.com
  const emailInput = page.locator('[data-testid="email"], input[name="email"], #email');
  await emailInput.fill('jonh@gmail.com');

  // 7. Subject: Inquiry about Playwright Live
  const subjectInput = page.locator('[data-testid="subject"], input[name="subject"], #subject');
  await subjectInput.fill('Inquiry about Playwright Live');

  // 7. Message: Looking forward to the event!
  const messageInput = page.locator('[data-testid="message"], textarea[name="message"], #message');
  await messageInput.fill('Looking forward to the event!');

  // 8. Subscribe to newsletter: Yes
  const subscribeCheckbox = page.locator('[data-testid="subscribe"], input[name="subscribe"]');
  await subscribeCheckbox.check();

  // Optional: Take a screenshot before submission
  await page.screenshot({ path: 'posternity-form-filled.png' });

  // Verify form is filled correctly
  await expect(nameInput).toHaveValue('John Doe');
  await expect(emailInput).toHaveValue('jonh@gmail.com');
  await expect(subjectInput).toHaveValue('Inquiry about Playwright Live');
  await expect(messageInput).toHaveValue('Looking forward to the event!');
  await expect(subscribeCheckbox).toBeChecked();
});
