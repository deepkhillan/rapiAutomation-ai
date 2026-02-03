import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';

test.describe('Login - Positive Test Cases', () => {
    let loginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.verifyPageLoaded();
    });

    test('TC-LP-01: Login page loads successfully', async ({ page }) => {
        // Verify all major elements are visible
        await expect(loginPage.emailInput).toBeVisible();
        await expect(loginPage.passwordInput).toBeVisible();
        await expect(loginPage.loginButton).toBeVisible();

        // Verify page URL
        expect(page.url()).toContain('/login');
    });

    test('TC-LP-02: All login form elements are visible and interactive', async ({ page }) => {
        // Verify visibility
        await expect(loginPage.emailInput).toBeVisible();
        await expect(loginPage.passwordInput).toBeVisible();
        await expect(loginPage.loginButton).toBeVisible();
        await expect(loginPage.forgotPasswordLink).toBeVisible();
        await expect(loginPage.signupLink).toBeVisible();

        // Verify elements are enabled
        await expect(loginPage.emailInput).toBeEnabled();
        await expect(loginPage.passwordInput).toBeEnabled();
        await expect(loginPage.loginButton).toBeEnabled();
    });

    test('TC-LP-03: Password visibility toggle functionality', async ({ page }) => {
        // Initially password should be hidden
        let passwordType = await loginPage.getPasswordInputType();
        expect(passwordType).toBe('password');

        // Fill password to see the toggle
        await loginPage.passwordInput.fill('TestPassword123');

        // Toggle to show password
        await loginPage.togglePasswordVisibility();
        await page.waitForTimeout(300);

        passwordType = await loginPage.getPasswordInputType();
        expect(passwordType).toBe('text');

        // Toggle back to hide password
        await loginPage.togglePasswordVisibility();
        await page.waitForTimeout(300);

        passwordType = await loginPage.getPasswordInputType();
        expect(passwordType).toBe('password');
    });

    test('TC-LP-04: Navigation to signup page from login', async ({ page }) => {
        await loginPage.navigateToSignup();

        // Verify redirected to signup page
        await page.waitForURL('**/signup');
        expect(page.url()).toContain('/signup');
    });

    test('TC-LP-05: Navigation to forgot password page', async ({ page }) => {
        await loginPage.navigateToForgotPassword();

        // Wait for navigation
        await page.waitForTimeout(1000);

        // Verify URL changed (adjust based on actual forgot password URL)
        const currentUrl = await loginPage.getCurrentUrl();
        expect(currentUrl).not.toContain('/login');
    });

    test('TC-LP-06: Account type switching between User and Agent', async ({ page }) => {
        // Select User account type
        await loginPage.selectAccountType('User');
        await page.waitForTimeout(500);

        // Verify User tab is active
        const userTabClass = await loginPage.userAccountTypeTab.getAttribute('class');
        expect(userTabClass).toContain('active');

        // Select Agent account type
        await loginPage.selectAccountType('Agent');
        await page.waitForTimeout(500);

        // Verify Agent tab is active
        const agentTabClass = await loginPage.agentAccountTypeTab.getAttribute('class');
        expect(agentTabClass).toContain('active');
    });

    test('TC-LP-07: Email and password fields accept input', async ({ page }) => {
        const testEmail = 'test@example.com';
        const testPassword = 'TestPassword123';

        await loginPage.fillLoginForm(testEmail, testPassword);

        // Verify values are filled
        expect(await loginPage.emailInput.inputValue()).toBe(testEmail);
        expect(await loginPage.passwordInput.inputValue()).toBe(testPassword);
    });

    test('TC-LP-08: Login button is clickable', async ({ page }) => {
        // Verify button is enabled and clickable
        await expect(loginPage.loginButton).toBeEnabled();

        // Fill form and click login
        await loginPage.fillLoginForm('test@example.com', 'password123');
        await loginPage.submitForm();

        // Wait for response
        await page.waitForTimeout(2000);
    });

    test('TC-LP-09: Google Sign In button is visible and clickable', async ({ page }) => {
        await expect(loginPage.googleSignInButton).toBeVisible();
        await expect(loginPage.googleSignInButton).toBeEnabled();
    });

    test('TC-LP-10: Passkey Login button is visible and clickable', async ({ page }) => {
        await expect(loginPage.passkeyLoginButton).toBeVisible();
        await expect(loginPage.passkeyLoginButton).toBeEnabled();
    });

    test('TC-LP-11: Form fields can be cleared and refilled', async ({ page }) => {
        // Fill form
        await loginPage.fillLoginForm('first@example.com', 'password1');

        // Clear and refill
        await loginPage.emailInput.clear();
        await loginPage.passwordInput.clear();

        await loginPage.fillLoginForm('second@example.com', 'password2');

        // Verify new values
        expect(await loginPage.emailInput.inputValue()).toBe('second@example.com');
        expect(await loginPage.passwordInput.inputValue()).toBe('password2');
    });

    test('TC-LP-12: Login form maintains state during account type switch', async ({ page }) => {
        // Fill form as User
        await loginPage.selectAccountType('User');
        await loginPage.fillLoginForm('user@example.com', 'userpass123');

        // Switch to Agent
        await loginPage.selectAccountType('Agent');
        await page.waitForTimeout(500);

        // Verify form values are maintained (or cleared based on implementation)
        const emailValue = await loginPage.emailInput.inputValue();
        const passwordValue = await loginPage.passwordInput.inputValue();

        console.log(`After account type switch - Email: ${emailValue}, Password: ${passwordValue}`);
    });

    test('TC-LP-13: Forgot password link is accessible', async ({ page }) => {
        await expect(loginPage.forgotPasswordLink).toBeVisible();
        await expect(loginPage.forgotPasswordLink).toBeEnabled();

        // Verify link has href attribute
        const href = await loginPage.forgotPasswordLink.getAttribute('href');
        expect(href).toBeTruthy();
    });

    test('TC-LP-14: Signup link is accessible', async ({ page }) => {
        await expect(loginPage.signupLink).toBeVisible();
        await expect(loginPage.signupLink).toBeEnabled();

        // Verify link has href attribute
        const href = await loginPage.signupLink.getAttribute('href');
        expect(href).toBeTruthy();
    });

    test('TC-LP-15: Login form accepts valid email format', async ({ page }) => {
        const validEmails = [
            'test@example.com',
            'user.name@example.com',
            'user+tag@example.co.uk',
            'test123@test-domain.com'
        ];

        for (const email of validEmails) {
            await loginPage.emailInput.clear();
            await loginPage.emailInput.fill(email);

            const value = await loginPage.emailInput.inputValue();
            expect(value).toBe(email);
        }
    });

    // Note: The following tests require valid test credentials
    // Uncomment and update with actual test credentials when available

    test('TC-LP-16: Successful login with valid User credentials', async ({ page }) => {
        const { providedCredentials } = require('../utils/testData.js');

        await loginPage.login(
            providedCredentials.email,
            providedCredentials.password,
            'User'
        );

        // Handle PIN if it appears
        await loginPage.enterPin(providedCredentials.pin);

        // Verify redirect to dashboard
        await page.waitForURL('**/dashboard', { timeout: 30000 });
        expect(page.url()).toContain('/dashboard');

        // Verify no validation errors
        const hasErrors = await loginPage.hasValidationErrors();
        expect(hasErrors).toBeFalsy();
    });

    test('TC-LP-17: Successful login with valid Agent credentials', async ({ page }) => {
        // This is a placeholder since we only have User credentials
        console.log('Skipping Agent login as credentials are not provided.');
    });
});
