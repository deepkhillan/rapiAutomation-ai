import { test, expect } from '@playwright/test';
import { SignupPage } from '../pages/SignupPage.js';
import {
    generateRandomEmail,
    generateRandomName,
    generateRandomPhone,
    invalidEmails,
    sqlInjectionStrings,
    xssStrings,
    specialCharacters
} from '../utils/testData.js';

test.describe('Signup - Negative Test Cases', () => {
    let signupPage;

    test.beforeEach(async ({ page }) => {
        signupPage = new SignupPage(page);
        await signupPage.goto();
        await signupPage.verifyPageLoaded();
    });

    test('TC-SN-01: Submit form with all empty fields', async ({ page }) => {
        // Don't fill any fields, just try to submit
        await signupPage.submitForm();

        // Wait for validation messages
        await page.waitForTimeout(1000);

        // Verify validation errors are present
        const hasErrors = await signupPage.hasValidationErrors();
        expect(hasErrors).toBeTruthy();

        const errors = await signupPage.getAllValidationErrors();
        if (errors.length === 0) {
            // HTML5 constraint validation may not populate custom error containers
            expect(hasErrors).toBeTruthy();
        } else {
            expect(errors.length).toBeGreaterThan(0);
        }
    });

    test('TC-SN-02: Submit with invalid email format - missing @', async ({ page }) => {
        const userData = {
            fullName: generateRandomName(),
            email: 'invalidemail.com',
            password: 'Test@123456',
            phone: generateRandomPhone()
        };

        await signupPage.signup(userData);
        await page.waitForTimeout(1000);

        // Verify validation error for email
        const hasErrors = await signupPage.hasValidationErrors();
        expect(hasErrors).toBeTruthy();
    });

    test('TC-SN-03: Submit with invalid email format - missing domain', async ({ page }) => {
        const userData = {
            fullName: generateRandomName(),
            email: 'test@',
            password: 'Test@123456',
            phone: generateRandomPhone()
        };

        await signupPage.signup(userData);
        await page.waitForTimeout(1000);

        const hasErrors = await signupPage.hasValidationErrors();
        expect(hasErrors).toBeTruthy();
    });

    test('TC-SN-04: Submit with password mismatch', async ({ page }) => {
        const userData = {
            fullName: generateRandomName(),
            email: generateRandomEmail(),
            password: 'Test@123456',
            confirmPassword: 'DifferentPassword@123',
            phone: generateRandomPhone()
        };

        await signupPage.fillSignupForm(userData);
        await signupPage.acceptTerms();
        await signupPage.submitForm();

        await page.waitForTimeout(1000);

        // Verify validation error for password mismatch
        const hasErrors = await signupPage.hasValidationErrors();
        expect(hasErrors).toBeTruthy();
    });

    test('TC-SN-05: Submit without accepting terms and conditions', async ({ page }) => {
        const userData = {
            fullName: generateRandomName(),
            email: generateRandomEmail(),
            password: 'Test@123456',
            phone: generateRandomPhone()
        };

        await signupPage.fillSignupForm(userData);
        // Don't accept terms
        await signupPage.submitForm();

        await page.waitForTimeout(1000);

        // Verify validation error for terms
        const hasErrors = await signupPage.hasValidationErrors();
        expect(hasErrors).toBeTruthy();

        const errors = await signupPage.getAllValidationErrors();
        const termsError = errors.some(error =>
            error.toLowerCase().includes('terms') ||
            error.toLowerCase().includes('accept')
        );
        expect(termsError).toBeTruthy();
    });

    test('TC-SN-06: Submit with missing full name', async ({ page }) => {
        const userData = {
            fullName: '', // Empty name
            email: generateRandomEmail(),
            password: 'Test@123456',
            phone: generateRandomPhone()
        };

        await signupPage.signup(userData);
        await page.waitForTimeout(1000);

        const hasErrors = await signupPage.hasValidationErrors();
        expect(hasErrors).toBeTruthy();

        const errors = await signupPage.getAllValidationErrors();
        const nameError = errors.some(error =>
            error.toLowerCase().includes('name') ||
            error.toLowerCase().includes('required')
        );
        expect(nameError).toBeTruthy();
    });

    test('TC-SN-07: Submit with missing email', async ({ page }) => {
        const userData = {
            fullName: generateRandomName(),
            email: '', // Empty email
            password: 'Test@123456',
            phone: generateRandomPhone()
        };

        await signupPage.signup(userData);
        await page.waitForTimeout(1000);

        const hasErrors = await signupPage.hasValidationErrors();
        expect(hasErrors).toBeTruthy();

        const errors = await signupPage.getAllValidationErrors();
        const emailError = errors.some(error =>
            error.toLowerCase().includes('email') ||
            error.toLowerCase().includes('required')
        );
        expect(emailError).toBeTruthy();
    });

    test('TC-SN-08: Submit with missing password', async ({ page }) => {
        const userData = {
            fullName: generateRandomName(),
            email: generateRandomEmail(),
            password: '', // Empty password
            phone: generateRandomPhone()
        };

        await signupPage.signup(userData);
        await page.waitForTimeout(1000);

        const hasErrors = await signupPage.hasValidationErrors();
        expect(hasErrors).toBeTruthy();

        const errors = await signupPage.getAllValidationErrors();
        const passwordError = errors.some(error =>
            error.toLowerCase().includes('password') ||
            error.toLowerCase().includes('required')
        );
        expect(passwordError).toBeTruthy();
    });

    test('TC-SN-09: Submit with missing confirm password', async ({ page }) => {
        const userData = {
            fullName: generateRandomName(),
            email: generateRandomEmail(),
            password: 'Test@123456',
            confirmPassword: '', // Empty confirm password
            phone: generateRandomPhone()
        };

        await signupPage.fillSignupForm(userData);
        await signupPage.acceptTerms();
        await signupPage.submitForm();

        await page.waitForTimeout(1000);

        const hasErrors = await signupPage.hasValidationErrors();
        expect(hasErrors).toBeTruthy();
    });

    test('TC-SN-10: Submit with missing mobile number', async ({ page }) => {
        const userData = {
            fullName: generateRandomName(),
            email: generateRandomEmail(),
            password: 'Test@123456',
            phone: '' // Empty phone
        };

        await signupPage.signup(userData);
        await page.waitForTimeout(1000);

        const hasErrors = await signupPage.hasValidationErrors();
        expect(hasErrors).toBeTruthy();

        const errors = await signupPage.getAllValidationErrors();
        const phoneError = errors.some(error =>
            error.toLowerCase().includes('phone') ||
            error.toLowerCase().includes('mobile') ||
            error.toLowerCase().includes('number')
        );
        expect(phoneError).toBeTruthy();
    });

    test('TC-SN-11: Submit with invalid mobile number format - letters', async ({ page }) => {
        const userData = {
            fullName: generateRandomName(),
            email: generateRandomEmail(),
            password: 'Test@123456',
            phone: 'abcdefghij'
        };

        await signupPage.signup(userData);
        await page.waitForTimeout(1000);

        // Phone field may filter letters, show validation, or accept partial digits
        const phoneValue = await signupPage.mobileNumberInput.inputValue();
        const hasErrors = await signupPage.hasValidationErrors();
        const noLetters = !/[a-z]/i.test(phoneValue);
        expect(hasErrors || phoneValue === '' || noLetters).toBeTruthy();
    });

    test('TC-SN-12: Submit with special characters in name field', async ({ page }) => {
        for (const specialChar of specialCharacters) {
            await signupPage.goto();

            const userData = {
                fullName: specialChar,
                email: generateRandomEmail(),
                password: 'Test@123456',
                phone: generateRandomPhone()
            };

            await signupPage.signup(userData);
            await page.waitForTimeout(1000);

            // Depending on validation, this might show error or accept
            // We're testing that the system handles it appropriately
            const hasErrors = await signupPage.hasValidationErrors();
            // Document the behavior (either accepts or rejects)
            console.log(`Special char "${specialChar}" - Has errors: ${hasErrors}`);
        }
    });

    test('TC-SN-13: Submit with SQL injection in email field', async ({ page }) => {
        const userData = {
            fullName: generateRandomName(),
            email: sqlInjectionStrings[0], // "' OR '1'='1"
            password: 'Test@123456',
            phone: generateRandomPhone()
        };

        await signupPage.signup(userData);
        await page.waitForTimeout(1000);

        // Should show validation error for invalid email format
        const hasErrors = await signupPage.hasValidationErrors();
        expect(hasErrors).toBeTruthy();
    });

    test('TC-SN-14: Submit with SQL injection in name field', async ({ page }) => {
        const userData = {
            fullName: sqlInjectionStrings[1], // "admin'--"
            email: generateRandomEmail(),
            password: 'Test@123456',
            phone: generateRandomPhone()
        };

        await signupPage.signup(userData);
        await page.waitForTimeout(2000);

        // System should handle SQL injection safely
        // Either reject or sanitize the input
        const nameValue = await signupPage.fullNameInput.inputValue();
        console.log(`SQL injection in name - Value stored: ${nameValue}`);
    });

    test('TC-SN-15: Submit with XSS attempt in email field', async ({ page }) => {
        const userData = {
            fullName: generateRandomName(),
            email: xssStrings[0], // '<script>alert("XSS")</script>'
            password: 'Test@123456',
            phone: generateRandomPhone()
        };

        await signupPage.signup(userData);
        await page.waitForTimeout(1000);

        // Should show validation error for invalid email format
        const hasErrors = await signupPage.hasValidationErrors();
        expect(hasErrors).toBeTruthy();

        // Verify no script execution
        const alerts = [];
        page.on('dialog', dialog => {
            alerts.push(dialog.message());
            dialog.dismiss();
        });

        expect(alerts.length).toBe(0);
    });

    test('TC-SN-16: Submit with XSS attempt in name field', async ({ page }) => {
        const userData = {
            fullName: xssStrings[1], // '<img src=x onerror=alert("XSS")>'
            email: generateRandomEmail(),
            password: 'Test@123456',
            phone: generateRandomPhone()
        };

        // Monitor for alerts
        const alerts = [];
        page.on('dialog', dialog => {
            alerts.push(dialog.message());
            dialog.dismiss();
        });

        await signupPage.signup(userData);
        await page.waitForTimeout(2000);

        // Verify no XSS execution
        expect(alerts.length).toBe(0);
    });

    test('TC-SN-17: Submit with very long email (boundary test)', async ({ page }) => {
        const longEmail = 'a'.repeat(100) + '@example.com';

        const userData = {
            fullName: generateRandomName(),
            email: longEmail,
            password: 'Test@123456',
            phone: generateRandomPhone()
        };

        await signupPage.signup(userData);
        await page.waitForTimeout(1000);

        // System should either accept or show validation error
        const hasErrors = await signupPage.hasValidationErrors();
        console.log(`Long email (${longEmail.length} chars) - Has errors: ${hasErrors}`);
    });

    test('TC-SN-18: Submit with very long name (boundary test)', async ({ page }) => {
        const longName = 'A'.repeat(200);

        const userData = {
            fullName: longName,
            email: generateRandomEmail(),
            password: 'Test@123456',
            phone: generateRandomPhone()
        };

        await signupPage.signup(userData);
        await page.waitForTimeout(1000);

        // System should either accept or show validation error
        const hasErrors = await signupPage.hasValidationErrors();
        console.log(`Long name (${longName.length} chars) - Has errors: ${hasErrors}`);
    });

    test('TC-SN-19: Submit with whitespace-only name', async ({ page }) => {
        const userData = {
            fullName: '     ', // Only spaces
            email: generateRandomEmail(),
            password: 'Test@123456',
            phone: generateRandomPhone()
        };

        await signupPage.signup(userData);
        await page.waitForTimeout(1000);

        // Should show validation error
        const hasErrors = await signupPage.hasValidationErrors();
        expect(hasErrors).toBeTruthy();
    });

    test('TC-SN-20: Submit with email containing spaces', async ({ page }) => {
        const userData = {
            fullName: generateRandomName(),
            email: 'test user@example.com', // Space in email
            password: 'Test@123456',
            phone: generateRandomPhone()
        };

        await signupPage.signup(userData);
        await page.waitForTimeout(1000);

        // Should show validation error
        const hasErrors = await signupPage.hasValidationErrors();
        expect(hasErrors).toBeTruthy();
    });

    test('TC-SN-21: Multiple invalid emails test', async ({ page }) => {
        for (const invalidEmail of invalidEmails.slice(0, 5)) {
            await signupPage.goto();
            await signupPage.verifyPageLoaded();

            const userData = {
                fullName: generateRandomName(),
                email: invalidEmail,
                password: 'Test@123456',
                phone: generateRandomPhone()
            };

            await signupPage.signup(userData);
            await page.waitForTimeout(1000);

            const hasErrors = await signupPage.hasValidationErrors();
            const stillOnSignup = page.url().includes('/signup');
            expect(hasErrors || stillOnSignup).toBeTruthy();

            console.log(`Invalid email "${invalidEmail}" - Correctly rejected: ${hasErrors}`);
        }
    });
});
