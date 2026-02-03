import { expect } from '@playwright/test';

/**
 * Rapix Pay Page Object Model
 */
export class RapixPayPage {
    constructor(page) {
        this.page = page;
        this.sidebarLink = page.locator('a:has-text("RapiX Pay")').first();
        this.sendButton = page.locator('button:has-text("Send")').first();
        this.receiveButton = page.locator('button:has-text("Receive")').first();

        // Send Flow - Step 1
        this.emailInput = page.locator('input[placeholder*="email"], input[name="email"], input#email').first();
        this.continueButton = page.locator('button:has-text("Continue"), .btn-continue').first();

        // Send Flow - Step 2 (Assumed based on requirements)
        // System always asks for 'number of orders to execute'
        this.orderCountInput = page.locator('input[placeholder*="orders"], input[name="orderCount"], input[type="number"]').first();
        this.coinDropdown = page.locator('.coin-select, .select-asset, .dropdown-toggle, .coin-dropdown, [role="button"]:has(.coin-icon)').first();
        this.amountInput = page.locator('input[placeholder*="Amount"], input[name="amount"]').first();
        this.finalSubmitButton = page.locator('button:has-text("Send"), button:has-text("Transfer"), button:has-text("Confirm")').last();

        // Recent Transactions Listing
        this.recentTransactionsSection = page.locator('.recent-transactions, div:has-text("Recent Transactions")').first();
        this.latestTransactionRow = page.locator('table tbody tr, .transaction-item').first();
    }

    async goto() {
        console.log('Navigating to Rapix Pay...');
        await this.sidebarLink.click();
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000);
    }

    /**
     * Place Rapix Pay Send order(s)
     */
    async placeSendOrder(email, coin, amount, orderCount) {
        console.log(`Starting Rapix Pay Send flow: ${orderCount} orders of ${amount} ${coin} to ${email}`);

        await this.sendButton.click();
        await this.emailInput.fill(email);
        await this.continueButton.click();
        await this.page.waitForTimeout(2000);

        // Select Coin from dropdown
        if (coin !== 'default') {
            await this.coinDropdown.click();
            const coinOption = this.page.locator(`div, span, p`).filter({ hasText: new RegExp(`^${coin}$`) }).last();
            await coinOption.click();
        }

        // Enter number of orders (Specific requirement)
        if (await this.orderCountInput.isVisible()) {
            await this.orderCountInput.fill(orderCount.toString());
        }

        // Enter amount per order
        await this.amountInput.fill(amount.toString());

        // Submit
        await this.finalSubmitButton.click();
        await this.page.waitForTimeout(3000);
    }

    async getLatestTransactionDetails() {
        console.log('Fetching latest transaction from Rapix Pay recent listing...');
        if (await this.latestTransactionRow.isVisible()) {
            return await this.latestTransactionRow.innerText();
        }
        return "No Record Found";
    }
}
