/**
 * Discovery test: open Swap page, click You Pay asset dropdown, capture DOM and screenshot.
 * Run with: npx playwright test tests/transfer_swap/swap.discover.spec.js --project=swap
 * Use output to fix SwapPage locators if the app structure differs.
 */
const path = require('path');
const fs = require('fs');

import { test } from '@playwright/test';
import { SwapPage } from '../pages/SwapPage.js';

test.describe('Swap UI discovery', () => {
    test('Capture page after clicking You Pay asset dropdown', async ({ page }) => {
        test.setTimeout(90000);
        const swapPage = new SwapPage(page);
        await swapPage.goto();
        await swapPage.ensureCryptoSwapTab();

        const payBlock = page.locator('div, section').filter({ hasText: /You Pay/i }).first();
        await payBlock.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

        const input = payBlock.locator('input[placeholder*="value"], input[placeholder*="Enter"], input[type="number"]').first();
        await input.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

        const assetBoxXPath = 'xpath=(.//input[contains(@placeholder,"value") or contains(@placeholder,"Enter") or @type="number"])[1]/preceding-sibling::*[1]';
        const assetBox = payBlock.locator(assetBoxXPath).first();
        await assetBox.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(500);
        await assetBox.click({ timeout: 8000 }).catch(() => {});

        await page.waitForTimeout(4000);

        const outDir = path.join(process.cwd(), 'test-results', 'swap-discover');
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        await page.screenshot({ path: path.join(outDir, 'after-click-you-pay.png'), fullPage: true });
        const html = await page.content();
        fs.writeFileSync(path.join(outDir, 'after-click-you-pay.html'), html, 'utf8');

        const hasDialog = await page.getByRole('dialog').first().isVisible({ timeout: 2000 }).catch(() => false);
        const hasChoose = await page.locator('text=/Choose your asset|Select your asset|Select asset/i').first().isVisible({ timeout: 1000 }).catch(() => false);
        const hasListbox = await page.getByRole('listbox').first().isVisible({ timeout: 1000 }).catch(() => false);
        console.log('After click - dialog:', hasDialog, 'Choose text:', hasChoose, 'listbox:', hasListbox);
        console.log('See test-results/swap-discover/after-click-you-pay.png and .html');
    });
});
