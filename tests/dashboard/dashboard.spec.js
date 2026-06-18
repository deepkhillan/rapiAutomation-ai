/**
 * Dashboard – positive test cases after login.
 * Session: login once via tests/auth/auth.setup.js (--project=authenticated).
 */

import { test, expect } from '@playwright/test';
import { prepareAuthenticatedPage } from '../utils/prepareAuthenticatedPage.js';

test.describe('Dashboard – Positive', () => {
    test.beforeEach(async ({ page }) => {
        test.setTimeout(60000);
        await prepareAuthenticatedPage(page);
    });

    test('TC-DASH-POS-01: After login, main app loads (not login page)', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);
        const onLogin = page.url().toLowerCase().includes('/login');
        expect(onLogin).toBeFalsy();
    });

    test('TC-DASH-POS-02: Dashboard or home – balance/summary or main content visible', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);
        const balance = page.locator('text=/balance|portfolio|total|USD|wallet/i').first();
        const sidebar = page.locator('a:has-text("Wallets"), a:has-text("Buy"), a:has-text("Dashboard")').first();
        const mainContent = page.locator('main, [class*="dashboard"], [class*="content"], [class*="layout"]').first();
        const visible = await balance.isVisible({ timeout: 8000 }).catch(() => false)
            || await sidebar.isVisible({ timeout: 8000 }).catch(() => false)
            || await mainContent.isVisible({ timeout: 8000 }).catch(() => false);
        expect(visible).toBeTruthy();
    });

    test('TC-DASH-POS-03: Sidebar navigation links visible (Wallets, Buy/Sell, etc.)', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);
        const walletsLink = page.locator('a:has-text("Wallets"), a:has-text("Wallet")').first();
        const buyLink = page.locator('a:has-text("Buy/Sell"), a:has-text("Buy")').first();
        const hasNav = await walletsLink.isVisible({ timeout: 8000 }).catch(() => false)
            || await buyLink.isVisible({ timeout: 8000 }).catch(() => false);
        expect(hasNav).toBeTruthy();
    });
});
