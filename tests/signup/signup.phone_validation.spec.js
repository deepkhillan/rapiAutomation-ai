import { test, expect } from '@playwright/test';
import { SignupPage } from '../pages/SignupPage.js';
import { generateRandomEmail, generateRandomName } from '../utils/testData.js';

test.describe('Signup - Phone Number Validation Refinement', () => {
    let signupPage;

    test.beforeEach(async ({ page }) => {
        signupPage = new SignupPage(page);
        await signupPage.goto();
        await signupPage.verifyPageLoaded();
    });

    const baseUserData = {
        fullName: 'Phone Test User',
        email: 'phone_test@example.com',
        password: 'Test@123456',
        countryCode: '+91'
    };

    test('TC-SN-PH-01: Phone number too short (less than 10 digits)', async ({ page }) => {
        const userData = {
            ...baseUserData,
            email: generateRandomEmail('short_phone'),
            phone: '12345'
        };

        await signupPage.signup(userData);
        await page.waitForTimeout(1000);

        const hasErrors = await signupPage.hasValidationErrors();
        expect(hasErrors).toBeTruthy();

        const error = await signupPage.getValidationError('mobile');
        console.log(`Short phone error: ${error}`);
    });

    test('TC-SN-PH-02: Phone number too long (more than 10 digits)', async ({ page }) => {
        const userData = {
            ...baseUserData,
            email: generateRandomEmail('long_phone'),
            phone: '123456789012345'
        };

        await signupPage.signup(userData);
        await page.waitForTimeout(1000);

        // Many systems limit to 10-15 digits
        const hasErrors = await signupPage.hasValidationErrors();
        console.log(`Long phone has errors: ${hasErrors}`);
    });

    test('TC-SN-PH-03: Phone number with leading zero', async ({ page }) => {
        const userData = {
            ...baseUserData,
            email: generateRandomEmail('leading_zero'),
            phone: '0123456789'
        };

        await signupPage.signup(userData);
        await page.waitForTimeout(1000);

        const hasErrors = await signupPage.hasValidationErrors();
        console.log(`Leading zero phone has errors: ${hasErrors}`);
    });

    test('TC-SN-PH-04: Phone number with special characters (+, -, (, ))', async ({ page }) => {
        const userData = {
            ...baseUserData,
            email: generateRandomEmail('spec_phone'),
            phone: '(123) 456-7890'
        };

        await signupPage.signup(userData);
        await page.waitForTimeout(1000);

        // This usually should be accepted and sanitized by the backend, 
        // or the input field should handle it.
        const hasErrors = await signupPage.hasValidationErrors();
        console.log(`Phone with formatting signs has errors: ${hasErrors}`);
    });

    test('TC-SN-PH-05: Phone number with spaces', async ({ page }) => {
        const userData = {
            ...baseUserData,
            email: generateRandomEmail('space_phone'),
            phone: '123 456 7890'
        };

        await signupPage.signup(userData);
        await page.waitForTimeout(1000);

        const hasErrors = await signupPage.hasValidationErrors();
        console.log(`Phone with spaces has errors: ${hasErrors}`);
    });

    test('TC-SN-PH-06: Changing country code updates validation or mask', async ({ page }) => {
        // Switch to a different country, e.g., USA +1
        await signupPage.selectCountryCode('+1');
        await page.waitForTimeout(500);

        // Fill a 10 digit number
        await signupPage.mobileNumberInput.fill('1234567890');

        // Check if it's accepted
        await signupPage.signup({ ...baseUserData, email: generateRandomEmail('usa_phone'), countryCode: '+1', phone: '2025550123' });
        await page.waitForTimeout(1000);

        const hasErrors = await signupPage.hasValidationErrors();
        const phoneFilled = (await signupPage.mobileNumberInput.inputValue()).length > 0;
        expect(phoneFilled && !hasErrors).toBeTruthy();
    });
});
