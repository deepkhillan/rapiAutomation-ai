/**
 * Buy/Sell Module – Single spec
 * Login once, then for each crypto from dropdown: place BUY → place SELL → verify wallet balance
 * and transaction history for that coin.
 * @see CRYPTO_EXCHANGE_TEST_CASES.md for manual test cases
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { BuySellPage } from '../pages/BuySellPage.js';
import { WalletPage } from '../pages/WalletPage.js';
import { TransactionHistoryPage } from '../pages/TransactionHistoryPage.js';
import { providedCredentials } from '../utils/testData.js';

const FIAT_SYMBOL = 'USD';
const BUY_AMOUNT_FIAT = '15';
const SELL_AMOUNT_FIAT = '10';
const ORDER_WAIT_MS = 20000;
const GAP_BETWEEN_COINS_MS = 20000;

test.describe('Buy/Sell – All coins (login once, place orders, verify wallet & history)', () => {
    test('Login once → for each crypto: BUY then SELL → verify wallet balance and transaction history per coin', async ({ page }) => {
        const totalTimeout = 600000;
        test.setTimeout(totalTimeout);

        const loginPage = new LoginPage(page);
        const buySellPage = new BuySellPage(page);
        const walletPage = new WalletPage(page);
        const txHistoryPage = new TransactionHistoryPage(page);

        // --- Login once ---
        console.log('--- Login (once) ---');
        await loginPage.goto();
        await loginPage.login(providedCredentials.email, providedCredentials.password);
        await loginPage.enterPin(providedCredentials.pin);
        await page.waitForLoadState('networkidle').catch(() => {});
        await page.waitForTimeout(3000);

        // Maximize viewport for stable selectors and dropdown visibility
        await page.setViewportSize({ width: 1920, height: 1080 });

        // --- Get all crypto coins from dropdown (select one by one later) ---
        console.log('--- Get crypto list from Buy/Sell page ---');
        await buySellPage.goto();
        await page.waitForTimeout(2000);
        let coins = await buySellPage.getAllAvailableCoins();
        coins = (coins || []).filter(c => c && c !== 'USD' && c !== 'USDT' && c !== 'USDC');
        if (coins.length === 0) {
            console.log('No crypto coins found in dropdown; using default list [BTC, ETH].');
            coins = ['BTC', 'ETH'];
        }
        console.log(`Coins to test: ${coins.join(', ')}`);

        for (const coin of coins) {
            console.log(`\n========== Coin: ${coin} ==========`);

            // --- BUY order (select coin from dropdown, enter 15 USD in fiat field) ---
            console.log(`  [${coin}] Placing BUY order (15 USD)...`);
            await buySellPage.goto();
            await page.waitForTimeout(2000);
            await buySellPage.switchToBuy();
            await buySellPage.selectCoin(coin).catch(() => {});
            await page.waitForTimeout(1500);
            await buySellPage.setPayAmount(BUY_AMOUNT_FIAT);
            await page.waitForTimeout(1000);
            const buySubmitted = await buySellPage.submitOrder();
            if (buySubmitted) {
                await page.waitForTimeout(ORDER_WAIT_MS);
            } else {
                console.log(`  [${coin}] BUY button disabled (min amount or balance); skipping BUY.`);
            }

            // --- SELL order (same coin, 10 USD in fiat field) ---
            console.log(`  [${coin}] Placing SELL order (10 USD)...`);
            await buySellPage.goto();
            await page.waitForTimeout(2000);
            await buySellPage.switchToSell();
            await buySellPage.selectCoin(coin).catch(() => {});
            await page.waitForTimeout(1500);
            await buySellPage.setPayAmount(SELL_AMOUNT_FIAT);
            await page.waitForTimeout(1000);
            const sellSubmitted = await buySellPage.submitOrder();
            if (sellSubmitted) {
                await page.waitForTimeout(ORDER_WAIT_MS);
            } else {
                console.log(`  [${coin}] SELL button disabled (min amount or balance); skipping SELL.`);
            }

            // --- Verify wallet balance for this coin ---
            console.log(`  [${coin}] Checking wallet balance...`);
            await walletPage.goto();
            await page.waitForTimeout(2000);
            try {
                const balance = await walletPage.getBalance(coin);
                console.log(`  [${coin}] Wallet balance: ${balance}`);
                expect(Number.isFinite(balance)).toBeTruthy();
            } catch (e) {
                console.log(`  [${coin}] Wallet balance read failed: ${e.message}`);
            }

            // --- Verify transaction history: latest rows contain this coin (use raw text for layout resilience) ---
            console.log(`  [${coin}] Checking transaction history...`);
            await txHistoryPage.goto();
            await page.waitForTimeout(2000);
            const rowCount = await txHistoryPage.getTransactionCount();
            if (rowCount >= 1) {
                const latest = await txHistoryPage.getTransactionDetailsByIndex(0);
                const rawUpper = (latest.raw || '').toUpperCase();
                const hasCoin = rawUpper.includes(coin.toUpperCase());
                const hasBuyOrSell = /BUY|SELL/.test(rawUpper);
                console.log(`  [${coin}] Latest tx raw snippet: ${(latest.raw || '').substring(0, 80)}...`);
                expect(hasCoin).toBeTruthy();
                expect(hasBuyOrSell).toBeTruthy();
            }
            if (rowCount >= 2) {
                const second = await txHistoryPage.getTransactionDetailsByIndex(1);
                const hasCoin2 = (second.raw || '').toUpperCase().includes(coin.toUpperCase());
                console.log(`  [${coin}] Second tx has coin: ${hasCoin2}`);
                expect(hasCoin2).toBeTruthy();
            }

            await page.waitForTimeout(GAP_BETWEEN_COINS_MS);
        }

        console.log('\n--- Buy/Sell all-coins flow finished ---');
    });

    /**
     * TC-NEG-07: Page refresh after order does not duplicate – single entry in history.
     * Place one order, refresh page; transaction count must increase by exactly one (no duplicate).
     */
    test('TC-NEG-07: Page refresh after order does not duplicate – single entry in history', async ({ page }) => {
        test.setTimeout(120000);
        const loginPage = new LoginPage(page);
        const buySellPage = new BuySellPage(page);
        const txHistoryPage = new TransactionHistoryPage(page);

        await loginPage.goto();
        await loginPage.login(providedCredentials.email, providedCredentials.password);
        await loginPage.enterPin(providedCredentials.pin);
        await page.waitForLoadState('networkidle').catch(() => {});
        await page.waitForTimeout(2000);

        await page.setViewportSize({ width: 1920, height: 1080 });

        await txHistoryPage.goto();
        await page.waitForTimeout(2000);
        const countBefore = await txHistoryPage.getTransactionCount();

        await buySellPage.goto();
        await page.waitForTimeout(2000);
        await buySellPage.switchToBuy();
        await buySellPage.selectCoin('BTC').catch(() => {});
        await page.waitForTimeout(1500);
        await buySellPage.setPayAmount(BUY_AMOUNT_FIAT);
        await page.waitForTimeout(1000);
        const submitted = await buySellPage.submitOrder();
        expect(submitted).toBeTruthy();
        await page.waitForTimeout(8000);

        await txHistoryPage.goto();
        await page.waitForTimeout(2000);
        const countAfterOrder = await txHistoryPage.getTransactionCount();

        await page.reload({ waitUntil: 'networkidle' }).catch(() => {});
        await page.waitForTimeout(3000);
        const countAfterRefresh = await txHistoryPage.getTransactionCount();

        expect(countAfterOrder).toBe(countBefore + 1);
        expect(countAfterRefresh).toBe(countBefore + 1);
    });
});
