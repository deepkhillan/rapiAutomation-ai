import { expect } from '@playwright/test';

/**
 * Buy/Sell Page Object Model
 * Encapsulates all interactions with the Buy/Sell page
 */

export class BuySellPage {
    constructor(page) {
        this.page = page;

        // Tabs
        this.buyTab = page.locator('button, [role="tab"]').filter({ hasText: /^Buy$/ }).first();
        this.sellTab = page.locator('button, [role="tab"]').filter({ hasText: /^Sell$/ }).first();

        // Specific locators for the exchange form
        this.exchangeCard = page.locator('.exchange-card, .card, .container').filter({ has: page.locator('button:has-text("Buy"), button:has-text("Sell")') }).first();

        // Final Action Button (The big one at the bottom of the card)
        this.actionButton = page.locator('button').filter({ hasText: /^Buy$|^Sell$|^Exchange$/ }).last();

        // PIN / Confirmation Modal
        this.pinInputs = page.locator('input[type="password"], input[type="text"], input[type="tel"]').filter({ hasNot: page.locator('#email') });
        this.confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Submit"), button:has-text("Verify")').first();

        // Notifications/Messages
        this.successMessage = page.locator('.success-notification, .toast-success, .success-msg');
        this.errorMessage = page.locator('.error-notification, .toast-error, .validation-message, .alert-danger, .error-text');
    }

    /**
     * Navigate to Buy/Sell page
     */
    async goto() {
        console.log('Navigating to Buy/Sell page...');
        await this.page.goto('/buysell', { timeout: 60000 }).catch(e => console.log('Direct navigation to /buysell failed'));

        await this.page.waitForLoadState('domcontentloaded');

        // If still on home/dashboard, use the sidebar
        const currentUrl = this.page.url();
        if (currentUrl.includes('dashboard') || currentUrl.endsWith('/')) {
            console.log('On dashboard/home, clicking Buy/Sell sidebar link...');
            const sidebarLink = this.page.locator('a:has-text("Buy/Sell"), .nav-link:has-text("Buy")').first();
            await sidebarLink.click({ timeout: 10000 }).catch(e => console.log('Sidebar link click failed'));
        }

        await this.page.waitForTimeout(3000);
        console.log(`Current URL: ${this.page.url()}`);
    }

    /**
     * Switch to Buy tab
     */
    async switchToBuy() {
        console.log('Switching to Buy tab...');
        await this.buyTab.click({ timeout: 5000 });
        await this.page.waitForTimeout(1000);
    }

    /**
     * Switch to Sell tab
     */
    async switchToSell() {
        console.log('Switching to Sell tab...');
        await this.sellTab.click({ timeout: 10000 });
        await this.page.waitForTimeout(2000);
    }

    async getAllAvailableCoins() {
        console.log('Detecting available coins...');
        await this.exchangeCard.waitFor({ state: 'visible', timeout: 30000 });

        let coinBox = this.page.locator('.exchange-card .coin-select, .exchange-card [role="button"]:has(.coin-icon), .exchange-card div:has-text("BTC")').first();
        if (!(await coinBox.isVisible())) {
            coinBox = this.page.locator('.exchange-card div').filter({ hasText: /^[A-Z]{2,10}$/ }).first();
        }

        await coinBox.click().catch(() => { });
        await this.page.waitForTimeout(3000);

        if (!(await this.page.locator('text=Choose your asset').isVisible())) {
            await this.page.locator('.exchange-card').click({ position: { x: 200, y: 100 } }).catch(() => { });
            await this.page.waitForTimeout(2000);
        }

        const symbols = await this.page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('div, span, p'));
            const tickers = items
                .map(el => el.innerText.trim())
                .filter(text => /^[A-Z]{2,6}$/.test(text));

            const commonUI = ['CHOOSE', 'YOUR', 'ASSET', 'USD', 'USDT', 'MIN', 'MAX', 'BUY', 'SELL', 'PIN', 'AUTH', 'CLOSE', 'MARKET', 'TOTAL'];
            return [...new Set(tickers)].filter(t => !commonUI.includes(t));
        });

        console.log(`Found coins: ${symbols.join(', ')}`);

        await this.page.keyboard.press('Escape').catch(() => { });
        await this.page.waitForTimeout(1000);
        return symbols;
    }

    async selectCoin(symbol) {
        console.log(`Selecting coin: ${symbol}`);

        let coinBox = this.page.locator('.exchange-card .coin-select, .exchange-card [role="button"]:has(.coin-icon), .exchange-card div:has-text("BTC")').first();
        if (!(await coinBox.isVisible())) {
            coinBox = this.page.locator('.exchange-card div').filter({ hasText: /^[A-Z]{2,10}$/ }).first();
        }
        await coinBox.click().catch(() => { });
        await this.page.waitForTimeout(2000);

        const option = this.page.locator('div, span, p').filter({ hasText: new RegExp(`^${symbol}$`) }).last();
        if (await option.isVisible()) {
            await option.click();
        } else {
            await this.page.locator(`text=${symbol}`).last().click().catch(() => { });
        }
        await this.page.waitForTimeout(2000);
    }

    /**
     * Set amount to pay
     * @param {string|number} amount 
     */
    async setPayAmount(amount) {
        console.log(`Setting amount to pay: ${amount}`);

        // Focus on the input that belongs to the "You Pay" section
        // Usually the first numeric input in the exchange card
        const amountInput = this.page.locator('input[type="number"], .exchange-card input, .card input').filter({ visible: true }).first();

        await amountInput.waitFor({ state: 'visible', timeout: 10000 });
        await amountInput.click();

        // Clear value using keyboard to be safe
        await this.page.keyboard.press('Control+A');
        await this.page.keyboard.press('Backspace');

        // Type amount with delay for stability
        await this.page.keyboard.type(amount.toString(), { delay: 100 });
        console.log('Amount entered.');
    }

    /**
     * Perform the Buy/Sell action
     */
    async submitOrder() {
        console.log('Waiting for action button to be clickable...');
        await this.actionButton.waitFor({ state: 'visible', timeout: 10000 });

        // The button might be disabled if balance is 0 or fee is loading
        const isEnabled = await this.actionButton.isEnabled();
        if (!isEnabled) {
            console.log('Action button is currently DISABLED. Capturing state...');
            return false;
        }

        console.log('Clicking action button...');
        await this.actionButton.click({ timeout: 10000 });
        return true;
    }

    /**
     * Enter PIN during transaction
     * @param {string} pin 
     */
    async enterPin(pin) {
        console.log(`Entering transaction PIN: ${pin}`);
        await this.page.waitForTimeout(2000);
        const targets = await this.page.locator('input[type="password"], input[type="text"], input[type="tel"]').filter({ visible: true }).all();

        if (targets.length === 1) {
            await targets[0].fill(pin);
        } else if (targets.length >= pin.length) {
            for (let i = 0; i < pin.length; i++) {
                await targets[i].fill(pin[i]);
            }
        }

        const confirmBtn = this.page.locator('button:has-text("Confirm"), button:has-text("Submit"), button:has-text("Verify")').filter({ visible: true }).first();
        if (await confirmBtn.isVisible()) {
            await confirmBtn.click();
        } else {
            await this.page.keyboard.press('Enter');
        }
        await this.page.waitForTimeout(5000);
    }

    /**
     * Get the validation error message if visible
     */
    async getValidationMessage() {
        if (await this.errorMessage.isVisible({ timeout: 5000 })) {
            return await this.errorMessage.textContent();
        }
        // Also check for browser-level validation or other hints
        const validationHint = this.page.locator('.text-danger, .validation-hint, .error-msg').filter({ visible: true }).first();
        if (await validationHint.isVisible()) {
            return await validationHint.textContent();
        }
        return null;
    }

    /**
     * Extract numeric value from a message like "Minimum amount is 10 USD"
     */
    getMinAmountFromMessage(message) {
        if (!message) return null;
        const matches = message.match(/(\d+(\.\d+)?)/);
        return matches ? matches[0] : null;
    }

    /**
     * Confirm the order after entering PIN
     */
    async confirmOrder() {
        if (await this.confirmButton.isVisible({ timeout: 5000 })) {
            console.log('Confirming order...');
            await this.confirmButton.click();
        }
    }
}
