import { test, expect } from '@playwright/test';


test('test add to cart', async ({ page }) => {
  await page.goto('https://www.hepsiburada.com/');

await page.getByRole('button', { name: 'Kabul et' }).click();

await page.waitForTimeout(3000);

  await page.getByRole('search', { name: 'Site İçi Arama' }).locator('div').nth(1).click();

  await page.waitForTimeout(2000);

  await page.locator('[data-test-id="search-bar-input"]').fill('iphone 14');

  await page.waitForTimeout(2000);

  await page.locator('[data-test-id="search-bar-input"]').press('Enter');

//  await page.getByRole('link', { name: 'Teslimat bilgisi: Yarın kargoda Listene ekle: iPhone 14 512 GB Kırmızı' }).click();
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Teslimat bilgisi: Yarın kargoda Listene ekle: iPhone 14 512 GB Kırmızı' }).click();
  const page1 = await page1Promise;

  await page.waitForTimeout(3000);
  await page1.locator('[data-test-id="addToCart"]').click();

  await expect(page1.locator('#cartItemCount')).toContainText('1');
});


test('test', async ({ page, context  }) => {
  await page.goto('https://www.hepsiburada.com/');
  await page.getByRole('button', { name: 'Kabul et' }).click();
  await page.waitForTimeout(3000);
  await page.getByText('Elektronik', { exact: true }).click();
await page.getByRole('link', { name: 'Bilgisayar/Tablet' }).hover();

  await page.getByRole('link', { name: 'Lenovo,' }).first().click();
 // await page.getByRole('checkbox', { name: 'MSI' }).check();
    //await page.getByRole('link', { name: 'Acer', exact: true }).click();
await page.waitForTimeout(2000);
  await page.getByRole('link', { name: 'Intel Core i7', exact: true }).nth(3).click();
  await page.getByRole('link', { name: '32 GB' }).nth(1).click();
//  await page.getByRole('link', { name: 'Nvidia GeForce RTX 5060' }).nth(1).click();



//  await page.getByRole('link', { name: 'Teslimat bilgisi: Yarın kargoda Listene ekle: iPhone 14 512 GB Kırmızı' }).click();
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Teslimat bilgisi: Yarın kargoda Listene ekle: iPhone 14 512 GB Kırmızı' }).click();
  const page1 = await page1Promise;

  await page.waitForTimeout(3000);
  await page1.locator('[data-test-id="addToCart"]').click();

  await expect(page1.locator('#cartItemCount')).toContainText('1');

/*
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('link', { name: 'Nvidia GeForce RTX 5060' }).nth(1).click()
  ]);

  await newPage.waitForLoadState();

  await newPage.getByTestId('addToCart').click();
*/


  await expect(page.locator('#cartItemCount')).toContainText('1');
});
