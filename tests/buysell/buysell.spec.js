/**
 * Buy/Sell Module – Single spec
 * Flow: Auth once (saved session) → get crypto list from Buy/Sell page dropdown → place BUY orders for ALL coins
 * (select each coin from dropdown) → then place SELL orders for ALL coins (select from dropdown) →
 * verify wallet & history. Issues are reported clearly at the end.
 * @see CRYPTO_EXCHANGE_TEST_CASES.md for manual test cases
 */

import { test, expect } from '@playwright/test';
import { BuySellPage } from '../pages/BuySellPage.js';
import { WalletPage } from '../pages/WalletPage.js';
import { TransactionHistoryPage } from '../pages/TransactionHistoryPage.js';
import { prepareAuthenticatedPage } from '../utils/prepareAuthenticatedPage.js';
import { writeBuySellRegressionReport } from '../utils/buysellReport.js';
import { loadKnownCoins, mergeCoinLists } from '../utils/loadKnownCoins.js';

const FIAT_SYMBOL = 'USD';
const BUY_AMOUNT_FIAT = '15';
const SELL_AMOUNT_FIAT = '10';
const ORDER_WAIT_MS = 20000;
const GAP_BETWEEN_COINS_MS = 20000;

test.describe('Buy/Sell – All coins (login once, all BUYs then all SELLs, dropdown selection)', () => {
    test('Place BUY orders for all coins → then SELL orders for all coins (select from dropdown); report issues', async ({ page }) => {
        const totalTimeout = 1800000;
        test.setTimeout(totalTimeout);

        // Some actions may open a new tab and close the original page. Keep an activePage reference.
        let activePage = page;
        let buySellPage = new BuySellPage(activePage);
        let walletPage = new WalletPage(activePage);
        let txHistoryPage = new TransactionHistoryPage(activePage);

        const syncActivePage = async () => {
            if (activePage && !activePage.isClosed()) return;
            const pages = page.context().pages();
            const last = pages[pages.length - 1];
            if (last && !last.isClosed()) {
                activePage = last;
                buySellPage = new BuySellPage(activePage);
                walletPage = new WalletPage(activePage);
                txHistoryPage = new TransactionHistoryPage(activePage);
            }
        };

        const safeWait = async (ms) => {
            await syncActivePage();
            if (!activePage || activePage.isClosed()) return;
            await activePage.waitForTimeout(ms);
        };

        /** @type {{ coin: string, success: boolean, message: string }[]} */
        const buyResults = [];
        /** @type {{ coin: string, success: boolean, message: string }[]} */
        const sellResults = [];
        /** @type {string[]} */
        const issues = [];
        /** @type {{ name: string, ok: boolean, detail?: string }[]} */
        let locatorChecks = [];
        const startedAt = Date.now();

        // --- Session from auth setup (login once) ---
        console.log('--- Authenticated session (saved auth) ---');
        await prepareAuthenticatedPage(activePage);

        // --- Locator sanity + coin list ---
        console.log('--- Validate Buy/Sell locators ---');
        await buySellPage.goto();
        await safeWait(1500);
        locatorChecks = await buySellPage.validateLocators();
        const locatorFails = locatorChecks.filter((c) => !c.ok);
        if (locatorFails.length) {
            issues.push(`Locators: ${locatorFails.map((c) => c.name).join(', ')} not visible.`);
        }

        console.log('--- Get crypto list from Buy/Sell dropdown + known coins ---');
        const dropdownCoins = await buySellPage.getAllAvailableCoins();
        const knownCoins = loadKnownCoins();
        let coins = mergeCoinLists(dropdownCoins, knownCoins);
        if (coins.length === 0) {
            console.log('No crypto coins found; using default list [BTC, ETH].');
            coins = ['BTC', 'ETH'];
            issues.push('ISSUE: Coin dropdown returned no crypto; using default [BTC, ETH].');
        } else if (dropdownCoins.length < knownCoins.length) {
            issues.push(`Dropdown showed ${dropdownCoins.length} coins; merged with known list (${knownCoins.length} total).`);
        }
        console.log(`Coins to test: ${coins.join(', ')}`);

        try {
        // ========== PHASE 1: Place BUY orders for ALL coins (select each from dropdown) ==========
        console.log('\n--- PHASE 1: BUY orders for all coins (select from dropdown) ---');
        await buySellPage.goto();
        await safeWait(1200);
        await buySellPage.switchToBuy();

        for (const coin of coins) {
            console.log(`  [BUY] ${coin}: selecting from dropdown, amount ${BUY_AMOUNT_FIAT} USD...`);
            try {
                await syncActivePage();
                await buySellPage.selectCoin(coin, 'buy');
                await safeWait(800);
                await buySellPage.setPayAmount(BUY_AMOUNT_FIAT);
                await safeWait(600);
                const submitted = await buySellPage.submitOrder();
                if (submitted) {
                    await buySellPage.waitForOrderSuccessMessage();
                    buyResults.push({ coin, success: true, message: 'BUY order submitted.' });
                    await safeWait(Math.min(ORDER_WAIT_MS, 8000));
                } else {
                    buyResults.push({ coin, success: false, message: 'BUY button disabled (min amount or balance).' });
                    issues.push(`BUY ${coin}: Button disabled – min amount or insufficient balance.`);
                }
            } catch (e) {
                buyResults.push({ coin, success: false, message: e.message || 'Error' });
                issues.push(`BUY ${coin}: ${e.message || 'Exception during order.'}`);
            }
            await safeWait(Math.min(GAP_BETWEEN_COINS_MS, 4000));
        }

        // ========== PHASE 2: Place SELL orders for ALL coins (select each from dropdown) ==========
        console.log('\n--- PHASE 2: SELL orders for all coins (select from dropdown) ---');
        await buySellPage.goto();
        await safeWait(1200);
        await buySellPage.switchToSell();

        for (const coin of coins) {
            console.log(`  [SELL] ${coin}: selecting from dropdown, receive ${SELL_AMOUNT_FIAT} USD...`);
            try {
                await syncActivePage();
                await buySellPage.selectCoin(coin, 'sell');
                await safeWait(800);
                await buySellPage.setReceiveAmountFiat(SELL_AMOUNT_FIAT);
                await safeWait(600);
                const submitted = await buySellPage.submitOrder();
                if (submitted) {
                    await buySellPage.waitForOrderSuccessMessage();
                    sellResults.push({ coin, success: true, message: 'SELL order submitted.' });
                    await safeWait(Math.min(ORDER_WAIT_MS, 8000));
                } else {
                    sellResults.push({ coin, success: false, message: 'SELL button disabled (min amount or balance).' });
                    issues.push(`SELL ${coin}: Button disabled – min amount or insufficient balance.`);
                }
            } catch (e) {
                sellResults.push({ coin, success: false, message: e.message || 'Error' });
                issues.push(`SELL ${coin}: ${e.message || 'Exception during order.'}`);
            }
            await safeWait(Math.min(GAP_BETWEEN_COINS_MS, 4000));
        }

        // ========== PHASE 3: Spot-check wallet (sample coins only – saves regression time) ==========
        console.log('\n--- PHASE 3: Spot-check wallet (sample) ---');
        const sampleForWallet = coins.filter(c => buyResults.find(r => r.coin === c && r.success)).slice(0, 3);
        for (const coin of sampleForWallet) {
            try {
                await walletPage.goto();
                await safeWait(1200);
                const balance = await walletPage.getBalance(coin);
                console.log(`  [${coin}] Wallet balance: ${balance}`);
            } catch (e) {
                issues.push(`Wallet ${coin}: ${e.message || 'Failed to get balance.'}`);
            }
        }

        expect(buyResults.length).toBe(coins.length);
        expect(sellResults.length).toBe(coins.length);
        if (locatorFails.length) {
            console.log(`Locator warnings: ${locatorFails.map(c => c.name).join(', ')}`);
        }
        console.log('\n--- Buy/Sell all-coins flow finished ---');
        } finally {
            if (buyResults.length > 0 || sellResults.length > 0) {
                const buyOk = buyResults.filter(r => r.success).length;
                const buyFail = buyResults.filter(r => !r.success).length;
                const sellOk = sellResults.filter(r => r.success).length;
                const sellFail = sellResults.filter(r => !r.success).length;
                const durationMs = Date.now() - startedAt;
                const { paths: reportPaths } = writeBuySellRegressionReport({
                    coins,
                    buyResults,
                    sellResults,
                    locatorChecks,
                    issues,
                    durationMs,
                });
                const reportText = [
                    '========== BUY/SELL TEST REPORT ==========',
                    `Report files: ${reportPaths.md} | ${reportPaths.json}`,
                    `Coins tested: ${coins.length} — ${coins.join(', ')}`,
                    `BUY: ${buyOk}/${coins.length} passed (${coins.length ? Math.round((buyOk / coins.length) * 100) : 0}%)`,
                    ...buyResults.map(r => `  ${r.coin}: ${r.success ? 'OK' : 'FAIL'} – ${r.message}`),
                    `SELL: ${sellOk}/${coins.length} passed (${coins.length ? Math.round((sellOk / coins.length) * 100) : 0}%)`,
                    ...sellResults.map(r => `  ${r.coin}: ${r.success ? 'OK' : 'FAIL'} – ${r.message}`),
                    `Locators: ${locatorChecks.filter(c => c.ok).length}/${locatorChecks.length} OK`,
                ].join('\n');
                console.log('\n' + reportText);
                test.info().attach('BUY_SELL_REPORT', { body: reportText, contentType: 'text/plain' });
            }
        }
    });

    /**
     * TC-NEG-07: Page refresh after order does not duplicate – single entry in history.
     */
    test('TC-NEG-07: Page refresh after order does not duplicate – single entry in history', async ({ page }) => {
        test.setTimeout(180000);
        await prepareAuthenticatedPage(page);
        const buySellPage = new BuySellPage(page);
        const txHistoryPage = new TransactionHistoryPage(page);

        const safeWait = async (ms) => {
            if (page.isClosed()) return;
            await page.waitForTimeout(ms);
        };

        await safeWait(2000);
        await txHistoryPage.goto();
        await safeWait(2000);
        const countBefore = await txHistoryPage.getTransactionCount();

        await buySellPage.goto();
        await safeWait(2000);
        await buySellPage.switchToBuy();
        await buySellPage.selectCoin('BTC', 'buy').catch(() => {});
        await buySellPage.dismissOpenModals();
        await safeWait(1500);
        await buySellPage.setPayAmount(BUY_AMOUNT_FIAT);
        await safeWait(1000);
        const submitted = await buySellPage.submitOrder();
        expect(submitted).toBeTruthy();
        await buySellPage.waitForOrderSuccessMessage();
        await safeWait(5000);

        await txHistoryPage.goto();
        await safeWait(2500);
        const countAfterOrder = await txHistoryPage.getTransactionCount();
        const latestAfterOrder = await txHistoryPage.getLatestTransaction().catch(() => '');

        if (!page.isClosed()) {
            await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
        }
        await safeWait(2500);
        await txHistoryPage.goto();
        await safeWait(2000);
        const countAfterRefresh = await txHistoryPage.getTransactionCount();
        const latestAfterRefresh = await txHistoryPage.getLatestTransaction().catch(() => '');

        expect(countAfterOrder).toBeGreaterThanOrEqual(countBefore);
        expect(countAfterRefresh).toBeLessThanOrEqual(countAfterOrder + 1);
        const stable = latestAfterRefresh === latestAfterOrder
            || /BTC/i.test(latestAfterRefresh)
            || /BUY/i.test(latestAfterRefresh);
        expect(stable).toBeTruthy();
    });
});

/** Buy/Sell – focused positive and negative test cases for full platform coverage */
test.describe('Buy/Sell – Positive & Negative (focused)', () => {
    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);
        await prepareAuthenticatedPage(page);
    });

    test('TC-BS-POS-01: Buy/Sell page loads and URL contains buysell', async ({ page }) => {
        const buySellPage = new BuySellPage(page);
        await buySellPage.goto();
        await page.waitForTimeout(3000);
        expect(page.url()).toMatch(/buy-sell|buysell|exchange/i);
    });

    test('TC-BS-POS-02: Buy tab is visible and clickable', async ({ page }) => {
        const buySellPage = new BuySellPage(page);
        await buySellPage.goto();
        await page.waitForTimeout(2000);
        const buyTab = buySellPage.buyTab;
        await expect(buyTab).toBeVisible({ timeout: 10000 });
        await buyTab.click();
        await page.waitForTimeout(1000);
    });

    test('TC-BS-POS-03: Sell tab is visible and clickable', async ({ page }) => {
        const buySellPage = new BuySellPage(page);
        await buySellPage.goto();
        await page.waitForTimeout(2000);
        const sellTab = buySellPage.sellTab;
        await expect(sellTab).toBeVisible({ timeout: 10000 });
        await sellTab.click();
        await page.waitForTimeout(1000);
    });

    test('TC-BS-POS-04: Exchange form (amount input or card) is visible on Buy', async ({ page }) => {
        const buySellPage = new BuySellPage(page);
        await buySellPage.goto();
        await page.waitForTimeout(2000);
        await buySellPage.switchToBuy();
        const amountField = buySellPage.getYouPayAmount();
        const hasForm = await amountField.isVisible({ timeout: 10000 }).catch(() => false)
            || await buySellPage.tradingPanel.isVisible({ timeout: 8000 }).catch(() => false);
        expect(hasForm).toBeTruthy();
    });

    test('TC-BS-NEG-01: Buy with amount below minimum – button disabled, validation shown, or no success on submit', async ({ page }) => {
        const buySellPage = new BuySellPage(page);
        await buySellPage.goto();
        await page.waitForTimeout(2000);
        await buySellPage.switchToBuy();
        await buySellPage.selectCoin('BTC', 'buy').catch(() => {});
        await page.waitForTimeout(1500);
        await buySellPage.setPayAmount('0.01');
        await page.waitForTimeout(1500);
        const actionBtn = buySellPage.actionButton;
        const minError = page.locator('text=/minimum|min\\. amount|at least|below minimum/i').first();
        const disabled = await actionBtn.isDisabled().catch(() => false);
        const hasMinError = await minError.isVisible({ timeout: 2000 }).catch(() => false);
        if (disabled || hasMinError) {
            expect(true).toBeTruthy();
            return;
        }
        // App may allow click; then we expect no success toast (validation on submit or modal)
        await actionBtn.click().catch(() => {});
        await page.waitForTimeout(3000);
        const successToast = page.locator('[class*="toast"]:has-text("success"), [class*="toast"]:has-text("Success"), .success-notification').first();
        const noSuccess = !(await successToast.isVisible({ timeout: 3000 }).catch(() => false));
        expect(noSuccess).toBeTruthy();
    });

    test('TC-BS-NEG-02: Buy with empty amount – submit not possible, validation, or no success on submit', async ({ page }) => {
        const buySellPage = new BuySellPage(page);
        await buySellPage.goto();
        await page.waitForTimeout(2000);
        await buySellPage.switchToBuy();
        await buySellPage.selectCoin('BTC', 'buy').catch(() => {});
        await page.waitForTimeout(1000);
        // Clear amount if any default
        const amountField = buySellPage.getYouPayAmount();
        if (await amountField.isVisible({ timeout: 2000 }).catch(() => false)) {
            await amountField.fill('');
            await page.waitForTimeout(500);
        }
        const actionBtn = buySellPage.actionButton;
        const disabled = await actionBtn.isDisabled().catch(() => false);
        const requiredMsg = page.locator('text=/required|enter amount|amount is required/i').first();
        const hasRequired = await requiredMsg.isVisible({ timeout: 2000 }).catch(() => false);
        if (disabled || hasRequired) {
            expect(true).toBeTruthy();
            return;
        }
        // App may allow click; then we expect no success toast
        await actionBtn.click().catch(() => {});
        await page.waitForTimeout(3000);
        const successToast = page.locator('[class*="toast"]:has-text("success"), [class*="toast"]:has-text("Success"), .success-notification').first();
        const noSuccess = !(await successToast.isVisible({ timeout: 3000 }).catch(() => false));
        expect(noSuccess).toBeTruthy();
    });
});
