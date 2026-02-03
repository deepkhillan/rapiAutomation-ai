import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { TransactionHistoryPage } from '../pages/TransactionHistoryPage.js';
import { providedCredentials } from '../utils/testData.js';

test('Dump History HTML', async ({ page }) => {
    test.setTimeout(60000);
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(providedCredentials.email, providedCredentials.password);
    await loginPage.enterPin(providedCredentials.pin);

    await page.locator('a:has-text("Transaction History")').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    const html = await page.content();
    console.log('--- Page HTML Snippet ---');
    console.log(html.substring(0, 5000)); // First 5000 chars

    // Specifically look for the tabs
    const tabsHtml = await page.evaluate(() => {
        const tabs = Array.from(document.querySelectorAll('.tab, button, li')).map(el => el.innerText);
        return tabs.filter(t => t.includes('Pay'));
    });
    console.log('Tabs containing "Pay":', tabsHtml);
});
