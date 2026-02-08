import { test, expect } from '@playwright/test';

test.describe('Admin Interface Deep Exploration', () => {
  test('Deep dive into admin actions and menus', async ({ page }) => {
    console.log('\n=== DEEP ADMIN EXPLORATION ===\n');
    
    // Navigate and login
    await page.goto('http://localhost:5174');
    await page.waitForLoadState('networkidle');
    
    const emailField = page.locator('input[type="email"]').first();
    await emailField.fill('admin@efsora.com');
    
    const passwordField = page.locator('input[type="password"]').first();
    await passwordField.fill('Demo123!');
    
    const loginButton = page.locator('button[type="submit"]').first();
    await loginButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('✓ Logged in successfully\n');
    
    // Explore Admin Actions menu
    console.log('--- EXPLORING ADMIN ACTIONS MENU ---\n');
    
    const adminActionsButton = page.locator('button:has-text("Admin Actions")').first();
    if (await adminActionsButton.isVisible()) {
      console.log('Found "Admin Actions" button, clicking...');
      await adminActionsButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/admin-actions-menu-open.png', fullPage: true });
      
      // Get all menu items that appear
      const menuItems = page.locator('[role="menuitem"], [role="menu"] a, [role="menu"] button');
      const menuCount = await menuItems.count();
      console.log(`\nFound ${menuCount} menu items:`);
      
      for (let i = 0; i < menuCount; i++) {
        try {
          const item = menuItems.nth(i);
          if (await item.isVisible()) {
            const text = await item.textContent();
            const role = await item.getAttribute('role');
            console.log(`  ${i + 1}. "${text?.trim()}" (role: ${role})`);
          }
        } catch (e) {
          // Skip
        }
      }
      
      // Close menu
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    // Explore company/account selector buttons
    console.log('\n--- EXPLORING COMPANY/ACCOUNT SELECTORS ---\n');
    
    const companyButtons = ['Efsora', 'Apex', 'TechCorp'];
    for (const company of companyButtons) {
      const button = page.locator(`button:has-text("${company}")`).first();
      if (await button.count() > 0 && await button.isVisible()) {
        console.log(`\nClicking "${company}" button...`);
        await button.click();
        await page.waitForTimeout(1000);
        
        // Check what happens when clicked
        const url = page.url();
        console.log(`  Current URL: ${url}`);
        
        // Check for any modals or dropdowns
        const dropdowns = page.locator('[role="menu"], [role="dialog"], .dropdown-menu');
        const dropdownCount = await dropdowns.count();
        if (dropdownCount > 0) {
          console.log(`  Dropdown/menu appeared with ${dropdownCount} elements`);
          
          // Get dropdown items
          const items = page.locator('[role="menuitem"], [role="menu"] button, [role="menu"] a');
          const itemCount = await items.count();
          for (let i = 0; i < itemCount && i < 10; i++) {
            try {
              const item = items.nth(i);
              if (await item.isVisible()) {
                const text = await item.textContent();
                console.log(`    - ${text?.trim()}`);
              }
            } catch (e) {
              // Skip
            }
          }
        }
        
        await page.screenshot({ path: `test-results/company-${company.toLowerCase()}-clicked.png`, fullPage: true });
        
        // Close any open menus
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    }
    
    // Click Dashboard to reset
    const dashboardButton = page.locator('button:has-text("Dashboard")').first();
    if (await dashboardButton.isVisible()) {
      await dashboardButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Explore user profile menu
    console.log('\n--- EXPLORING USER PROFILE MENU ---\n');
    
    const userMenuButtons = page.locator('button:has-text("admin")').or(page.locator('button:has-text("System Admin")'));
    const userMenuCount = await userMenuButtons.count();
    
    for (let i = 0; i < userMenuCount; i++) {
      try {
        const button = userMenuButtons.nth(i);
        if (await button.isVisible()) {
          const text = await button.textContent();
          console.log(`\nClicking user menu button: "${text?.trim()}"`);
          await button.click();
          await page.waitForTimeout(1000);
          
          // Capture what appears
          await page.screenshot({ path: `test-results/user-menu-${i}.png`, fullPage: true });
          
          // Get menu items
          const menuItems = page.locator('[role="menuitem"], [role="menu"] button, [role="menu"] a');
          const itemCount = await menuItems.count();
          
          if (itemCount > 0) {
            console.log('  Menu items found:');
            for (let j = 0; j < itemCount; j++) {
              try {
                const item = menuItems.nth(j);
                if (await item.isVisible()) {
                  const itemText = await item.textContent();
                  console.log(`    - ${itemText?.trim()}`);
                }
              } catch (e) {
                // Skip
              }
            }
          }
          
          // Close menu
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
      } catch (e) {
        console.log(`  Error exploring menu ${i}: ${e}`);
      }
    }
    
    // Look for "Sync Linear Data" button functionality
    console.log('\n--- EXPLORING SYNC LINEAR DATA BUTTON ---\n');
    
    const syncButton = page.locator('button:has-text("Sync Linear Data")').first();
    if (await syncButton.isVisible()) {
      console.log('Found "Sync Linear Data" button');
      console.log('  This button likely triggers a data synchronization process');
      console.log('  Button is visible and enabled:', await syncButton.isEnabled());
    }
    
    // Explore tables on the page
    console.log('\n--- ANALYZING TABLES ON DASHBOARD ---\n');
    
    const tables = page.locator('table');
    const tableCount = await tables.count();
    
    for (let i = 0; i < tableCount; i++) {
      console.log(`\nTable ${i + 1}:`);
      const table = tables.nth(i);
      
      // Get headers
      const headers = await table.locator('th').allTextContents();
      console.log(`  Headers: ${headers.join(', ')}`);
      
      // Get row count
      const rows = table.locator('tbody tr');
      const rowCount = await rows.count();
      console.log(`  Row count: ${rowCount}`);
      
      // Check for action buttons in rows
      const actionButtons = table.locator('button');
      const actionCount = await actionButtons.count();
      if (actionCount > 0) {
        console.log(`  Action buttons found: ${actionCount}`);
        
        // Get first few button texts
        for (let j = 0; j < Math.min(actionCount, 5); j++) {
          try {
            const btn = actionButtons.nth(j);
            if (await btn.isVisible()) {
              const btnText = await btn.textContent();
              console.log(`    - ${btnText?.trim()}`);
            }
          } catch (e) {
            // Skip
          }
        }
      }
      
      // Check for links in rows
      const actionLinks = table.locator('a');
      const linkCount = await actionLinks.count();
      if (linkCount > 0) {
        console.log(`  Links found: ${linkCount}`);
      }
    }
    
    // Check for chat interface
    console.log('\n--- EXPLORING CHAT INTERFACE ---\n');
    
    const chatInput = page.locator('input[placeholder*="Ask"]').or(page.locator('textarea[placeholder*="Ask"]'));
    if (await chatInput.count() > 0) {
      console.log('Found chat/assistant interface');
      const placeholder = await chatInput.first().getAttribute('placeholder');
      console.log(`  Placeholder: "${placeholder}"`);
      console.log('  This appears to be an AI assistant or help system');
    }
    
    // Look for any "Open menu" buttons
    console.log('\n--- EXPLORING ADDITIONAL MENUS ---\n');
    
    const menuButtons = page.locator('button[aria-label*="menu"], button:has-text("Open menu")');
    const menuButtonCount = await menuButtons.count();
    
    for (let i = 0; i < menuButtonCount; i++) {
      try {
        const button = menuButtons.nth(i);
        if (await button.isVisible()) {
          const ariaLabel = await button.getAttribute('aria-label');
          console.log(`\nFound menu button: ${ariaLabel || 'Open menu'}`);
          
          await button.click();
          await page.waitForTimeout(1000);
          
          await page.screenshot({ path: `test-results/additional-menu-${i}.png`, fullPage: true });
          
          // Get menu content
          const menuItems = page.locator('[role="menuitem"]');
          const itemCount = await menuItems.count();
          
          if (itemCount > 0) {
            console.log('  Menu items:');
            for (let j = 0; j < itemCount; j++) {
              try {
                const item = menuItems.nth(j);
                if (await item.isVisible()) {
                  const text = await item.textContent();
                  console.log(`    - ${text?.trim()}`);
                }
              } catch (e) {
                // Skip
              }
            }
          }
          
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
      } catch (e) {
        console.log(`  Error with menu ${i}: ${e}`);
      }
    }
    
    // Final page state
    console.log('\n--- FINAL PAGE STATE ---\n');
    console.log(`URL: ${page.url()}`);
    console.log(`Title: ${await page.title()}`);
    
    await page.screenshot({ path: 'test-results/admin-deep-exploration-final.png', fullPage: true });
    
    console.log('\n=== DEEP EXPLORATION COMPLETE ===\n');
  });
});
