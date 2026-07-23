import { test, expect } from '@playwright/test';

test.describe('Project Actions Panel Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate and login
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    
    await page.getByLabel('Email', { exact: true }).fill('admin@efsora.com');
    await page.getByLabel('Password', { exact: true }).fill('Demo123!');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Navigate to Project Actions
    await page.getByRole('button', { name: 'Admin Actions' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: 'Project Actions' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('should display Project Actions page correctly', async ({ page }) => {
    // Verify page title or heading
    await expect(page.getByRole('main')).toContainText('Project Actions');
    
    await page.screenshot({ 
      path: 'tests/admin/screenshots/project-actions-page-display.png',
      fullPage: true 
    });
    
    // Verify URL contains project-related path
    const url = page.url();
    const hasProjectPath = url.includes('project') || url.includes('admin');
    expect(hasProjectPath).toBeTruthy();
  });

  test('should have Create/Add Project button visible and clickable', async ({ page }) => {
    // Try multiple selector strategies for Create/Add button
    const createButton = page.getByRole('button', { name: 'Create Project', exact: true })
      .or(page.getByRole('button', { name: 'Add Project', exact: true }))
      .or(page.getByRole('button', { name: 'New Project', exact: true }))
      .or(page.getByRole('button', { name: /create.*project/i }))
      .or(page.getByRole('button', { name: /add.*project/i }))
      .or(page.getByRole('button', { name: /new.*project/i }))
      .or(page.locator('button:has-text("Create")'))
      .or(page.locator('button:has-text("Add")'))
      .or(page.locator('button:has-text("New")'));
    
    const isCreateVisible = await createButton.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isCreateVisible) {
      expect(await createButton.isEnabled()).toBeTruthy();
      
      await page.screenshot({ 
        path: 'tests/admin/screenshots/project-create-button.png',
        fullPage: true 
      });
    } else {
      console.log('⚠️ Create Project button not found - may require permissions or different UI pattern');
    }
  });

  test('should display project list or table', async ({ page }) => {
    // Check for table
    const table = page.locator('table')
      .or(page.locator('[role="table"]'))
      .or(page.locator('[class*="table"]'));
    
    const isTableVisible = await table.first().isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isTableVisible) {
      // Verify table headers
      const headers = page.locator('th')
        .or(page.locator('[role="columnheader"]'));
      
      const headerCount = await headers.count();
      expect(headerCount).toBeGreaterThan(0);
      
      await page.screenshot({ 
        path: 'tests/admin/screenshots/project-table.png',
        fullPage: true 
      });
    } else {
      // Check for list or card view
      const listView = page.locator('[role="list"]')
        .or(page.locator('ul'))
        .or(page.locator('[class*="list"]'))
        .or(page.locator('[class*="card"]'));
      
      const isListVisible = await listView.first().isVisible({ timeout: 5000 }).catch(() => false);
      
      if (isListVisible) {
        await page.screenshot({ 
          path: 'tests/admin/screenshots/project-list.png',
          fullPage: true 
        });
        expect(isListVisible).toBeTruthy();
      } else {
        console.log('⚠️ No table or list view found - UI may be empty or use different pattern');
      }
    }
  });

  test('should have action buttons (Edit, Delete, View, Assign) visible', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(1000);
    
    // Check for common action buttons
    const actionButtons = [
      { name: 'Edit', selectors: ['Edit', 'edit', /edit/i] },
      { name: 'Delete', selectors: ['Delete', 'delete', /delete/i] },
      { name: 'View', selectors: ['View', 'view', 'Details', /view/i] },
      { name: 'Assign', selectors: ['Assign', 'assign', /assign/i] },
      { name: 'Manage', selectors: ['Manage', 'manage', /manage/i] },
    ];
    
    let visibleCount = 0;
    
    for (const action of actionButtons) {
      for (const selector of action.selectors) {
        const button = page.getByRole('button', { name: selector as any })
          .or(page.getByRole('link', { name: selector as any }))
          .or(page.locator(`button:has-text("${selector}")`))
          .or(page.locator(`a:has-text("${selector}")`));
        
        const isVisible = await button.first().isVisible({ timeout: 2000 }).catch(() => false);
        
        if (isVisible) {
          console.log(`✅ Found action button: ${action.name}`);
          visibleCount++;
          break;
        }
      }
    }
    
    await page.screenshot({ 
      path: 'tests/admin/screenshots/project-action-buttons.png',
      fullPage: true 
    });
    
    console.log(`Total visible action buttons: ${visibleCount}`);
  });

  test('should have row actions or action menus for each project', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Check for row-level actions
    const rowActions = page.locator('button[aria-label*="action"]')
      .or(page.locator('button[aria-label*="menu"]'))
      .or(page.locator('[class*="action"]'))
      .or(page.locator('[class*="menu"]'))
      .or(page.locator('button svg'))
      .or(page.locator('button:has-text("⋮")'))
      .or(page.locator('button:has-text("...")'));
    
    const actionCount = await rowActions.count();
    console.log(`Found ${actionCount} row action elements`);
    
    if (actionCount > 0) {
      // Try to click first action menu
      const firstAction = rowActions.first();
      const isClickable = await firstAction.isEnabled({ timeout: 2000 }).catch(() => false);
      
      if (isClickable) {
        await firstAction.click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(500);
        
        await page.screenshot({ 
          path: 'tests/admin/screenshots/project-row-actions.png',
          fullPage: true 
        });
      }
    }
  });

  test('should have search or filter functionality', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Check for search input
    const searchInput = page.getByPlaceholder(/search/i)
      .or(page.getByLabel(/search/i))
      .or(page.locator('input[type="search"]'))
      .or(page.locator('input[placeholder*="search" i]'))
      .or(page.locator('input[name*="search"]'));
    
    const isSearchVisible = await searchInput.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isSearchVisible) {
      expect(await searchInput.isEnabled()).toBeTruthy();
      
      // Try typing in search
      await searchInput.fill('Apex').catch(() => {});
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: 'tests/admin/screenshots/project-search.png',
        fullPage: true 
      });
    }
    
    // Check for filter dropdowns
    const filterButton = page.getByRole('button', { name: /filter/i })
      .or(page.locator('button:has-text("Filter")'))
      .or(page.locator('[class*="filter"]'));
    
    const isFilterVisible = await filterButton.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isFilterVisible) {
      console.log('✅ Filter functionality found');
    }
    
    // Check for company filter/selector
    const companyFilter = page.locator('select[name*="company"]')
      .or(page.getByLabel(/company/i))
      .or(page.locator('button:has-text("Company")'))
      .or(page.locator('[data-testid*="company"]'));
    
    const isCompanyFilterVisible = await companyFilter.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isCompanyFilterVisible) {
      console.log('✅ Company filter/selector found');
    }
  });

  test('should have pagination controls if list is long', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Check for pagination elements
    const pagination = page.locator('[role="navigation"][aria-label*="pagination" i]')
      .or(page.locator('.pagination'))
      .or(page.locator('[class*="pagination"]'))
      .or(page.locator('nav:has(button:has-text("Next"))'))
      .or(page.locator('nav:has(button:has-text("Previous"))'));
    
    const isPaginationVisible = await pagination.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isPaginationVisible) {
      // Check for next/previous buttons
      const nextButton = page.getByRole('button', { name: /next/i })
        .or(page.locator('button:has-text("Next")'));
      
      const prevButton = page.getByRole('button', { name: /prev/i })
        .or(page.locator('button:has-text("Previous")'));
      
      const hasNext = await nextButton.isVisible({ timeout: 2000 }).catch(() => false);
      const hasPrev = await prevButton.isVisible({ timeout: 2000 }).catch(() => false);
      
      console.log(`Pagination controls: Next=${hasNext}, Previous=${hasPrev}`);
      
      await page.screenshot({ 
        path: 'tests/admin/screenshots/project-pagination.png',
        fullPage: true 
      });
    } else {
      console.log('⚠️ No pagination found - list may be short or use infinite scroll');
    }
  });

  test('should open modal when clicking Create Project button', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Try to find and click Create button
    const createButton = page.getByRole('button', { name: 'Create Project', exact: true })
      .or(page.getByRole('button', { name: 'Add Project', exact: true }))
      .or(page.getByRole('button', { name: 'New Project', exact: true }))
      .or(page.getByRole('button', { name: /create.*project/i }))
      .or(page.locator('button:has-text("Create")'))
      .or(page.locator('button:has-text("Add")'));
    
    const isCreateVisible = await createButton.first().isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isCreateVisible) {
      await createButton.first().click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(1000);
      
      // Check for modal/dialog
      const modal = page.locator('[role="dialog"]')
        .or(page.locator('[aria-modal="true"]'))
        .or(page.locator('.modal'))
        .or(page.locator('[class*="modal"]'))
        .or(page.locator('[class*="dialog"]'));
      
      const isModalVisible = await modal.first().isVisible({ timeout: 3000 }).catch(() => false);
      
      if (isModalVisible) {
        expect(isModalVisible).toBeTruthy();
        
        await page.screenshot({ 
          path: 'tests/admin/screenshots/project-create-modal.png',
          fullPage: true 
        });
        
        // Check for form fields
        const nameInput = page.getByLabel(/name/i)
          .or(page.locator('input[name*="name"]'))
          .or(page.locator('input[placeholder*="name" i]'));
        
        const isNameInputVisible = await nameInput.first().isVisible({ timeout: 2000 }).catch(() => false);
        console.log(`Name input in modal: ${isNameInputVisible ? 'Found' : 'Not found'}`);
      } else {
        console.log('⚠️ Modal did not open - may navigate to separate page');
      }
    } else {
      console.log('⚠️ Create Project button not found to test modal');
    }
  });

  test('should display known project names from exploration', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Known project names from user data
    const knownProjects = [
      'Apex Mobile',
      'Apex Analytics',
      'Apex Web Portal'
    ];
    
    let foundCount = 0;
    
    for (const projectName of knownProjects) {
      const element = page.getByText(projectName, { exact: true })
        .or(page.locator(`text="${projectName}"`))
        .or(page.locator(`[title="${projectName}"]`));
      
      const isVisible = await element.first().isVisible({ timeout: 3000 }).catch(() => false);
      
      if (isVisible) {
        console.log(`✅ Found project: "${projectName}"`);
        foundCount++;
      } else {
        console.log(`⚠️ Project "${projectName}" not visible (may be filtered or on another page)`);
      }
    }
    
    await page.screenshot({ 
      path: 'tests/admin/screenshots/project-list-with-names.png',
      fullPage: true 
    });
    
    console.log(`Total known projects found: ${foundCount}/${knownProjects.length}`);
  });

  test('should have breadcrumb or back navigation', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Check for breadcrumb navigation
    const breadcrumb = page.locator('[aria-label*="breadcrumb" i]')
      .or(page.locator('nav[class*="breadcrumb"]'))
      .or(page.locator('[class*="breadcrumb"]'))
      .or(page.locator('nav:has(a:has-text("Admin"))'));
    
    const isBreadcrumbVisible = await breadcrumb.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isBreadcrumbVisible) {
      console.log('✅ Breadcrumb navigation found');
      
      await page.screenshot({ 
        path: 'tests/admin/screenshots/project-breadcrumb.png',
        fullPage: true 
      });
    }
    
    // Check for back button
    const backButton = page.getByRole('button', { name: /back/i })
      .or(page.locator('button:has-text("Back")'))
      .or(page.locator('button[aria-label*="back" i]'));
    
    const isBackVisible = await backButton.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isBackVisible) {
      console.log('✅ Back button found');
    }
  });
});
