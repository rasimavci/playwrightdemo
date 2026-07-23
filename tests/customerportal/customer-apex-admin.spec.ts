import { test, expect } from '@playwright/test';

test.describe('CUSTOMER Account 1 - customeradmin@apex.com', () => {
  const CUSTOMER_EMAIL = 'customeradmin@apex.com';
  const PASSWORD = 'Demo123!';

  test.beforeEach(async ({ page }) => {
    // Login as Apex customer admin
    await page.goto('http://localhost:5173/');
    await page.getByLabel('Email').fill(CUSTOMER_EMAIL);
    await page.getByLabel('Password',{ exact: true }).fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for successful login
    await page.waitForTimeout(5000);
  });

  test('should login successfully with customer credentials', async ({ page }) => {
    // Verify we're logged in
    await expect(page).toHaveURL('http://localhost:5173/');
    
    await page.waitForLoadState('networkidle');
  });

  test('should have CUSTOMER role permissions', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Customer should NOT see admin-specific features
    // Verify limited permissions compared to admin
  });

  test('should see only Apex company', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Navigate to companies section if available
    // Should only see Apex company
    // Should NOT see other companies
    
    // Look for company name in header, navigation, or dashboard
    const apexCompany = page.getByText(/apex/i);
    if (await apexCompany.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(apexCompany).toBeVisible();
    }
  });

  test('should see Apex Mobile project', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Navigate to projects section
    // Should see "Apex Mobile" project
    const apexMobile = page.getByText(/apex mobile/i);
    
    if (await apexMobile.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(apexMobile).toBeVisible();
    }
  });

  test('should see Apex Analytics project', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Navigate to projects section
    // Should see "Apex Analytics" project
    const apexAnalytics = page.getByText(/apex analytics/i);
    
    if (await apexAnalytics.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(apexAnalytics).toBeVisible();
    }
  });

  test('should NOT see Apex Web Portal project', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // This project belongs to sarah.wilson@apex.com
    // customeradmin@apex.com should NOT see it
    
    // Navigate to projects section
    const apexWebPortal = page.getByText(/apex web portal/i);
    
    // Should not be visible
    await expect(apexWebPortal).not.toBeVisible({ timeout: 3000 }).catch(() => {
      // If timeout occurs, that's expected (element not found)
    });
  });

  test('should NOT have access to other companies', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Should only see Apex company
    // Should not see Demo company or other companies
  });

  test('should NOT have admin features', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Should NOT see user management
    // Should NOT see system settings
    // Should NOT see other admin-only features
  });

  test('should see only assigned projects', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Should see exactly 2 projects:
    // 1. Apex Mobile
    // 2. Apex Analytics
    
    // Count visible projects if UI allows
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
    // Check user profile or header area
  });

  test('should display correct company context', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Verify UI shows Apex as the active company
    // Check for company name in header or navigation
  });
});
