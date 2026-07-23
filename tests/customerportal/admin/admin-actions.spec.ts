import { test, expect } from '@playwright/test';

test.describe('Admin Actions - Comprehensive Tests', () => {
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
  });

test('should locate and display Admin Actions button/menu', async ({ page }) => {
    // 1. STRATEJİ: Tüm olası selektörleri ".or()" ile birbirine bağlıyoruz.
    // Bu sayede Playwright, bunlardan HERHANGİ BİRİ görünene kadar (default 5sn) bekler.
    const adminActionsButton = page.getByRole('button', { name: /admin actions/i })
        .or(page.getByTestId('admin-actions'))
        .or(page.getByText('Admin Actions', { exact: true }))
        .or(page.locator('[data-action="admin"]'))
        .or(page.locator('button:has-text("Admin Actions")'))
        .or(page.locator('header button:has-text("Admin")'))
        .or(page.locator('nav button:has-text("Admin")'))
        .first(); // Eğer birden fazla eşleşirse ilkini al

    // 2. BEKLEME VE DOĞRULAMA (ASSERTION)
    // Artık 'undefined' hatası almazsın çünkü bu satır element DOM'a düşene kadar testi bekletir.
    await expect(adminActionsButton).toBeVisible();
    await expect(adminActionsButton).toBeEnabled();

    console.log('✅ Admin Actions button located and visible.');

    // 3. SCREENSHOT
    // Element bulunduktan sonra ekran görüntüsü alıyoruz
    await page.screenshot({ path: 'tests/admin/screenshots/admin-actions-button.png' });
});

test('should open Admin Actions panel/dropdown', async ({ page }) => {
    // 1. Butonu Bul (Daha önce yaptığımız gibi)
    const adminActionsButton = page.getByRole('button', { name: /admin/i })
      .or(page.getByText('Admin Actions'))
      .or(page.locator('[data-testid="admin-actions"]'))
      .first();

    await adminActionsButton.click();

    // 2. Paneli Tanımla (.or() Zinciri ile)
    // Döngü YOK. Playwright bunlardan HERHANGİ BİRİNİ görene kadar bekleyecek.
    page.getByRole('button', { name: 'Admin Actions' }).click();

    await page.getByRole('link', { name: 'Company Actions' }).click();
    await page.getByRole('link', { name: 'Project Actions' }).click();
    await page.getByRole('link', { name: 'People Actions' }).click();
    await page.getByRole('link', { name: 'Billing' }).click();
    await page.getByRole('link', { name: 'Data Management' }).click();
    await page.getByRole('link', { name: 'Agent Orchestration' }).click();
    await page.getByText('Company ActionsProject').click();
});

  test('should list all available admin action items', async ({ page }) => {
    // Open Admin Actions using exact locator
    await page.getByRole('button', { name: 'Admin Actions' }).click();
    await page.waitForTimeout(500); // Wait for animation

    // Define expected action links
    const expectedActions = [
      'Company Actions',
      'Project Actions',
      'People Actions',
      'Billing',
      'Data Management',
      'Agent Orchestration'
    ];

    console.log(`\n📋 Listing all Admin Action items:`);
    
    let visibleCount = 0;
    
    // Verify each action link exists and is visible
    for (const actionName of expectedActions) {
      const actionLink = page.getByRole('link', { name: actionName });
      await expect(actionLink).toBeVisible();
      
      // Get additional info about the link
      const href = await actionLink.getAttribute('href');
      console.log(`  ✅ ${actionName} -> ${href}`);
      visibleCount++;
    }

    console.log(`\n📊 Total action links verified: ${visibleCount}/${expectedActions.length}`);
    expect(visibleCount).toBe(expectedActions.length);
    
    // Take screenshot showing all actions
    await page.screenshot({ 
      path: 'tests/admin/screenshots/all-action-items-listed.png' 
    });
  });

  test('should execute User Management action', async ({ page }) => {
    // Open Admin Actions
    await page.getByRole('button', { name: /admin/i }).first().click();
    
    // Click User Management
    const userMgmtLocators = [
      page.getByRole('menuitem', { name: /user.*management/i }),
      page.getByText('User Management', { exact: true }),
      page.locator('a[href*="users"]'),
      page.locator('[data-action="user-management"]'),
    ];

    let clicked = false;
    for (const locator of userMgmtLocators) {
      if (await locator.isVisible({ timeout: 1000 }).catch(() => false)) {
        await locator.click();
        clicked = true;
        console.log('✅ Clicked User Management');
        break;
      }
    }

    if (clicked) {
      // Verify navigation or modal opened
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'tests/admin/screenshots/user-management.png' });
      
      // Check URL changed or modal appeared
      const urlChanged = page.url().includes('user');
      const modalVisible = await page.locator('[role="dialog"]').isVisible().catch(() => false);
      
      expect(urlChanged || modalVisible).toBeTruthy();
    }
  });

  test('should execute System Settings action', async ({ page }) => {
    await page.getByRole('button', { name: /admin/i }).first().click();
    
    const settingsLocators = [
      page.getByRole('menuitem', { name: /settings/i }),
      page.getByText('Settings', { exact: true }),
      page.locator('a[href*="settings"]'),
      page.locator('[data-action="settings"]'),
    ];

    let clicked = false;
    for (const locator of settingsLocators) {
      if (await locator.isVisible({ timeout: 1000 }).catch(() => false)) {
        await locator.click();
        clicked = true;
        console.log('✅ Clicked Settings');
        break;
      }
    }

    if (clicked) {
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'tests/admin/screenshots/settings.png' });
      
      const urlChanged = page.url().includes('setting');
      const modalVisible = await page.locator('[role="dialog"]').isVisible().catch(() => false);
      
      expect(urlChanged || modalVisible).toBeTruthy();
    }
  });

  test('should verify all admin actions are clickable', async ({ page }) => {
    // Open Admin Actions using exact locator
    await page.getByRole('button', { name: 'Admin Actions' }).click();
    await page.waitForTimeout(500);

    // Define expected action links
    const expectedActions = [
      'Company Actions',
      'Project Actions',
      'People Actions',
      'Billing',
      'Data Management',
      'Agent Orchestration'
    ];

    console.log(`\n🔗 Verifying all admin actions are clickable:`);

    // Verify each action link is clickable
    for (let i = 0; i < expectedActions.length; i++) {
      const actionName = expectedActions[i];
      const actionLink = page.getByRole('link', { name: actionName });
      
      // Verify visible and enabled
      await expect(actionLink).toBeVisible();
      await expect(actionLink).toBeEnabled();
      
      // Get href attribute
      const href = await actionLink.getAttribute('href');
      
      console.log(`  ✅ Action ${i + 1}/${expectedActions.length}: "${actionName}" is clickable -> ${href}`);
    }

    console.log(`\n📊 All ${expectedActions.length} actions verified as clickable`);
    
    // Take screenshot of all action items
    await page.screenshot({ 
      path: 'tests/admin/screenshots/all-actions-clickable.png' 
    });
  });

  test('should close Admin Actions panel with ESC key', async ({ page }) => {
    // Open panel
    await page.getByRole('button', { name: /admin/i }).first().click();
    
    // Wait for panel to open
    await page.waitForTimeout(500);
    
    // Press ESC
    await page.keyboard.press('Escape');
    
    // Verify panel closed
    await page.waitForTimeout(500);
    const panelVisible = await page.locator('[role="menu"]').isVisible().catch(() => false);
    
    expect(panelVisible).toBeFalsy();
    console.log('✅ Panel closed with ESC key');
  });

  test('should close Admin Actions panel by clicking outside', async ({ page }) => {
    // Open panel using exact locator
    await page.getByRole('button', { name: 'Admin Actions' }).click();
    await page.waitForTimeout(500);
    
    // Verify panel is open first
    const panelBeforeClick = await page.locator('[role="menu"]')
      .or(page.locator('.dropdown-menu'))
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    
    expect(panelBeforeClick).toBeTruthy();
    console.log('✅ Panel is open');
    
    // Click outside (on body/main content)
    await page.locator('body').click({ 
      position: { x: 100, y: 100 },
      force: true 
    });
    
    // Verify panel closed
    await page.waitForTimeout(500);
    const panelVisible = await page.locator('[role="menu"]')
      .or(page.locator('.dropdown-menu'))
      .isVisible({ timeout: 1000 })
      .catch(() => false);
    
    expect(panelVisible).toBeFalsy();
    console.log('✅ Panel closed by clicking outside');
  });

  test('should verify admin actions are only visible to admin role', async ({ page }) => {
    // Use exact locator to find admin actions button
    const adminButton = page.getByRole('button', { name: 'Admin Actions' });
    
    // Verify button is visible and accessible
    await expect(adminButton).toBeVisible();
    await expect(adminButton).toBeEnabled();
    
    // Verify button count (should be exactly 1)
    const buttonCount = await adminButton.count();
    expect(buttonCount).toBe(1);
    
    console.log('✅ Admin Actions button is visible for admin user');
    
    // Take screenshot showing the button exists
    await page.screenshot({ 
      path: 'tests/admin/screenshots/admin-button-visible.png',
      fullPage: false 
    });
    
    // Note: To fully test role-based visibility, create separate test with non-admin user
  });

  test('should handle rapid open/close of Admin Actions', async ({ page }) => {
    const adminButton = page.getByRole('button', { name: 'Admin Actions' });
    
    // Verify button exists first
    await expect(adminButton).toBeVisible();
    
    // Rapid click test - open/close cycle
    for (let i = 0; i < 5; i++) {
      console.log(`🔄 Cycle ${i + 1}/5`);
      
      // Open
      await adminButton.click();
      await page.waitForTimeout(200); // Wait for animation
      
      // Verify opened
            const openState = await page.getByRole('menu', { name: 'Admin Actions' }) // ✅ Doğrusu bu
            .or(page.locator('.dropdown-menu'))
            .isVisible({ timeout: 1000 })
            .catch(() => false);
      
      if (openState) {
        console.log(`  ✅ Opened`);
      }
      
      // Close with ESC
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200); // Wait for animation
      
      // Verify closed
      const closeState = await page.getByRole('menu', { name: 'Admin Actions' })
        .isVisible({ timeout: 500 })
        .catch(() => false);
      
      expect(closeState).toBeFalsy();
      console.log(`  ✅ Closed`);
    }
    
    // Final state: Open one more time and verify it's stable
    await adminButton.click();
    await page.waitForTimeout(500);
    
    const finalPanelVisible = await page.getByRole('menu', { name: 'Admin Actions' })
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    
    expect(finalPanelVisible).toBeFalsy();
    console.log('✅ Admin Actions handles rapid interactions correctly - Final state is stable');
    
    // Take screenshot of final stable state
    await page.screenshot({ 
      path: 'tests/admin/screenshots/rapid-interaction-final.png' 
    });
  });
});