import { expect } from '@playwright/test';
import { navigateToFeature, APP_ROUTES } from '../utils/appNavigation.js';
import { providedCredentials } from '../utils/testData.js';

/** Platform rule: a new swap order can only be placed 60s after the previous one. */
export const SWAP_ORDER_COOLDOWN_MS = 60_000;

let lastSwapOrderPlacedAt = 0;

/**
 * Swap Page Object Model – RapiXchange Crypto Swap
 * Flow: Swapping tab → Crypto Swap tab → You Pay (ETH) / You Receive (USDT) → amount → Swap → Continue → Success popup
 */
export class SwapPage {
    constructor(page) {
        this.page = page;

        this.sidebarLink = page.locator('a:has-text("Swapping"), a:has-text("Swap"), a[href*="swap"]').first();

        // Tabs scoped to visible swap card in main (hidden duplicate panels exist in DOM)
        this.cryptoSwapTab = page.locator('main button:has-text("Crypto Swap")').locator('visible=true').first();
        this.fiatSwapTab = page.locator('main button:has-text("Fiat Swap")').locator('visible=true').first();

        // Confirmation modal – Continue / Cancel inside review dialog
        this.modalContinueButton = page.getByRole('dialog').getByRole('button', { name: 'Continue' });
        this.modalCancelButton = page.getByRole('dialog').getByRole('button', { name: 'Cancel' });

        // Success popup
        this.successPopupTitle = page.locator('text=/Successfully Swap|successfully swap/i').first();
        this.successPopupMessage = page.locator('text=/successfully Swap \\d|You have successfully Swap/i').first();
        this.successOkButton = page.getByRole('button', { name: 'Ok' });
        this.successToast = page.locator('text=/swap order has been successfully executed/i').first();

        // Insufficient balance / funds validation
        this.insufficientBalanceMessage = page.locator('text=/Insufficient balance|insufficient funds|not enough balance|exceeds.*balance/i').first();
    }

    /** Active swap card panel with visible amount fields (crypto or fiat). */
    swapCard() {
        return this.page.locator('main .swapCardSwitcher_variant.is-active, main .swapCardSwitcher_variant').filter({
            has: this.page.locator('input.balanceInput, input[placeholder="Enter value"]').locator('visible=true'),
        }).first();
    }

    /** First visible amount input in the active swap card (You Pay). */
    visibleYouPayInput() {
        return this.page.locator('main input.balanceInput, main input[placeholder="Enter value"]').locator('visible=true').first();
    }

    /** Second visible amount input in the active swap card (You Receive). */
    visibleYouReceiveInput() {
        return this.page.locator('main input.balanceInput, main input[placeholder="Enter value"]').locator('visible=true').nth(1);
    }

    /** Visible "You Pay" section in the active swap card. */
    youPayRow() {
        return this.swapCard().locator('div').filter({ has: this.page.getByText('You Pay', { exact: true }) }).first();
    }

    /** Visible "You Receive" section in the active swap card. */
    youReceiveRow() {
        return this.swapCard().locator('div').filter({ has: this.page.getByText('You Receive', { exact: true }) }).first();
    }

    /** Visible Swap button in the active swap card. */
    swapButton() {
        return this.swapCard().getByRole('button', { name: 'Swap', exact: true });
    }

    /** You Pay amount input (textbox with placeholder "Enter value"). */
    youPayAmountInput() {
        return this.visibleYouPayInput();
    }

    async goto() {
        console.log('Navigating to Swap page (Swapping)...');
        for (let attempt = 0; attempt < 3; attempt++) {
            await navigateToFeature(this.page, APP_ROUTES.swap);
            await this.page.waitForLoadState('domcontentloaded').catch(() => {});
            await this.dismissOpenDialogs();
            const url = this.page.url() || '';
            const onSwap = APP_ROUTES.swap.urlPattern.test(url);
            const hasForm = await this.page.getByText('You Pay', { exact: true }).first()
                .isVisible({ timeout: 12000 }).catch(() => false);
            if (onSwap && hasForm) break;
            if (attempt === 2 && !onSwap) {
                throw new Error(`Swap page not reachable (redirected to ${url}). Re-run auth setup or check navigation selectors.`);
            }
            await this.page.waitForTimeout(2000);
        }
        await this.cryptoSwapTab.click().catch(() => {});
        await this.visibleYouPayInput().waitFor({ state: 'visible', timeout: 60000 });
        await this.page.waitForTimeout(500);
        const closeBanner = this.page.locator('button:has-text("Close")').first();
        if (await closeBanner.isVisible({ timeout: 2000 }).catch(() => false)) {
            await closeBanner.click();
            await this.page.waitForTimeout(300);
        }
    }

    /**
     * Wait until 60s have passed since the last completed swap order (shared across tests in the same run).
     */
    async waitForOrderCooldown() {
        if (lastSwapOrderPlacedAt === 0) return;
        const elapsed = Date.now() - lastSwapOrderPlacedAt;
        if (elapsed < SWAP_ORDER_COOLDOWN_MS) {
            const waitMs = SWAP_ORDER_COOLDOWN_MS - elapsed;
            console.log(`Swap order cooldown: waiting ${Math.ceil(waitMs / 1000)}s before next order (60s rule)...`);
            await this.page.waitForTimeout(waitMs);
        }
    }

    /** Record that a swap order was successfully placed (starts the 60s cooldown). */
    markOrderPlaced() {
        lastSwapOrderPlacedAt = Date.now();
        console.log('Swap order placed. Next order allowed after 60 seconds.');
    }

    async dismissOpenDialogs() {
        const cancel = this.modalCancelButton;
        if (await cancel.isVisible({ timeout: 1000 }).catch(() => false)) {
            await cancel.click();
            await this.page.waitForTimeout(500);
        }
        const ok = this.successOkButton;
        if (await ok.isVisible({ timeout: 1000 }).catch(() => false)) {
            await ok.click();
            await this.page.waitForTimeout(500);
        }
    }

    async ensureCryptoSwapTab() {
        const tab = this.cryptoSwapTab;
        if (await tab.isVisible({ timeout: 5000 }).catch(() => false)) {
            await tab.click();
            await this.page.waitForTimeout(500);
        }
        await this.youPayRow().waitFor({ state: 'visible', timeout: 10000 });
    }

    async ensureFiatSwapTab() {
        const tab = this.fiatSwapTab;
        await tab.waitFor({ state: 'visible', timeout: 10000 });
        await tab.click();
        await this.page.waitForTimeout(800);
        await this.swapCard().waitFor({ state: 'visible', timeout: 10000 });
        await this.youPayRow().waitFor({ state: 'visible', timeout: 10000 });
    }

    async selectAssetFromChooseModal(symbol) {
        const symbolRegex = new RegExp(`^${symbol}$|^${symbol}\\s|\\s${symbol}$|${symbol}-|Ethereum|Tether|Bitcoin`, 'i');
        const dialog = this.page.getByRole('dialog').first();
        const textHeading = this.page.locator('text=/Choose your asset|Select your asset|Select asset/i').first();
        const listbox = this.page.getByRole('listbox').first();
        const customModal = this.page.locator('[class*="modal"], [class*="Modal"], [class*="dropdown"], [class*="Dropdown"]').filter({ hasText: /Choose|Select|asset/i }).first();
        const anyChoose = this.page.locator('div, h2, h3, p').filter({ hasText: /Choose your asset|Choose asset|Select asset/i }).first();
        const optionsInListbox = this.page.getByRole('listbox').locator('[role="option"]').nth(1);
        const optionsInDialog = this.page.getByRole('dialog').locator('li, [role="option"], div[class*="item"], div[class*="option"]').nth(1);

        try {
            await Promise.any([
                dialog.waitFor({ state: 'visible', timeout: 18000 }),
                textHeading.waitFor({ state: 'visible', timeout: 18000 }),
                listbox.waitFor({ state: 'visible', timeout: 18000 }),
                customModal.waitFor({ state: 'visible', timeout: 18000 }),
                anyChoose.waitFor({ state: 'visible', timeout: 18000 }),
                optionsInListbox.waitFor({ state: 'visible', timeout: 18000 }),
                optionsInDialog.waitFor({ state: 'visible', timeout: 18000 }),
            ]);
        } catch {
            throw new Error(
                'Asset selection modal did not open after clicking the dropdown. '
                + 'Run: npx playwright test tests/transfer_swap/swap.discover.spec.js --project=swap-discover',
            );
        }
        await this.page.waitForTimeout(800);
        const modal = this.page.getByRole('dialog').first();
        const modalVisible = await modal.isVisible({ timeout: 2000 }).catch(() => false);
        const headingDiv = this.page.locator('div').filter({ hasText: /Choose your asset|Select your asset|Select asset/i }).first();
        const headingVisible = modalVisible ? false : await headingDiv.isVisible({ timeout: 1500 }).catch(() => false);
        const listboxVisible = !modalVisible && !headingVisible && (await listbox.isVisible({ timeout: 1500 }).catch(() => false));
        const customVisible = !modalVisible && !headingVisible && !listboxVisible && (await customModal.isVisible({ timeout: 1500 }).catch(() => false));
        const anyChooseVisible = !modalVisible && !headingVisible && !listboxVisible && !customVisible && (await anyChoose.isVisible({ timeout: 1500 }).catch(() => false));
        const optionsInListboxVisible = !modalVisible && !headingVisible && !listboxVisible && (await optionsInListbox.isVisible({ timeout: 1500 }).catch(() => false));
        const optionsInDialogVisible = !modalVisible && !headingVisible && !listboxVisible && !optionsInListboxVisible && (await optionsInDialog.isVisible({ timeout: 1500 }).catch(() => false));
        const chooseContainer = this.page.locator('div').filter({ hasText: /Choose/i }).first();
        const modalRoot = modalVisible ? modal : (headingVisible ? headingDiv : (listboxVisible ? listbox : (customVisible ? customModal : (anyChooseVisible ? chooseContainer : (optionsInListboxVisible ? listbox : (optionsInDialogVisible ? modal : this.page))))));
        const assetModal = this.page.locator('.chooseAssetModal, [role="dialog"]').first();
        if (await assetModal.isVisible({ timeout: 3000 }).catch(() => false)) {
            const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const exact = assetModal.locator('h6, li, button, span, p').filter({ hasText: new RegExp(`^${escaped}$`, 'i') }).first();
            if (await exact.isVisible({ timeout: 5000 }).catch(() => false)) {
                await exact.click();
                await assetModal.waitFor({ state: 'hidden', timeout: 6000 }).catch(() => {});
                await this.page.waitForTimeout(500);
                return;
            }
        }

        let listItem = modalRoot.locator('h6').filter({ hasText: symbolRegex }).first();
        if (!(await listItem.isVisible({ timeout: 2000 }).catch(() => false))) {
            listItem = modalRoot.locator('[role="option"], li, [role="menuitem"], [role="button"], div[class*="item"], div[class*="option"], div[class*="token"], [data-symbol]').filter({ hasText: symbolRegex }).first();
        }
        await listItem.waitFor({ state: 'visible', timeout: 15000 });
        await listItem.click();
        await this.page.getByRole('dialog').first().waitFor({ state: 'hidden', timeout: 6000 }).catch(() => {});
        await this.page.waitForTimeout(500);
    }

    async openYouPayTokenDropdown() {
        const paySection = this.paySection();
        const trigger = paySection.locator('.inputHead_selectModal_coinSelect, .inputHead_selectModal').first();
        await trigger.waitFor({ state: 'visible', timeout: 15000 });
        await trigger.click({ force: true, timeout: 10000 });
        await this.page.waitForTimeout(1200);
    }

    async openYouReceiveTokenDropdown() {
        const receiveSection = this.receiveSection();
        const trigger = receiveSection.locator('.inputHead_selectModal_coinSelect, .inputHead_selectModal').first();
        await trigger.waitFor({ state: 'visible', timeout: 15000 });
        await trigger.click({ force: true, timeout: 10000 });
        await this.page.waitForTimeout(1200);
    }

    paySection() {
        return this.visibleYouPayInput().locator('xpath=ancestor::div[.//*[normalize-space()="You Pay"]][1]');
    }

    receiveSection() {
        return this.visibleYouReceiveInput().locator('xpath=ancestor::div[.//*[normalize-space()="You Receive"]][1]');
    }

    async getSelectedPaySymbol() {
        const label = (await this.paySection().locator('.inputHead_selectModal_coinSelect h6, .inputHead_selectModal h6').first()
            .textContent().catch(() => '')) || '';
        return label.trim().split(/\s/)[0];
    }

    async getSelectedReceiveSymbol() {
        const label = (await this.receiveSection().locator('.inputHead_selectModal_coinSelect h6, .inputHead_selectModal h6').first()
            .textContent().catch(() => '')) || '';
        return label.trim().split(/\s/)[0];
    }

    async selectYouPayAsset(symbol) {
        console.log(`Selecting You Pay asset: ${symbol}`);
        const current = await this.getSelectedPaySymbol();
        if (new RegExp(`^${symbol}$`, 'i').test(current)) {
            await this.page.waitForTimeout(300);
            return;
        }
        await this.openYouPayTokenDropdown();
        await this.page.waitForTimeout(1000);
        await this.selectAssetFromChooseModal(symbol);
        await this.waitForAssetSelectedInYouPay(symbol);
        const selected = await this.getSelectedPaySymbol();
        if (!new RegExp(`^${symbol}$`, 'i').test(selected)) {
            console.log(`You Pay asset is "${selected}" after attempting to select ${symbol}`);
            return false;
        }
        return true;
    }

    async selectYouReceiveAsset(symbol) {
        console.log(`Selecting You Receive asset: ${symbol}`);
        const current = await this.getSelectedReceiveSymbol();
        if (new RegExp(`^${symbol}$`, 'i').test(current)) {
            await this.page.waitForTimeout(300);
            return;
        }
        await this.openYouReceiveTokenDropdown();
        await this.page.waitForTimeout(1000);
        await this.selectAssetFromChooseModal(symbol);
        await this.waitForAssetSelectedInYouReceive(symbol);
        const selected = await this.getSelectedReceiveSymbol();
        if (!new RegExp(`^${symbol}$`, 'i').test(selected)) {
            console.log(`You Receive asset is "${selected}" after attempting to select ${symbol}`);
            return false;
        }
        return true;
    }

    async waitForAssetSelectedInYouPay(symbol) {
        const payRow = this.youPayRow();
        await payRow.locator('h6').filter({ hasText: new RegExp('^' + symbol + '$', 'i') }).first()
            .waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        await this.page.waitForTimeout(300);
    }

    async waitForAssetSelectedInYouReceive(symbol) {
        const receiveRow = this.youReceiveRow();
        await receiveRow.locator('h6').filter({ hasText: new RegExp('^' + symbol + '$', 'i') }).first()
            .waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        await this.page.waitForTimeout(300);
    }

    async setYouPayAmount(amount) {
        console.log(`Setting You Pay amount: ${amount}`);
        const input = this.youPayAmountInput();
        await input.waitFor({ state: 'visible', timeout: 10000 });
        await input.click({ force: true });
        await input.fill(amount.toString(), { force: true });
        await this.page.waitForTimeout(800);
    }

    async clickSwapButton() {
        const btn = this.swapButton();
        await btn.waitFor({ state: 'visible', timeout: 15000 });
        await btn.scrollIntoViewIfNeeded();
        for (let i = 0; i < 12; i++) {
            if (await btn.isEnabled().catch(() => false)) break;
            await this.page.waitForTimeout(1500);
        }
        await btn.click({ force: true });
        await this.page.locator('text=/Please review your details|Crypto Swap/i').first()
            .waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
        await this.page.waitForTimeout(800);
    }

    async clickContinueInModal() {
        const continueBtn = this.page.getByRole('button', { name: 'Continue' })
            .or(this.page.locator('button:has-text("Continue")'))
            .first();
        await continueBtn.waitFor({ state: 'visible', timeout: 20000 });
        await continueBtn.scrollIntoViewIfNeeded();
        await continueBtn.click({ force: true });
        await this.page.waitForTimeout(2500);
        await this.enterPinIfPrompted(providedCredentials.pin);
    }

    async enterPinIfPrompted(pin = '111111') {
        await this.page.waitForTimeout(1500);
        const pinFields = await this.page.locator('input[type="password"], input[type="text"], input[type="tel"]')
            .filter({ visible: true }).all();
        const targets = [];
        for (const f of pinFields) {
            const id = ((await f.getAttribute('id')) || '').toLowerCase();
            const name = ((await f.getAttribute('name')) || '').toLowerCase();
            if (id.includes('email') || id.includes('password') || name.includes('email') || name.includes('password')) continue;
            targets.push(f);
        }
        if (targets.length === 0) return;
        if (targets.length === 1) {
            await targets[0].fill(pin);
        } else {
            for (let i = 0; i < Math.min(pin.length, targets.length); i++) {
                await targets[i].fill(pin[i]);
                await this.page.waitForTimeout(150);
            }
        }
        const verifyBtn = this.page.locator('button:has-text("Verify"), button:has-text("Submit"), button:has-text("Confirm")').filter({ visible: true }).first();
        if (await verifyBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await verifyBtn.click();
        }
        await this.page.waitForTimeout(2000);
    }

    async waitForSuccessPopup(timeoutMs = 20000) {
        const successTitle = this.page.locator('text=/Successfully Swap|successfully swap/i').first();
        return await successTitle.isVisible({ timeout: timeoutMs }).catch(() => false);
    }

    async expectSuccessPopup() {
        const successTitle = this.page.locator(
            'text=/Successfully Swap|successfully swap|swap order has been successfully|Swap successful/i',
        ).first();
        const successToast = this.page.locator('text=/swap order has been successfully executed|successfully executed/i').first();
        const titleVisible = await successTitle.isVisible({ timeout: 30000 }).catch(() => false);
        const toastVisible = await successToast.isVisible({ timeout: 5000 }).catch(() => false);
        expect(titleVisible || toastVisible).toBeTruthy();
        this.markOrderPlaced();
        if (await this.successOkButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await this.successOkButton.click();
            await this.page.waitForTimeout(500);
        }
    }

    async performCryptoSwapEthToUsdt(amountEth = '0.005') {
        await this.waitForOrderCooldown();
        await this.goto();
        await this.ensureCryptoSwapTab();
        await this.selectYouPayAsset('ETH').catch(() => false);
        await this.selectYouReceiveAsset('USDT').catch(() => false);
        await this.setYouPayAmount(amountEth);
        await this.clickSwapButton();
        await this.clickContinueInModal();
    }

    async performSwapWithDefaultPair(amount = '0.0005') {
        await this.waitForOrderCooldown();
        await this.goto();
        await this.ensureCryptoSwapTab();
        await this.setYouPayAmount(amount);
        const btn = this.swapButton();
        for (let i = 0; i < 20; i++) {
            const receiveVal = await this.visibleYouReceiveInput().inputValue().catch(() => '0');
            const enabled = await btn.isEnabled().catch(() => false);
            if (enabled && receiveVal && parseFloat(receiveVal) > 0) break;
            await this.page.waitForTimeout(1500);
        }
        if (!(await btn.isEnabled().catch(() => false))) {
            throw new Error(`Swap button disabled (amount ${amount} may exceed balance or quote unavailable)`);
        }
        await btn.click({ force: true });
        await this.page.waitForTimeout(2000);
        await this.clickContinueInModal();
    }

    async getYouPayBalanceDisplay() {
        const balanceText = await this.youPayRow().locator('text=/Balance:/i').first().textContent().catch(() => null);
        if (!balanceText) return null;
        const match = balanceText.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : null;
    }

    async expectInsufficientBalanceMessage() {
        await expect(this.insufficientBalanceMessage).toBeVisible({ timeout: 10000 });
    }
}
