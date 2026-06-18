/**
 * Lightweight page prep for specs using saved auth (playwright/.auth/user.json).
 * Login runs once in tests/auth/auth.setup.js – not per test.
 */

export async function prepareAuthenticatedPage(page) {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('domcontentloaded').catch(() => {});
}
