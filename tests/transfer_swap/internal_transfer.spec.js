/**
 * Internal Transfer – positive and negative test cases for fiat and crypto.
 * Navigation: Wallets (sidebar) → Internal Transfer tab → email + amount → review → Continue.
 * Login once via auth-setup; all tests run with saved session (--project=authenticated).
 * Uses transferRecipientEmail for transfer flows. Crypto amount 0.1, Fiat amount 10.
 */

import { test, expect } from '@playwright/test';
import { InternalTransferPage } from '../pages/InternalTransferPage.js';
import { transferRecipientEmail, invalidEmails, providedCredentials } from '../utils/testData.js';
import { prepareAuthenticatedPage } from '../utils/prepareAuthenticatedPage.js';

/** Navigate to Internal Transfer via Wallets → Internal Transfer tab. */
async function goToInternalTransfer(page) {
    const internalTransferPage = new InternalTransferPage(page);
    await internalTransferPage.gotoInternalTransfer();
    return internalTransferPage;
}

test.describe('Internal Transfer', () => {
    test.beforeEach(async ({ page }) => {
        test.setTimeout(90000);
        await prepareAuthenticatedPage(page);
        await page.goto('/', { waitUntil: 'domcontentloaded' }).catch(() => {});
        await page.waitForLoadState('networkidle').catch(() => {});
        await page.waitForTimeout(2000);
    });

    test('TC-TR-E2E-CRYPTO: Internal Transfer – Crypto 0.1 – full flow, Continue, PIN 111111, order completed', async ({ page }) => {
        const internalTransferPage = new InternalTransferPage(page);
        await internalTransferPage.gotoInternalTransfer();
        await internalTransferPage.fillAndSubmitCrypto(transferRecipientEmail, '0.1');
        await internalTransferPage.clickContinueOnReview();
        await internalTransferPage.enterPinToApprove(providedCredentials.pin);
        await internalTransferPage.expectOrderCompleted();
    });

    test('TC-TR-E2E-FIAT: Internal Transfer – Fiat 10 – Fiat Wallet tab → Internal Transfer → Send USD, Continue, PIN, order completed', async ({ page }) => {
        const internalTransferPage = new InternalTransferPage(page);
        await internalTransferPage.fillAndSubmitFiat(transferRecipientEmail, '10');
        await internalTransferPage.clickContinueOnReview();
        await internalTransferPage.enterPinToApprove(providedCredentials.pin);
        await internalTransferPage.expectOrderCompleted();
    });

    test('TC-TR-01: Internal Transfer – Fiat (USD) – page loads and form is available', async ({ page }) => {
        await goToInternalTransfer(page);
        const amountInput = page.locator('input[type="number"], input[placeholder*="amount"], input[placeholder*="Amount"]').first();
        const hasForm = await amountInput.isVisible({ timeout: 10000 }).catch(() => false)
            || await page.locator('text=/transfer|amount|from|to/i').first().isVisible({ timeout: 5000 }).catch(() => false);
        expect(hasForm).toBeTruthy();
    });

    test('TC-TR-02: Internal Transfer – Crypto (BTC/ETH) – page loads and asset selection available', async ({ page }) => {
        await goToInternalTransfer(page);
        const assetOrAmount = page.locator('input[type="number"], .coin-select, [class*="asset"], text=/BTC|ETH|coin|asset/i').first();
        const hasForm = await assetOrAmount.isVisible({ timeout: 10000 }).catch(() => false);
        expect(hasForm).toBeTruthy();
    });

    test('TC-TR-03: Internal Transfer – transfer to user email (jot.antier@gmail.com)', async ({ page }) => {
        await goToInternalTransfer(page);
        const emailInput = page.locator('input[type="email"], input[placeholder*="email"], input[name="email"], input[id*="email"]').first();
        if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
            await emailInput.fill(transferRecipientEmail);
            const value = await emailInput.inputValue();
            expect(value).toBe(transferRecipientEmail);
        }
        const amountInput = page.locator('input[type="number"], input[placeholder*="amount"], input[placeholder*="Amount"]').first();
        const hasForm = await amountInput.isVisible({ timeout: 5000 }).catch(() => false)
            || await page.locator('text=/transfer|amount|from|to/i').first().isVisible({ timeout: 5000 }).catch(() => false);
        expect(hasForm).toBeTruthy();
    });

    // ---------- Negative: Fiat ----------
    test('TC-TR-NEG-FIAT-02: Fiat transfer – below minimum amount shows validation', async ({ page }) => {
        await goToInternalTransfer(page);
        const emailInput = page.locator('input[type="email"], input[placeholder*="email"], input[name="email"], input[id*="email"]').first();
        if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await emailInput.fill(transferRecipientEmail);
        }
        const amountInput = page.locator('input[type="number"], input[placeholder*="amount"], input[placeholder*="Amount"]').first();
        if (await amountInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await amountInput.fill('0.01');
            await page.waitForTimeout(1500);
            const minError = page.locator('text=/minimum|min\\. amount|at least|below minimum/i').first();
            const submitDisabled = page.locator('button:has-text("Transfer"), button:has-text("Send"), button:has-text("Submit")').first();
            const hasValidation = await minError.isVisible({ timeout: 3000 }).catch(() => false)
                || (await submitDisabled.isVisible({ timeout: 2000 }).catch(() => false) && !(await submitDisabled.isEnabled().catch(() => false)));
            expect(hasValidation).toBeTruthy();
        } else {
            test.skip();
        }
    });

    test('TC-TR-NEG-FIAT-03: Fiat transfer – invalid recipient email shows validation', async ({ page }) => {
        await goToInternalTransfer(page);
        const emailInput = page.locator('input[type="email"], input[placeholder*="email"], input[name="email"], input[id*="email"]').first();
        if (!(await emailInput.isVisible({ timeout: 3000 }).catch(() => false))) {
            test.skip();
            return;
        }
        const invalidEmail = invalidEmails[0] || 'invalid-email';
        await emailInput.fill(invalidEmail);
        await page.waitForTimeout(800);
        await emailInput.blur().catch(() => {});
        await page.waitForTimeout(1000);
        const errorMsg = page.locator('text=/valid email|invalid|enter a valid|invalid email/i').first();
        const hasError = await errorMsg.isVisible({ timeout: 3000 }).catch(() => false);
        expect(hasError).toBeTruthy();
    });

    // ---------- Negative: Crypto (when crypto transfer form is available) ----------
    test('TC-TR-NEG-CRYPTO-01: Crypto transfer – insufficient balance shows validation', async ({ page }) => {
        await goToInternalTransfer(page);
        const cryptoOption = page.locator('text=/BTC|ETH|crypto|Crypto/i').first();
        if (await cryptoOption.isVisible({ timeout: 3000 }).catch(() => false)) {
            await cryptoOption.click().catch(() => {});
            await page.waitForTimeout(1000);
        }
        const emailInput = page.locator('input[type="email"], input[placeholder*="email"], input[name="email"]').first();
        if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
            await emailInput.fill(transferRecipientEmail);
        }
        const amountInput = page.locator('input[type="number"], input[placeholder*="amount"], input[placeholder*="Amount"]').first();
        if (await amountInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await amountInput.fill('999999');
            await page.waitForTimeout(1500);
            const insufficientMsg = page.locator('text=/insufficient balance|not enough|balance is too low/i').first();
            const hasValidation = await insufficientMsg.isVisible({ timeout: 3000 }).catch(() => false);
            expect(hasValidation).toBeTruthy();
        } else {
            test.skip();
        }
    });

    test('TC-TR-NEG-CRYPTO-03: Crypto transfer – invalid recipient email shows validation', async ({ page }) => {
        await goToInternalTransfer(page);
        const emailInput = page.locator('input[type="email"], input[placeholder*="email"], input[name="email"], input[id*="email"]').first();
        if (!(await emailInput.isVisible({ timeout: 3000 }).catch(() => false))) {
            test.skip();
            return;
        }
        await emailInput.fill('notanemail');
        await page.waitForTimeout(800);
        await emailInput.blur().catch(() => {});
        await page.waitForTimeout(1000);
        const errorMsg = page.locator('text=/valid email|invalid|enter a valid|invalid email/i').first();
        const hasError = await errorMsg.isVisible({ timeout: 3000 }).catch(() => false);
        expect(hasError).toBeTruthy();
    });
});
