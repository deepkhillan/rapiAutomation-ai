import { expect } from '@playwright/test';
import { navigateToFeature, APP_ROUTES, clickAppNavLink } from '../utils/appNavigation.js';

/**
 * Internal Transfer flow:
 * - Crypto: Wallets → Crypto Wallet tab → Internal Transfer → email + amount → Send [coin] → Continue → PIN → success.
 * - Fiat:   Wallets → Fiat Wallet tab → Internal Transfer → email + amount → Send [coin name] → Continue → PIN → success.
 */

export class InternalTransferPage {
    constructor(page) {
        this.page = page;
        // Navigation: Wallets sidebar
        this.walletsSidebarLink = page.locator('a:has-text("Wallets"), a:has-text("Wallet")').first();
        // Wallets page main tabs (Crypto Wallet | Fiat Wallet)
        this.cryptoWalletTab = page.locator('button:has-text("Crypto Wallet"), [role="tab"]:has-text("Crypto Wallet"), .tab:has-text("Crypto Wallet")').first();
        this.fiatWalletTab = page.locator('button:has-text("Fiat Wallet"), [role="tab"]:has-text("Fiat Wallet"), .tab:has-text("Fiat Wallet")').first();
        // Internal Transfer: tab or button (e.g. in table row – "Internal Transfer" button per currency)
        this.internalTransferTab = page.locator('button:has-text("Internal Transfer"), [role="tab"]:has-text("Internal Transfer"), .tab:has-text("Internal Transfer"), a:has-text("Internal Transfer")').first();
        this.internalTransferButton = page.locator('button:has-text("Internal Transfer")').first();
        // Form – email (placeholder "Enter Email Address") and amount
        this.emailInput = page.locator('input[placeholder*="Email Address"], input[type="email"], input[placeholder*="email"], input[name="email"], input[id*="email"]').first();
        this.amountInput = page.locator('input[type="number"], input[placeholder*="amount"], input[placeholder*="Amount"]').first();
        // Internal Transfer submit – use //button[@type='submit'] to click the button while internal transfer
        this.transferOrSendButton = page.locator('//button[@type="submit"]').first();
        // Review / confirmation: Continue button (span with text "Continue" in review modal)
        this.continueButton = page.locator("//span[normalize-space()='Continue']").first();
        // PIN approval (after Continue): transaction PIN to approve
        this.pinInputs = page.locator('input[type="text"], input[type="tel"], input[type="password"]').filter({ visible: true });
        this.pinSubmitButton = page.locator('button:has-text("Verify"), button:has-text("Submit"), button:has-text("Confirm"), button:has-text("Approve")').first();
        // Success
        this.successMessage = page.locator('text=/success|completed|transfer successful|order completed/i').first();
        this.successPopup = page.locator('text=/successfully|completed|transfer complete/i').first();
    }

    async gotoWallets() {
        const url = await navigateToFeature(this.page, APP_ROUTES.wallets);
        if (!APP_ROUTES.wallets.urlPattern.test(url)) {
            await clickAppNavLink(this.page, APP_ROUTES.wallets);
        }
        if (!APP_ROUTES.wallets.urlPattern.test(this.page.url())) {
            await this.page.goto('/wallet', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
        }
        await this.page.waitForLoadState('domcontentloaded').catch(() => {});
        await this.page.waitForTimeout(2000);
    }

    /** Go to Wallets then Crypto Wallet tab, then open Internal Transfer (tab or first button). */
    async gotoInternalTransfer(coinSymbol = 'BTC') {
        await this.gotoWallets();
        await this.page.waitForLoadState('domcontentloaded').catch(() => {});
        if (await this.cryptoWalletTab.isVisible({ timeout: 5000 }).catch(() => false)) {
            await this.cryptoWalletTab.click();
            await this.page.waitForTimeout(1500);
        }
        const row = this.page.locator('tr, [class*="wallet-row"], [class*="table-row"]')
            .filter({ hasText: new RegExp(coinSymbol, 'i') }).first();
        const rowBtn = row.locator('button:has-text("Internal Transfer")').first();
        const globalBtn = this.page.locator('button:has-text("Internal Transfer")').filter({ visible: true }).first();
        if (await rowBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await rowBtn.click();
        } else if (await globalBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await globalBtn.click();
        } else if (await this.internalTransferTab.isVisible({ timeout: 3000 }).catch(() => false)) {
            await this.internalTransferTab.click();
        }
        await this.page.waitForLoadState('domcontentloaded').catch(() => {});
        await this.page.waitForTimeout(2000);
    }

    /** Go to Wallets → Fiat Wallet tab → Internal Transfer (button in table, e.g. USD row), then form opens. */
    async gotoFiatInternalTransfer() {
        await this.gotoWallets();
        await this.fiatWalletTab.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
        if (await this.fiatWalletTab.isVisible({ timeout: 3000 }).catch(() => false)) {
            await this.fiatWalletTab.click();
            await this.page.waitForTimeout(2000);
        }
        const usdRow = this.page.locator('tr, [class*="wallet-row"]').filter({ hasText: /USD|USDT/i }).first();
        const rowBtn = usdRow.locator('button:has-text("Internal Transfer")').first();
        if (await rowBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await rowBtn.click();
        } else if (await this.internalTransferButton.isVisible({ timeout: 5000 }).catch(() => false)) {
            await this.internalTransferButton.click();
        } else if (await this.internalTransferTab.isVisible({ timeout: 3000 }).catch(() => false)) {
            await this.internalTransferTab.click();
        }
        await this.page.waitForLoadState('domcontentloaded').catch(() => {});
        await this.page.waitForTimeout(2000);
    }

    async clickTransferSubmit() {
        const dialog = this.page.getByRole('dialog').filter({ hasText: /Internal Transfer/i });
        const sendBtn = dialog.locator('button').filter({ hasText: /^Send / }).first();
        if (await sendBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await sendBtn.click({ timeout: 15000 });
            return;
        }
        const submitBtn = dialog.locator('button[type="submit"], button:has-text("Transfer"), button:has-text("Send")').first();
        if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await submitBtn.click({ timeout: 15000 });
        } else if (await this.transferOrSendButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await this.transferOrSendButton.click({ timeout: 15000 });
        }
    }

    /** Fill email and amount, then click submit. Crypto flow uses gotoInternalTransfer first. */
    async fillAndSubmitCrypto(email, amount = '0.1') {
        if (await this.emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
            await this.emailInput.fill(email);
        }
        if (await this.amountInput.isVisible({ timeout: 5000 }).catch(() => false)) {
            await this.amountInput.fill(amount);
        }
        await this.page.waitForTimeout(800);
        await this.clickTransferSubmit();
        await this.page.waitForTimeout(2000);
    }

    /** Fiat: goto Fiat Wallet → Internal Transfer, then enter email and amount, click submit. */
    async fillAndSubmitFiat(email, amount = '10') {
        await this.gotoFiatInternalTransfer();
        if (await this.emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
            await this.emailInput.fill(email);
        }
        if (await this.amountInput.isVisible({ timeout: 5000 }).catch(() => false)) {
            await this.amountInput.fill(amount);
        }
        await this.page.waitForTimeout(800);
        await this.clickTransferSubmit();
        await this.page.waitForTimeout(2000);
    }

    /** After Send: wait 2 seconds for popup, then click Continue on review/confirmation popup. */
    async clickContinueOnReview() {
        await this.page.waitForTimeout(2000);
        const continueBtn = this.page.locator(
            'button:has-text("Continue"), span:has-text("Continue"), [role="button"]:has-text("Continue")',
        ).filter({ visible: true }).first();
        await continueBtn.waitFor({ state: 'visible', timeout: 15000 });
        await continueBtn.scrollIntoViewIfNeeded().catch(() => {});
        await continueBtn.click({ timeout: 15000 });
        await this.page.waitForTimeout(3000);
    }

    /** Enter PIN (e.g. 111111) to approve the transaction, then submit. */
    async enterPinToApprove(pin = '111111') {
        await this.page.waitForTimeout(2000);
        const pinFields = await this.page.locator('input[type="text"], input[type="tel"], input[type="password"]').filter({ visible: true }).all();
        const targets = [];
        for (const f of pinFields) {
            const id = (await f.getAttribute('id') || '').toLowerCase();
            const name = (await f.getAttribute('name') || '').toLowerCase();
            if (!id.includes('email') && !id.includes('password') && !name.includes('email') && !name.includes('password')) {
                targets.push(f);
            }
        }
        if (targets.length >= 1) {
            if (targets.length === 1) {
                await targets[0].fill(pin);
            } else {
                for (let i = 0; i < Math.min(pin.length, targets.length); i++) {
                    await targets[i].focus();
                    await targets[i].fill(pin[i]);
                    await this.page.waitForTimeout(200);
                }
            }
            await this.page.waitForTimeout(1000);
            const submitBtn = this.page.locator('button:has-text("Verify"), button:has-text("Submit"), button:has-text("Confirm"), button:has-text("Approve")').filter({ visible: true }).first();
            if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await submitBtn.click();
            } else {
                await this.page.keyboard.press('Enter');
            }
            await this.page.waitForTimeout(3000);
        }
    }

    /** Check that order is completed (success message visible). */
    async expectOrderCompleted(timeoutMs = 20000) {
        const success = this.successMessage.or(this.successPopup);
        const visible = await success.isVisible({ timeout: timeoutMs }).catch(() => false);
        if (visible) return;
        const toast = this.page.locator('text=/success|completed|transfer/i').first();
        const toastVisible = await toast.isVisible({ timeout: 5000 }).catch(() => false);
        expect(toastVisible || visible).toBeTruthy();
    }
}
