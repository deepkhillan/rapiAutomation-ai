import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { BuySellPage } from '../pages/BuySellPage.js';
import { providedCredentials } from '../utils/testData.js';
import fs from 'fs';

test('Discover available crypto coins v2', async ({ page }) => {
    test.setTimeout(180000);
    const loginPage = new LoginPage(page);

    console.log('--- Logging in ---');
    await loginPage.goto();
    await loginPage.login(providedCredentials.email, providedCredentials.password);
    await loginPage.enterPin(providedCredentials.pin);

    console.log('--- Navigating to Buy/Sell via sidebar (not direct /buy-sell URL) ---');
    const buySellPage = new BuySellPage(page);
    await buySellPage.goto();

    // Close any notifications if they are open
    const closeNotification = page.locator('button:has-text("Close"), .close-icon, .notification-close').first();
    if (await closeNotification.isVisible()) {
        await closeNotification.click();
    }

    // Find the coin selector (BTC dropdown)
    const coinSelector = page.locator('.coin-select, .token-select, .assets-list-item, [role="button"]:has(.coin-icon), .exchange-card div:has-text("BTC")').filter({ visible: true }).first();

    // Actually, looking at the screenshot, the BTC part is in a rounded box
    const btcBox = page.locator('div').filter({ hasText: /^BTC/ }).first();

    console.log('--- Clicking coin selector ---');
    await btcBox.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/coins_dropdown_open.png' });

    // Extract coins
    const items = page.locator('.coin-item, .asset-item, .dropdown-item, [role="option"], .list-item').filter({ visible: true });
    const itemCount = await items.count();
    console.log(`Found ${itemCount} items in dropdown`);

    const coins = [];
    for (let i = 0; i < itemCount; i++) {
        const text = await items.nth(i).innerText();
        const cleanedText = text.trim().replace(/\n/g, ' ');
        if (cleanedText) {
            coins.push(cleanedText);
            console.log(`Coin ${i}: ${cleanedText}`);
        }
    }

    fs.writeFileSync('available_coins.json', JSON.stringify(coins, null, 2));
    console.log('Available coins saved to available_coins.json');
});
