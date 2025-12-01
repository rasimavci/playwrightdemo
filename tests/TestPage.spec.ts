import { test, expect } from '@playwright/test';

test.describe('Playwright Test Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('test-page.html'); // HTML dosya yolu
  });

  // 1. Başlık ve metin kontrolü
  test('Check main heading and paragraph', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Playwright Test Page');
    await expect(page.locator('p')).toContainText('This page contains elements for automated testing');
  });

  // 2. Tablo içeriğini test etme
  test('Validate table content', async ({ page }) => {
    const firstRowName = await page.locator('#test-table tbody tr:first-child td:first-child').textContent();
    expect(firstRowName).toBe('Alice');

    const allRows = await page.locator('#test-table tbody tr').count();
    expect(allRows).toBe(3);
  });

  // 3. Liste testleri
  test('Check unordered and ordered lists', async ({ page }) => {
    const ulItems = await page.locator('#ulist li').allTextContents();
    expect(ulItems).toEqual(['Apple', 'Banana', 'Cherry']);

    const olItems = await page.locator('#olist li').allTextContents();
    expect(olItems).toEqual(['First', 'Second', 'Third']);
  });

  // 4. Form etkileşimleri
  test('Fill and submit the form', async ({ page }) => {
    await page.fill('#username', 'Rasim');
    await page.fill('#email', 'rasim@example.com');
    await page.selectOption('#gender', 'male');
    await page.check('#subscribe');

    page.once('dialog', dialog => {
      expect(dialog.message()).toBe('Form submitted!');
      dialog.dismiss();
    });

    await page.click('#submit-btn');
  });

  // 5. Link ve resim kontrolü
  test('Check link and image', async ({ page }) => {
    const link = page.locator('#example-link');
    await expect(link).toHaveAttribute('href', 'https://example.com');

    const img = page.locator('#test-image');
    await expect(img).toHaveAttribute('src', 'https://via.placeholder.com/150');
    await expect(img).toHaveAttribute('alt', 'Placeholder Image');
  });

  // 6. Alert butonunu test etme
  test('Click alert button', async ({ page }) => {
    page.once('dialog', dialog => {
      expect(dialog.message()).toBe('Button clicked!');
      dialog.dismiss();
    });

    await page.click('#alert-btn');
  });

  // 7. Input boş bırakıldığında submit testi
  test('Form submission with empty fields', async ({ page }) => {
    page.once('dialog', dialog => {
      expect(dialog.message()).toBe('Form submitted!');
      dialog.dismiss();
    });
    await page.click('#submit-btn');
  });

});
