import { expect } from '@playwright/test';

export class WalletPage {
    constructor(page) {
        this.page = page;
        this.sidebarLink = page.locator('a:has-text("Wallets")').first();
        this.cryptoWalletTab = page.locator('button:has-text("Crypto Wallet"), .tab:has-text("Crypto")').first();
        this.fiatWalletTab = page.locator('button:has-text("Fiat Wallet"), .tab:has-text("Fiat")').first();
        this.walletsTable = page.locator('table').first();
        this.searchField = page.locator('input[placeholder*="Search"]').first();
    }

    async goto() {
        console.log('Navigating to Wallets page...');
        await this.sidebarLink.click();
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Get balance for a specific coin
     * @param {string} coinSymbol e.g. 'BTC', 'ETH'
     * @returns {Promise<number>}
     */
    async getBalance(coinSymbol) {
        console.log(`Getting balance for ${coinSymbol}...`);
        await this.searchField.fill(coinSymbol);
        await this.page.waitForTimeout(2000); // Wait for filter

        // Find the row containing the coin symbol
        const row = this.page.locator('tr').filter({ hasText: coinSymbol }).first();
        // Assuming "Available" is the 3rd or 4th column. Let's look at the screenshot.
        // Columns: Coin Name, Total Balance, Available, Locked, Action.
        // "Available" is the 3rd data column (index 2 or 3 usually)
        const availableText = await row.locator('td').nth(2).innerText();
        const balance = parseFloat(availableText.replace(/[^0-9.]/g, ''));
        console.log(`Available balance for ${coinSymbol}: ${balance}`);
        return balance;
    }
}
