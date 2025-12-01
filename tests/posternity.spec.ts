
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
  await page.goto('localhost:3000/test-page');
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
  await page.goto('localhost:3000/test-page');
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
});



test('test text', async ({ page }) => {
  await page.goto('localhost:3000/test-page');
  await page.getByText('Test Page This page contains').click();
  await expect(page.locator('body')).toContainText('Table Example');

  await expect(page.locator('tbody')).toContainText('Alice');
  await expect(page.locator('tbody')).toContainText('25');
  await expect(page.locator('tbody')).toContainText('New York');

  await expect(page.locator('#ulist')).toContainText('Apple');
  await page.getByLabel('Gender:').selectOption('male');
  await expect(page.getByLabel('Gender:')).toHaveValue('male');
});

test('test table', async ({ page }) => {
  await page.goto('localhost:3000/test-page');
  await expect(page.locator('#test-table')).toContainText('Alice');
  await expect(page.locator('#test-table')).toContainText('25');
  await expect(page.locator('#test-table')).toContainText('New York');
});