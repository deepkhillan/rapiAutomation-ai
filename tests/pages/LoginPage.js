import { expect } from '@playwright/test';

/**
 * Login Page Object Model
 * Encapsulates all interactions with the login page
 */

export class LoginPage {
    constructor(page) {
        this.page = page;

        // Account Type Tabs
        this.userAccountTypeTab = page.locator('button:has-text("User"), .tab:has-text("User")').first();
        this.agentAccountTypeTab = page.locator('button:has-text("Agent"), .tab:has-text("Agent")').first();

        // Form Fields
        this.emailInput = page.locator('#email, input[name="email"], input[type="email"]').first();
        this.passwordInput = page.locator('#password, input[name="password"], input[type="password"]').first();

        // PIN Input
        this.pinInputs = page.locator('input[type="password"], input[type="text"], input[type="tel"]').filter({ hasNot: page.locator('#email'), hasNot: page.locator('#password') });
        this.pinSubmitButton = page.locator('button:has-text("Verify"), button:has-text("Submit PIN"), button:has-text("Confirm")').first();

        // Buttons
        this.loginButton = page.locator('button:has-text("Login"), button[type="submit"], .login-btn').first();
        this.googleSignInButton = page.locator('button:has-text("Google")').first();

        // Links
        this.forgotPasswordLink = page.locator('a:has-text("Forgot"), .forgot-password').first();
        this.signupLink = page.locator('a:has-text("Sign up"), a:has-text("Register")').first();

        // Validation Messages
        this.validationMessages = page.locator('.error-message, .validation-error, .text-red-500, .alert-danger');
    }

    /**
     * Navigate to login page
     */
    async goto() {
        console.log('Navigating to Login Page...');
        await this.page.goto('/login', { timeout: 60000, waitUntil: 'load' });
    }

    /**
     * Verify login page is loaded
     */
    async verifyPageLoaded() {
        console.log('Verifying Login page load...');
        await this.page.waitForURL('**/login', { timeout: 20000 });
        await expect(this.emailInput).toBeVisible({ timeout: 20000 });
        console.log('Login page loaded successfully.');
    }

    /**
     * Select account type
     * @param {string} type - 'User' or 'Agent'
     */
    async selectAccountType(type) {
        console.log(`Selecting account type: ${type}`);
        const targetTab = type === 'Agent' ? this.agentAccountTypeTab : this.userAccountTypeTab;
        if (await targetTab.isVisible()) {
            await targetTab.click();
            await this.page.waitForTimeout(2000); // Wait for tab switch
        } else {
            console.log(`Tab for ${type} not found or already selected.`);
        }
    }

    /**
     * Login process
     * @param {string} email 
     * @param {string} password 
     * @param {string} type - Optional account type
     */
    async login(email, password, type = 'User') {
        if (type) await this.selectAccountType(type);

        console.log(`Entering email: ${email}`);
        await this.emailInput.waitFor({ state: 'visible' });
        await this.emailInput.fill(email);

        console.log('Entering password...');
        await this.passwordInput.fill(password);

        console.log('Clicking Login button...');
        await this.loginButton.click();

        // Wait for potential redirect or PIN screen
        await this.page.waitForTimeout(2000);
    }

    /**
     * Enter PIN
     * @param {string} pin 
     */
    async enterPin(pin) {
        console.log(`Checking for PIN input...`);
        await this.page.waitForTimeout(2000);

        const pinFields = await this.page.locator('input[type="text"], input[type="tel"], input[type="password"]').filter({ visible: true }).all();
        // Filter out login fields
        const targets = [];
        for (const f of pinFields) {
            const id = (await f.getAttribute('id') || '').toLowerCase();
            const name = (await f.getAttribute('name') || '').toLowerCase();
            if (!id.includes('email') && !id.includes('password') && !name.includes('email') && !name.includes('password')) {
                targets.push(f);
            }
        }

        console.log(`Found ${targets.length} PIN input fields.`);

        if (targets.length >= 1) {
            console.log(`Entering PIN: ${pin}`);
            if (targets.length === 1) {
                await targets[0].fill(pin);
            } else {
                for (let i = 0; i < Math.min(pin.length, targets.length); i++) {
                    await targets[i].focus();
                    await targets[i].fill(pin[i]);
                    await this.page.waitForTimeout(200);
                }
            }

            await this.page.waitForTimeout(1000);

            // Check for submit button within modal
            const submitBtn = this.page.locator('button:has-text("Verify"), button:has-text("Submit"), button:has-text("Confirm")').filter({ visible: true }).first();
            if (await submitBtn.isVisible()) {
                await submitBtn.click();
            } else {
                await this.page.keyboard.press('Enter');
            }
            console.log('PIN submitted. Waiting for redirect...');
            await this.page.waitForTimeout(5000);
        }
    }

    /**
     * Get all visible validation errors
     * @returns {Promise<string[]>}
     */
    async getAllValidationErrors() {
        return await this.validationMessages.allTextContents();
    }
}
