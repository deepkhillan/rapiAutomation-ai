import { expect } from '@playwright/test';

export class TransactionHistoryPage {
    constructor(page) {
        this.page = page;
        this.sidebarLink = page.locator('a:has-text("Transaction History")').first();
        this.rapixPayTab = page.locator('button, [role="tab"], div').filter({ hasText: /^RapiX Pay$/ }).first();
        this.masterHistoryButton = page.locator('button:has-text("Master Trxn History"), button:has-text("Master")').first();
        this.historyTable = page.locator('table').first();
        this.totalCountText = page.locator('.total-count, .items-count').first();
    }

    async goto() {
        console.log('Navigating to Transaction History...');
        await this.sidebarLink.click();
        await this.page.waitForLoadState('networkidle');
    }

    async switchToRapixPay() {
        console.log('Switching to Rapix Pay tab...');
        await this.rapixPayTab.click();
        await this.page.waitForTimeout(2000);
    }

    async getTransactionCount() {
        // If there's a label "Total X items", we extract X.
        // Otherwise, count rows in the table.
        const rowCount = await this.historyTable.locator('tbody tr').count();
        console.log(`Current transaction count in table: ${rowCount}`);
        return rowCount;
    }

    /**
     * Get details of the latest transaction (raw text)
     */
    async getLatestTransaction() {
        const row = this.historyTable.locator('tbody tr').first();
        const details = await row.innerText();
        return details;
    }

    /**
     * Get structured details of the latest (first) transaction row
     * Assumes table has columns such as Date, Type, Coin, Amount, Price, Fee, Status
     * @returns {Promise<{ raw: string, cells: string[], type?: string, coin?: string, amount?: string, fee?: string, status?: string, timestamp?: string }>}
     */
    async getLatestTransactionDetails() {
        const row = this.historyTable.locator('tbody tr').first();
        const raw = await row.innerText();
        const cells = await row.locator('td').allTextContents();
        const normalized = cells.map(c => c.trim());
        return {
            raw,
            cells: normalized,
            type: normalized.find(c => /buy|sell/i.test(c)) || normalized[1],
            coin: normalized.find(c => /^[A-Z]{2,10}$/.test(c)) || normalized[2],
            amount: normalized[2] ?? normalized[3],
            fee: normalized.find(c => /^\d*\.?\d+$/.test(c)),
            status: normalized.find(c => /pending|completed|failed|cancelled/i.test(c)) || normalized[normalized.length - 1],
            timestamp: normalized[0]
        };
    }

    /**
     * Get transaction row by index (0 = latest)
     * @param {number} index
     * @returns {Promise<string>} Row text
     */
    async getTransactionByIndex(index) {
        const row = this.historyTable.locator('tbody tr').nth(index);
        return row.innerText();
    }

    /**
     * Verify that the latest transaction matches expected type and contains expected values
     * @param {Object} expected - { orderType: 'BUY'|'SELL', coin?: string, status?: string }
     * @returns {Promise<{ match: boolean, details: Object }>}
     */
    async verifyLatestTransaction(expected) {
        const details = await this.getLatestTransactionDetails();
        const typeMatch = !expected.orderType || (details.type && details.type.toUpperCase().includes(expected.orderType));
        const coinMatch = !expected.coin || (details.coin && details.coin.toUpperCase() === expected.coin.toUpperCase());
        const statusMatch = !expected.status || (details.status && details.status.toLowerCase().includes(expected.status.toLowerCase()));
        return {
            match: typeMatch && coinMatch && statusMatch,
            details
        };
    }

    /**
     * Check that transactions are ordered by date (latest first)
     * @param {number} sampleSize - number of rows to check
     * @returns {Promise<boolean>}
     */
    async isOrderedByDateLatestFirst(sampleSize = 3) {
        const rows = this.historyTable.locator('tbody tr');
        const count = await rows.count();
        if (count < 2) return true;
        const toCheck = Math.min(sampleSize, count - 1);
        for (let i = 0; i < toCheck; i++) {
            const first = await rows.nth(i).locator('td').first().innerText();
            const second = await rows.nth(i + 1).locator('td').first().innerText();
            if (first && second && new Date(first) < new Date(second)) return false;
        }
        return true;
    }
}
