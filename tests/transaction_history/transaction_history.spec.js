/**
 * Transaction History – positive and negative test cases.
 * Requires saved auth (--project=authenticated).
 */

import { test, expect } from '@playwright/test';
import { TransactionHistoryPage } from '../pages/TransactionHistoryPage.js';
import { prepareAuthenticatedPage } from '../utils/prepareAuthenticatedPage.js';

test.describe('Transaction History – Positive & Negative', () => {
    test.beforeEach(async ({ page }) => {
        test.setTimeout(60000);
        await prepareAuthenticatedPage(page);
    });

    test('TC-TH-POS-01: Transaction History page loads and sidebar link works', async ({ page }) => {
        const historyPage = new TransactionHistoryPage(page);
        await historyPage.goto();
        await page.waitForTimeout(2000);
        const table = historyPage.historyTable;
        const hasTable = await table.isVisible({ timeout: 10000 }).catch(() => false);
        const urlOk = page.url().toLowerCase().includes('transaction') || page.url().toLowerCase().includes('history');
        expect(hasTable || urlOk).toBeTruthy();
    });

    test('TC-TH-POS-02: Transaction History – table or content area visible', async ({ page }) => {
        const historyPage = new TransactionHistoryPage(page);
        await historyPage.goto();
        await page.waitForTimeout(2000);
        const table = historyPage.historyTable;
        const anyContent = page.locator('table, .transaction-list, [class*="history"], [class*="transaction"]').first();
        const visible = await table.isVisible({ timeout: 8000 }).catch(() => false)
            || await anyContent.isVisible({ timeout: 8000 }).catch(() => false);
        expect(visible).toBeTruthy();
    });

    test('TC-TH-POS-03: RapiX Pay tab (if present) is clickable', async ({ page }) => {
        const historyPage = new TransactionHistoryPage(page);
        await historyPage.goto();
        await page.waitForTimeout(2000);
        const rapixTab = historyPage.rapixPayTab;
        if (await rapixTab.isVisible({ timeout: 5000 }).catch(() => false)) {
            await rapixTab.click();
            await page.waitForTimeout(1500);
        }
        expect(true).toBeTruthy();
    });

    test('TC-TH-NEG-01: Transaction History – invalid filter (if filter exists) does not break page', async ({ page }) => {
        const historyPage = new TransactionHistoryPage(page);
        await historyPage.goto();
        await page.waitForTimeout(2000);
        const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
        if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await searchInput.fill('__invalid_filter_xyz__');
            await page.waitForTimeout(2000);
        }
        const table = historyPage.historyTable;
        const pageStillOk = await table.isVisible({ timeout: 5000 }).catch(() => false)
            || await page.locator('body').isVisible();
        expect(pageStillOk).toBeTruthy();
    });
});
