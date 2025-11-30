import { test, expect } from '@playwright/test';


test('Home Page Test', async ({ page }) => {

    await page.goto('https://www.demoblaze.com/index.html');

    await expect(page).toHaveTitle('STORE');

    const pageTitle = page.title();
    console.log(pageTitle);

    await page.close();

});


//require('@playwright/test');

