import { navigateToFeature, APP_ROUTES, isAppErrorPage, ensureAuthenticatedApp, recoverFromErrorShell } from '../utils/appNavigation.js';
import { providedCredentials } from '../utils/testData.js';

const COIN_TICKER = /^[A-Z]{2,10}(-[A-Z0-9]+)?$/;
const UI_WORDS = new Set(['CHOOSE', 'YOUR', 'ASSET', 'USD', 'USDT', 'USDC', 'MIN', 'MAX', 'BUY', 'SELL', 'PIN', 'AUTH', 'CLOSE', 'MARKET', 'TOTAL', 'PAY', 'RECEIVE', 'BALANCE', 'FAQ', 'HELP', 'P2P', 'AI', 'ASK', 'DASH', 'HOME']);

/**
 * Buy/Sell Page Object Model
 * Avoids Ctrl+A / keyboard.type (selects whole page when input not focused).
 * Uses chooseAssetModal for coin selection.
 */

export class BuySellPage {
    constructor(page) {
        this.page = page;

        this.tradingPanel = page.locator('div, section, form').filter({ hasText: 'You Pay' }).filter({ hasText: 'You Receive' }).first();

        this.youPaySection = this.tradingPanel.locator('div, section').filter({ hasText: 'You Pay' }).first();
        this.youReceiveSection = this.tradingPanel.locator('div, section').filter({ hasText: 'You Receive' }).first();

        // Buy/Sell tabs inside exchange widget (navTab – NOT the submit button)
        this.buyTab = page.locator('button.navTab').filter({ hasText: /^Buy$/ }).first();
        this.sellTab = page.locator('button.navTab').filter({ hasText: /^Sell$/ }).first();

        this.exchangeCard = page.locator('.exchange-card, .card, .container').filter({ has: page.locator('button:has-text("Buy"), button:has-text("Sell")') }).first();

        // Submit CTA at bottom of form – matches button "Buy" / "Sell" (not navTab)
        this.actionButton = this.tradingPanel.locator('button:not(.navTab):not([class*="navTab"])')
            .filter({ hasText: /^Buy$|^Sell$|^Exchange$/ }).last();

        this.coinModal = page.locator('.chooseAssetModal, [role="dialog"].chooseAssetModal, .modal.chooseAssetModal').first();

        // Amount spinbuttons resolved dynamically in getters (DOM changes after modal)
        this.youReceiveCoinButton = this.youReceiveSection.getByRole('button').filter({ hasNotText: /US Dollar|Fiat/i }).first();
        this.youPayCoinButton = this.youPaySection.getByRole('button').filter({ hasNotText: /US Dollar|Fiat/i }).first();

        this.pinInputs = page.locator('input[type="password"], input[type="text"], input[type="tel"]').filter({ hasNot: page.locator('#email') });
        this.confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Submit"), button:has-text("Verify")').first();
        this.successMessage = page.locator('.success-notification, .toast-success, .success-msg');
        this.errorMessage = page.locator('.error-notification, .toast-error, .validation-message, .alert-danger, .error-text');
    }

    /** Clear accidental full-page text selection (caused by Ctrl+A without focus). */
    async clearPageSelection() {
        await this.page.evaluate(() => window.getSelection()?.removeAllRanges()).catch(() => {});
        await this.page.keyboard.press('Escape').catch(() => {});
    }

    async goto() {
        console.log('Navigating to Buy/Sell page...');
        await this.clearPageSelection();
        await navigateToFeature(this.page, APP_ROUTES.buysell);

        for (let attempt = 0; attempt < 3; attempt++) {
            if (await isAppErrorPage(this.page)) {
                await recoverFromErrorShell(this.page).catch(() => {});
                await ensureAuthenticatedApp(this.page);
            }

            let ready = await this.waitForExchangeReady(15000);
            if (!ready) {
                const sidebarLink = this.page.locator('a:has-text("Buy/Sell"), a[href*="buysell" i]').first();
                if (await sidebarLink.isVisible({ timeout: 5000 }).catch(() => false)) {
                    console.log(`Opening Buy/Sell via sidebar (attempt ${attempt + 1})...`);
                    await sidebarLink.click({ timeout: 15000 });
                    await this.page.waitForTimeout(3000);
                    await this.clearPageSelection();
                }
                ready = await this.waitForExchangeReady(20000);
            }
            if (ready && !(await isAppErrorPage(this.page))) break;
        }

        const closeNotification = this.page.locator('button:has-text("Close"), .close-icon, .notification-close').first();
        if (await closeNotification.isVisible({ timeout: 2000 }).catch(() => false)) {
            await closeNotification.click();
        }

        if (!(await this.waitForExchangeReady(10000)) || await isAppErrorPage(this.page)) {
            throw new Error(`Buy/Sell exchange UI not ready (URL: ${this.page.url()}).`);
        }
        await this.clearPageSelection();
        console.log(`Current URL: ${this.page.url()}`);
    }

    async switchToBuy() {
        console.log('Switching to Buy tab...');
        await this.clearPageSelection();
        await this.dismissOpenModals();
        if (await this.buyTab.isVisible({ timeout: 5000 }).catch(() => false)) {
            await this.buyTab.click({ timeout: 10000 });
        }
        await this.page.waitForTimeout(800);
    }

    async switchToSell() {
        console.log('Switching to Sell tab...');
        await this.clearPageSelection();
        await this.dismissOpenModals();
        if (await this.sellTab.isVisible({ timeout: 5000 }).catch(() => false)) {
            await this.sellTab.click({ timeout: 10000 });
        }
        await this.page.waitForTimeout(800);
    }

    async waitForExchangeReady(timeoutMs = 45000) {
        const deadline = Date.now() + timeoutMs;
        while (Date.now() < deadline) {
            if (this.page.isClosed()) return false;
            const youPay = await this.page.getByText('You Pay', { exact: true }).first().isVisible({ timeout: 1500 }).catch(() => false);
            if (youPay) return true;
            if (!this.page.isClosed()) await this.page.waitForTimeout(1000);
        }
        return false;
    }

    /** Opens the crypto asset picker modal (chooseAssetModal). */
    getYouPayAmount() {
        return this.youPaySection.locator('input.balanceInput, input[type="number"], [role="spinbutton"]').first();
    }

    getYouReceiveAmount() {
        return this.youReceiveSection.locator('input.balanceInput, input[type="number"], [role="spinbutton"]').first();
    }

    /** @deprecated use getYouPayAmount() */
    get youPayAmount() {
        return this.getYouPayAmount();
    }

    /** @deprecated use getYouReceiveAmount() */
    get youReceiveAmount() {
        return this.getYouReceiveAmount();
    }

    async isCoinSelected(symbol, mode = 'buy') {
        const section = mode === 'sell' ? this.youPaySection : this.youReceiveSection;
        const text = await section.innerText().catch(() => '');
        return new RegExp(`\\b${symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text);
    }

    async openCryptoCoinDropdown(mode = 'buy') {
        await this.clearPageSelection();
        await this.dismissOpenModals();

        if (mode === 'sell') await this.switchToSell();
        else await this.switchToBuy();

        const trigger = mode === 'sell' ? this.youPayCoinButton : this.youReceiveCoinButton;

        if (await trigger.isVisible({ timeout: 5000 }).catch(() => false)) {
            await trigger.click({ timeout: 10000 });
        } else {
            const section = mode === 'sell' ? this.youPaySection : this.youReceiveSection;
            await section.getByRole('button').filter({ hasNotText: /US Dollar/ }).first().click({ timeout: 10000 });
        }

        await this.coinModal.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
        await this.page.waitForTimeout(500);
    }

    async dismissOpenModals() {
        await this.page.keyboard.press('Escape').catch(() => {});
        const closeBtn = this.page.locator(
            '.chooseAssetModal button.close, .chooseAssetModal .btn-close, .modal.show button.close, button:has-text("Close")',
        ).first();
        if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
            await closeBtn.click().catch(() => {});
        }
        if (await this.coinModal.isVisible({ timeout: 500 }).catch(() => false)) {
            await this.page.keyboard.press('Escape').catch(() => {});
        }
        await this.page.waitForTimeout(300);
        await this.clearPageSelection();
    }

    async collectCoinsFromOpenDropdown() {
        return this.page.evaluate((excludeList) => {
            const exclude = new Set(excludeList);
            const pattern = /^[A-Z]{2,10}(-[A-Z0-9]+)?$/;
            const found = new Set();
            const modal = document.querySelector('.chooseAssetModal, [role="dialog"].chooseAssetModal');
            const root = modal || document.body;
            root.querySelectorAll('div, span, p, li, button, [role="option"]').forEach((el) => {
                const text = (el.innerText || '').trim().split('\n')[0].trim();
                if (pattern.test(text) && !exclude.has(text)) found.add(text);
            });
            return [...found];
        }, [...UI_WORDS]);
    }

    async getAllAvailableCoins() {
        console.log('Detecting available coins from chooseAssetModal...');
        await this.openCryptoCoinDropdown('buy');
        let symbols = await this.collectCoinsFromOpenDropdown();
        await this.dismissOpenModals();
        console.log(`Found coins in dropdown: ${(symbols || []).join(', ') || '(none)'}`);
        return symbols || [];
    }

    async selectCoin(symbol, mode = 'buy') {
        console.log(`Selecting coin: ${symbol} (${mode})`);
        if (await this.isCoinSelected(symbol, mode)) {
            console.log(`${symbol} already selected — skipping dropdown.`);
            await this.dismissOpenModals();
            return;
        }
        await this.openCryptoCoinDropdown(mode);

        const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const option = this.coinModal.locator('div, span, p, li, button, h6, [role="option"]')
            .filter({ hasText: new RegExp(`^${escaped}$`) }).first();

        if (await option.isVisible({ timeout: 8000 }).catch(() => false)) {
            await option.click({ timeout: 10000 });
        } else {
            await this.coinModal.getByRole('heading', { name: symbol, exact: true }).first().click({ timeout: 8000 }).catch(async () => {
                await this.coinModal.getByText(symbol, { exact: true }).first().click({ timeout: 8000 });
            });
        }

        await this.coinModal.waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
        await this.dismissOpenModals();
        await this.clearPageSelection();
        await this.page.waitForTimeout(800);
    }

    /** Safe amount entry – never uses Ctrl+A on the page. */
    async fillAmountInput(input, amount) {
        await this.clearPageSelection();
        await this.dismissOpenModals();
        await this.tradingPanel.scrollIntoViewIfNeeded().catch(() => {});
        await this.page.locator('.buySellCard').first().scrollIntoViewIfNeeded().catch(() => {});
        await input.waitFor({ state: 'visible', timeout: 15000 });
        await input.scrollIntoViewIfNeeded().catch(() => {});
        await input.fill(String(amount), { force: true });
        await input.evaluate((el) => {
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }).catch(() => {});
        await this.clearPageSelection();
    }

    async setPayAmount(amount) {
        console.log(`Setting amount to pay (fiat): ${amount}`);
        await this.fillAmountInput(this.getYouPayAmount(), amount);
        console.log('Amount entered.');
    }

    async setReceiveAmountFiat(amount) {
        console.log(`Setting amount to receive (fiat): ${amount}`);
        await this.fillAmountInput(this.getYouReceiveAmount(), amount);
        console.log('Receive amount (fiat) entered.');
    }

    async submitOrder() {
        console.log('Waiting for action button to be clickable...');
        await this.clearPageSelection();
        await this.dismissOpenModals();

        await this.actionButton.waitFor({ state: 'visible', timeout: 15000 });
        let isEnabled = await this.actionButton.isEnabled();
        if (!isEnabled) {
            await this.page.waitForTimeout(3000);
            isEnabled = await this.actionButton.isEnabled();
        }
        if (!isEnabled) {
            console.log('Action button is still DISABLED (min amount or balance).');
            return false;
        }

        console.log('Clicking Buy/Sell submit button...');
        await this.actionButton.click({ timeout: 15000 });
        await this.page.waitForTimeout(2500);

        const continueBtn = this.page.locator('button:has-text("Continue"), span:has-text("Continue")').filter({ visible: true }).first();
        if (await continueBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
            console.log('Clicking Continue on Review & Confirm popup...');
            await continueBtn.click();
            await this.page.waitForTimeout(2500);
            await this.enterPin(providedCredentials.pin);
        } else {
            const confirmModalBtn = this.page.locator('button:has-text("Confirm"), button:has-text("Place Order"), button:has-text("Submit")').filter({ visible: true }).first();
            if (await confirmModalBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await confirmModalBtn.click();
                await this.page.waitForTimeout(3000);
            }
        }

        await this.page.waitForTimeout(2000);
        console.log('Order submit flow completed.');
        return true;
    }

    async waitForOrderSuccessMessage(timeoutMs = 15000) {
        const deadline = Date.now() + timeoutMs;
        while (Date.now() < deadline) {
            const el = this.page.locator(
                '.toast-success, .success-notification, [class*="toast"]:has-text("success"), text=/order placed|completed|successfully/i',
            ).first();
            if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
                console.log('Order success message received.');
                return;
            }
            await this.page.waitForTimeout(1000);
        }
        console.log('No success message seen within timeout; proceeding.');
    }

    async enterPin(pin) {
        console.log(`Entering transaction PIN: ${pin}`);
        await this.page.waitForTimeout(1500);
        const pinFields = await this.page.locator('input[type="password"], input[type="text"], input[type="tel"]')
            .filter({ visible: true }).all();

        const targets = [];
        for (const f of pinFields) {
            const id = ((await f.getAttribute('id')) || '').toLowerCase();
            if (id.includes('email')) continue;
            targets.push(f);
        }

        if (targets.length === 0) {
            console.log('No PIN fields visible.');
            return;
        }

        if (targets.length === 1) {
            await targets[0].fill(pin);
        } else if (targets.length >= pin.length) {
            for (let i = 0; i < pin.length; i++) await targets[i].fill(pin[i]);
        } else {
            await targets[0].fill(pin);
        }

        const confirmBtn = this.page.locator('button:has-text("Confirm"), button:has-text("Verify"), button:has-text("Approve")').filter({ visible: true }).first();
        if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await confirmBtn.click();
        }
        await this.page.waitForTimeout(3000);
    }

    async validateLocators() {
        const checks = [];
        const add = async (name, locator) => {
            const ok = await locator.isVisible({ timeout: 8000 }).catch(() => false);
            checks.push({ name, ok });
        };
        await this.waitForExchangeReady(20000);
        await add('Trading panel', this.tradingPanel);
        await add('Buy tab (navTab)', this.buyTab);
        await add('Sell tab (navTab)', this.sellTab);
        await add('Submit button (not navTab)', this.actionButton);
        await add('You Pay spinbutton', this.getYouPayAmount());
        await add('You Receive coin button', this.youReceiveCoinButton);
        return checks;
    }

    async getValidationMessage() {
        if (await this.errorMessage.isVisible({ timeout: 3000 }).catch(() => false)) {
            return await this.errorMessage.textContent();
        }
        return null;
    }

    getMinAmountFromMessage(message) {
        if (!message) return null;
        const matches = message.match(/(\d+(\.\d+)?)/);
        return matches ? matches[0] : null;
    }

    async confirmOrder() {
        if (await this.confirmButton.isVisible({ timeout: 5000 }).catch(() => false)) {
            await this.confirmButton.click();
        }
    }
}
