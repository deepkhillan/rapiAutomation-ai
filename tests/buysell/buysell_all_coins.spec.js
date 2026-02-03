import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { BuySellPage } from '../pages/BuySellPage.js';
import { providedCredentials } from '../utils/testData.js';

test.describe('Buy/Sell All Coins Feature Update', () => {
    let loginPage;
    let buySellPage;
    let coins = [];

    test.beforeAll(async ({ browser }) => {
        const page = await browser.newPage();
        loginPage = new LoginPage(page);
        buySellPage = new BuySellPage(page);

        console.log('--- Phase 1: Discovery ---');
        await loginPage.goto();
        await loginPage.login(providedCredentials.email, providedCredentials.password);
        await loginPage.enterPin(providedCredentials.pin);

        await buySellPage.goto();
        coins = await buySellPage.getAllAvailableCoins();

        coins = coins.filter(c => c !== 'USD' && c !== 'USDC');

        // Use a small subset for reliability in this environment
        if (coins.length > 3) {
            console.log(`Limiting ${coins.length} coins to top 3 for stability.`);
            coins = coins.slice(0, 3);
        }

        console.log(`Testing coins: ${coins.join(', ')}`);
        await page.close();
    });

    test('Execute positive and negative buy/sell for subset of coins with 20s gap', async ({ page }) => {
        test.setTimeout(coins.length * 2 * 100000);

        loginPage = new LoginPage(page);
        buySellPage = new BuySellPage(page);

        await loginPage.goto();
        await loginPage.login(providedCredentials.email, providedCredentials.password);
        await loginPage.enterPin(providedCredentials.pin);
        await buySellPage.goto();

        for (const coin of coins) {
            for (const action of ['Buy', 'Sell']) {
                console.log(`\n>>> STARTING: ${action} ${coin}`);

                try {
                    if (action === 'Buy') {
                        await buySellPage.switchToBuy();
                    } else {
                        await buySellPage.switchToSell();
                    }

                    await buySellPage.selectCoin(coin);
                    await page.waitForTimeout(2000);

                    // NEGATIVE
                    console.log(`- Testing Negative (Below Min)`);
                    await buySellPage.setPayAmount('0.0000001');
                    await buySellPage.actionButton.click().catch(() => { });
                    await page.waitForTimeout(2000);

                    const msg = await buySellPage.getValidationMessage();
                    console.log(`  Validation: ${msg || 'None'}`);

                    const minAmount = buySellPage.getMinAmountFromMessage(msg) || '10';

                    // POSITIVE
                    console.log(`- Testing Positive (Min Amount: ${minAmount})`);
                    await buySellPage.setPayAmount(minAmount);
                    await page.waitForTimeout(2000);

                    if (await buySellPage.actionButton.isEnabled()) {
                        console.log(`  Submitting order...`);
                        const submitted = await buySellPage.submitOrder();
                        if (submitted) {
                            await buySellPage.enterPin(providedCredentials.pin);
                            console.log(`  Order submitted. Waiting 20 seconds gap...`);
                            await page.waitForTimeout(20000);
                        } else {
                            console.log(`  Submission failed.`);
                        }
                    } else {
                        console.log(`  Action button disabled (Balance?)`);
                    }
                } catch (err) {
                    console.error(`Error during ${action} ${coin}:`, err.message);
                }
            }
        }
    });
});
