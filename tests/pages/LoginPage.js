import { expect } from '@playwright/test';
import { gotoWithRetry } from '../utils/pageGoto.js';

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
        this.passkeyLoginButton = page.locator('button:has-text("Passkey"), button:has-text("passkey")').first();

        // Links
        this.forgotPasswordLink = page.locator('a:has-text("Forgot"), .forgot-password').first();
        this.signupLink = page.locator('a:has-text("Sign up"), a:has-text("Register")').first();

        // Validation Messages
        this.validationMessages = page.locator([
            '.error-message',
            '.validation-error',
            '.text-red-500',
            '.alert-danger',
            '.alert-error',
            '[class*="error"]',
            '[class*="invalid"]',
            '[class*="toast"]',
            '[role="alert"]'
        ].join(','));

        // Password visibility toggle (best-effort; UI varies)
        this.passwordToggleButton = this.passwordInput
            .locator('xpath=ancestor::*[1]//button')
            .or(page.locator('button[aria-label*="password" i], button[aria-label*="show" i], button[aria-label*="hide" i]'))
            .first();
    }

    /**
     * Navigate to login page and wait for the form (carousel/splash may render before inputs).
     */
    async goto() {
        console.log('Navigating to Login Page...');
        await gotoWithRetry(this.page, '/login', { timeout: 60000, waitUntil: 'domcontentloaded' });
        await this.waitForLoginForm();
    }

    /**
     * Wait until email/password fields are visible (login form loads after splash carousel).
     */
    async waitForLoginForm(timeoutMs = 45000) {
        await this.page.waitForURL('**/login', { timeout: 15000 }).catch(() => {});
        const skipBtn = this.page.locator(
            'button:has-text("Skip"), button:has-text("Get Started"), .carousel-control-next, [class*="skip" i]',
        ).first();
        if (await skipBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await skipBtn.click().catch(() => {});
            await this.page.waitForTimeout(800);
        }
        await this.emailInput.waitFor({ state: 'visible', timeout: timeoutMs });
        await this.passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    }

    /**
     * Verify login page is loaded
     */
    async verifyPageLoaded() {
        console.log('Verifying Login page load...');
        await this.waitForLoginForm();
        await expect(this.emailInput).toBeVisible();
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
        await this.fillLoginForm(email, password);

        console.log('Clicking Login button...');
        await this.submitForm();

        // Wait for either PIN prompt or navigation away from /login
        await this.waitForPostLoginGate();
    }

    /**
     * Wait for post-login state: either PIN appears, or URL changes away from /login.
     */
    async waitForPostLoginGate(timeoutMs = 20000) {
        const deadline = Date.now() + timeoutMs;
        while (Date.now() < deadline) {
            if (this.page.isClosed()) return;
            const url = (this.page.url() || '').toLowerCase();
            const pinVisible = await this.page
                .locator('input[type="text"], input[type="tel"], input[type="password"]')
                .filter({ visible: true })
                .first()
                .isVisible({ timeout: 500 })
                .catch(() => false);
            if (pinVisible) return;
            if (!url.includes('/login')) return;
            await this.page.waitForTimeout(500);
        }
    }

    /**
     * Fill login form fields (does not submit).
     * @param {string} email
     * @param {string} password
     */
    async fillLoginForm(email, password) {
        await this.waitForLoginForm();
        await this.emailInput.fill(email ?? '');
        await this.passwordInput.fill(password ?? '');
    }

    /**
     * Submit login form.
     */
    async submitForm() {
        await this.loginButton.waitFor({ state: 'visible', timeout: 20000 });
        await this.loginButton.click();
    }

    /**
     * Whether any validation message is visible.
     * @returns {Promise<boolean>}
     */
    async hasValidationErrors() {
        const url = (this.page.url() || '').toLowerCase();
        if (!url.includes('/login')) return false;

        const html5Invalid = await this.emailInput.evaluate((el) => el.validity && !el.validity.valid).catch(() => false)
            || await this.passwordInput.evaluate((el) => el.validity && !el.validity.valid).catch(() => false);
        if (html5Invalid) return true;

        const validationMessage = await this.emailInput.evaluate((el) => el.validationMessage || '').catch(() => '');
        if (validationMessage.trim()) return true;

        // Prefer explicit error containers
        const explicitVisible = await this.validationMessages.filter({ visible: true }).first()
            .isVisible({ timeout: 1500 })
            .catch(() => false);
        if (explicitVisible) return true;

        // Fallback: common validation/auth error text on login page only
        const errorText = this.page.locator('text=/invalid|required|incorrect|not found|enter a valid|something went wrong|try again/i').first();
        return await errorText.isVisible({ timeout: 1500 }).catch(() => false);
    }

    /**
     * Navigate to signup page from login.
     */
    async navigateToSignup() {
        const href = await this.signupLink.getAttribute('href').catch(() => null);
        if (href && href !== '#') {
            try {
                const base = this.page.url();
                const target = href.startsWith('http') ? href : new URL(href, base).href;
                await this.page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30000 });
            } catch {
                await this.signupLink.click({ timeout: 15000 });
            }
        } else {
            await this.signupLink.click({ timeout: 15000 });
        }
        await this.page.waitForURL('**/signup**', { timeout: 30000 });
    }

    /**
     * Navigate to forgot password page from login.
     */
    async navigateToForgotPassword() {
        await this.forgotPasswordLink.click();
    }

    /**
     * Whether account type tab appears selected (flexible – UI class names vary).
     * @param {'User'|'Agent'} type
     * @returns {Promise<boolean>}
     */
    async isAccountTypeSelected(type) {
        const tab = type === 'Agent' ? this.agentAccountTypeTab : this.userAccountTypeTab;
        const cls = (await tab.getAttribute('class')) || '';
        const aria = await tab.getAttribute('aria-selected');
        const ariaPressed = await tab.getAttribute('aria-pressed');
        return /active|selected/i.test(cls) || aria === 'true' || ariaPressed === 'true';
    }

    /**
     * Current page URL helper.
     * @returns {Promise<string>}
     */
    async getCurrentUrl() {
        return this.page.url();
    }

    /**
     * Get password input type attribute (password/text).
     * @returns {Promise<string|null>}
     */
    async getPasswordInputType() {
        return await this.passwordInput.getAttribute('type');
    }

    /**
     * Toggle password visibility (best-effort).
     */
    async togglePasswordVisibility() {
        const btn = this.passwordToggleButton;
        if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await btn.click();
            return;
        }
        // Fallback: click any button next to password input
        const fallback = this.passwordInput.locator('xpath=ancestor::*[1]//button').first();
        if (await fallback.isVisible({ timeout: 2000 }).catch(() => false)) {
            await fallback.click();
        }
    }

    /**
     * Enter PIN
     * @param {string} pin 
     */
    async enterPin(pin) {
        console.log(`Checking for PIN input...`);
        let targets = [];
        for (let attempt = 0; attempt < 25; attempt++) {
            const pinFields = await this.page.locator('input[type="text"], input[type="tel"], input[type="password"]').filter({ visible: true }).all();
            targets = [];
            for (const f of pinFields) {
                const id = (await f.getAttribute('id') || '').toLowerCase();
                const name = (await f.getAttribute('name') || '').toLowerCase();
                if (!id.includes('email') && !id.includes('password') && !name.includes('email') && !name.includes('password')) {
                    targets.push(f);
                }
            }
            if (targets.length >= 1) break;
            const url = (this.page.url() || '').toLowerCase();
            if (!url.includes('/login')) break;
            await this.page.waitForTimeout(1000);
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
        } else {
            // Some sessions may not require PIN; wait to leave /login
            await this.waitForPostLoginGate(15000);
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
