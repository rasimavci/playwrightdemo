import { test, expect } from '@playwright/test';

test('Fill Posternity contact form with specified details', async ({ page }) => {
  // Navigate to the contact page
  await page.goto('https://posternity.ai/contact');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Show: playwright live
  // Look for a checkbox or field related to "Playwright Live" and select it
  const playwrightLiveCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /playwright live/i }).first();
  if (await playwrightLiveCheckbox.isVisible()) {
    await playwrightLiveCheckbox.check();
  }

  // Fill Name field: John Doe
  const nameField = page.locator('input[name="name"], input[placeholder*="Name" i], input[id*="name" i]').first();
  await nameField.fill('John Doe');

  // Fill Email field: jonh@gmail.com
  const emailField = page.locator('input[name="email"], input[type="email"], input[placeholder*="Email" i], input[id*="email" i]').first();
  await emailField.fill('jonh@gmail.com');

  // Fill Subject field: Inquiry about Playwright Live
  const subjectField = page.locator('input[name="subject"], input[placeholder*="Subject" i], input[id*="subject" i]').first();
  await subjectField.fill('Inquiry about Playwright Live');

  // Fill Message field: Looking forward to the event!
  const messageField = page.locator('textarea[name="message"], textarea[placeholder*="Message" i], textarea[id*="message" i]').first();
  await messageField.fill('Looking forward to the event!');

  // Subscribe to newsletter: Yes
  const newsletterCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /newsletter|subscribe/i }).last();
  if (await newsletterCheckbox.isVisible()) {
    await newsletterCheckbox.check();
  }

  // Optional: Take a screenshot to verify form is filled
  await page.screenshot({ path: 'posternity-form-filled.png' })

  // Optional: Submit the form if there's a submit button
  const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /submit|send/i }).first();
  if (await submitButton.isVisible()) {
    await submitButton.click();
    // Wait for submission to complete
  //  await page.waitForLoadState('networkidle');
  }
});
