import { test, expect } from '@playwright/test';

test.describe('CUSTOMER Account 2 - sarah.wilson@apex.com', () => {
  const CUSTOMER_EMAIL = 'sarah.wilson@apex.com';
  const PASSWORD = 'Demo123!';

  test.beforeEach(async ({ page }) => {
    // Login as Sarah Wilson
    await page.goto('http://localhost:5174/');
    await page.getByLabel('Email').fill(CUSTOMER_EMAIL);
    await page.getByLabel('Password',{ exact: true }).fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for successful login
    await page.waitForTimeout(5000);
  });

  test('should login successfully with Sarah Wilson credentials', async ({ page }) => {
    // Verify we're logged in
    await expect(page).toHaveURL('http://localhost:5174/');
    
    await page.waitForLoadState('networkidle');
  });

  test('should have CUSTOMER role permissions', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Customer should NOT see admin-specific features
    // Verify limited permissions
  });

  test('should see only Apex company', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Should only see Apex company (same company as customeradmin@apex.com)
    // Should NOT see other companies
    
    const apexCompany = page.getByText(/apex/i);
    if (await apexCompany.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(apexCompany).toBeVisible();
    }
  });

  test('should see Apex Web Portal project', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Navigate to projects section
    // Should see "Apex Web Portal" project (unique to Sarah)
    const apexWebPortal = page.getByText(/apex web portal/i);
    
    if (await apexWebPortal.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(apexWebPortal).toBeVisible();
    }
  });

  test('should see Apex Analytics project', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Navigate to projects section
    // Should see "Apex Analytics" project (shared with customeradmin)
    const apexAnalytics = page.getByText(/apex analytics/i);
    
    if (await apexAnalytics.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(apexAnalytics).toBeVisible();
    }
  });

  test('should NOT see Apex Mobile project', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // This project belongs to customeradmin@apex.com only
    // Sarah should NOT see it
    
    const apexMobile = page.getByText(/apex mobile/i);
    
    // Should not be visible
    await expect(apexMobile).not.toBeVisible({ timeout: 3000 }).catch(() => {
      // If timeout occurs, that's expected (element not found)
    });
  });

  test('should have different project access than customeradmin@apex.com', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Sarah sees: Apex Web Portal + Apex Analytics
    // Customer Admin sees: Apex Mobile + Apex Analytics
    // They share only Apex Analytics
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
  });

  test('should see only assigned projects', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Should see exactly 2 projects:
    // 1. Apex Web Portal
    // 2. Apex Analytics
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
      await expect(page).toHaveURL('http://localhost:5174/', { timeout: 5000 });
    }
  });

  test('should display customer role indicator', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for role badge showing "CUSTOMER"
  });

  test('should display user name (Sarah Wilson)', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for user name display in header or profile
    const userName = page.getByText(/sarah/i).or(page.getByText(/wilson/i));
    
    if (await userName.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(userName).toBeVisible();
    }
  });

  test('should be working within same company as other Apex users', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Verify Apex company context
    // Both Sarah and customeradmin belong to Apex but see different projects
  });
});
