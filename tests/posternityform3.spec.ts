import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://posternity.ai/contact');
  await page.getByRole('textbox', { name: 'Name*' }).click();
  await page.getByRole('textbox', { name: 'Name*' }).fill('rasim');
  await page.getByRole('textbox', { name: 'Email*' }).click();
  await page.getByRole('textbox', { name: 'Email*' }).fill('rasim@gmail.com');
  await page.getByRole('textbox', { name: 'Subject' }).click();
  await page.getByRole('textbox', { name: 'Subject' }).fill('test subject');
  await page.getByRole('textbox', { name: 'Write a Message*' }).click();
  await page.getByRole('textbox', { name: 'Write a Message*' }).fill('test message');
  await page.getByRole('button', { name: 'Send Message' }).click();
  //await expect(page.locator('#formStatus')).toContainText('Thank you! Your message has been sent.');
});