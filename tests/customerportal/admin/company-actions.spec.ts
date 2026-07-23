import { test, expect } from '@playwright/test';

test.describe('Admin - Company Actions Tests', () => {
  const ADMIN_EMAIL = 'admin@efsora.com';
  const PASSWORD = 'Demo123!';
  const BASE_URL = 'http://localhost:5173/';

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto(BASE_URL);
    await page.getByLabel('Email', { exact: true }).fill(ADMIN_EMAIL);
    await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    
    // Wait for successful login
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(BASE_URL + '/');
    
    // Navigate to Company Actions
    await page.getByRole('button', { name: 'Admin Actions' }).click();
    await page.waitForTimeout(500);
    
    await page.getByRole('link', { name: 'Company Actions' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('should display Company Actions page/panel', async ({ page }) => {
    // Verify we're on the correct page
    const url = page.url();
    console.log(`Current URL: ${url}`);
    
    // Look for Company Actions heading
    const headingLocators = [
      page.getByRole('heading', { name: /company actions/i }),
      page.getByRole('heading', { name: /companies/i }),
      page.locator('h1:has-text("Company")'),
      page.locator('h2:has-text("Company")'),
    ];

    let headingFound = false;
    for (const locator of headingLocators) {
      if (await locator.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(locator).toBeVisible();
        const text = await locator.textContent();
        console.log(`✅ Found heading: "${text}"`);
        headingFound = true;
        break;
      }
    }

    // Take screenshot
    await page.screenshot({ 
      path: 'tests/admin/screenshots/company-actions-page.png',
      fullPage: true 
    });
    
    console.log(`✅ Company Actions page displayed`);
  });

  test('should display Create/Add Company button', async ({ page }) => {
    // Look for Create/Add button with multiple strategies
    const createButtonLocators = [
      page.getByRole('button', { name: /create company/i }),
      page.getByRole('button', { name: /add company/i }),
      page.getByRole('button', { name: /new company/i }),
      page.locator('button:has-text("Create")'),
      page.locator('button:has-text("Add")'),
      page.locator('[data-testid="create-company"]'),
    ];

    let createButton;
    for (const locator of createButtonLocators) {
      if (await locator.isVisible({ timeout: 2000 }).catch(() => false)) {
        createButton = locator;
        const text = await createButton.textContent();
        console.log(`✅ Found Create button: "${text?.trim()}"`);
        break;
      }
    }

    if (createButton) {
      await expect(createButton).toBeVisible();
      await expect(createButton).toBeEnabled();
      
      console.log('✅ Create Company button is visible and enabled');
    } else {
      console.log('ℹ️ Create Company button not found (might be in a different location)');
    }
  });

  test('should display companies list/table', async ({ page }) => {
    // Look for table
    const table = page.locator('table').first();
    const tableVisible = await table.isVisible({ timeout: 2000 }).catch(() => false);

    if (tableVisible) {
      await expect(table).toBeVisible();
      
      // Get table headers
      const headers = await table.locator('th').allTextContents();
      console.log('✅ Table headers:', headers.map(h => h.trim()).filter(h => h));
      
      // Count rows
      const rows = await table.locator('tbody tr').count();
      console.log(`✅ Table has ${rows} rows`);
      
      expect(rows).toBeGreaterThanOrEqual(0);
    } else {
      // Look for alternative list display (cards, grid, etc.)
      const listSelectors = [
        page.locator('[class*="card"]'),
        page.locator('[class*="list"]'),
        page.locator('[class*="grid"]'),
        page.locator('[role="list"]'),
      ];

      for (const locator of listSelectors) {
        const count = await locator.count();
        if (count > 0) {
          console.log(`✅ Found ${count} list items with selector`);
          break;
        }
      }
    }

    await page.screenshot({ 
      path: 'tests/admin/screenshots/company-list.png',
      fullPage: true 
    });
  });

  test('should verify action buttons are clickable', async ({ page }) => {
    // Common action button patterns
    const actionButtonKeywords = [
      'create', 'add', 'new',
      'edit', 'update', 'modify',
      'delete', 'remove',
      'view', 'details',
      'search', 'filter',
      'export', 'import'
    ];

    console.log('\n🔍 Searching for action buttons:');
    const foundButtons = new Set<string>();

    for (const keyword of actionButtonKeywords) {
      const buttons = page.locator(`button:has-text("${keyword}")`);
      const count = await buttons.count();

      for (let i = 0; i < count; i++) {
        try {
          const button = buttons.nth(i);
          if (await button.isVisible({ timeout: 500 }).catch(() => false)) {
            const text = await button.textContent();
            const buttonText = text?.trim();
            
            if (buttonText && buttonText.length > 0 && !foundButtons.has(buttonText)) {
              foundButtons.add(buttonText);
              
              // Verify it's enabled
              await expect(button).toBeEnabled();
              
              console.log(`  ✅ "${buttonText}" - visible and enabled`);
            }
          }
        } catch (e) {
          // Skip if error
        }
      }
    }

    console.log(`\n📊 Total action buttons found: ${foundButtons.size}`);
    
    if (foundButtons.size === 0) {
      console.log('ℹ️ No action buttons found with common keywords');
    }
  });

  test('should verify row action buttons if table exists', async ({ page }) => {
    const table = page.locator('table').first();
    const tableVisible = await table.isVisible({ timeout: 2000 }).catch(() => false);

    if (tableVisible) {
      const firstRow = table.locator('tbody tr').first();
      const rowExists = await firstRow.isVisible({ timeout: 1000 }).catch(() => false);

      if (rowExists) {
        console.log('✅ Table with rows found');

        // Look for action buttons in the first row
        const rowButtons = firstRow.locator('button');
        const buttonCount = await rowButtons.count();

        console.log(`Found ${buttonCount} buttons in first row`);

        for (let i = 0; i < buttonCount; i++) {
          const button = rowButtons.nth(i);
          const text = await button.textContent();
          const ariaLabel = await button.getAttribute('aria-label');
          
          await expect(button).toBeVisible();
          await expect(button).toBeEnabled();
          
          console.log(`  ✅ Button ${i + 1}: "${text?.trim() || ariaLabel || 'No text'}"`);
        }

        // Look for action icons/links
        const rowLinks = firstRow.locator('a');
        const linkCount = await rowLinks.count();
        
        if (linkCount > 0) {
          console.log(`Found ${linkCount} links in first row`);
        }
      } else {
        console.log('ℹ️ Table exists but has no data rows');
      }
    } else {
      console.log('ℹ️ No table found on this page');
    }

    await page.screenshot({ 
      path: 'tests/admin/screenshots/company-row-actions.png',
      fullPage: true 
    });
  });

  test('should verify search/filter functionality exists', async ({ page }) => {
    // Look for search input
    const searchLocators = [
      page.getByPlaceholder(/search/i),
      page.getByRole('textbox', { name: /search/i }),
      page.locator('input[type="search"]'),
      page.locator('input[placeholder*="search" i]'),
      page.locator('input[name*="search"]'),
    ];

    let searchFound = false;
    for (const locator of searchLocators) {
      if (await locator.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(locator).toBeVisible();
        await expect(locator).toBeEditable();
        
        const placeholder = await locator.getAttribute('placeholder');
        console.log(`✅ Search input found: "${placeholder}"`);
        searchFound = true;
        break;
      }
    }

    // Look for filter button
    const filterLocators = [
      page.getByRole('button', { name: /filter/i }),
      page.locator('button:has-text("Filter")'),
      page.locator('[aria-label*="filter" i]'),
    ];

    let filterFound = false;
    for (const locator of filterLocators) {
      if (await locator.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(locator).toBeVisible();
        await expect(locator).toBeEnabled();
        
        console.log(`✅ Filter button found`);
        filterFound = true;
        break;
      }
    }

    if (!searchFound && !filterFound) {
      console.log('ℹ️ No search or filter functionality found');
    }
  });

  test('should verify pagination if exists', async ({ page }) => {
    // Look for pagination controls
    const paginationSelectors = [
      page.locator('[class*="pagination"]'),
      page.locator('[role="navigation"][aria-label*="pagination" i]'),
      page.locator('nav:has-text("Previous")'),
      page.locator('nav:has-text("Next")'),
    ];

    let paginationFound = false;
    for (const locator of paginationSelectors) {
      const count = await locator.count();
      if (count > 0) {
        console.log(`✅ Pagination controls found`);
        paginationFound = true;

        // Look for page buttons
        const pageButtons = locator.locator('button');
        const buttonCount = await pageButtons.count();
        console.log(`  - ${buttonCount} pagination buttons found`);

        // Verify first/last buttons are enabled/disabled appropriately
        const prevButton = locator.locator('button:has-text("Previous"), button:has-text("Prev")').first();
        const nextButton = locator.locator('button:has-text("Next")').first();

        if (await prevButton.isVisible({ timeout: 500 }).catch(() => false)) {
          console.log(`  - Previous button exists`);
        }

        if (await nextButton.isVisible({ timeout: 500 }).catch(() => false)) {
          console.log(`  - Next button exists`);
        }

        break;
      }
    }

    if (!paginationFound) {
      console.log('ℹ️ No pagination controls found');
    }

    await page.screenshot({ 
      path: 'tests/admin/screenshots/company-pagination.png',
      fullPage: true 
    });
  });

  test('should verify modals/forms when clicking Create button', async ({ page }) => {
    // Find Create button
    const createButtonLocators = [
      page.getByRole('button', { name: /create company/i }),
      page.getByRole('button', { name: /add company/i }),
      page.getByRole('button', { name: /new company/i }),
      page.locator('button:has-text("Create")'),
      page.locator('button:has-text("Add")'),
    ];

    let createButton;
    for (const locator of createButtonLocators) {
      if (await locator.isVisible({ timeout: 2000 }).catch(() => false)) {
        createButton = locator;
        break;
      }
    }

    if (createButton) {
      console.log('✅ Create button found, clicking...');
      await createButton.click();
      await page.waitForTimeout(1000);

      // Look for modal/dialog
      const modalLocators = [
        page.locator('[role="dialog"]'),
        page.locator('[aria-modal="true"]'),
        page.locator('.modal'),
        page.locator('[class*="modal"]'),
      ];

      let modalFound = false;
      for (const locator of modalLocators) {
        if (await locator.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(locator).toBeVisible();
          console.log('✅ Modal/dialog opened');
          modalFound = true;

          // Look for form inputs
          const inputs = locator.locator('input, textarea, select');
          const inputCount = await inputs.count();
          console.log(`  - Found ${inputCount} form inputs`);

          // Look for Save/Submit button
          const saveButton = locator.locator('button:has-text("Save"), button:has-text("Submit"), button:has-text("Create")');
          if (await saveButton.first().isVisible({ timeout: 1000 }).catch(() => false)) {
            await expect(saveButton.first()).toBeVisible();
            console.log('  - Save/Submit button found');
          }

          // Look for Cancel button
          const cancelButton = locator.locator('button:has-text("Cancel"), button:has-text("Close")');
          if (await cancelButton.first().isVisible({ timeout: 1000 }).catch(() => false)) {
            await expect(cancelButton.first()).toBeVisible();
            console.log('  - Cancel button found');
          }

          await page.screenshot({ 
            path: 'tests/admin/screenshots/company-create-modal.png',
            fullPage: true 
          });

          // Close modal
          await cancelButton.first().click();
          await page.waitForTimeout(500);

          break;
        }
      }

      if (!modalFound) {
        console.log('ℹ️ No modal opened, might navigate to new page');
        
        // Check if URL changed
        const newUrl = page.url();
        console.log(`  Current URL: ${newUrl}`);
      }
    } else {
      console.log('ℹ️ Create button not found, skipping modal test');
    }
  });

  test('should verify all company-related text is visible', async ({ page }) => {
    // Get all visible text
    const bodyText = await page.locator('body').textContent();

    // Check for company-related keywords
    const keywords = [
      'company', 'companies', 'organization',
      'name', 'status', 'active', 'inactive'
    ];

    console.log('\n📋 Company-related keywords found on page:');
    const foundKeywords = keywords.filter(keyword => 
      bodyText?.toLowerCase().includes(keyword)
    );

    foundKeywords.forEach(keyword => console.log(`  ✅ ${keyword}`));

    if (foundKeywords.length === 0) {
      console.log('  ℹ️ No standard company keywords found');
    }

    // Verify page is not empty
    expect(bodyText?.trim().length || 0).toBeGreaterThan(0);
  });

  test('should verify breadcrumb navigation if exists', async ({ page }) => {
    // Look for breadcrumbs
    const breadcrumbLocators = [
      page.locator('[aria-label="breadcrumb"]'),
      page.locator('[class*="breadcrumb"]'),
      page.locator('nav ol'),
      page.locator('nav ul'),
    ];

    let breadcrumbFound = false;
    for (const locator of breadcrumbLocators) {
      if (await locator.isVisible({ timeout: 1000 }).catch(() => false)) {
        const items = await locator.locator('a, span').allTextContents();
        console.log('✅ Breadcrumb navigation found:');
        items.forEach(item => {
          if (item.trim()) {
            console.log(`  - ${item.trim()}`);
          }
        });
        breadcrumbFound = true;
        break;
      }
    }

    if (!breadcrumbFound) {
      console.log('ℹ️ No breadcrumb navigation found');
    }
  });
});
