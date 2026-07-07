import { expect } from '@playwright/test';
import { navigateToFeature, APP_ROUTES, clickAppNavLink } from '../utils/appNavigation.js';

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
        const url = await navigateToFeature(this.page, APP_ROUTES.wallets);
        if (!APP_ROUTES.wallets.urlPattern.test(url)) {
            await clickAppNavLink(this.page, APP_ROUTES.wallets);
        }
        if (!APP_ROUTES.wallets.urlPattern.test(this.page.url())) {
            await this.page.goto('/wallet', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
        }
        await this.page.waitForLoadState('domcontentloaded').catch(() => {});
        await this.ensureCryptoWalletTab();
        await this.page.waitForTimeout(2000);
        console.log(`Wallets URL: ${this.page.url()}`);
    }

    async ensureCryptoWalletTab() {
        if (await this.cryptoWalletTab.isVisible({ timeout: 5000 }).catch(() => false)) {
            await this.cryptoWalletTab.click();
            await this.page.waitForTimeout(1500);
        }
    }

    /**
     * Get balance for a specific coin (crypto or fiat)
     * @param {string} coinSymbol e.g. 'BTC', 'ETH', 'USD', 'USDT'
     * @returns {Promise<number>}
     */
    async getBalance(coinSymbol) {
        console.log(`Getting balance for ${coinSymbol}...`);
        await this.ensureCryptoWalletTab();

        const search = this.page.locator('input[placeholder*="Search" i], input[type="search"]').first();
        if (await search.isVisible({ timeout: 3000 }).catch(() => false)) {
            await search.fill('');
            await search.fill(coinSymbol);
            await this.page.waitForTimeout(2000);
        }

        const row = this.page.locator('tr, [class*="table-row"], [class*="wallet-row"], [class*="asset-row"]')
            .filter({ hasText: new RegExp(coinSymbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }).first();
        const card = this.page.locator('div[class*="card"], div[class*="wallet"], div[class*="asset"]')
            .filter({ hasText: new RegExp(coinSymbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }).first();

        let balanceText = '';
        if (await row.isVisible({ timeout: 8000 }).catch(() => false)) {
            const cells = row.locator('td, [class*="cell"]');
            const cellCount = await cells.count();
            const availableIndex = cellCount >= 3 ? 2 : 1;
            balanceText = await cells.nth(availableIndex).innerText().catch(() => row.innerText());
        } else if (await card.isVisible({ timeout: 5000 }).catch(() => false)) {
            balanceText = await card.innerText();
        } else {
            console.log(`Wallet row/card not found for ${coinSymbol}; returning 0.`);
            return 0;
        }

        const match = balanceText.match(/[\d,]+\.?\d*/);
        const balance = match ? parseFloat(match[0].replace(/,/g, '')) : NaN;
        console.log(`Available balance for ${coinSymbol}: ${balance}`);
        return Number.isFinite(balance) ? balance : 0;
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
