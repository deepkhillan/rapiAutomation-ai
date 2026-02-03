import { test, expect } from '@playwright/test';

test('Simple RapiXchange navigation', async ({ page }) => {
    console.log('Navigating...');
    await page.goto('https://uat-eks.rapixchange.com/signup', { timeout: 30000 });
    console.log('Page loaded');
    await page.screenshot({ path: 'signup_debug.png' });
    const title = await page.title();
    console.log('Title:', title);
});
