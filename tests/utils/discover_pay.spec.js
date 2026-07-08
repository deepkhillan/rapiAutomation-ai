import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { providedCredentials } from '../utils/testData.js';

/** Discovery helper – verifies Rapix Pay navigation after login (uses fresh login, not saved auth). */
test('Discover Rapix Pay UI', async ({ page }) => {
    test.setTimeout(120000);
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(providedCredentials.email, providedCredentials.password);
    await loginPage.enterPin(providedCredentials.pin);
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 60000 }).catch(() => {});

    const payLink = page.locator('a:has-text("Rapix Pay"), a:has-text("RapiX Pay"), a[href*="rapix-pay"]').first();
    await expect(payLink).toBeVisible({ timeout: 15000 });
    await payLink.click();
    await page.waitForURL(/rapix-?pay/i, { timeout: 30000 }).catch(() => {});
    expect(page.url()).toMatch(/rapix-?pay/i);

    const sendBtn = page.locator('button:has-text("Send")').first();
    const sendVisible = await sendBtn.isVisible({ timeout: 8000 }).catch(() => false);
    expect(sendVisible).toBeTruthy();
});
