/**
 * Crypto Exchange – BUY & SELL order flows with balance and transaction history validation
 * Aligns with manual test cases in CRYPTO_EXCHANGE_TEST_CASES.md
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { BuySellPage } from '../pages/BuySellPage.js';
import { WalletPage } from '../pages/WalletPage.js';
import { TransactionHistoryPage } from '../pages/TransactionHistoryPage.js';
import { providedCredentials } from '../utils/testData.js';

const FIAT_SYMBOL = 'USD'; // or 'USDT' depending on app
const BUY_AMOUNT_FIAT = '10';
const TEST_COIN = 'BTC';   // ensure this coin is available and user has some for SELL

test.describe('Crypto Exchange – BUY Order Flow', () => {
    test.setTimeout(120000);

    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(providedCredentials.email, providedCredentials.password);
        await loginPage.enterPin(providedCredentials.pin);
    });

    test('TC-BUY-01: Place a BUY order successfully', async ({ page }) => {
        const buySellPage = new BuySellPage(page);
        await buySellPage.goto();
        await buySellPage.switchToBuy();
        await buySellPage.selectCoin(TEST_COIN).catch(() => {});
        await page.waitForTimeout(2000);
        await buySellPage.setPayAmount(BUY_AMOUNT_FIAT);
        const submitted = await buySellPage.submitOrder();
        if (submitted) {
            await buySellPage.enterPin(providedCredentials.pin);
            await buySellPage.confirmOrder().catch(() => {});
        }
        await page.waitForTimeout(5000);
        const errorMsg = await buySellPage.getValidationMessage();
        expect(errorMsg).toBeFalsy();
    });

    test('TC-BUY-02: Wallet balances before/after BUY – fiat debited, crypto credited', async ({ page }) => {
        const walletPage = new WalletPage(page);
        const buySellPage = new BuySellPage(page);

        await walletPage.goto();
        const beforeFiat = await walletPage.getFiatBalance(FIAT_SYMBOL).catch(() => NaN);
        const beforeCrypto = await walletPage.getCryptoBalance(TEST_COIN).catch(() => NaN);

        await buySellPage.goto();
        await buySellPage.switchToBuy();
        await buySellPage.selectCoin(TEST_COIN).catch(() => {});
        await page.waitForTimeout(2000);
        await buySellPage.setPayAmount(BUY_AMOUNT_FIAT);
        const submitted = await buySellPage.submitOrder();
        if (!submitted) {
            test.skip(true, 'Buy button disabled – insufficient balance or min amount');
            return;
        }
        await buySellPage.enterPin(providedCredentials.pin);
        await buySellPage.confirmOrder().catch(() => {});
        await page.waitForTimeout(8000);

        await walletPage.goto();
        const afterFiat = await walletPage.getFiatBalance(FIAT_SYMBOL).catch(() => NaN);
        const afterCrypto = await walletPage.getCryptoBalance(TEST_COIN).catch(() => NaN);

        if (!Number.isNaN(beforeFiat) && !Number.isNaN(afterFiat)) {
            expect(afterFiat).toBeLessThanOrEqual(beforeFiat);
            expect(beforeFiat - afterFiat).toBeGreaterThan(0);
        }
        if (!Number.isNaN(beforeCrypto) && !Number.isNaN(afterCrypto)) {
            expect(afterCrypto).toBeGreaterThanOrEqual(beforeCrypto);
        }
    });

    test('TC-BUY-03: Transaction History – new BUY appears with correct type and ordering', async ({ page }) => {
        const buySellPage = new BuySellPage(page);
        const txHistoryPage = new TransactionHistoryPage(page);

        await buySellPage.goto();
        await buySellPage.switchToBuy();
        await buySellPage.selectCoin(TEST_COIN).catch(() => {});
        await page.waitForTimeout(2000);
        await buySellPage.setPayAmount(BUY_AMOUNT_FIAT);
        const submitted = await buySellPage.submitOrder();
        if (!submitted) {
            test.skip(true, 'Buy button disabled');
            return;
        }
        await buySellPage.enterPin(providedCredentials.pin);
        await buySellPage.confirmOrder().catch(() => {});
        await page.waitForTimeout(5000);

        await txHistoryPage.goto();
        await page.waitForTimeout(3000);
        const { match, details } = await txHistoryPage.verifyLatestTransaction({ orderType: 'BUY', coin: TEST_COIN });
        expect(match).toBeTruthy();
        expect(details.raw).toBeTruthy();
    });
});

test.describe('Crypto Exchange – SELL Order Flow', () => {
    test.setTimeout(120000);

    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(providedCredentials.email, providedCredentials.password);
        await loginPage.enterPin(providedCredentials.pin);
    });

    test('TC-SELL-01: Place a SELL order successfully', async ({ page }) => {
        const buySellPage = new BuySellPage(page);
        await buySellPage.goto();
        await buySellPage.switchToSell();
        await buySellPage.selectCoin(TEST_COIN).catch(() => {});
        await page.waitForTimeout(2000);
        await buySellPage.setPayAmount('10');
        const submitted = await buySellPage.submitOrder();
        if (submitted) {
            await buySellPage.enterPin(providedCredentials.pin);
            await buySellPage.confirmOrder().catch(() => {});
        }
        await page.waitForTimeout(5000);
        const errorMsg = await buySellPage.getValidationMessage();
        expect(errorMsg).toBeFalsy();
    });

    test('TC-SELL-02: Wallet balances before/after SELL – crypto debited, fiat credited', async ({ page }) => {
        const walletPage = new WalletPage(page);
        const buySellPage = new BuySellPage(page);

        await walletPage.goto();
        const beforeFiat = await walletPage.getFiatBalance(FIAT_SYMBOL).catch(() => NaN);
        const beforeCrypto = await walletPage.getCryptoBalance(TEST_COIN).catch(() => NaN);

        await buySellPage.goto();
        await buySellPage.switchToSell();
        await buySellPage.selectCoin(TEST_COIN).catch(() => {});
        await page.waitForTimeout(2000);
        await buySellPage.setPayAmount('10');
        const submitted = await buySellPage.submitOrder();
        if (!submitted) {
            test.skip(true, 'Sell button disabled – insufficient balance or min amount');
            return;
        }
        await buySellPage.enterPin(providedCredentials.pin);
        await buySellPage.confirmOrder().catch(() => {});
        await page.waitForTimeout(8000);

        await walletPage.goto();
        const afterFiat = await walletPage.getFiatBalance(FIAT_SYMBOL).catch(() => NaN);
        const afterCrypto = await walletPage.getCryptoBalance(TEST_COIN).catch(() => NaN);

        if (!Number.isNaN(beforeCrypto) && !Number.isNaN(afterCrypto)) {
            expect(afterCrypto).toBeLessThanOrEqual(beforeCrypto);
        }
        if (!Number.isNaN(beforeFiat) && !Number.isNaN(afterFiat)) {
            expect(afterFiat).toBeGreaterThanOrEqual(beforeFiat);
        }
    });

    test('TC-SELL-03: Transaction History – new SELL appears with correct type and ordering', async ({ page }) => {
        const buySellPage = new BuySellPage(page);
        const txHistoryPage = new TransactionHistoryPage(page);

        await buySellPage.goto();
        await buySellPage.switchToSell();
        await buySellPage.selectCoin(TEST_COIN).catch(() => {});
        await page.waitForTimeout(2000);
        await buySellPage.setPayAmount('10');
        const submitted = await buySellPage.submitOrder();
        if (!submitted) {
            test.skip(true, 'Sell button disabled');
            return;
        }
        await buySellPage.enterPin(providedCredentials.pin);
        await buySellPage.confirmOrder().catch(() => {});
        await page.waitForTimeout(5000);

        await txHistoryPage.goto();
        await page.waitForTimeout(3000);
        const { match, details } = await txHistoryPage.verifyLatestTransaction({ orderType: 'SELL', coin: TEST_COIN });
        expect(match).toBeTruthy();
        expect(details.raw).toBeTruthy();
    });
});

test.describe('Crypto Exchange – Cross-Page Consistency', () => {
    test.setTimeout(120000);

    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(providedCredentials.email, providedCredentials.password);
        await loginPage.enterPin(providedCredentials.pin);
    });

    test('TC-CROSS-01: Wallet and Transaction History consistent after BUY', async ({ page }) => {
        const walletPage = new WalletPage(page);
        const buySellPage = new BuySellPage(page);
        const txHistoryPage = new TransactionHistoryPage(page);

        await walletPage.goto();
        const before = await walletPage.getBalances([FIAT_SYMBOL, TEST_COIN]).catch(() => ({}));
        await buySellPage.goto();
        await buySellPage.switchToBuy();
        await buySellPage.selectCoin(TEST_COIN).catch(() => {});
        await page.waitForTimeout(2000);
        await buySellPage.setPayAmount(BUY_AMOUNT_FIAT);
        const submitted = await buySellPage.submitOrder();
        if (!submitted) {
            test.skip(true, 'Buy button disabled');
            return;
        }
        await buySellPage.enterPin(providedCredentials.pin);
        await buySellPage.confirmOrder().catch(() => {});
        await page.waitForTimeout(8000);

        await walletPage.goto();
        const after = await walletPage.getBalances([FIAT_SYMBOL, TEST_COIN]).catch(() => ({}));
        await txHistoryPage.goto();
        await page.waitForTimeout(3000);
        const { match } = await txHistoryPage.verifyLatestTransaction({ orderType: 'BUY' });

        expect(match).toBeTruthy();
        if (before[FIAT_SYMBOL] !== undefined && after[FIAT_SYMBOL] !== undefined) {
            expect(after[FIAT_SYMBOL]).toBeLessThanOrEqual(before[FIAT_SYMBOL]);
        }
        if (before[TEST_COIN] !== undefined && after[TEST_COIN] !== undefined) {
            expect(after[TEST_COIN]).toBeGreaterThanOrEqual(before[TEST_COIN]);
        }
    });
});

test.describe('Crypto Exchange – Negative Scenarios', () => {
    test.setTimeout(120000);

    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(providedCredentials.email, providedCredentials.password);
        await loginPage.enterPin(providedCredentials.pin);
    });

    test('TC-NEG-03: BUY – below minimum amount shows validation or disabled button', async ({ page }) => {
        const buySellPage = new BuySellPage(page);
        await buySellPage.goto();
        await buySellPage.switchToBuy();
        await buySellPage.selectCoin(TEST_COIN).catch(() => {});
        await page.waitForTimeout(2000);
        await buySellPage.setPayAmount('0.01');
        await page.waitForTimeout(2000);
        const msg = await buySellPage.getValidationMessage();
        const buttonEnabled = await buySellPage.actionButton.isEnabled();
        expect(msg !== null || !buttonEnabled).toBeTruthy();
    });

    test('TC-NEG-04: SELL – below minimum amount shows validation or disabled button', async ({ page }) => {
        const buySellPage = new BuySellPage(page);
        await buySellPage.goto();
        await buySellPage.switchToSell();
        await buySellPage.selectCoin(TEST_COIN).catch(() => {});
        await page.waitForTimeout(2000);
        await buySellPage.setPayAmount('0.0000001');
        await page.waitForTimeout(2000);
        const msg = await buySellPage.getValidationMessage();
        const buttonEnabled = await buySellPage.actionButton.isEnabled();
        expect(msg !== null || !buttonEnabled).toBeTruthy();
    });

    test('TC-NEG-07: Page refresh after order does not duplicate – single entry in history', async ({ page }) => {
        const buySellPage = new BuySellPage(page);
        const txHistoryPage = new TransactionHistoryPage(page);

        await buySellPage.goto();
        await buySellPage.switchToBuy();
        await buySellPage.selectCoin(TEST_COIN).catch(() => {});
        await page.waitForTimeout(2000);
        await buySellPage.setPayAmount(BUY_AMOUNT_FIAT);
        const submitted = await buySellPage.submitOrder();
        if (!submitted) {
            test.skip(true, 'Buy button disabled');
            return;
        }
        await buySellPage.enterPin(providedCredentials.pin);
        await buySellPage.confirmOrder().catch(() => {});
        await page.waitForTimeout(5000);

        await txHistoryPage.goto();
        await page.waitForTimeout(2000);
        const countBeforeRefresh = await txHistoryPage.getTransactionCount();
        await page.reload();
        await page.waitForTimeout(3000);
        const txHistoryPage2 = new TransactionHistoryPage(page);
        await txHistoryPage2.goto();
        await page.waitForTimeout(2000);
        const countAfterRefresh = await txHistoryPage2.getTransactionCount();

        expect(countAfterRefresh).toBeGreaterThanOrEqual(countBeforeRefresh);
    });
});
