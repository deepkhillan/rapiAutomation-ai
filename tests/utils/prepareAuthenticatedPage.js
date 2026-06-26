/**
 * Page prep for specs using saved auth (playwright/.auth/user.json).
 * Login runs once in tests/auth/auth.setup.js – not per test.
 */

import { ensureAuthenticatedApp } from './appNavigation.js';

export async function prepareAuthenticatedPage(page) {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await ensureAuthenticatedApp(page);
}
