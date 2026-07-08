/**
 * Page prep for specs using saved auth (playwright/.auth/user.json).
 * Login runs once in tests/auth/auth.setup.js – not per test.
 */

import { ensureAuthenticatedApp } from './appNavigation.js';
import { refreshAuthIfNeeded } from './refreshAuth.js';

async function hasValidJwt(page) {
    return page.evaluate(() => {
        try {
            const raw = localStorage.getItem('persist:root');
            if (!raw) return false;
            const auth = JSON.parse(JSON.parse(raw).auth || '{}');
            return typeof auth.jwt === 'string' && auth.jwt.length > 20;
        } catch {
            return false;
        }
    }).catch(() => false);
}

async function hasAppNav(page) {
    return page.locator(
        'nav a, aside a, [class*="sidebar" i] a, a:has-text("Wallets"), a:has-text("Buy/Sell"), a[href*="wallet"]',
    ).first().isVisible({ timeout: 5000 }).catch(() => false);
}

export async function prepareAuthenticatedPage(page) {
    await page.setViewportSize({ width: 1920, height: 1080 });

    const url = page.url() || '';
    const blank = !url || url === 'about:blank';
    const onLogin = url.includes('/login');

    if (blank || !url.includes('rapixchange.com')) {
        await ensureAuthenticatedApp(page);
        return;
    }

    if (onLogin) {
        await refreshAuthIfNeeded(page);
        await ensureAuthenticatedApp(page);
        return;
    }

    const jwt = await hasValidJwt(page);
    const nav = await hasAppNav(page);

    if (jwt && nav) {
        return;
    }

    if (!jwt) {
        await refreshAuthIfNeeded(page);
    }

    if (!(await hasAppNav(page))) {
        await ensureAuthenticatedApp(page, 45000);
    }
}
