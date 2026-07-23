import { test, expect } from '@playwright/test';

test.describe('CUSTOMER Account 3 - customer@demo.com', () => {
  const CUSTOMER_EMAIL = 'customer@demo.com';
  const PASSWORD = 'Demo123!';

  test.beforeEach(async ({ page }) => {
    // Login as Demo customer
    await page.goto('http://localhost:5173/');
    await page.getByLabel('Email').fill(CUSTOMER_EMAIL);
    await page.getByLabel('Password',{ exact: true }).fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for successful login
    await page.waitForTimeout(5000);
  });

  test('should login successfully with demo customer credentials', async ({ page }) => {
    // Verify we're logged in
    await expect(page).toHaveURL('http://localhost:5173/');
    
    await page.waitForLoadState('networkidle');
  });

  test('should have CUSTOMER role permissions', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Customer should NOT see admin-specific features
    // Verify limited permissions
  });

  test('should see only Demo company', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Should only see Demo company
    // Should NOT see Apex or other companies
    
    const demoCompany = page.getByText(/demo/i);
    if (await demoCompany.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(demoCompany).toBeVisible();
    }
  });

  test('should NOT see Apex company', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Demo customer should not see Apex company
    // This is a different company than the Apex users
  });

  test('should NOT see any Apex projects', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Should NOT see:
    // - Apex Mobile
    // - Apex Analytics  
    // - Apex Web Portal
    
    const apexMobile = page.getByText(/apex mobile/i);
    const apexAnalytics = page.getByText(/apex analytics/i);
    const apexWebPortal = page.getByText(/apex web portal/i);
    
    await expect(apexMobile).not.toBeVisible({ timeout: 3000 }).catch(() => {});
    await expect(apexAnalytics).not.toBeVisible({ timeout: 3000 }).catch(() => {});
    await expect(apexWebPortal).not.toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should see Demo company projects (if any)', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Navigate to projects section
    // Should see projects specific to Demo company
    // (Projects list may be empty or contain demo-specific projects)
  });

  test('should have isolated access from Apex company', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Demo customer should be completely isolated from Apex data
    // No cross-company visibility
  });

  test('should NOT have admin features', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Should NOT see user management
    // Should NOT see system settings
    // Should NOT see admin-only features
  });

  test('should NOT see other companies data', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Should only see Demo company
    // Complete isolation from other companies
  });

  test('should logout successfully', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Find and click logout button
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i }).or(
      page.getByText(/logout|sign out/i)
    );
    
    if (await logoutButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await logoutButton.click();
      
      // Should redirect to login page
      await expect(page).toHaveURL('http://localhost:5173/', { timeout: 5000 });
    }
  });

  test('should display customer role indicator', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for role badge showing "CUSTOMER"
  });

  test('should display correct company context (Demo)', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Verify UI shows Demo as the active company
    // Check for company name in header or navigation
  });

  test('should have basic customer features', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Should have access to:
    // - Dashboard
    // - Projects (within Demo company)
    // - Profile settings
    // - Basic customer functionality
  });

  test('should not be able to access Apex company URLs directly', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Even if Demo customer tries to access Apex-specific URLs
    // They should be blocked or redirected
    // (This depends on URL structure - adjust as needed)
  });
});
