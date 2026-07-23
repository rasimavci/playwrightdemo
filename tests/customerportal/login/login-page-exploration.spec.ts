import { test, expect } from '@playwright/test';

test.describe('Login Page Exploration', () => {
  test('explore login page elements', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for reference
    await page.screenshot({ path: 'login-page-exploration.png', fullPage: true });
    
    // Get the page title
    const title = await page.title();
    console.log('Page Title:', title);
    
    // Get all input fields
    const inputs = await page.locator('input').all();
    console.log(`\nFound ${inputs.length} input fields:`);
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const id = await input.getAttribute('id');
      const placeholder = await input.getAttribute('placeholder');
      const ariaLabel = await input.getAttribute('aria-label');
      console.log(`  Input ${i + 1}:`, { type, name, id, placeholder, ariaLabel });
    }
    
    // Get all buttons
    const buttons = await page.locator('button').all();
    console.log(`\nFound ${buttons.length} buttons:`);
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const type = await button.getAttribute('type');
      const ariaLabel = await button.getAttribute('aria-label');
      console.log(`  Button ${i + 1}:`, { text: text?.trim(), type, ariaLabel });
    }
    
    // Get all labels
    const labels = await page.locator('label').all();
    console.log(`\nFound ${labels.length} labels:`);
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      const text = await label.textContent();
      const forAttr = await label.getAttribute('for');
      console.log(`  Label ${i + 1}:`, { text: text?.trim(), for: forAttr });
    }
    
    // Get all links
    const links = await page.locator('a').all();
    console.log(`\nFound ${links.length} links:`);
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      console.log(`  Link ${i + 1}:`, { text: text?.trim(), href });
    }
    
    // Get all headings
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    console.log(`\nFound ${headings.length} headings:`);
    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i];
      const tagName = await heading.evaluate(el => el.tagName);
      const text = await heading.textContent();
      console.log(`  ${tagName}:`, text?.trim());
    }
    
    // Get page HTML structure (first 2000 chars for reference)
    const html = await page.content();
    console.log('\nPage HTML (preview):', html.substring(0, 2000));
  });
});
