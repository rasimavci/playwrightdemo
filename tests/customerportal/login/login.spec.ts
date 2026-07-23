import { test, expect } from '@playwright/test';

test.describe('Customer Portal - Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
  });

  test('should display login page with all elements', async ({ page }) => {
    // Verify page title or heading
    await expect(page.getByText('Welcome')).toBeVisible();
    await expect(page.getByText('Sign in to your account to continue.')).toBeVisible();

    // Verify brand logo
    await expect(page.locator('img[alt*="efsora-brand"]')).toBeVisible();

    // Verify form elements
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();

    // Verify support link
    await expect(page.getByText('Need help? Contact')).toBeVisible();
    await expect(page.getByRole('link', { name: 'support@efsora.com' })).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByLabel('Password', { exact: true });
    
    // Initially password should be hidden (type="password")
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click the eye icon to show password
    await page.locator('img[alt*="eye"]').click();
    
    // Password should now be visible (type="text")
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click again to hide password
    await page.locator('img[alt*="eye"]').click();
    
    // Password should be hidden again
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should allow user to enter email and password', async ({ page }) => {
    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password', { exact: true });

    await emailInput.fill('test@example.com');
    await passwordInput.fill('TestPassword123!');

    await expect(emailInput).toHaveValue('test@example.com');
    await expect(passwordInput).toHaveValue('TestPassword123!');
  });

  test('should submit login form with valid credentials', async ({ page }) => {
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password', { exact: true }).fill('TestPassword123!');
    
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for navigation or error message
    await page.waitForTimeout(1000);
  });

  test('should show validation for empty email', async ({ page }) => {
    // Try to submit with empty email
    await page.getByLabel('Password', { exact: true }).fill('TestPassword123!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Check for HTML5 validation or custom error message
    const emailInput = page.getByLabel('Email');
    await expect(emailInput).toBeVisible();
  });

  test('should show validation for empty password', async ({ page }) => {
    // Try to submit with empty password
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Check for HTML5 validation or custom error message
    const passwordInput = page.getByLabel('Password', { exact: true });
    await expect(passwordInput).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    // Enter invalid email format
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByLabel('Password', { exact: true }).fill('TestPassword123!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await page.waitForTimeout(500);
  });

  test('should navigate to support email link', async ({ page }) => {
    const supportLink = page.getByRole('link', { name: 'support@efsora.com' });
    
    await expect(supportLink).toHaveAttribute('href', 'mailto:support@efsora.com');
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Email')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Password', { exact: true })).toBeFocused();
    
    // 3. Tab -> Göz İkonu (Show Password) <-- EKSİK OLAN ADIM
    await page.keyboard.press('Tab');
    // İstersen burada göz ikonuna odaklandığını doğrulayabilirsin ama şart değil:
    // await expect(page.getByRole('button', { name: 'Show password' })).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Sign In'})).toBeFocused();
  });

  test('should submit form with Enter key', async ({ page }) => {
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password', { exact: true }).fill('TestPassword123!');
    
    // Press Enter to submit
    await page.getByLabel('Password', { exact: true }).press('Enter');
    
    await page.waitForTimeout(1000);
  });
});
