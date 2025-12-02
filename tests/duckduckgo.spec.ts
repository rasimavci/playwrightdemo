// @ts-check
import { test, expect } from '@playwright/test';


test('TestGrid website on DuckDuckGo.', async ({ page }) => {
 await page.goto('https://duckduckgo.com/?t=h_&q=https%3A%2F%2Ftestgrid.io%2F&ia=web', { waitUntil: 'load' });
 await page.goto('https://duckduckgo.com/?t=h_&q=https%3A%2F%2Ftestgrid.io%2F&ia=web', { waitUntil: 'load' });
 await page.getByRole('link', { name: 'AI powered End-to-End Testing Platform - TestGrid', exact: true }).click();
 await page.getByRole('link', { name: 'Sign in' }).click();
 await page.getByPlaceholder('Email').click();
 await page.getByPlaceholder('Email').fill('demo@demo.com');
 await page.getByPlaceholder('Password').click();
 await page.getByPlaceholder('Password').fill('demo');
 await page.getByRole('button', { name: 'Sign In' }).click();
});

test('DemoQA website on DuckDuckGo.', async ({ page }) => {
 await page.goto('https://duckduckgo.com/?t=h_&q=https%3A%2F%2Fdemoqa.com%2F&ia=web', { waitUntil: 'load' });
 await page.goto('https://duckduckgo.com/?t=h_&q=https%3A%2F%2Fdemoqa.com%2F&ia=web', { waitUntil: 'load' });
 await page.getByRole('link', { name: 'DEMOQA', exact: true }).first().click();
 await page.getByRole('heading', { name: 'Elements' }).click();
 await page.getByText('Check Box').click();
 await page.locator('#tree-node').getByRole('img').nth(3).click();
});