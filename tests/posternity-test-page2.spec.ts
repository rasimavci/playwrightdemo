import { test, expect } from '@playwright/test';

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
  await page.getByRole('button', { name: ' Alerts' }).click();
  
  // UI reaction bekle
    //await expect(page.getByTestId('alerts-content')).toBeVisible();

  await expect(page.getByRole('heading', { name: 'Alert Messages' })).toBeVisible();
  await page.getByRole('button').first().click();
  await expect(page).toHaveURL(/.*/, { timeout: 5000 });
});