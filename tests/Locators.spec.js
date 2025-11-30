import { test, expect } from '@playwright/test';

test('Locators', async ({ page }) => {

    await page.goto('https://www.demoblaze.com/index.html')

    //property of element as locator
    await page.locator('id=login2').click()

    //provide user name and password
    await page.locator('#loginusername').fill('pavanol')

    await page.locator('input[id="loginpassword"]').fill('test@123')

    await page.waitForTimeout(2000); // wait for 2 seconds

   // await page.locator('button[onclick="logIn()"]').click()

    await page.click("//button[normalize-space()='Log in']")

    await page.waitForTimeout(2000); // wait for 2 seconds

    const logOutButton = page.locator("(//a[normalize-space()='Log out'])")
    
    await expect(logOutButton).toBeVisible()
});