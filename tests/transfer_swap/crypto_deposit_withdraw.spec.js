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
        const depositLink = row.locator('button:has-text("Deposit"), a:has-text("Deposit"), [class*="deposit"]').first();
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
        const depositLink = row.locator('button:has-text("Deposit"), a:has-text("Deposit"), [class*="deposit"]').first();
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
        await page.waitForTimeout(2000);
        const row = page.locator('tr').filter({ hasText: 'USDT' }).first();
        if (!(await row.isVisible({ timeout: 5000 }).catch(() => false))) {
            test.skip();
            return;
        }
        const depositLink = row.locator('button:has-text("Deposit"), a:has-text("Deposit"), [class*="deposit"]').first();
        if (await depositLink.isVisible({ timeout: 3000 }).catch(() => false)) {
            await depositLink.click();
            await page.waitForTimeout(3000);
        }
        const addressOrNetwork = page.locator('text=/0x|ERC-20|TRC-20|USDT network/i, [class*="address"]').first();
        const hasAddress = await addressOrNetwork.isVisible({ timeout: 8000 }).catch(() => false);
        expect(hasAddress).toBeTruthy();
    });

    test('TC-DW-DEP-05: Deposit – all supported coins – each shows deposit entry or address', async ({ page }) => {
        const walletPage = new WalletPage(page);
        await walletPage.goto();
        await page.waitForTimeout(2000);
        let allFound = true;
        for (const coin of COINS_TO_CHECK) {
            const row = page.locator('tr').filter({ hasText: coin }).first();
            const hasRow = await row.isVisible({ timeout: 3000 }).catch(() => false);
            if (!hasRow) {
                allFound = false;
                break;
            }
            const depositAction = row.locator('button:has-text("Deposit"), a:has-text("Deposit"), button:has-text("Receive"), button:has-text("Send"), [class*="deposit"]').first();
            const hasDeposit = await depositAction.isVisible({ timeout: 2000 }).catch(() => false);
            if (!hasDeposit) {
                allFound = false;
                break;
            }
        }
        expect(allFound).toBeTruthy();
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
        await page.waitForTimeout(2000);
        const withdrawBtn = page.locator('button:has-text("Withdraw"), a:has-text("Withdraw"), button:has-text("Send"), [class*="withdraw"]').first();
        const row = page.locator('tr').first();
        const withdrawInRow = row.locator('button:has-text("Withdraw"), a:has-text("Withdraw"), button:has-text("Send")').first();
        const hasWithdraw = await withdrawBtn.isVisible({ timeout: 6000 }).catch(() => false)
            || await withdrawInRow.isVisible({ timeout: 6000 }).catch(() => false);
        expect(hasWithdraw).toBeTruthy();
    });

    test('TC-DW-WTH-02: Withdraw – BTC – form has address and amount fields', async ({ page }) => {
        const walletPage = new WalletPage(page);
        await walletPage.goto();
        await page.waitForTimeout(2000);
        const row = page.locator('tr').filter({ hasText: 'BTC' }).first();
        if (!(await row.isVisible({ timeout: 5000 }).catch(() => false))) {
            test.skip();
            return;
        }
        const withdrawLink = row.locator('button:has-text("Withdraw"), a:has-text("Withdraw")').first();
        if (await withdrawLink.isVisible({ timeout: 3000 }).catch(() => false)) {
            await withdrawLink.click();
            await page.waitForTimeout(3000);
        }
        const addressField = page.locator('input[placeholder*="address"], input[name*="address"], input[id*="address"]').first();
        const amountField = page.locator('input[type="number"], input[placeholder*="amount"], input[placeholder*="Amount"]').first();
        const hasForm = await addressField.isVisible({ timeout: 6000 }).catch(() => false)
            && await amountField.isVisible({ timeout: 3000 }).catch(() => false);
        expect(hasForm).toBeTruthy();
    });

    test('TC-DW-WTH-03: Withdraw – ETH – form has address and amount fields', async ({ page }) => {
        const walletPage = new WalletPage(page);
        await walletPage.goto();
        await page.waitForTimeout(2000);
        const row = page.locator('tr').filter({ hasText: 'ETH' }).first();
        if (!(await row.isVisible({ timeout: 5000 }).catch(() => false))) {
            test.skip();
            return;
        }
        const withdrawLink = row.locator('button:has-text("Withdraw"), a:has-text("Withdraw")').first();
        if (await withdrawLink.isVisible({ timeout: 3000 }).catch(() => false)) {
            await withdrawLink.click();
            await page.waitForTimeout(3000);
        }
        const addressField = page.locator('input[placeholder*="address"], input[name*="address"], input[id*="address"]').first();
        const amountField = page.locator('input[type="number"], input[placeholder*="amount"], input[placeholder*="Amount"]').first();
        const hasForm = await addressField.isVisible({ timeout: 6000 }).catch(() => false)
            && await amountField.isVisible({ timeout: 3000 }).catch(() => false);
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
        const withdrawLink = row.locator('button:has-text("Withdraw"), a:has-text("Withdraw")').first();
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
        const insufficientMsg = page.locator('text=/insufficient balance|not enough|exceeds balance/i').first();
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
        const withdrawLink = row.locator('button:has-text("Withdraw"), a:has-text("Withdraw")').first();
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
        const invalidMsg = page.locator('text=/invalid address|valid address|wrong format|invalid wallet/i').first();
        const hasValidation = await invalidMsg.isVisible({ timeout: 4000 }).catch(() => false);
        expect(hasValidation).toBeTruthy();
    });
});
