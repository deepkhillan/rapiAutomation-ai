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
     * Get details of the latest transaction
     */
    async getLatestTransaction() {
        const row = this.historyTable.locator('tbody tr').first();
        const details = await row.innerText();
        return details;
    }
}
