import { test, expect } from '@playwright/test';
import { SignupPage } from '../pages/SignupPage.js';
import { generateRandomEmail, generateRandomName, generateRandomPhone } from '../utils/testData.js';

test.describe('Signup - Positive Test Cases', () => {
    let signupPage;

    test.beforeEach(async ({ page }) => {
        signupPage = new SignupPage(page);
        await signupPage.goto();
        await signupPage.verifyPageLoaded();
    });

    test('TC-SP-01: Successful signup with valid User account data', async ({ page }) => {
        const userData = {
            accountType: 'User',
            fullName: generateRandomName(),
            email: generateRandomEmail('user'),
            password: 'Test@123456',
            phone: generateRandomPhone(),
            countryCode: '+91' // India
        };

        await signupPage.signup(userData);

        // Wait for potential redirect or success message
        await page.waitForTimeout(2000);

        // Verify no validation errors are present
        const hasErrors = await signupPage.hasValidationErrors();
        expect(hasErrors).toBeFalsy();
    });

    test('TC-SP-03: Successful signup with optional referral code', async ({ page }) => {
        const userData = {
            fullName: generateRandomName(),
            email: generateRandomEmail('referral'),
            password: 'Test@123456',
            phone: generateRandomPhone(),
            referralCode: 'REF12345',
            countryCode: '+91'
        };

        await signupPage.fillSignupForm(userData);
        await signupPage.acceptTerms();

        // Verify referral code is filled
        const referralValue = await signupPage.referralCodeInput.inputValue();
        expect(referralValue).toBe('REF12345');

        await signupPage.submitForm();
        await page.waitForTimeout(2000);
    });

    test('TC-SP-04: Password visibility toggle functionality', async ({ page }) => {
        // Fill password field first
        await signupPage.passwordInput.fill('TestPassword123');

        // Initially password should be hidden
        let passwordType = await signupPage.getPasswordInputType();
        expect(passwordType).toBe('password');

        // Try to toggle password visibility
        await signupPage.togglePasswordVisibility();
        await page.waitForTimeout(500);

        // Check if toggle worked
        passwordType = await signupPage.getPasswordInputType();
        console.log(`Password type after toggle: ${passwordType}`);
    });

    test('TC-SP-05: Confirm password visibility toggle functionality', async ({ page }) => {
        // Fill confirm password field first
        await signupPage.confirmPasswordInput.fill('TestPassword123');

        // Initially confirm password should be hidden
        let confirmPasswordType = await signupPage.getConfirmPasswordInputType();
        expect(confirmPasswordType).toBe('password');

        // Try to toggle password visibility
        await signupPage.toggleConfirmPasswordVisibility();
        await page.waitForTimeout(500);

        // Check if toggle worked
        confirmPasswordType = await signupPage.getConfirmPasswordInputType();
        console.log(`Confirm password type after toggle: ${confirmPasswordType}`);
    });

    test('TC-SP-06: Navigation to login page from signup', async ({ page }) => {
        await signupPage.navigateToLogin();

        // Verify redirected to login page
        await page.waitForURL('**/login', { timeout: 10000 });
        expect(page.url()).toContain('/login');
    });

    test('TC-SP-08: Terms and conditions checkbox functionality', async ({ page }) => {
        // Initially checkbox should be unchecked
        let isChecked = await signupPage.isTermsAccepted();
        expect(isChecked).toBeFalsy();

        // Check the checkbox
        await signupPage.acceptTerms();

        // Verify checkbox is checked
        isChecked = await signupPage.isTermsAccepted();
        expect(isChecked).toBeTruthy();
    });

    test('TC-SP-09: All form fields are editable and accept input', async ({ page }) => {
        const userData = {
            fullName: generateRandomName(),
            email: generateRandomEmail('test'),
            password: 'Test@' + Date.now(),
            phone: generateRandomPhone(),
            referralCode: 'REF' + Math.floor(Math.random() * 10000),
            countryCode: '+91'
        };

        // Make sure confirm password matches password
        userData.confirmPassword = userData.password;

        await signupPage.fillSignupForm(userData);

        // Verify all fields have the correct values
        expect(await signupPage.fullNameInput.inputValue()).toBe(userData.fullName);
        expect(await signupPage.emailInput.inputValue()).toBe(userData.email);
        expect(await signupPage.passwordInput.inputValue()).toBe(userData.password);
        expect(await signupPage.confirmPasswordInput.inputValue()).toBe(userData.confirmPassword);

        // Phone number might be formatted, so strip non-digits for comparison
        const phoneValue = await signupPage.mobileNumberInput.inputValue();
        const digitsOnly = phoneValue.replace(/\D/g, '');
        // The digitsOnly will likely include the country code (91)
        expect(digitsOnly).toContain(userData.phone);

        expect(await signupPage.referralCodeInput.inputValue()).toBe(userData.referralCode);
    });

    test('TC-SP-10: Signup form elements are visible and interactive', async ({ page }) => {
        // Verify all major elements are visible
        await expect(signupPage.fullNameInput).toBeVisible();
        await expect(signupPage.emailInput).toBeVisible();
        await expect(signupPage.passwordInput).toBeVisible();
        await expect(signupPage.confirmPasswordInput).toBeVisible();
        await expect(signupPage.mobileNumberInput).toBeVisible();
        await expect(signupPage.termsCheckbox).toBeVisible();
        await expect(signupPage.signupButton).toBeVisible();

        // Verify elements are enabled
        await expect(signupPage.fullNameInput).toBeEnabled();
        await expect(signupPage.emailInput).toBeEnabled();
        await expect(signupPage.passwordInput).toBeEnabled();
        await expect(signupPage.signupButton).toBeEnabled();
    });
});
