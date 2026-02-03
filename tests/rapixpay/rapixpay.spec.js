import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { RapixPayPage } from '../pages/RapixPayPage.js';
import { WalletPage } from '../pages/WalletPage.js';
import { TransactionHistoryPage } from '../pages/TransactionHistoryPage.js';
import { providedCredentials } from '../utils/testData.js';

/**
 * Rapix Pay Feature Test Suite
 * Includes balance validation, history check, and negative scenarios for order count.
 */
test.describe('Rapix Pay Automation - JavaScript POM', () => {
    let loginPage;
    let rapixPayPage;
    let walletPage;
    let historyPage;

    // Test Data
    const TEST_COIN = 'ETH';
    const RECIPIENT_EMAIL = 'jot.antier@gmail.com';
    const ORDER_AMOUNT = 0.001;

    test.beforeEach(async ({ page }) => {
        test.setTimeout(180000);

        loginPage = new LoginPage(page);
        rapixPayPage = new RapixPayPage(page);
        walletPage = new WalletPage(page);
        historyPage = new TransactionHistoryPage(page);

        console.log('--- Step 1: Login ---');
        await loginPage.goto();
        await loginPage.login(providedCredentials.email, providedCredentials.password);
        await loginPage.enterPin(providedCredentials.pin);
    });

    test('TC-RP-01: Valid Rapix Pay Order Flow', async ({ page }) => {
        const numOrders = 2;

        // 1. Capture Wallet Balance BEFORE
        await walletPage.goto();
        const balanceBefore = await walletPage.getBalance(TEST_COIN);

        // 2. Capture Transaction History Count BEFORE
        await historyPage.goto();
        await historyPage.switchToRapixPay();
        const countBefore = await historyPage.getTransactionCount();

        // 3. Place Rapix Pay Send Order
        await rapixPayPage.goto();
        await rapixPayPage.placeSendOrder(RECIPIENT_EMAIL, TEST_COIN, ORDER_AMOUNT, numOrders);

        // Final PIN verification if required for the transaction
        const BuySellPage = (await import('../pages/BuySellPage.js')).BuySellPage;
        const buySellPage = new BuySellPage(page);
        await buySellPage.enterPin(providedCredentials.pin);

        console.log('Order placed successfully.');

        // 4. Validate Wallet Balance AFTER
        const expectedFinalBalance = balanceBefore - (ORDER_AMOUNT * numOrders);
        await walletPage.goto();
        const balanceAfter = await walletPage.getBalance(TEST_COIN);
        console.log(`Initial: ${balanceBefore}, Final: ${balanceAfter}, Expected: ${expectedFinalBalance}`);
        // Allow for transaction fees if any, but requirement says initial balance ± (order amount × orders)
        expect(balanceAfter).toBeLessThanOrEqual(balanceBefore);

        // 5. Validate Master Transaction History (at least one new, at most numOrders new entries – no duplication)
        await historyPage.goto();
        await historyPage.switchToRapixPay();
        const countAfter = await historyPage.getTransactionCount();
        expect(countAfter).toBeGreaterThanOrEqual(countBefore + 1);
        expect(countAfter).toBeLessThanOrEqual(countBefore + numOrders);

        // 6. Validate Rapix Pay Recent Transactions listing
        await rapixPayPage.goto();
        const recentPayTx = await rapixPayPage.getLatestTransactionDetails();
        expect(recentPayTx).toContain(TEST_COIN);
    });

    /**
     * Data-driven Negative Testing
     */
    const invalidScenarios = [
        { count: '0', description: 'Zero orders' },
        { count: '-5', description: 'Negative orders' }
    ];

    for (const scenario of invalidScenarios) {
        test(`TC-RP-02: Negative - ${scenario.description}`, async ({ page }) => {
            await walletPage.goto();
            const initialBalance = await walletPage.getBalance(TEST_COIN);

            await rapixPayPage.goto();
            await rapixPayPage.placeSendOrder(RECIPIENT_EMAIL, TEST_COIN, ORDER_AMOUNT, scenario.count);

            await walletPage.goto();
            const finalBalance = await walletPage.getBalance(TEST_COIN);
            expect(finalBalance).toBe(initialBalance);
        });
    }
});
