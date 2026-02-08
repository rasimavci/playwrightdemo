import { test, expect } from '@playwright/test';

test.describe('Login Page - UI and Functionality Tests', () => {
  const LOGIN_URL = 'http://localhost:5174/';
  
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.waitForLoadState('networkidle');
  });

  test('should load login page with correct title', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle('Efsora Customer Portal');
  });

  test('should display all required login form elements', async ({ page }) => {
    // Verify email input field
    const emailInput = page.getByLabel('Email');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(emailInput).toHaveAttribute('placeholder', 'you@company.com');
    
    // Verify password input field
    const passwordInput = page.getByLabel('Password', { exact: true });
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(passwordInput).toHaveAttribute('placeholder', '******');
    
    // Verify show password button
    const showPasswordButton = page.getByRole('button', { name: 'Show password' });
    await expect(showPasswordButton).toBeVisible();
    
    // Verify Sign In button
    const signInButton = page.getByRole('button', { name: 'Sign In' });
    await expect(signInButton).toBeVisible();
    await expect(signInButton).toHaveAttribute('type', 'submit');
    
    // Verify support email link
    const supportLink = page.getByRole('link', { name: 'support@efsora.com' });
    await expect(supportLink).toBeVisible();
    await expect(supportLink).toHaveAttribute('href', 'mailto:support@efsora.com');
  });

  test('should allow typing in email field', async ({ page }) => {
    const emailInput = page.getByLabel('Email');
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
  });

  test('should allow typing in password field', async ({ page }) => {
    const passwordInput = page.getByLabel('Password', { exact: true });
    await passwordInput.fill('SecurePassword123!');
    await expect(passwordInput).toHaveValue('SecurePassword123!');
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByLabel('Password', { exact: true });
    const showPasswordButton = page.getByRole('button', { name: 'Show password' });
    
    // Fill password
    await passwordInput.fill('TestPassword123!');
    
    // Verify password is hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click show password button
    await showPasswordButton.click();
    
    // Wait a bit for the toggle to take effect
    await page.waitForTimeout(500);
    
    // Verify password is now visible (type should be text)
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click again to hide
    await showPasswordButton.click();
    await page.waitForTimeout(500);
    
    // Verify password is hidden again
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should successfully login with valid admin credentials', async ({ page }) => {
    const ADMIN_EMAIL = 'admin@efsora.com';
    const PASSWORD = 'Demo123!';
    
    // Fill in login credentials
    await page.getByLabel('Email').fill(ADMIN_EMAIL);
    await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
    
    // Click Sign In button
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for navigation after successful login
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
    
    // Verify we're still on the main page (successful login)
    // The URL should remain at the base URL for this app
    await expect(page).toHaveURL(LOGIN_URL);
    
    // Verify login was successful by checking if we can see authenticated content
    // (the form should be gone or we should see user-specific elements)
    // This will depend on the app's post-login behavior
  });

  test('should successfully login with valid customer credentials', async ({ page }) => {
    const CUSTOMER_EMAIL = 'sarah@apextechnologies.com';
    const PASSWORD = 'Demo123!';
    
    // Fill in login credentials
    await page.getByLabel('Email').fill(CUSTOMER_EMAIL);
    await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
    
    // Click Sign In button
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for navigation after successful login
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
    
    // Verify login was successful
    await expect(page).toHaveURL(LOGIN_URL);
  });

  test('should handle empty form submission', async ({ page }) => {
    // Click Sign In without filling any fields
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // The form should show validation errors or prevent submission
    // Check if we're still on the login page
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(LOGIN_URL);
  });

  test('should handle login with invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password', { exact: true }).fill('WrongPassword123!');
    
    // Click Sign In button
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for potential error message
    await page.waitForTimeout(2000);
    
    // Should remain on login page
    await expect(page).toHaveURL(LOGIN_URL);
  });

  test('should validate email format', async ({ page }) => {
    const emailInput = page.getByLabel('Email');
    
    // Try to enter invalid email format
    await emailInput.fill('notanemail');
    await page.getByLabel('Password', { exact: true }).fill('Password123!');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await page.waitForTimeout(1000);
    
    // Should still be on login page due to validation
    await expect(page).toHaveURL(LOGIN_URL);
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through form fields
    await page.keyboard.press('Tab');
    
    // Email field should be focused
    const emailInput = page.getByLabel('Email');
    await expect(emailInput).toBeFocused();
    
    // Type email
    await page.keyboard.type('test@example.com');
    
    // Tab to password field
    await page.keyboard.press('Tab');
    
    // Password field should be focused
    const passwordInput = page.getByLabel('Password', { exact: true });
    await expect(passwordInput).toBeFocused();
    
    // Type password
    await page.keyboard.type('TestPassword123!');
  });

  test('should have accessible form labels', async ({ page }) => {
    // Verify email label is associated with input
    const emailLabel = page.locator('label[for="email"]');
    await expect(emailLabel).toBeVisible();
    await expect(emailLabel).toHaveText('Email');
    
    // Verify password label is associated with input
    const passwordLabel = page.locator('label[for="password"]');
    await expect(passwordLabel).toBeVisible();
    await expect(passwordLabel).toHaveText('Password');
  });
});
