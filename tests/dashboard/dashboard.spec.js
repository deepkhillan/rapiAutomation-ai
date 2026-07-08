/**
 * Dashboard – positive test cases after login.
 * Session: login once via tests/auth/auth.setup.js (--project=authenticated).
 */

import { test, expect } from '@playwright/test';
import { prepareAuthenticatedPage } from '../utils/prepareAuthenticatedPage.js';

test.describe('Dashboard – Positive', () => {
    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);
        await prepareAuthenticatedPage(page);
    });

    test('TC-DASH-POS-01: After login, main app loads (not login page)', async ({ page }) => {
        const onLogin = page.url().toLowerCase().includes('/login');
        expect(onLogin).toBeFalsy();
    });

    test('TC-DASH-POS-02: Dashboard or home – balance/summary or main content visible', async ({ page }) => {
        const balance = page.locator('text=/balance|portfolio|total|USD|wallet/i').first();
        const sidebar = page.locator('a:has-text("Wallets"), a:has-text("Buy"), a:has-text("Dashboard")').first();
        const mainContent = page.locator('main, [class*="dashboard"], [class*="content"], [class*="layout"]').first();
        const visible = await balance.isVisible({ timeout: 8000 }).catch(() => false)
            || await sidebar.isVisible({ timeout: 8000 }).catch(() => false)
            || await mainContent.isVisible({ timeout: 8000 }).catch(() => false);
        expect(visible).toBeTruthy();
    });

    test('TC-DASH-POS-03: Sidebar navigation links visible (Wallets, Buy/Sell, etc.)', async ({ page }) => {
        const navSelectors = [
            'nav a[href*="wallet" i]',
            'aside a[href*="wallet" i]',
            'a:has-text("Wallets")',
            'a:has-text("Buy/Sell")',
            'a[href*="buysell" i]',
            'a[href*="transaction-history" i]',
            '[class*="sidebar" i] a',
            'nav a, aside a',
        ];
        let hasNav = false;
        for (const sel of navSelectors) {
            if (await page.locator(sel).first().isVisible({ timeout: 4000 }).catch(() => false)) {
                hasNav = true;
                break;
            }
        }
        expect(hasNav).toBeTruthy();
    });
});
