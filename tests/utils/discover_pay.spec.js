import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { providedCredentials } from '../utils/testData.js';

test('Discover Rapix Pay UI', async ({ page }) => {
    test.setTimeout(120000);
    const loginPage = new LoginPage(page);

    console.log('--- Logging in with providedCredentials ---');
    await loginPage.goto();
    await loginPage.login(providedCredentials.email, providedCredentials.password);
    await loginPage.enterPin(providedCredentials.pin);

    console.log('--- Checking current URL ---');
    console.log('URL after login:', page.url());

    console.log('--- Navigating to Rapix Pay via sidebar ---');
    const payLink = page.locator('a:has-text("Rapix Pay"), .nav-link:has-text("Rapix Pay"), a[href*="rapix-pay"]').first();
    await payLink.click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/rapix_pay_main_new.png' });
    console.log('Rapix Pay URL:', page.url());

    // Send button
    const sendBtn = page.locator('button:has-text("Send")').first();
    if (await sendBtn.isVisible()) {
        console.log('Clicking Send button...');
        await sendBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'screenshots/rapix_pay_send_modal_new.png' });
    }

    // Wallets
    console.log('--- Navigating to Wallets ---');
    await page.locator('a:has-text("Wallets")').first().click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/wallets_page_new.png' });

    // History
    console.log('--- Navigating to History ---');
    await page.locator('a:has-text("Transaction History")').first().click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'screenshots/history_page_new.png' });
});
