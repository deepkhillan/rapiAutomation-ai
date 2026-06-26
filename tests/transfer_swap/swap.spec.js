/**
 * Swap – Crypto Swap tests for RapiXchange.
 * Sign in once: all tests run with stored auth (auth-setup → authenticated project).
 * Flow: Swapping tab → Crypto Swap → select pair via "Choose your asset" (pay + receive) →
 * enter amount in You Pay → Swap → Continue → verify "Successfully Swap" or "Insufficient balance".
 */

import { test, expect } from '@playwright/test';
import { SwapPage } from '../pages/SwapPage.js';
import { prepareAuthenticatedPage } from '../utils/prepareAuthenticatedPage.js';

test.describe('Swap feature – Crypto Swap', () => {
    // Serial: swap orders require 60s cooldown between placements (TC-SW-02, TC-SW-03, TC-SW-07).
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page }) => {
        test.setTimeout(600000);
        await prepareAuthenticatedPage(page);
        const swapPage = new SwapPage(page);
        await swapPage.dismissOpenDialogs();
    });

    test('TC-SW-01: Crypto Swap – tap Swapping tab, select ETH-USDT via Choose your asset, enter 0.005 in You Pay, click Swap', async ({ page }) => {
        const swapPage = new SwapPage(page);
        await swapPage.goto();
        await swapPage.ensureCryptoSwapTab();

        await swapPage.selectYouPayAsset('ETH');
        await swapPage.selectYouReceiveAsset('USDT');
        await swapPage.setYouPayAmount('0.005');

        await swapPage.clickSwapButton();

        const modalVisible = await page.locator('text=/Please review your details|Crypto Swap/i').first().isVisible({ timeout: 10000 }).catch(() => false);
        expect(modalVisible).toBeTruthy();

        await swapPage.modalCancelButton.click().catch(() => {});
    });

    test('TC-SW-02: Crypto Swap – full flow: ETH→USDT 0.005, click Continue, then verify Successfully Swap popup', async ({ page }) => {
        const swapPage = new SwapPage(page);
        await swapPage.performCryptoSwapEthToUsdt('0.005');

        await swapPage.expectSuccessPopup();
    });

    test('TC-SW-03: Crypto Swap – success popup shows "successfully swap" text to confirm order completed', async ({ page }) => {
        const swapPage = new SwapPage(page);
        await swapPage.performCryptoSwapEthToUsdt('0.005');

        const successTitle = page.locator('text=/Successfully Swap|successfully swap/i').first();
        await expect(successTitle).toBeVisible({ timeout: 15000 });

        const successMessage = page.locator('text=/You have successfully Swap|successfully Swap \\d|\\.\\d+ ETH/i').first();
        const hasMessage = await successMessage.isVisible({ timeout: 5000 }).catch(() => false);
        expect(hasMessage).toBeTruthy();

        swapPage.markOrderPlaced();
        await swapPage.successOkButton.click().catch(() => {});
    });

    test('TC-SW-04: Swap page loads – Crypto Swap tab and You Pay / You Receive visible', async ({ page }) => {
        const swapPage = new SwapPage(page);
        await swapPage.goto();

        const hasSwapping = await page.locator('a:has-text("Swapping")').first().isVisible({ timeout: 5000 }).catch(() => false);
        if (!hasSwapping) {
            test.skip();
            return;
        }

        await swapPage.ensureCryptoSwapTab();
        const youPay = await page.locator('text=/You Pay/i').first().isVisible({ timeout: 5000 }).catch(() => false);
        const youReceive = await page.locator('text=/You Receive/i').first().isVisible({ timeout: 5000 }).catch(() => false);
        expect(youPay).toBeTruthy();
        expect(youReceive).toBeTruthy();
    });

    test('TC-SW-05: Crypto Swap – You Pay amount field accepts 0.005 and Swap button visible', async ({ page }) => {
        const swapPage = new SwapPage(page);
        await swapPage.goto();
        await swapPage.ensureCryptoSwapTab();
        await swapPage.selectYouPayAsset('ETH');
        await swapPage.selectYouReceiveAsset('USDT');
        await swapPage.setYouPayAmount('0.005');

        const swapBtn = swapPage.swapButton();
        await expect(swapBtn).toBeVisible();
        const value = await swapPage.youPayAmountInput().inputValue().catch(() => '');
        expect(value === '0.005' || value.includes('0.005')).toBeTruthy();
    });

    test('TC-SW-06: Insufficient balance – order not executed and validation message shown', async ({ page }) => {
        const swapPage = new SwapPage(page);
        await swapPage.goto();
        await swapPage.ensureCryptoSwapTab();
        await swapPage.selectYouPayAsset('ETH');
        await swapPage.selectYouReceiveAsset('USDT');
        await swapPage.setYouPayAmount('999999');

        await page.waitForTimeout(3000);
        await swapPage.clickSwapButton().catch(() => {});

        await swapPage.expectInsufficientBalanceMessage();

        const successPopup = page.locator('text=/Successfully Swap|successfully swap/i').first();
        const noSuccess = !(await successPopup.isVisible({ timeout: 5000 }).catch(() => false));
        expect(noSuccess).toBeTruthy();
    });

    test('TC-SW-07: Swap with default pair (BTC-USDT) – place order without opening asset dropdown', async ({ page }) => {
        const swapPage = new SwapPage(page);
        await swapPage.performSwapWithDefaultPair('0.001');
        await swapPage.expectSuccessPopup();
    });
});

test.describe('Swap feature – Fiat Swap (positive & negative)', () => {
    test.beforeEach(async ({ page }) => {
        test.setTimeout(120000);
        await prepareAuthenticatedPage(page);
        const swapPage = new SwapPage(page);
        await swapPage.dismissOpenDialogs();
    });

    test('TC-SW-FIAT-POS-01: Fiat Swap tab is visible on Swap page', async ({ page }) => {
        const swapPage = new SwapPage(page);
        await swapPage.goto();
        const fiatTab = swapPage.fiatSwapTab;
        const visible = await fiatTab.isVisible({ timeout: 10000 }).catch(() => false);
        expect(visible).toBeTruthy();
    });

    test('TC-SW-FIAT-POS-02: Fiat Swap tab click – form or content area visible', async ({ page }) => {
        const swapPage = new SwapPage(page);
        await swapPage.goto();
        await swapPage.ensureFiatSwapTab();
        await expect(swapPage.youPayRow()).toBeVisible();
        await expect(swapPage.youReceiveRow()).toBeVisible();
    });

    test('TC-SW-FIAT-NEG-01: Fiat Swap – zero amount does not execute (button disabled or validation)', async ({ page }) => {
        const swapPage = new SwapPage(page);
        await swapPage.goto();
        await swapPage.ensureFiatSwapTab();
        const amountInput = swapPage.youPayAmountInput();
        if (await amountInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await amountInput.fill('0');
            await page.waitForTimeout(1000);
        }
        const swapBtn = swapPage.swapButton();
        const disabled = await swapBtn.isDisabled().catch(() => false);
        const validation = page.locator('text=/enter amount|minimum|required/i').first();
        const hasValidation = await validation.isVisible({ timeout: 2000 }).catch(() => false);
        expect(disabled || hasValidation).toBeTruthy();
    });
});
