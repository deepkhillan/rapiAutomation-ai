/**
 * Signup Page Object Model
 * Encapsulates all interactions with the signup page
 */

import { gotoWithRetry } from '../utils/pageGoto.js';

export class SignupPage {
    constructor(page) {
        this.page = page;

        // Account Type Tabs
        this.userAccountTypeTab = page.locator('button:has-text("User")').first();
        this.agentAccountTypeTab = page.locator('button:has-text("Agent")').first();

        // Form Fields - Primary Locators (using IDs)
        this.fullNameInput = page.locator('#name');
        this.emailInput = page.locator('#email');
        this.referralCodeInput = page.locator('#code');
        this.passwordInput = page.locator('#password');
        this.confirmPasswordInput = page.locator('#confirmPassword');
        this.mobileNumberInput = page.locator('#mobile');
        this.termsCheckbox = page.locator('#acceptTerms');

        // Country Code Selector
        this.countryCodeSelector = page.locator('.country-code-selector, .selected-flag, select[name="countryCode"]').first();

        // Buttons
        this.signupButton = page.getByRole('button', { name: /sign up/i }).first();
        this.googleSignInButton = page.getByRole('button', { name: /sign in with google/i }).first();

        // Links
        this.loginLink = page.getByRole('link', { name: /login/i }).first();

        // Validation Messages
        this.validationMessages = page.locator('.error-message, .validation-error, [class*="error-text"], .text-red-500');
    }

    /**
     * Navigate to signup page
     */
    async goto() {
        console.log('Navigating to Signup Page...');
        await gotoWithRetry(this.page, '/signup', { timeout: 60000, waitUntil: 'domcontentloaded' });
    }

    /**
     * Verify signup page is loaded
     */
    async verifyPageLoaded() {
        await this.page.waitForURL('**/signup', { timeout: 15000 }).catch(() => {});
        await this.emailInput.waitFor({ state: 'visible', timeout: 30000 });
        await this.signupButton.waitFor({ state: 'visible', timeout: 15000 });
        console.log('Signup page loaded successfully.');
    }

    /**
     * Select account type
     * @param {string} type - 'User' or 'Agent'
     */
    async selectAccountType(type) {
        console.log(`Selecting account type: ${type}`);
        const targetTab = type === 'Agent' ? this.agentAccountTypeTab : this.userAccountTypeTab;
        await targetTab.click();
        await this.page.waitForTimeout(500); // UI transition
    }

    /**
     * Select country code (improved for custom dropdowns)
     * @param {string} countryCode - Country code to select (e.g., '+91')
     */
    async selectCountryCode(countryCode) {
        console.log(`Selecting country code: ${countryCode}`);
        try {
            const tagName = await this.countryCodeSelector.evaluate(el => el.tagName);
            if (tagName === 'SELECT') {
                await this.countryCodeSelector.selectOption({ label: new RegExp(countryCode.replace('+', '\\+')) });
            } else {
                await this.countryCodeSelector.click();
                await this.page.waitForTimeout(500);
                const option = this.page.locator(`li:has-text("${countryCode}"), .country-option:has-text("${countryCode}")`).first();
                if (await option.isVisible()) {
                    await option.click();
                } else {
                    console.log(`Warning: Country code option ${countryCode} not found in dropdown list.`);
                }
            }
        } catch (error) {
            console.error(`Failed to select country code: ${error.message}`);
        }
    }

    /**
     * Fill the signup form
     * @param {Object} userData - User data object
     */
    async fillSignupForm(userData) {
        console.log('Filling signup form...');

        if (userData.accountType) await this.selectAccountType(userData.accountType);
        if (userData.fullName) await this.fullNameInput.fill(userData.fullName);
        if (userData.email) await this.emailInput.fill(userData.email);
        if (userData.referralCode) await this.referralCodeInput.fill(userData.referralCode);
        if (userData.password) await this.passwordInput.fill(userData.password);

        const confirmPass = userData.confirmPassword !== undefined ? userData.confirmPassword : userData.password;
        if (confirmPass) await this.confirmPasswordInput.fill(confirmPass);

        if (userData.countryCode) await this.selectCountryCode(userData.countryCode);
        if (userData.phone) await this.mobileNumberInput.fill(userData.phone);
    }

    /**
     * Complete signup process
     * @param {Object} userData - User data object
     * @param {boolean} acceptTerms - Whether to accept terms (default: true)
     */
    async signup(userData, acceptTerms = true) {
        await this.fillSignupForm(userData);
        if (acceptTerms) {
            await this.acceptTerms();
        }
        await this.submitForm();
    }

    /**
     * Accept terms and conditions checkbox.
     */
    async acceptTerms() {
        console.log('Accepting terms and conditions...');
        if (await this.termsCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
            await this.termsCheckbox.check({ force: true }).catch(async () => {
                await this.termsCheckbox.click({ force: true });
            });
        }
    }

    /**
     * Submit signup form.
     */
    async submitForm() {
        console.log('Submitting signup form...');
        await this.signupButton.click();
    }

    /**
     * @returns {Promise<boolean>}
     */
    async isTermsAccepted() {
        return this.termsCheckbox.isChecked();
    }

    /**
     * @returns {Promise<string|null>}
     */
    async getPasswordInputType() {
        return this.passwordInput.getAttribute('type');
    }

    /**
     * @returns {Promise<string|null>}
     */
    async getConfirmPasswordInputType() {
        return this.confirmPasswordInput.getAttribute('type');
    }

    async togglePasswordVisibility() {
        await this.toggleVisibility('password');
    }

    async toggleConfirmPasswordVisibility() {
        await this.toggleVisibility('confirmPassword');
    }

    /**
     * Check if validation error is visible
     * @returns {Promise<boolean>}
     */
    async hasValidationErrors() {
        const html5Invalid = await this.page.evaluate(() => {
            const fields = document.querySelectorAll('#name, #email, #password, #confirmPassword, #mobile');
            return Array.from(fields).some((el) => el instanceof HTMLInputElement && !el.checkValidity());
        }).catch(() => false);
        if (html5Invalid) return true;

        const visibleMsg = await this.validationMessages.first().isVisible({ timeout: 2000 }).catch(() => false);
        if (visibleMsg) return true;

        const errorText = this.page.locator('text=/required|invalid|mismatch|must|enter|accept terms/i').first();
        return await errorText.isVisible({ timeout: 1500 }).catch(() => false);
    }

    /**
     * Get all visible validation error messages
     * @returns {Promise<string[]>}
     */
    async getAllValidationErrors() {
        return await this.validationMessages.allTextContents();
    }

    /**
     * Get specific error message for a field (if mapped)
     * @param {string} fieldId - ID or part of ID
     */
    async getValidationError(fieldId) {
        const error = this.page.locator(`.error-message:near(#${fieldId}), #${fieldId} + .error-message, .error-${fieldId}`).first();
        if (await error.isVisible()) return await error.textContent();
        return (await this.getAllValidationErrors()).join(', ');
    }

    /**
     * Navigate to login page from signup
     */
    async navigateToLogin() {
        await this.loginLink.click();
        await this.page.waitForURL('**/login');
    }

    /**
     * Toggle password visibility
     * @param {string} fieldId - 'password' or 'confirmPassword'
     */
    async toggleVisibility(fieldId) {
        const input = this.page.locator(`#${fieldId}`);
        const toggle = input.locator('xpath=ancestor::*[1]//button').first()
            .or(this.page.locator(`#${fieldId} ~ button`))
            .or(input.locator('..').locator('button, svg, [class*="eye"]'))
            .first();
        if (await toggle.isVisible({ timeout: 2000 }).catch(() => false)) {
            await toggle.click();
        }
    }
}
