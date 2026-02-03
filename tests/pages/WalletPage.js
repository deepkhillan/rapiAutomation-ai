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
     * Get balance for a specific coin (crypto or fiat)
     * @param {string} coinSymbol e.g. 'BTC', 'ETH', 'USD', 'USDT'
     * @returns {Promise<number>}
     */
    async getBalance(coinSymbol) {
        console.log(`Getting balance for ${coinSymbol}...`);
        await this.searchField.fill(coinSymbol);
        await this.page.waitForTimeout(2000); // Wait for filter

        const row = this.page.locator('tr').filter({ hasText: coinSymbol }).first();
        // Available balance: typically 3rd data column (index 2)
        const availableText = await row.locator('td').nth(2).innerText();
        const balance = parseFloat(availableText.replace(/[^0-9.]/g, ''));
        console.log(`Available balance for ${coinSymbol}: ${balance}`);
        return balance;
    }

    /**
     * Capture fiat balance (USD or USDT)
     * @param {string} fiatSymbol e.g. 'USD', 'USDT'
     * @returns {Promise<number>}
     */
    async getFiatBalance(fiatSymbol = 'USD') {
        return this.getBalance(fiatSymbol);
    }

    /**
     * Capture crypto balance for a given coin
     * @param {string} cryptoSymbol e.g. 'BTC', 'ETH'
     * @returns {Promise<number>}
     */
    async getCryptoBalance(cryptoSymbol) {
        return this.getBalance(cryptoSymbol);
    }

    /**
     * Capture multiple balances at once (for before/after snapshots)
     * @param {string[]} symbols e.g. ['USD', 'BTC']
     * @returns {Promise<Object<string, number>>} e.g. { USD: 100, BTC: 0.001 }
     */
    async getBalances(symbols) {
        const result = {};
        for (const symbol of symbols) {
            try {
                result[symbol] = await this.getBalance(symbol);
            } catch (e) {
                console.log(`Could not get balance for ${symbol}:`, e.message);
                result[symbol] = NaN;
            }
        }
        return result;
    }
}
