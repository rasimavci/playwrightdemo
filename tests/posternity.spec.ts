
import { test, expect } from '@playwright/test';

test('test teplates link', async ({ page }) => {
  await page.goto('https://posternity.ai/');
  await page.getByRole('link', { name: ' Ads' }).click();
  await page.getByRole('link', { name: 'Social Ads' }).click();
  await page.getByRole('link', { name: 'Explore Stories' }).click();
  await page.getByRole('button', { name: 'travel tips' }).click();
  const page1Promise = page.waitForEvent('popup');
  await page.getByText('A vibrant lifestyle').click();
  const page1 = await page1Promise;
});




test('test elements', async ({ page }) => {
  await page.goto('https://posternity.ai/test-page');
  await expect(page.getByRole('heading', { name: 'Table Example' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Alice' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Username:' })).toBeEmpty();

  await page.getByRole('textbox', { name: 'Username:' }).click();
  await page.getByRole('textbox', { name: 'Username:' }).fill('rasim');
  await page.getByRole('textbox', { name: 'Email:' }).click();
  await page.getByRole('textbox', { name: 'Email:' }).fill('avci');
  await page.getByLabel('Gender:').selectOption('male');
  await page.getByRole('checkbox', { name: 'Subscribe to newsletter' }).check();
  await page.getByRole('button', { name: 'Submit' }).click();
});


test('test visibility', async ({ page }) => {
  await page.goto('https://posternity.ai/test-page');
  await expect(page.getByRole('heading', { name: 'Test Page' })).toBeVisible();
  await expect(page.getByText('This page contains elements')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Table Example' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Unordered List' })).toBeVisible();
  await expect(page.getByText('Apple')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ordered List', exact: true })).toBeVisible();
  await expect(page.getByText('First')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Form Elements' })).toBeVisible();
  await expect(page.getByText('Username:')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
  await expect(page.getByRole('img', { name: 'Placeholder Image' })).toBeVisible();

  const locatorbutton  = page.getByRole('button');

  locatorbutton.click();

  await page.getByRole('button').first().click();
  await page.getByRole('button').last().click();
  await page.getByRole('button').nth(2).click();


});




test('test text', async ({ page }) => {
  await page.goto('https://posternity.ai/test-page');
  await page.getByText('Test Page This page contains').click();
  await expect(page.locator('body')).toContainText('Table Example');

  await expect(page.locator('tbody')).toContainText('Alice');
  await expect(page.locator('tbody')).toContainText('25');
  await expect(page.locator('tbody')).toContainText('New York');


});

test('test table', async ({ page }) => {
  await page.goto('https://posternity.ai/test-page');
  await expect(page.locator('#test-table')).toContainText('Alice');
  await expect(page.locator('#test-table')).toContainText('25');
  await expect(page.locator('#test-table')).toContainText('New York');
});


test('test select', async ({ page }) => {
  await page.goto('https://posternity.ai/test-page');
  await page.getByLabel('Gender:').selectOption('male');
  await expect(page.getByLabel('Gender:')).toHaveValue('male');
  await page.waitForTimeout(3000);
});

test('test form validation', async ({ page }) => {
  await page.goto('https://posternity.ai/test-page');
  
  // Test empty form submission
  await page.getByRole('button', { name: 'Submit' }).click();
  
  // Fill form with valid data
  await page.getByRole('textbox', { name: 'Username:' }).fill('testuser');
  await page.getByRole('textbox', { name: 'Email:' }).fill('test@example.com');
  await page.getByLabel('Gender:').selectOption('female');
  
  // Verify form data
  await expect(page.getByRole('textbox', { name: 'Username:' })).toHaveValue('testuser');
  await expect(page.getByRole('textbox', { name: 'Email:' })).toHaveValue('test@example.com');
  await expect(page.getByLabel('Gender:')).toHaveValue('female');
});

test('test checkbox interaction', async ({ page }) => {
  await page.goto('https://posternity.ai/test-page');
  
  const checkbox = page.getByRole('checkbox', { name: 'Subscribe to newsletter' });
  
  // Check the checkbox
  await checkbox.check();
  await expect(checkbox).toBeChecked();
  
  // Uncheck the checkbox
  await checkbox.uncheck();
  await expect(checkbox).not.toBeChecked();
});

test('test table data', async ({ page }) => {
  await page.goto('https://posternity.ai/test-page');
  
  const table = page.locator('#test-table');
  
  // Verify table exists and contains expected data
  await expect(table).toBeVisible();
  await expect(table).toContainText('Alice');
  await expect(table).toContainText('25');
  await expect(table).toContainText('New York');
  await expect(table).toContainText('Bob');
  await expect(table).toContainText('30');
  await expect(table).toContainText('London');
});

test('test list elements', async ({ page }) => {
  await page.goto('https://posternity.ai/test-page');
  
  // Check unordered list
  await expect(page.getByRole('heading', { name: 'Unordered List' })).toBeVisible();
  await expect(page.getByText('Apple')).toBeVisible();
  await expect(page.getByText('Banana')).toBeVisible();
  await expect(page.getByText('Cherry')).toBeVisible();
  
  // Check ordered list
  await expect(page.getByRole('heading', { name: 'Ordered List', exact: true })).toBeVisible();
  await expect(page.getByText('First')).toBeVisible();
  await expect(page.getByText('Second')).toBeVisible();
  await expect(page.getByText('Third')).toBeVisible();
});

test('test image visibility', async ({ page }) => {
  await page.goto('https://posternity.ai/test-page');
  
  const image = page.getByRole('img', { name: 'Placeholder Image' });
  await expect(image).toBeVisible();
});

test('test button state', async ({ page }) => {
  await page.goto('https://posternity.ai/test-page');
  
  const submitButton = page.getByRole('button', { name: 'Submit' });
  
  // Verify button is visible and enabled
  await expect(submitButton).toBeVisible();
  await expect(submitButton).toBeEnabled();
});

test('test form complete workflow', async ({ page }) => {
  await page.goto('https://posternity.ai/test-page');
  
  // Fill all form fields
  await page.getByRole('textbox', { name: 'Username:' }).fill('john_doe');
  await page.getByRole('textbox', { name: 'Email:' }).fill('john@example.com');
  await page.getByLabel('Gender:').selectOption('male');
  await page.getByRole('checkbox', { name: 'Subscribe to newsletter' }).check();
  
  // Verify all fields have correct values
  await expect(page.getByRole('textbox', { name: 'Username:' })).toHaveValue('john_doe');
  await expect(page.getByRole('textbox', { name: 'Email:' })).toHaveValue('john@example.com');
  await expect(page.getByLabel('Gender:')).toHaveValue('male');
  await expect(page.getByRole('checkbox', { name: 'Subscribe to newsletter' })).toBeChecked();
  
  // Submit the form
  await page.getByRole('button', { name: 'Submit' }).click();
  
  // Wait for any potential response/redirect
  await page.waitForTimeout(2000);
});