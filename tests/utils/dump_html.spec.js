import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { BuySellPage } from '../pages/BuySellPage.js';
import { providedCredentials } from '../utils/testData.js';

test('Dump Buy/Sell HTML', async ({ page }) => {
    test.setTimeout(60000);
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(providedCredentials.email, providedCredentials.password);
    await loginPage.enterPin(providedCredentials.pin);

    const buySellPage = new BuySellPage(page);
    await buySellPage.goto();

    const html = await page.locator('.exchange-card').innerHTML();
    console.log('--- Exchange Card HTML ---');
    console.log(html);
});
