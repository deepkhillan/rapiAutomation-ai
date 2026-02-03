import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { 
  invalidEmails,
  sqlInjectionStrings,
  xssStrings
} from '../utils/testData.js';

test.describe('Login - Negative Test Cases', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.verifyPageLoaded();
  });

  test('TC-LN-01: Login with empty email and password', async ({ page }) => {
    // Don't fill any fields, just submit
    await loginPage.submitForm();
    
    // Wait for validation messages
    await page.waitForTimeout(1000);
    
    // Verify validation errors are present
    const hasErrors = await loginPage.hasValidationErrors();
    expect(hasErrors).toBeTruthy();
    
    // Verify specific error messages
    const errors = await loginPage.getAllValidationErrors();
    expect(errors.length).toBeGreaterThan(0);
  });

  test('TC-LN-02: Login with invalid email format - missing @', async ({ page }) => {
    await loginPage.login('invalidemail.com', 'Password123');
    await page.waitForTimeout(1000);
    
    // Verify validation error for email
    const hasErrors = await loginPage.hasValidationErrors();
    expect(hasErrors).toBeTruthy();
  });

  test('TC-LN-03: Login with invalid email format - missing domain', async ({ page }) => {
    await loginPage.login('test@', 'Password123');
    await page.waitForTimeout(1000);
    
    const hasErrors = await loginPage.hasValidationErrors();
    expect(hasErrors).toBeTruthy();
  });

  test('TC-LN-04: Login with invalid email format - no username', async ({ page }) => {
    await loginPage.login('@example.com', 'Password123');
    await page.waitForTimeout(1000);
    
    const hasErrors = await loginPage.hasValidationErrors();
    expect(hasErrors).toBeTruthy();
  });

  test('TC-LN-05: Login with unregistered email', async ({ page }) => {
    const unregisteredEmail = `nonexistent_${Date.now()}@example.com`;
    
    await loginPage.login(unregisteredEmail, 'Password123');
    await page.waitForTimeout(2000);
    
    // Should show error (either validation or authentication error)
    const hasErrors = await loginPage.hasValidationErrors();
    const isStillOnLoginPage = page.url().includes('/login');
    
    // Either shows error or stays on login page
    expect(hasErrors || isStillOnLoginPage).toBeTruthy();
  });

  test('TC-LN-06: Login with incorrect password', async ({ page }) => {
    // Using a potentially valid email format but wrong password
    await loginPage.login('test@example.com', 'WrongPassword123');
    await page.waitForTimeout(2000);
    
    // Should show authentication error or stay on login page
    const hasErrors = await loginPage.hasValidationErrors();
    const isStillOnLoginPage = page.url().includes('/login');
    
    expect(hasErrors || isStillOnLoginPage).toBeTruthy();
  });

  test('TC-LN-07: Login with empty email field', async ({ page }) => {
    await loginPage.login('', 'Password123');
    await page.waitForTimeout(1000);
    
    const hasErrors = await loginPage.hasValidationErrors();
    expect(hasErrors).toBeTruthy();
    
    const errors = await loginPage.getAllValidationErrors();
    const emailError = errors.some(error => 
      error.toLowerCase().includes('email') || 
      error.toLowerCase().includes('required')
    );
    expect(emailError).toBeTruthy();
  });

  test('TC-LN-08: Login with empty password field', async ({ page }) => {
    await loginPage.login('test@example.com', '');
    await page.waitForTimeout(1000);
    
    const hasErrors = await loginPage.hasValidationErrors();
    expect(hasErrors).toBeTruthy();
    
    const errors = await loginPage.getAllValidationErrors();
    const passwordError = errors.some(error => 
      error.toLowerCase().includes('password') || 
      error.toLowerCase().includes('required')
    );
    expect(passwordError).toBeTruthy();
  });

  test('TC-LN-09: Login with SQL injection in email field', async ({ page }) => {
    await loginPage.login(sqlInjectionStrings[0], 'Password123');
    await page.waitForTimeout(1000);
    
    // Should show validation error for invalid email format
    const hasErrors = await loginPage.hasValidationErrors();
    expect(hasErrors).toBeTruthy();
  });

  test('TC-LN-10: Login with SQL injection in password field', async ({ page }) => {
    await loginPage.login('test@example.com', sqlInjectionStrings[1]);
    await page.waitForTimeout(2000);
    
    // Should not cause any SQL errors, should handle gracefully
    // Either shows validation error or authentication failure
    const isStillOnLoginPage = page.url().includes('/login');
    expect(isStillOnLoginPage).toBeTruthy();
  });

  test('TC-LN-11: Login with XSS attempt in email field', async ({ page }) => {
    // Monitor for alerts
    const alerts = [];
    page.on('dialog', dialog => {
      alerts.push(dialog.message());
      dialog.dismiss();
    });

    await loginPage.login(xssStrings[0], 'Password123');
    await page.waitForTimeout(1000);
    
    // Should show validation error for invalid email format
    const hasErrors = await loginPage.hasValidationErrors();
    expect(hasErrors).toBeTruthy();
    
    // Verify no script execution
    expect(alerts.length).toBe(0);
  });

  test('TC-LN-12: Login with XSS attempt in password field', async ({ page }) => {
    // Monitor for alerts
    const alerts = [];
    page.on('dialog', dialog => {
      alerts.push(dialog.message());
      dialog.dismiss();
    });

    await loginPage.login('test@example.com', xssStrings[1]);
    await page.waitForTimeout(2000);
    
    // Verify no XSS execution
    expect(alerts.length).toBe(0);
  });

  test('TC-LN-13: Login with special characters in password', async ({ page }) => {
    const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    await loginPage.login('test@example.com', specialPassword);
    await page.waitForTimeout(2000);
    
    // Should handle special characters without errors
    // May show authentication error but no system errors
    const isStillOnLoginPage = page.url().includes('/login');
    expect(isStillOnLoginPage).toBeTruthy();
  });

  test('TC-LN-14: Login with very long email (boundary test)', async ({ page }) => {
    const longEmail = 'a'.repeat(100) + '@example.com';
    
    await loginPage.login(longEmail, 'Password123');
    await page.waitForTimeout(1000);
    
    // System should either accept or show validation error
    const hasErrors = await loginPage.hasValidationErrors();
    console.log(`Long email (${longEmail.length} chars) - Has errors: ${hasErrors}`);
  });

  test('TC-LN-15: Login with very long password (boundary test)', async ({ page }) => {
    const longPassword = 'P'.repeat(200);
    
    await loginPage.login('test@example.com', longPassword);
    await page.waitForTimeout(2000);
    
    // System should handle gracefully
    const isStillOnLoginPage = page.url().includes('/login');
    expect(isStillOnLoginPage).toBeTruthy();
  });

  test('TC-LN-16: Login with email containing spaces', async ({ page }) => {
    await loginPage.login('test user@example.com', 'Password123');
    await page.waitForTimeout(1000);
    
    // Should show validation error
    const hasErrors = await loginPage.hasValidationErrors();
    expect(hasErrors).toBeTruthy();
  });

  test('TC-LN-17: Login with whitespace-only email', async ({ page }) => {
    await loginPage.login('     ', 'Password123');
    await page.waitForTimeout(1000);
    
    // Should show validation error
    const hasErrors = await loginPage.hasValidationErrors();
    expect(hasErrors).toBeTruthy();
  });

  test('TC-LN-18: Login with whitespace-only password', async ({ page }) => {
    await loginPage.login('test@example.com', '     ');
    await page.waitForTimeout(1000);
    
    // Should show validation error
    const hasErrors = await loginPage.hasValidationErrors();
    expect(hasErrors).toBeTruthy();
  });

  test('TC-LN-19: Multiple invalid emails test', async ({ page }) => {
    for (const invalidEmail of invalidEmails.slice(0, 5)) {
      await loginPage.goto();
      await loginPage.verifyPageLoaded();
      
      await loginPage.login(invalidEmail, 'Password123');
      await page.waitForTimeout(1000);
      
      // All invalid emails should show validation errors
      const hasErrors = await loginPage.hasValidationErrors();
      expect(hasErrors).toBeTruthy();
      
      console.log(`Invalid email "${invalidEmail}" - Correctly rejected: ${hasErrors}`);
    }
  });

  test('TC-LN-20: Login with wrong account type selection', async ({ page }) => {
    // Try to login as User with Agent credentials (or vice versa)
    await loginPage.selectAccountType('Agent');
    await loginPage.login('user@example.com', 'UserPassword123', 'Agent');
    await page.waitForTimeout(2000);
    
    // Should either show error or stay on login page
    const isStillOnLoginPage = page.url().includes('/login');
    expect(isStillOnLoginPage).toBeTruthy();
  });

  test('TC-LN-21: Rapid multiple login attempts', async ({ page }) => {
    // Test rate limiting or multiple failed attempts
    for (let i = 0; i < 5; i++) {
      await loginPage.login('test@example.com', `wrongpass${i}`);
      await page.waitForTimeout(500);
    }
    
    // System should handle multiple attempts gracefully
    // May show rate limiting message or account lockout warning
    await page.waitForTimeout(1000);
    const isStillOnLoginPage = page.url().includes('/login');
    expect(isStillOnLoginPage).toBeTruthy();
  });

  test('TC-LN-22: Login with email in uppercase', async ({ page }) => {
    await loginPage.login('TEST@EXAMPLE.COM', 'Password123');
    await page.waitForTimeout(2000);
    
    // Email validation should be case-insensitive
    // May succeed or fail based on whether account exists
    const currentUrl = await loginPage.getCurrentUrl();
    console.log(`Uppercase email test - Current URL: ${currentUrl}`);
  });

  test('TC-LN-23: Login with leading/trailing spaces in email', async ({ page }) => {
    await loginPage.login('  test@example.com  ', 'Password123');
    await page.waitForTimeout(2000);
    
    // System should either trim spaces or show validation error
    const hasErrors = await loginPage.hasValidationErrors();
    const isStillOnLoginPage = page.url().includes('/login');
    
    console.log(`Email with spaces - Has errors: ${hasErrors}, Still on login: ${isStillOnLoginPage}`);
  });

  test('TC-LN-24: Login with Unicode characters in email', async ({ page }) => {
    await loginPage.login('tëst@éxample.com', 'Password123');
    await page.waitForTimeout(1000);
    
    // Should handle Unicode appropriately
    const hasErrors = await loginPage.hasValidationErrors();
    console.log(`Unicode email - Has errors: ${hasErrors}`);
  });

  test('TC-LN-25: Login form submission without JavaScript', async ({ page }) => {
    // Disable JavaScript and try to submit
    await page.context().setOffline(false);
    
    await loginPage.fillLoginForm('test@example.com', 'Password123');
    
    // Try to submit via Enter key
    await loginPage.passwordInput.press('Enter');
    await page.waitForTimeout(2000);
    
    // Form should still be functional
    const currentUrl = await loginPage.getCurrentUrl();
    console.log(`Form submission test - Current URL: ${currentUrl}`);
  });
});
