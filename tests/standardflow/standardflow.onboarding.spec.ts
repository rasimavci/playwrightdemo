import { test, expect } from '@playwright/test';
import path from 'path';

test('test', async ({ page }) => {
  await page.goto('https://standardflow.onrender.com/');
  await page.getByRole('link', { name: 'Smart Matching' }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'Fundraising' }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'Features' }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'For Investors' }).click();
  await page.getByRole('link', { name: 'Pricing' }).click();
});


test('join test', async ({ page }) => {
  await page.goto('https://standardflow.onrender.com/onboarding');
//  await page.getByRole('link', { name: 'Join Now' }).click();

  await page.waitForTimeout(1000);


  await page.getByRole('button', { name: 'I\'m a Founder Raising capital' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Pre-Seed Just getting started' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'SaaS' }).click();
  await page.getByRole('button', { name: 'AI/ML' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'MVP Built Product ready,' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('combobox').first().selectOption('100k-500k');
  await page.getByRole('combobox').nth(1).selectOption('6-10');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'North America' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('textbox', { name: 'John Doe' }).click();
  await page.getByRole('textbox', { name: 'John Doe' }).fill('rasim avci');
  await page.getByRole('textbox', { name: 'John Doe' }).press('Tab');
  await page.getByRole('textbox', { name: 'john@example.com' }).fill('rasimavci@gmail.com');
  await page.getByRole('textbox', { name: 'john@example.com' }).press('Tab');
  await page.getByRole('textbox', { name: 'Your Startup Inc.' }).fill('posternity');
  await page.getByRole('textbox', { name: 'Your Startup Inc.' }).press('Tab');
  await page.getByRole('textbox', { name: 'https://yourcompany.com' }).fill('posternity.ai');



  /*
    await page.locator('label').filter({ hasText: 'Click to upload pitch deckPDF' }).click();
  // Drag & drop alanına tıklayıp file chooser'ı aç
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByText('Click to upload pitch deckPDF').click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles('tests/fixtures/sample.pdf');
  
  await page.waitForTimeout(1000);
*/

  

//const filePath = 'C:\\youtube.txt'; // path.join(process.cwd(), 

//await page.setInputFiles('#dropzone input[type="file"]', filePath);


const fileInput = page.locator('input[type="file"]');

await fileInput.setInputFiles('C:\\youtube.txt');

await page.waitForTimeout(2000);
await page.getByRole('button', { name: 'Complete' }).click();


});