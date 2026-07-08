import { navigateToFeature, APP_ROUTES, clickAppNavLink } from '../utils/appNavigation.js';

/**
 * Rapix Pay Page Object Model
 */
export class RapixPayPage {
    constructor(page) {
        this.page = page;
        this.sidebarLink = page.locator('a:has-text("RapiX Pay")').first();
        this.sendButton = page.locator('button:has-text("Send")').first();
        this.receiveButton = page.locator('button:has-text("Receive")').first();

        this.emailInput = page.locator('input[placeholder*="email" i], input[name="email"], input#email').first();
        this.continueButton = page.locator('button:has-text("Continue"), .btn-continue').first();

        this.orderCountInput = page.locator('input[placeholder*="orders" i], input[name="orderCount"], input[type="number"]').first();
        this.coinDropdown = page.locator('.coin-select, .select-asset, .dropdown-toggle, .coin-dropdown, [role="button"]:has(.coin-icon), .inputHead_selectModal').first();
        this.amountInput = page.locator('input[placeholder*="Amount" i], input[name="amount"]').first();
        this.finalSubmitButton = page.locator('main button:has-text("Send"), button:has-text("Transfer"), button:has-text("Confirm")').filter({ visible: true }).last();

        this.recentTransactionsSection = page.locator('.recent-transactions, div:has-text("Recent Transactions")').first();
        this.latestTransactionRow = page.locator('table tbody tr, .transaction-item').first();
    }

    async goto() {
        console.log('Navigating to Rapix Pay...');
        const url = await navigateToFeature(this.page, APP_ROUTES.rapixPay);
        if (!APP_ROUTES.rapixPay.urlPattern.test(url)) {
            await clickAppNavLink(this.page, APP_ROUTES.rapixPay);
        }
        await this.page.waitForLoadState('domcontentloaded').catch(() => {});
        await this.page.waitForTimeout(2000);
        console.log(`RapiX Pay URL: ${this.page.url()}`);
    }

    async selectCoin(coin) {
        const trigger = this.page.locator(
            '.coin-select, .select-asset, .dropdown-toggle, .coin-dropdown, .inputHead_selectModal_coinSelect, [class*="coinSelect"]',
        ).filter({ visible: true }).first();
        if (!(await trigger.isVisible({ timeout: 5000 }).catch(() => false))) return false;
        await trigger.click({ timeout: 5000 });
        await this.page.waitForTimeout(1000);
        const escaped = coin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const option = this.page.locator('h6, li, button, span, p, [role="option"]')
            .filter({ hasText: new RegExp(`^${escaped}$`, 'i') }).first();
        if (await option.isVisible({ timeout: 5000 }).catch(() => false)) {
            await option.click();
            await this.page.waitForTimeout(800);
            return true;
        }
        return false;
    }

    /**
     * Place Rapix Pay Send order(s). Returns true when final Send was clicked.
     */
    async placeSendOrder(email, coin, amount, orderCount) {
        console.log(`Starting Rapix Pay Send flow: ${orderCount} orders of ${amount} ${coin} to ${email}`);

        if (!(await this.sendButton.isVisible({ timeout: 10000 }).catch(() => false))) {
            console.log('Send button not visible on Rapix Pay page.');
            return false;
        }
        await this.sendButton.click({ timeout: 15000 });
        await this.emailInput.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
        await this.emailInput.fill(email);
        await this.page.waitForTimeout(1200);

        const countNum = parseFloat(String(orderCount));
        const countField = this.page.locator('input[type="number"], input[placeholder*="orders" i]').first();
        if (await countField.isVisible({ timeout: 3000 }).catch(() => false)) {
            await countField.fill(String(orderCount));
            await this.page.waitForTimeout(500);
        }

        if (!Number.isFinite(countNum) || countNum <= 0) {
            const validation = await this.page.locator('text=/invalid|minimum|must be|greater than|positive|zero/i').first()
                .isVisible({ timeout: 3000 }).catch(() => false);
            const continueDisabled = await this.continueButton.isDisabled().catch(() => false);
            if (validation || continueDisabled) return false;
        }

        console.log('Clicking Continue (step 1)...');
        await this.continueButton.click({ timeout: 10000 }).catch(() => {});
        await this.page.waitForTimeout(2500);

        if (coin !== 'default') {
            await this.selectCoin(coin);
        }

        if (await this.orderCountInput.isVisible({ timeout: 8000 }).catch(() => false)) {
            await this.orderCountInput.fill(String(orderCount));
        }

        const amountField = this.page.locator('main input[placeholder*="Amount" i], main input[name="amount"], main input[type="number"]').first();
        if (await amountField.isVisible({ timeout: 8000 }).catch(() => false)) {
            await amountField.fill(String(amount));
            await this.page.waitForTimeout(800);
        }

        if (!Number.isFinite(countNum) || countNum <= 0) {
            const submitDisabled = await this.finalSubmitButton.isDisabled().catch(() => false);
            const validation = await this.page.locator('text=/invalid|minimum|must be|greater than|positive/i').first()
                .isVisible({ timeout: 2000 }).catch(() => false);
            if (submitDisabled || validation) return false;
        }

        const sendBtn = this.page.locator('main button:has-text("Send"), button[type="submit"]:has-text("Send")')
            .filter({ visible: true }).last();
        if (!(await sendBtn.isVisible({ timeout: 8000 }).catch(() => false))) {
            console.log('Final Send button not visible after Continue.');
            return false;
        }
        const enabled = await sendBtn.isEnabled().catch(() => false);
        if (!enabled) {
            console.log('Final Send button disabled (validation or insufficient balance).');
            return false;
        }
        await sendBtn.click({ timeout: 10000 });
        await this.page.waitForTimeout(2000);
        console.log('Rapix Pay Send submitted.');
        return true;
    }

    async getLatestTransactionDetails() {
        console.log('Fetching latest transaction from Rapix Pay recent listing...');
        if (await this.latestTransactionRow.isVisible({ timeout: 5000 }).catch(() => false)) {
            return await this.latestTransactionRow.innerText();
        }
        return '';
    }
}
