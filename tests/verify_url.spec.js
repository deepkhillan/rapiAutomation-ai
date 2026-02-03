import { test, expect } from '@playwright/test';

test('Verify UAT URL is being used', async ({ page }) => {
    console.log('Navigating to root...');
    await page.goto('/');
    const url = page.url();
    console.log(`Current URL: ${url}`);
    expect(url).toContain('rapixchange.com');
});
