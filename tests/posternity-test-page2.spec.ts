import { test, expect } from '@playwright/test';
import path from 'path';

test('test database', async ({ page }) => {
  await page.goto('https://posternity.ai/test-page2');
  await page.getByRole('button', { name: 'Database' }).click();
  await page.getByRole('textbox', { name: 'Name', exact: true }).click();
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('name1');
  await page.getByRole('textbox', { name: 'Surname' }).click();
  await page.getByRole('textbox', { name: 'Surname' }).fill('lastname1');
  await page.getByRole('textbox', { name: 'Title' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('manager');
  await page.getByLabel('Gender').selectOption('Male');
  await page.getByRole('button', { name: ' Add Record' }).click();
  await expect(page.locator('#db-count-tab')).toContainText('1');

  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('name2');
  await page.getByRole('textbox', { name: 'Surname' }).click();
  await page.getByRole('textbox', { name: 'Surname' }).fill('lastname2');
  await page.getByRole('textbox', { name: 'Title' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('dveloper');
  await page.getByLabel('Gender').selectOption('Male');
  await page.getByRole('button', { name: ' Add Record' }).click();

  await expect(page.locator('#db-count-tab')).toBeVisible();
  await expect(page.locator('#db-count-tab')).toContainText('2');

  await expect(page.locator('#db-list-tab')).toContainText('name1');

  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('name3');
  await page.getByRole('textbox', { name: 'Surname' }).click();
  await page.getByRole('textbox', { name: 'Surname' }).fill('lastname3');
  await page.getByRole('textbox', { name: 'Title' }).click();
  await page.getByRole('textbox', { name: 'Title' }).fill('dveloper');
  await page.getByLabel('Gender').selectOption('Male');
  await page.getByRole('button', { name: ' Add Record' }).click();

  await expect(page.locator('#db-count-tab')).toBeVisible();
  await expect(page.locator('#db-count-tab')).toContainText('3');

  await expect(page.locator('#db-list-tab')).toContainText('name3');
});



test('test Interactive', async ({ page }) => {
  await page.goto('https://posternity.ai/test-page2');
  await page.getByRole('button', { name: ' Interactive' }).click();
  await page.getByRole('button', { name: ' Increase' }).click();
  await page.getByRole('button', { name: ' Increase' }).click();
  await expect(page.locator('#counter-display')).toContainText('2');
  await page.getByRole('button', { name: ' Decrease' }).click();
  await expect(page.locator('#counter-display')).toContainText('1');
  await page.getByRole('button', { name: ' Open Modal' }).click();
  await expect(page.locator('#test-modal')).toContainText('Test Modal');
  await page.getByRole('button', { name: 'Close Modal' }).click();
  await page.getByRole('button', { name: ' Toggle Box' }).click();
  await expect(page.locator('#toggle-box')).toContainText('This box can be toggled on and off!');
  await page.getByRole('button', { name: ' Toggle Box' }).click();
});


test('test alerts', async ({ page }) => {
  await page.goto('https://posternity.ai/test-page2');
  await expect(page).toHaveURL(/.*/, { timeout: 2000 });
  await page.getByRole('button', { name: ' Alerts' }).click();
  
  // UI reaction bekle
    //await expect(page.getByTestId('alerts-content')).toBeVisible();

  await expect(page.getByRole('heading', { name: 'Alert Messages' })).toBeVisible();
  await page.getByRole('button').first().click();
  await expect(page).toHaveURL(/.*/, { timeout: 5000 });
});

test('test form with file upload', async ({ page }) => {
  // Navigate to the form page
  await page.goto('localhost:3000/test-page2');


  await page.getByRole('button', { name: ' File Upload' }).click();


  await page.locator('#fileUploadForm div').filter({ hasText: 'Upload Image * Click to' }).locator('i').click();


/*
  // 1. Show: playwright live
  await page.locator('input[name="show"]').fill('Playwright Live');

  // 2. Date: 15 July
  const dateInput = page.locator('input[type="date"]');
  await dateInput.fill('2024-07-15');

  // 3. Time: 1:00 AM
  const timeInput = page.locator('input[type="time"]');
  await timeInput.fill('01:00');

  // 4. Topic: Playwright Live - Latest updates on Playwright MCP + Live Demo ....
  const topicInput = page.locator('input[name="topic"], textarea[name="topic"]');
  await topicInput.fill('Playwright Live - Latest updates on Playwright MCP + Live Demo ....');

  // 13. Upload image file ./selfie.png in the upload section
  const fileUploadInput = page.locator('input[type="file"]');
  const filePath = path.join(__dirname, './selfie.png');
  
  // Set the file input
  await fileUploadInput.setInputFiles(filePath);

  // Verify file was uploaded
  await expect(fileUploadInput).toHaveValue(/selfie\.png/);

  // Click the Submit button when done
  const submitButton = page.locator('button[type="submit"], button:has-text("Submit")');
  await submitButton.click();

  // Wait for form submission to complete
  await page.waitForNavigation().catch(() => {});
  
  // Assert success message or redirect
  await expect(page).toHaveURL(/., { timeout: 5000 });
  */
});