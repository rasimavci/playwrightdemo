import { test, expect } from '@playwright/test';

test.describe('Project Actions Panel Exploration', () => {
  test('Explore Project Actions panel features', async ({ page }) => {
    console.log('\n=== STARTING PROJECT ACTIONS PANEL EXPLORATION ===\n');
    
    // Navigate to the application
    console.log('1. Navigating to http://localhost:5173');
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    
    // Login as admin
    console.log('\n2. Attempting login with admin@efsora.com / Demo123!');
    await page.getByLabel('Email', { exact: true }).fill('admin@efsora.com');
    await page.getByLabel('Password', { exact: true }).fill('Demo123!');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('   ✅ Login successful');
    
    // Take post-login screenshot
    await page.screenshot({ 
      path: 'test-results/project-actions-01-post-login.png', 
      fullPage: true 
    });
    
    // Open Admin Actions
    console.log('\n3. Opening Admin Actions menu');
    await page.getByRole('button', { name: 'Admin Actions' }).click();
    await page.waitForTimeout(500);
    console.log('   ✅ Admin Actions menu opened');
    
    await page.screenshot({ 
      path: 'test-results/project-actions-02-admin-menu-open.png', 
      fullPage: true 
    });
    
    // Click Project Actions
    console.log('\n4. Clicking Project Actions link');
    await page.getByRole('link', { name: 'Project Actions' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    console.log('   ✅ Project Actions panel/page opened');
    
    await page.screenshot({ 
      path: 'test-results/project-actions-03-project-panel-open.png', 
      fullPage: true 
    });
    
    // Explore the Project Actions interface
    console.log('\n5. EXPLORING PROJECT ACTIONS INTERFACE\n');
    console.log('='.repeat(80));
    
    // Get page title
    const title = await page.title();
    console.log(`\nPAGE TITLE: ${title}`);
    
    // Get current URL
    const url = page.url();
    console.log(`CURRENT URL: ${url}`);
    
    // Check for main heading
    console.log('\n--- PAGE HEADINGS ---');
    const headings = await page.locator('h1, h2, h3').allTextContents();
    headings.forEach(heading => {
      if (heading.trim()) {
        console.log(`  - ${heading.trim()}`);
      }
    });
    
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
            const ariaLabel = await button.getAttribute('aria-label') || '';
            buttonList.add(`"${buttonText}" (type: ${type}, id: ${id}, aria: ${ariaLabel}, class: ${classes.substring(0, 40)})`);
          }
        }
      } catch (e) {
        // Skip if element is not available
      }
    }
    
    buttonList.forEach(item => console.log(`  - ${item}`));
    console.log(`Total visible buttons: ${buttonList.size}`);
    
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
    console.log(`Total visible links: ${linkList.size}`);
    
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
          const label = await input.getAttribute('aria-label') || '';
          inputList.add(`${type} (name: ${name}, id: ${id}, placeholder: ${placeholder}, label: ${label})`);
        }
      } catch (e) {
        // Skip if element is not available
      }
    }
    
    inputList.forEach(item => console.log(`  - ${item}`));
    console.log(`Total visible inputs: ${inputList.size}`);
    
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
          console.log(`  Table ${i + 1} headers: ${headers.map(h => h.trim()).filter(h => h).join(', ')}`);
        }
        
        // Count rows
        const rows = await table.locator('tbody tr').count();
        console.log(`  Table ${i + 1} rows: ${rows}`);
        
        // Check for row data
        if (rows > 0) {
          const firstRowCells = await table.locator('tbody tr').first().locator('td').allTextContents();
          console.log(`  First row data: ${firstRowCells.map(c => c.trim()).join(' | ')}`);
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
        
        for (let i = 0; i < count; i++) {
          try {
            const modal = modals.nth(i);
            if (await modal.isVisible()) {
              const text = await modal.textContent();
              console.log(`    Visible modal text: ${text?.substring(0, 100)}...`);
            }
          } catch (e) {
            // Skip
          }
        }
      }
    }
    
    // Find project-specific elements
    console.log('\n--- PROJECT-SPECIFIC ELEMENTS ---');
    const projectSelectors = [
      '[class*="project" i]',
      '[id*="project" i]',
      '[data-testid*="project"]',
      'button:has-text("Project")',
      'a:has-text("Project")',
      ':has-text("Apex Mobile")',
      ':has-text("Apex Analytics")',
      ':has-text("Apex Web Portal")',
    ];
    
    for (const selector of projectSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      for (let i = 0; i < count && i < 10; i++) {
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
    
    // Find action buttons (Create, Edit, Delete, etc.)
    console.log('\n--- ACTION BUTTONS (Create/Edit/Delete/Add/Assign) ---');
    const actionKeywords = [
      'create', 'add', 'new', 
      'edit', 'update', 'modify',
      'delete', 'remove', 'archive',
      'assign', 'allocate', 'link',
      'view', 'details', 'info',
      'save', 'cancel', 'submit'
    ];
    const actionButtons = new Set();
    
    for (const keyword of actionKeywords) {
      const buttons = page.locator(`button:has-text("${keyword}")`);
      const count = await buttons.count();
      
      for (let i = 0; i < count; i++) {
        try {
          const button = buttons.nth(i);
          if (await button.isVisible()) {
            const text = await button.textContent();
            if (text?.trim()) {
              actionButtons.add(text.trim());
            }
          }
        } catch (e) {
          // Skip
        }
      }
    }
    
    actionButtons.forEach(btn => console.log(`  - ${btn}`));
    console.log(`Total action buttons: ${actionButtons.size}`);
    
    // Find lists/grids/cards
    console.log('\n--- LISTS/GRIDS/CARDS ---');
    const listSelectors = [
      { selector: 'ul', name: 'Unordered lists' },
      { selector: 'ol', name: 'Ordered lists' },
      { selector: '[role="list"]', name: 'Role lists' },
      { selector: '.list', name: 'List classes' },
      { selector: '[class*="grid"]', name: 'Grid classes' },
      { selector: '[class*="card"]', name: 'Card classes' },
    ];
    
    for (const { selector, name } of listSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        console.log(`  - ${name}: ${count} found`);
      }
    }
    
    // Get all visible text and search for keywords
    console.log('\n--- PAGE CONTENT KEYWORDS ---');
    const bodyText = await page.locator('body').textContent();
    const keywords = [
      'project', 'projects', 'task', 'tasks',
      'create', 'edit', 'delete', 'assign',
      'manage', 'list', 'view', 'add',
      'name', 'description', 'status', 'priority',
      'start date', 'end date', 'deadline',
      'company', 'customer', 'client',
      'active', 'inactive', 'completed', 'in progress'
    ];
    
    const foundKeywords = keywords.filter(keyword => 
      bodyText?.toLowerCase().includes(keyword)
    );
    console.log(`Found keywords: ${foundKeywords.join(', ')}`);
    
    // Check for data display patterns
    console.log('\n--- DATA DISPLAY PATTERNS ---');
    
    // Cards
    const cards = page.locator('[class*="card"]');
    const cardCount = await cards.count();
    if (cardCount > 0) {
      console.log(`  - Found ${cardCount} card elements`);
    }
    
    // Rows
    const rows = page.locator('[class*="row"], tr');
    const rowCount = await rows.count();
    if (rowCount > 0) {
      console.log(`  - Found ${rowCount} row elements`);
    }
    
    // Items
    const items = page.locator('[class*="item"]');
    const itemCount = await items.count();
    if (itemCount > 0) {
      console.log(`  - Found ${itemCount} item elements`);
    }
    
    // Check for project names from user accounts
    console.log('\n--- KNOWN PROJECT NAMES (from user data) ---');
    const knownProjects = [
      'Apex Mobile',
      'Apex Analytics', 
      'Apex Web Portal'
    ];
    
    for (const projectName of knownProjects) {
      const element = page.getByText(projectName, { exact: true });
      const visible = await element.isVisible({ timeout: 1000 }).catch(() => false);
      if (visible) {
        console.log(`  ✅ "${projectName}" - found on page`);
      } else {
        console.log(`  ❌ "${projectName}" - not found`);
      }
    }
    
    // Look for company filter/dropdown
    console.log('\n--- COMPANY FILTER/SELECTION ---');
    const companyFilterSelectors = [
      page.locator('select[name*="company"]'),
      page.locator('[data-testid*="company-filter"]'),
      page.getByLabel(/company/i),
      page.locator('button:has-text("Company")'),
    ];
    
    for (const selector of companyFilterSelectors) {
      if (await selector.isVisible({ timeout: 1000 }).catch(() => false)) {
        console.log('  ✅ Company filter/selector found');
        break;
      }
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'test-results/project-actions-04-exploration-complete.png', 
      fullPage: true 
    });
    console.log('\n   - Final screenshot saved');
    
    // Scroll down to see more content
    console.log('\n6. Scrolling to reveal more content');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'test-results/project-actions-05-scrolled-view.png', 
      fullPage: true 
    });
    
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'test-results/project-actions-06-bottom-view.png', 
      fullPage: true 
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('=== PROJECT ACTIONS EXPLORATION COMPLETE ===\n');
    
    console.log('\n📸 Screenshots saved:');
    console.log('  1. project-actions-01-post-login.png');
    console.log('  2. project-actions-02-admin-menu-open.png');
    console.log('  3. project-actions-03-project-panel-open.png');
    console.log('  4. project-actions-04-exploration-complete.png');
    console.log('  5. project-actions-05-scrolled-view.png');
    console.log('  6. project-actions-06-bottom-view.png\n');
  });
});
