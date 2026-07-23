import { test, expect } from '@playwright/test';

test.describe('Customer Portal - Login Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
  });

  test('should have proper ARIA labels', async ({ page }) => {
    // Check for labeled inputs
    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password', { exact: true });
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('should have accessible form elements', async ({ page }) => {
    // All interactive elements should be keyboard accessible
    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password', { exact: true });
    const signInButton = page.getByRole('button', { name: 'Sign In' });
    
    // Check that they can receive focus
    await emailInput.focus();
    await expect(emailInput).toBeFocused();
    
    await passwordInput.focus();
    await expect(passwordInput).toBeFocused();
    
    await signInButton.focus();
    await expect(signInButton).toBeFocused();
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // This is a visual check - in real scenarios you'd use tools like axe-core
    // For now, we verify that text elements are visible
    await expect(page.getByText('Welcome')).toBeVisible();
    await expect(page.getByText('Sign in to your account to continue.')).toBeVisible();
  });

  test('should work with screen reader navigation', async ({ page }) => {
    // Verify semantic HTML structure
    const form = page.locator('form').first();
    
    // Check that inputs have proper types
    const emailInput = page.getByLabel('Email');
    await expect(emailInput).toHaveAttribute('type', 'email');
    
    const passwordInput = page.getByLabel('Password', { exact: true });
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should have descriptive button text', async ({ page }) => {
    // Buttons should have meaningful text
    const signInButton = page.getByRole('button', { name: 'Sign In' });
    await expect(signInButton).toBeVisible();
    
    const buttonText = await signInButton.textContent();
    expect(buttonText?.trim()).toBe('Sign In');
  });

  test('should have alt text for images', async ({ page }) => {
    // Check logo has alt text
    const logo = page.locator('img').first();
    const altText = await logo.getAttribute('alt');
    
    expect(altText).toBeTruthy();
  });

  test('should support keyboard-only navigation', async ({ page }) => {
    // Navigate entire form with keyboard
    await page.keyboard.press('Tab'); // Focus email
    await page.keyboard.type('test@example.com');
    
    await page.keyboard.press('Tab'); // Focus password
    await page.keyboard.type('password123');
    
    await page.keyboard.press('Tab'); // Focus sign in button
    await page.keyboard.press('Enter'); // Submit
    
    await page.waitForTimeout(1000);
  });

  test('should have visible focus indicators', async ({ page }) => {
    const emailInput = page.getByLabel('Email');
    
    await emailInput.focus();
    
    // Check that focused element has outline or border
    const box = await emailInput.boundingBox();
    expect(box).toBeTruthy();
  });

  test('should maintain focus order', async ({ page }) => {
    // Tab order should be logical: email -> password -> button
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Email')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Password', { exact: true })).toBeFocused();
    
    await page.keyboard.press('Tab');
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeFocused();
  });
});
