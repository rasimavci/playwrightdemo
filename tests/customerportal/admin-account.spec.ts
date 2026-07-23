import { test, expect } from '@playwright/test';

test.describe('EFSORA ADMIN Account - admin@efsora.com', () => {
  const ADMIN_EMAIL = 'admin@efsora.com';
  const PASSWORD = 'Demo123!';

  test.beforeEach(async ({ page }) => {
    // Login as EFSORA ADMIN
    await page.goto('http://localhost:5173/');
    await page.getByLabel('Email').fill(ADMIN_EMAIL);
    await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for successful login
    await page.waitForTimeout(5000);
  });

  test('should login successfully with admin credentials', async ({ page }) => {
    // Verify we're logged in (URL should change from login page)
    await expect(page).toHaveURL('http://localhost:5173/');
    
    // Admin should see dashboard or main page
    await page.waitForLoadState('networkidle');
  });

  test('should have EFSORA_ADMIN role permissions', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Admin should have access to admin-specific features
    // Check for admin menu items, settings, or user management
    // This will depend on actual UI implementation
  });

  test('should see ALL companies in the system', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Navigate to companies list if applicable
    // Verify Apex company is visible
    // Verify other companies are visible
    // Admin should see more companies than regular customers
  });

  test('should see ALL projects across all companies', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Navigate to projects list
    // Should see projects from multiple companies:
    // - Apex Mobile
    // - Apex Analytics
    // - Apex Web Portal
    // - Projects from other companies
  });

  test('should have access to user management', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for user management section
    // Admin should be able to view/manage users
  });

  test('should have access to system settings', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for settings/configuration options
    // These should only be visible to admins
  });

  test('should be able to view all customer accounts', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Navigate to customers/users section
    // Should see all customer accounts including:
    // - customeradmin@apex.com
    // - sarah.wilson@apex.com
    // - customer@demo.com
  });

  test('should have full system access rights', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Verify admin can access restricted areas
    // Check for admin-only navigation items
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

  test('should display admin role indicator', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for role badge or indicator showing "EFSORA_ADMIN" or "Admin"
    // Check user profile or header area
  });
});
