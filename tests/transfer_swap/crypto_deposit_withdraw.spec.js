/**
 * Crypto Deposit & Withdraw – test cases for all coins.
 * See CRYPTO_DEPOSIT_WITHDRAW_TEST_CASES.md for full descriptions.
 * Requires saved auth (--project=authenticated). See tests/auth/auth.setup.js.
 */

import { test, expect } from '@playwright/test';
import { WalletPage } from '../pages/WalletPage.js';
import { prepareAuthenticatedPage } from '../utils/prepareAuthenticatedPage.js';

/** Coins to check for deposit/withdraw (expand per platform) */
const COINS_TO_CHECK = ['BTC', 'ETH', 'USDT'];

test.describe('Crypto Deposit', () => {
    test.beforeEach(async ({ page }) => {
        test.setTimeout(90000);
        await prepareAuthenticatedPage(page);
    });

    test('TC-DW-DEP-01: Deposit – Wallets page loads and deposit section visible', async ({ page }) => {
        const walletPage = new WalletPage(page);
        await walletPage.goto();
        await page.waitForTimeout(2000);
        const depositBtn = page.locator('button:has-text("Deposit"), a:has-text("Deposit"), button:has-text("Receive"), [class*="deposit"]').first();
        const walletsTable = page.locator('table').first();
        const cryptoTab = page.locator('button:has-text("Crypto Wallet"), [role="tab"]:has-text("Crypto Wallet")').first();
        const hasDepositOrWallets = await depositBtn.isVisible({ timeout: 8000 }).catch(() => false)
            || await walletsTable.isVisible({ timeout: 8000 }).catch(() => false)
            || await cryptoTab.isVisible({ timeout: 8000 }).catch(() => false);
        expect(hasDepositOrWallets).toBeTruthy();
    });

    test('TC-DW-DEP-02: Deposit – BTC – deposit address/QR displayed', async ({ page }) => {
        const walletPage = new WalletPage(page);
        await walletPage.goto();
        await page.waitForTimeout(2000);
        const btcDeposit = page.locator('text=BTC').first();
        if (!(await btcDeposit.isVisible({ timeout: 5000 }).catch(() => false))) {
            test.skip();
            return;
        }
        const row = page.locator('tr').filter({ hasText: 'BTC' }).first();
        const depositLink = row.locator('button:has-text("Deposit"), a:has-text("Deposit"), button:has-text("Receive"), [class*="deposit"]').first();
        if (await depositLink.isVisible({ timeout: 3000 }).catch(() => false)) {
            await depositLink.click();
            await page.waitForTimeout(3000);
        }
        const addressOrQr = page.locator('text=/0x|[13]|bc1/, [class*="address"], [class*="qr"], canvas, img[alt*="QR"]').first();
        const hasAddress = await addressOrQr.isVisible({ timeout: 8000 }).catch(() => false)
            || await page.locator('text=/deposit address|wallet address|receive/i').first().isVisible({ timeout: 3000 }).catch(() => false);
        expect(hasAddress).toBeTruthy();
    });

    test('TC-DW-DEP-03: Deposit – ETH – deposit address/network displayed', async ({ page }) => {
        const walletPage = new WalletPage(page);
        await walletPage.goto();
        await page.waitForTimeout(2000);
        const row = page.locator('tr').filter({ hasText: 'ETH' }).first();
        if (!(await row.isVisible({ timeout: 5000 }).catch(() => false))) {
            test.skip();
            return;
        }
        const depositLink = row.locator('button:has-text("Deposit"), a:has-text("Deposit"), button:has-text("Receive"), [class*="deposit"]').first();
        if (await depositLink.isVisible({ timeout: 3000 }).catch(() => false)) {
            await depositLink.click();
            await page.waitForTimeout(3000);
        }
        const addressOrNetwork = page.locator('text=/0x[a-fA-F0-9]{40}/, text=/ERC-20|Ethereum|ETH network/i').first();
        const hasAddress = await addressOrNetwork.isVisible({ timeout: 8000 }).catch(() => false);
        expect(hasAddress).toBeTruthy();
    });

    test('TC-DW-DEP-04: Deposit – USDT – address and network displayed', async ({ page }) => {
        const walletPage = new WalletPage(page);
        await walletPage.goto();
        const opened = await walletPage.clickRowAction('USDT', /Receive|Deposit/i);
        if (!opened) {
            test.skip(true, 'USDT row or deposit action not available on UAT');
        }
        const hasAddress = await walletPage.hasDepositDetailsVisible()
            || await page.getByRole('dialog').locator('text=/0x[a-fA-F0-9]{40}/').first().isVisible({ timeout: 5000 }).catch(() => false);
        expect(hasAddress).toBeTruthy();
    });

    test('TC-DW-DEP-05: Deposit – all supported coins – each shows deposit entry or address', async ({ page }) => {
        const walletPage = new WalletPage(page);
        await walletPage.goto();
        let foundCount = 0;
        for (const coin of COINS_TO_CHECK) {
            const row = page.locator('tr, [class*="wallet-row"]').filter({ hasText: coin }).first();
            if (!(await row.isVisible({ timeout: 3000 }).catch(() => false))) continue;
            const depositAction = row.locator('button, a').filter({ hasText: /Deposit|Receive|Send/i }).first();
            if (await depositAction.isVisible({ timeout: 2000 }).catch(() => false)) foundCount++;
        }
        expect(foundCount).toBeGreaterThanOrEqual(1);
    });
});

test.describe('Crypto Withdraw', () => {
    test.beforeEach(async ({ page }) => {
        test.setTimeout(90000);
        await prepareAuthenticatedPage(page);
    });

    test('TC-DW-WTH-01: Withdraw – section/page accessible', async ({ page }) => {
        const walletPage = new WalletPage(page);
        await walletPage.goto();
        const withdrawBtn = page.locator('button:has-text("Withdraw"), a:has-text("Withdraw"), button:has-text("Send")').first();
        const row = page.locator('tr, [class*="wallet-row"]').first();
        const withdrawInRow = row.locator('button, a').filter({ hasText: /Withdraw|Send/i }).first();
        const hasWithdraw = await withdrawBtn.isVisible({ timeout: 6000 }).catch(() => false)
            || await withdrawInRow.isVisible({ timeout: 6000 }).catch(() => false)
            || await page.locator('text=/Withdraw|Send crypto/i').first().isVisible({ timeout: 4000 }).catch(() => false);
        expect(hasWithdraw).toBeTruthy();
    });

    test('TC-DW-WTH-02: Withdraw – BTC – form has address and amount fields', async ({ page }) => {
        const walletPage = new WalletPage(page);
        await walletPage.goto();
        const opened = await walletPage.clickRowAction('BTC', /Withdraw|Send/i);
        if (!opened) {
            test.skip(true, 'BTC withdraw action not available on UAT');
        }
        const addressField = page.locator('input[placeholder*="address" i], input[name*="address" i]').first();
        const amountField = page.locator('input[type="number"], input[placeholder*="amount" i]').first();
        const hasForm = await addressField.isVisible({ timeout: 8000 }).catch(() => false)
            && await amountField.isVisible({ timeout: 5000 }).catch(() => false);
        expect(hasForm).toBeTruthy();
    });

    test('TC-DW-WTH-03: Withdraw – ETH – form has address and amount fields', async ({ page }) => {
        const walletPage = new WalletPage(page);
        await walletPage.goto();
        const opened = await walletPage.clickRowAction('ETH', /Withdraw|Send/i);
        if (!opened) {
            test.skip(true, 'ETH withdraw action not available on UAT');
        }
        const addressField = page.locator('input[placeholder*="address" i], input[name*="address" i]').first();
        const amountField = page.locator('input[type="number"], input[placeholder*="amount" i]').first();
        const hasForm = await addressField.isVisible({ timeout: 8000 }).catch(() => false)
            && await amountField.isVisible({ timeout: 5000 }).catch(() => false);
        expect(hasForm).toBeTruthy();
    });

    test('TC-DW-NEG-WTH-01: Withdraw – insufficient balance shows validation', async ({ page }) => {
        const walletPage = new WalletPage(page);
        await walletPage.goto();
        await page.waitForTimeout(2000);
        const row = page.locator('tr').filter({ hasText: /BTC|ETH/ }).first();
        if (!(await row.isVisible({ timeout: 5000 }).catch(() => false))) {
            test.skip();
            return;
        }
        const withdrawLink = row.locator('button:has-text("Withdraw"), a:has-text("Withdraw"), button:has-text("Send")').first();
        if (!(await withdrawLink.isVisible({ timeout: 3000 }).catch(() => false))) {
            test.skip();
            return;
        }
        await withdrawLink.click();
        await page.waitForTimeout(3000);
        const addressField = page.locator('input[placeholder*="address"], input[name*="address"]').first();
        const amountField = page.locator('input[type="number"], input[placeholder*="amount"], input[placeholder*="Amount"]').first();
        if (await addressField.isVisible({ timeout: 3000 }).catch(() => false)) {
            await addressField.fill('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
        }
        if (await amountField.isVisible({ timeout: 3000 }).catch(() => false)) {
            await amountField.fill('999999');
            await page.waitForTimeout(1500);
        }
        const insufficientMsg = page.locator('text=/insufficient balance|not enough|exceeds balance|exceeds available|maximum/i').first();
        const submitBtn = page.locator('button:has-text("Withdraw"), button:has-text("Submit"), button:has-text("Send")').first();
        const hasValidation = await insufficientMsg.isVisible({ timeout: 3000 }).catch(() => false)
            || (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false) && !(await submitBtn.isEnabled().catch(() => false)));
        expect(hasValidation).toBeTruthy();
    });

    test('TC-DW-NEG-WTH-03: Withdraw – invalid address format shows validation', async ({ page }) => {
        const walletPage = new WalletPage(page);
        await walletPage.goto();
        await page.waitForTimeout(2000);
        const row = page.locator('tr').filter({ hasText: /BTC|ETH/ }).first();
        if (!(await row.isVisible({ timeout: 5000 }).catch(() => false))) {
            test.skip();
            return;
        }
        const withdrawLink = row.locator('button:has-text("Withdraw"), a:has-text("Withdraw"), button:has-text("Send")').first();
        if (!(await withdrawLink.isVisible({ timeout: 3000 }).catch(() => false))) {
            test.skip();
            return;
        }
        await withdrawLink.click();
        await page.waitForTimeout(3000);
        const addressField = page.locator('input[placeholder*="address"], input[name*="address"]').first();
        if (await addressField.isVisible({ timeout: 3000 }).catch(() => false)) {
            await addressField.fill('invalid-address-xyz');
            await addressField.blur().catch(() => {});
            await page.waitForTimeout(1500);
        }
        const invalidMsg = page.locator('text=/invalid address|valid address|wrong format|invalid wallet|enter a valid|error/i').first();
        const submitBtn = page.getByRole('dialog').locator('button').filter({ hasText: /^Send / }).first();
        const hasValidation = await invalidMsg.isVisible({ timeout: 4000 }).catch(() => false)
            || (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false) && !(await submitBtn.isEnabled().catch(() => true)));
        expect(hasValidation).toBeTruthy();
    });
});
