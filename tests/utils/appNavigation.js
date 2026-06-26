/**
 * Shared navigation for post-login specs using saved auth state.
 * Ensures the SPA is loaded on the app origin before clicking sidebar links or deep-linking.
 */

/** @param {import('@playwright/test').Page} page */
export async function isAppErrorPage(page) {
    if (await page.locator('button:has-text("Reload Page")').first().isVisible({ timeout: 1500 }).catch(() => false)) {
        return true;
    }
    return page.locator('text=/Oops!?|unexpected error has occurred|Back To Home/i').first()
        .isVisible({ timeout: 2000 })
        .catch(() => false);
}

/** Recover from blank/error shell states on UAT */
/** @param {import('@playwright/test').Page} page */
export async function recoverFromErrorShell(page) {
    const reloadBtn = page.locator('button:has-text("Reload Page")').first();
    if (await reloadBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await reloadBtn.click().catch(() => page.reload({ waitUntil: 'domcontentloaded' }));
        await page.waitForTimeout(3000);
        return true;
    }
    const homeBtn = page.locator('button:has-text("Back To Home"), a:has-text("Back To Home")').first();
    if (await homeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await homeBtn.click().catch(() => {});
        await page.waitForTimeout(2000);
        return true;
    }
    return false;
}

/** @param {import('@playwright/test').Page} page */
export async function ensureAuthenticatedApp(page, timeoutMs = 60000) {
    if (page.isClosed()) return;

    const url = page.url();
    const onAppOrigin = url.includes('rapixchange.com') && !url.includes('/login');
    const navVisible = onAppOrigin && await page.locator(
        'nav a, aside a, [class*="sidebar" i] a, a:has-text("Buy/Sell"), a:has-text("Wallets")',
    ).first().isVisible({ timeout: 3000 }).catch(() => false);
    const errorPage = await isAppErrorPage(page);

    if (onAppOrigin && navVisible && !errorPage && url !== 'about:blank') {
        await page.waitForTimeout(500);
        return;
    }

    if (!url || url === 'about:blank' || !url.includes('rapixchange.com') || errorPage) {
        let lastError;
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                await page.goto('/', { waitUntil: 'domcontentloaded', timeout: timeoutMs });
                lastError = null;
                break;
            } catch (e) {
                lastError = e;
                await page.waitForTimeout(2000 * (attempt + 1));
            }
        }
        if (lastError) throw lastError;
    }

    await page.waitForFunction(
        () => !window.location.pathname.toLowerCase().includes('/login'),
        { timeout: timeoutMs },
    ).catch(() => {});

    await page.waitForFunction(() => {
        try {
            const raw = localStorage.getItem('persist:root');
            if (!raw) return true;
            const auth = JSON.parse(JSON.parse(raw).auth || '{}');
            return typeof auth.jwt === 'string' && auth.jwt.length > 20;
        } catch {
            return true;
        }
    }, { timeout: timeoutMs }).catch(() => {});

    const navReady = page.locator(
        'nav a, aside a, [class*="sidebar" i] a, [class*="Sidebar"] a, [class*="nav" i] a, a[href*="wallet"], a[href*="buy"]',
    ).first();
    await navReady.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});
    if (!page.isClosed()) {
        await page.waitForTimeout(1500);
    }
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ paths?: string[], labels?: string[], hrefContains?: string[], urlPattern?: RegExp, preferSidebar?: boolean }} options
 */
export async function navigateToFeature(page, options = {}) {
    const { paths = [], labels = [], hrefContains = [], urlPattern, preferSidebar = false } = options;
    await ensureAuthenticatedApp(page);

    const matchesTarget = (currentUrl) => {
        if (urlPattern?.test(currentUrl)) return true;
        if (hrefContains.some((h) => currentUrl.toLowerCase().includes(h.toLowerCase()))) return true;
        return paths.some((p) => {
            const segment = p.replace(/^\//, '').toLowerCase();
            return segment && currentUrl.toLowerCase().includes(segment);
        });
    };

    const isValidDestination = async () => {
        if (await isAppErrorPage(page)) return false;
        return matchesTarget(page.url());
    };

    const clickSidebarLinks = async () => {
        for (const fragment of hrefContains) {
            const link = page.locator(`a[href*="${fragment}" i]`).first();
            if (await link.isVisible({ timeout: 4000 }).catch(() => false)) {
                await link.click();
                await page.waitForTimeout(3000);
                if (await isValidDestination()) return true;
            }
        }

        for (const label of labels) {
            const link = page.getByRole('link', { name: new RegExp(label, 'i') })
                .or(page.locator(`a:has-text("${label}")`))
                .or(page.locator(`.nav-link:has-text("${label}")`))
                .first();
            if (await link.isVisible({ timeout: 4000 }).catch(() => false)) {
                await link.click();
                await page.waitForTimeout(3000);
                if (await isValidDestination()) return true;
            }
        }
        return false;
    };

    const tryDirectPaths = async () => {
        for (const path of paths) {
            await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
            await page.waitForLoadState('domcontentloaded').catch(() => {});
            await page.waitForTimeout(2000);
            if (await isValidDestination()) return true;
            if (await isAppErrorPage(page)) {
                console.log(`Direct navigation to ${path} hit error page – returning to home`);
                await page.goto('/', { waitUntil: 'domcontentloaded' }).catch(() => {});
                await page.waitForTimeout(1500);
            }
        }
        return false;
    };

    if (preferSidebar) {
        if (await clickSidebarLinks()) return page.url();
        await tryDirectPaths();
    } else {
        await tryDirectPaths();
        await clickSidebarLinks();
    }

    return page.url();
}

export const APP_ROUTES = {
    wallets: {
        paths: ['/wallet'],
        labels: ['Wallets', 'Wallet'],
        hrefContains: ['wallet'],
        urlPattern: /wallet/i,
        preferSidebar: true,
    },
    buysell: {
        // Direct /buy-sell often shows "Oops" on UAT – navigate via sidebar (client-side routing) first.
        paths: [],
        labels: ['Buy/Sell', 'Buy Sell'],
        hrefContains: ['buy-sell', 'buysell', 'exchange'],
        urlPattern: /buy-sell|buysell|exchange/i,
        preferSidebar: true,
    },
    swap: {
        paths: ['/swap', '/swapping'],
        labels: ['Swapping', 'Swap'],
        hrefContains: ['swap', 'swapping'],
        urlPattern: /swap|swapping/i,
        preferSidebar: true,
    },
    rapixPay: {
        paths: ['/rapix-pay', '/rapixpay'],
        labels: ['RapiX Pay', 'Rapix Pay'],
        hrefContains: ['rapix-pay', 'rapixpay'],
        urlPattern: /rapix-?pay/i,
        preferSidebar: true,
    },
    transactionHistory: {
        paths: ['/history', '/transaction-history', '/transactions'],
        labels: ['Transaction History', 'History'],
        hrefContains: ['history', 'transaction-history'],
        urlPattern: /history|transaction-history|transactions/i,
        preferSidebar: true,
    },
};
