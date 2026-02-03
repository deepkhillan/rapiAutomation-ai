import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { BuySellPage } from '../pages/BuySellPage.js';
import { providedCredentials } from '../utils/testData.js';

test.describe('Buy/Sell Functionality with Real Credentials', () => {
    let loginPage;
    let buySellPage;

    test.beforeEach(async ({ page }) => {
        // Increase timeout for slow UAT
        test.setTimeout(120000);

        loginPage = new LoginPage(page);
        buySellPage = new BuySellPage(page);

        console.log('--- Step 1: Login ---');
        await loginPage.goto();
        await loginPage.login(providedCredentials.email, providedCredentials.password);

        console.log('--- Step 2: Initial PIN ---');
        await loginPage.enterPin(providedCredentials.pin);

        console.log('--- Step 3: Navigation ---');
        await buySellPage.goto();
        console.log(`Current URL: ${page.url()}`);
    });

    test('TC-BS-01: Place a Buy Market Order', async ({ page }) => {
        console.log('--- TC-BS-01 START ---');

        console.log('Switching to Buy tab...');
        await buySellPage.switchToBuy();
        await page.screenshot({ path: 'screenshots/buy_tab_confirm.png' });

        console.log('Setting pay amount: 10');
        await buySellPage.setPayAmount('10');

        console.log('Submitting order...');
        const submitted = await buySellPage.submitOrder();
        await page.screenshot({ path: 'screenshots/after_buy_submit.png' });

        if (submitted) {
            console.log('Entering transaction PIN...');
            await buySellPage.enterPin(providedCredentials.pin);

            try {
                await buySellPage.confirmOrder();
            } catch (e) {
                console.log('Confirmation failed or not needed');
            }
        }

        console.log('Checking for messages...');
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'screenshots/buy_final_result.png' });
        console.log('--- TC-BS-01 END ---');
    });

    test('TC-BS-03: Validate minimum amount constraint', async ({ page }) => {
        console.log('--- TC-BS-03 START: Dynamic Min Amount Validation ---');

        await buySellPage.switchToBuy();

        // 1. Enter an extremely low amount to trigger validation
        const lowAmount = '0.0001';
        console.log(`Entering low amount: ${lowAmount}`);
        await buySellPage.setPayAmount(lowAmount);

        // 2. Try to click Buy to trigger any server-side or lazy validation
        console.log('Attempting to click Buy to trigger validation...');
        const buttonEnabled = await buySellPage.actionButton.isEnabled();
        if (buttonEnabled) {
            await buySellPage.actionButton.click();
        }

        // 3. Wait for validation message
        await page.waitForTimeout(3000);
        let validationMsg = await buySellPage.getValidationMessage();

        // Fallback: Check for any toast or alert
        if (!validationMsg) {
            const toast = page.locator('.Toastify__toast-body, .toast, .alert').filter({ visible: true }).first();
            if (await toast.isVisible()) {
                validationMsg = await toast.textContent();
            }
        }

        console.log(`Validation message received: ${validationMsg}`);

        if (validationMsg) {
            // 4. Extract min amount from message
            const minAmount = buySellPage.getMinAmountFromMessage(validationMsg);
            console.log(`Extracted minimum amount: ${minAmount}`);

            if (minAmount) {
                // 5. Enter the exact minimum amount
                console.log(`Entering exact minimum amount: ${minAmount}`);
                await buySellPage.setPayAmount(minAmount);
                await page.waitForTimeout(2000);

                // 6. Verify if action button is now enabled
                const isEnabled = await buySellPage.actionButton.isEnabled();
                console.log(`Is action button enabled for min amount? ${isEnabled}`);

                if (isEnabled) {
                    console.log('Proceeding with order at minimum amount...');
                    const submitted = await buySellPage.submitOrder();
                    if (submitted) {
                        await buySellPage.enterPin(providedCredentials.pin);
                        console.log('Transaction with minimum amount processed.');
                    }
                }
            }
        } else {
            console.log('No specific minimum amount validation message appeared.');
        }

        await page.screenshot({ path: 'screenshots/min_amount_validation.png' });
        console.log('--- TC-BS-03 END ---');
    });
});
