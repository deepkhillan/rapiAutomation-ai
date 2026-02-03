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
        // High timeout for environmental stability
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

    test('TC-RP-01: Valid Rapix Pay Order Flow (Balance, History, and Listing Validation)', async ({ page }) => {
        const numOrders = 2; // Parameters: Executing 2 orders

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
        console.log('Order placed successfully.');

        // 4. Validate Wallet Balance AFTER
        // Expected: balance - (amount * count)
        const expectedFinalBalance = balanceBefore - (ORDER_AMOUNT * numOrders);
        await walletPage.goto();
        const balanceAfter = await walletPage.getBalance(TEST_COIN);
        console.log(`Initial: ${balanceBefore}, Final: ${balanceAfter}, Expected: ${expectedFinalBalance}`);
        expect(balanceAfter).toBeCloseTo(expectedFinalBalance, 5);

        // 5. Validate Master Transaction History
        await historyPage.goto();
        await historyPage.switchToRapixPay();
        const countAfter = await historyPage.getTransactionCount();
        console.log(`History Count: Before=${countBefore}, After=${countAfter}`);

        // Count should increase by numOrders
        expect(countAfter).toBe(countBefore + numOrders);

        const historyDetails = await historyPage.getLatestTransaction();
        expect(historyDetails).toContain(TEST_COIN);
        expect(historyDetails).toContain(ORDER_AMOUNT.toString());

        // 6. Validate Rapix Pay Recent Transactions listing
        await rapixPayPage.goto();
        const recentPayTx = await rapixPayPage.getLatestTransactionDetails();
        expect(recentPayTx).toContain(TEST_COIN);
        expect(recentPayTx).toContain(ORDER_AMOUNT.toString());
        console.log('Test Case TC-RP-01 Completed Successfully.');
    });

    /**
     * Data-driven Negative Testing for Invalid Order Counts
     */
    const invalidScenarios = [
        { count: '0', description: 'Zero orders' },
        { count: '-5', description: 'Negative orders' },
        { count: '1.5', description: 'Decimal orders' },
        { count: 'ABC', description: 'Alphabetic input' }
    ];

    for (const scenario of invalidScenarios) {
        test(`TC-RP-02: Negative - Should not process ${scenario.description} (${scenario.count})`, async ({ page }) => {
            console.log(`Testing invalid order count: ${scenario.count}`);

            await walletPage.goto();
            const initialBalance = await walletPage.getBalance(TEST_COIN);

            await rapixPayPage.goto();
            // Attempt to place order with invalid count
            await rapixPayPage.placeSendOrder(RECIPIENT_EMAIL, TEST_COIN, ORDER_AMOUNT, scenario.count);

            // Validation: Balance should remain UNCHANGED
            await walletPage.goto();
            const finalBalance = await walletPage.getBalance(TEST_COIN);
            console.log(`Balance before: ${initialBalance}, Balance after: ${finalBalance}`);
            expect(finalBalance).toBe(initialBalance);

            console.log(`Negative scenario for ${scenario.count} passed.`);
        });
    }
});
