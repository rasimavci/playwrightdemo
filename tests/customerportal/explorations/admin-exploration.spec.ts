import { test, expect } from '@playwright/test';

test.describe('Admin Interface Exploration', () => {
  test('Explore admin interface features', async ({ page }) => {
    console.log('\n=== STARTING ADMIN INTERFACE EXPLORATION ===\n');
    
    // Navigate to the application
    console.log('1. Navigating to http://localhost:5174');
    await page.goto('http://localhost:5174');
    await page.waitForLoadState('networkidle');
    
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/admin-exploration-initial.png', fullPage: true });
    console.log('   - Initial page screenshot saved');
    
    // Login with admin credentials
    console.log('\n2. Attempting login with admin@efsora.com / Demo123!');
    
    // Find and fill email field
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[id*="email"]',
      'input[placeholder*="email" i]',
      'input[placeholder*="e-posta" i]'
    ];
    
    let emailField = null;
    for (const selector of emailSelectors) {
      const field = page.locator(selector).first();
      if (await field.count() > 0) {
        emailField = field;
        console.log(`   - Found email field with selector: ${selector}`);
        break;
      }
    }
    
    if (emailField) {
      await emailField.fill('admin@efsora.com');
    }
    
    // Find and fill password field
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[id*="password"]',
      'input[placeholder*="password" i]',
      'input[placeholder*="şifre" i]'
    ];
    
    let passwordField = null;
    for (const selector of passwordSelectors) {
      const field = page.locator(selector).first();
      if (await field.count() > 0) {
        passwordField = field;
        console.log(`   - Found password field with selector: ${selector}`);
        break;
      }
    }
    
    if (passwordField) {
      await passwordField.fill('Demo123!');
    }
    
    // Find and click login button
    const loginButtonSelectors = [
      'button[type="submit"]',
      'button:has-text("Login")',
      'button:has-text("Sign in")',
      'button:has-text("Giriş")',
      'input[type="submit"]',
      'button:has-text("Log in")'
    ];
    
    let loginButton = null;
    for (const selector of loginButtonSelectors) {
      const button = page.locator(selector).first();
      if (await button.count() > 0 && await button.isVisible()) {
        loginButton = button;
        console.log(`   - Found login button with selector: ${selector}`);
        break;
      }
    }
    
    if (loginButton) {
      await loginButton.click();
      console.log('   - Login button clicked');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // Wait for any animations
    }
    
    // Take post-login screenshot
    await page.screenshot({ path: 'test-results/admin-exploration-post-login.png', fullPage: true });
    console.log('   - Post-login screenshot saved');
    
    // Explore the admin interface
    console.log('\n3. EXPLORING ADMIN INTERFACE\n');
    console.log('='.repeat(80));
    
    // Get page title
    const title = await page.title();
    console.log(`\nPAGE TITLE: ${title}`);
    
    // Get current URL
    const url = page.url();
    console.log(`CURRENT URL: ${url}`);
    
    // Find all navigation menu items
    console.log('\n--- NAVIGATION MENU ITEMS ---');
    const navSelectors = [
      'nav a',
      'nav button',
      '[role="navigation"] a',
      '[role="navigation"] button',
      'header a',
      'header button',
      '.nav a',
      '.navbar a',
      '.menu a',
      '.sidebar a'
    ];
    
    const allNavItems = new Set();
    for (const selector of navSelectors) {
      const items = page.locator(selector);
      const count = await items.count();
      
      for (let i = 0; i < count; i++) {
        try {
          const item = items.nth(i);
          if (await item.isVisible()) {
            const text = await item.textContent();
            const href = await item.getAttribute('href') || await item.getAttribute('data-href') || 'N/A';
            const itemText = text?.trim();
            if (itemText && itemText.length > 0) {
              allNavItems.add(`"${itemText}" -> ${href}`);
            }
          }
        } catch (e) {
          // Skip if element is not available
        }
      }
    }
    
    allNavItems.forEach(item => console.log(`  - ${item}`));
    
    // Find all buttons
    console.log('\n--- ALL BUTTONS ---');
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    const buttonList = new Set();
    
    for (let i = 0; i < buttonCount; i++) {
      try {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const text = await button.textContent();
          const buttonText = text?.trim();
          if (buttonText && buttonText.length > 0) {
            const classes = await button.getAttribute('class') || '';
            const id = await button.getAttribute('id') || '';
            const type = await button.getAttribute('type') || '';
            buttonList.add(`"${buttonText}" (type: ${type}, id: ${id}, classes: ${classes})`);
          }
        }
      } catch (e) {
        // Skip if element is not available
      }
    }
    
    buttonList.forEach(item => console.log(`  - ${item}`));
    
    // Find all links
    console.log('\n--- ALL LINKS ---');
    const links = page.locator('a');
    const linkCount = await links.count();
    const linkList = new Set();
    
    for (let i = 0; i < linkCount; i++) {
      try {
        const link = links.nth(i);
        if (await link.isVisible()) {
          const text = await link.textContent();
          const href = await link.getAttribute('href') || '';
          const linkText = text?.trim();
          if (linkText && linkText.length > 0) {
            linkList.add(`"${linkText}" -> ${href}`);
          }
        }
      } catch (e) {
        // Skip if element is not available
      }
    }
    
    linkList.forEach(item => console.log(`  - ${item}`));
    
    // Find forms and inputs
    console.log('\n--- FORMS AND INPUT FIELDS ---');
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    const inputList = new Set();
    
    for (let i = 0; i < inputCount; i++) {
      try {
        const input = inputs.nth(i);
        if (await input.isVisible()) {
          const type = await input.getAttribute('type') || await input.evaluate(el => el.tagName.toLowerCase());
          const name = await input.getAttribute('name') || '';
          const id = await input.getAttribute('id') || '';
          const placeholder = await input.getAttribute('placeholder') || '';
          inputList.add(`${type} (name: ${name}, id: ${id}, placeholder: ${placeholder})`);
        }
      } catch (e) {
        // Skip if element is not available
      }
    }
    
    inputList.forEach(item => console.log(`  - ${item}`));
    
    // Find tables
    console.log('\n--- TABLES ---');
    const tables = page.locator('table');
    const tableCount = await tables.count();
    console.log(`Found ${tableCount} table(s)`);
    
    for (let i = 0; i < tableCount; i++) {
      try {
        const table = tables.nth(i);
        const headers = await table.locator('th').allTextContents();
        if (headers.length > 0) {
          console.log(`  Table ${i + 1} headers: ${headers.join(', ')}`);
        }
      } catch (e) {
        // Skip if element is not available
      }
    }
    
    // Find modals/dialogs
    console.log('\n--- MODALS/DIALOGS ---');
    const modalSelectors = [
      '[role="dialog"]',
      '.modal',
      '[class*="modal"]',
      '[class*="dialog"]',
      '[aria-modal="true"]'
    ];
    
    for (const selector of modalSelectors) {
      const modals = page.locator(selector);
      const count = await modals.count();
      if (count > 0) {
        console.log(`  Found ${count} element(s) with selector: ${selector}`);
      }
    }
    
    // Find admin-specific elements
    console.log('\n--- ADMIN-SPECIFIC ELEMENTS ---');
    const adminSelectors = [
      '[class*="admin" i]',
      '[id*="admin" i]',
      '[data-role="admin"]',
      'a[href*="admin"]',
      'button:has-text("Admin")'
    ];
    
    for (const selector of adminSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      for (let i = 0; i < count; i++) {
        try {
          const element = elements.nth(i);
          if (await element.isVisible()) {
            const text = await element.textContent();
            const tag = await element.evaluate(el => el.tagName.toLowerCase());
            console.log(`  - ${tag}: "${text?.trim()}" (${selector})`);
          }
        } catch (e) {
          // Skip if element is not available
        }
      }
    }
    
    // Check for user profile or account info
    console.log('\n--- USER PROFILE/ACCOUNT INFO ---');
    const profileSelectors = [
      '[class*="profile" i]',
      '[class*="account" i]',
      '[class*="user" i]',
      'button:has-text("admin@efsora.com")',
      ':has-text("admin@efsora.com")'
    ];
    
    for (const selector of profileSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      for (let i = 0; i < count && i < 5; i++) {
        try {
          const element = elements.nth(i);
          if (await element.isVisible()) {
            const text = await element.textContent();
            const tag = await element.evaluate(el => el.tagName.toLowerCase());
            console.log(`  - ${tag}: "${text?.trim()}"`);
          }
        } catch (e) {
          // Skip if element is not available
        }
      }
    }
    
    // Get all visible text on page (for context)
    console.log('\n--- PAGE CONTENT KEYWORDS ---');
    const bodyText = await page.locator('body').textContent();
    const keywords = ['admin', 'dashboard', 'users', 'settings', 'manage', 'create', 'delete', 'edit', 'report', 'analytics'];
    const foundKeywords = keywords.filter(keyword => 
      bodyText?.toLowerCase().includes(keyword)
    );
    console.log(`Found keywords: ${foundKeywords.join(', ')}`);
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/admin-exploration-final.png', fullPage: true });
    console.log('\n   - Final screenshot saved');
    
    console.log('\n' + '='.repeat(80));
    console.log('=== EXPLORATION COMPLETE ===\n');
  });
});
