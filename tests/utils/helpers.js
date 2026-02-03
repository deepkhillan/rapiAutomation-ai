/**
 * Helper Utilities
 * Common helper functions for Playwright tests
 */

/**
 * Wait for a specific duration
 * @param {number} ms - Milliseconds to wait
 */
export async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a unique timestamp-based identifier
 * @returns {string} Unique identifier
 */
export function generateUniqueId() {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Verify that an element is visible and enabled
 * @param {import('@playwright/test').Locator} locator - Playwright locator
 */
export async function verifyElementIsInteractable(locator) {
    await locator.waitFor({ state: 'visible' });
    await expect(locator).toBeEnabled();
}

/**
 * Clear input field and type new value
 * @param {import('@playwright/test').Locator} locator - Input field locator
 * @param {string} value - Value to type
 */
export async function clearAndType(locator, value) {
    await locator.clear();
    await locator.fill(value);
}

/**
 * Take a screenshot with a custom name
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} name - Screenshot name
 */
export async function takeScreenshot(page, name) {
    const timestamp = Date.now();
    await page.screenshot({
        path: `screenshots/${name}_${timestamp}.png`,
        fullPage: true
    });
}

/**
 * Scroll element into view
 * @param {import('@playwright/test').Locator} locator - Element locator
 */
export async function scrollIntoView(locator) {
    await locator.scrollIntoViewIfNeeded();
}

/**
 * Wait for network to be idle
 * @param {import('@playwright/test').Page} page - Playwright page
 */
export async function waitForNetworkIdle(page) {
    await page.waitForLoadState('networkidle');
}

/**
 * Get validation error message text
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} fieldName - Field name to get error for
 * @returns {Promise<string>} Error message text
 */
export async function getValidationError(page, fieldName) {
    const errorLocator = page.locator(`[id="${fieldName}"] ~ .error-message, [id="${fieldName}"] + .error-message, .error-message:has-text("${fieldName}")`).first();

    if (await errorLocator.isVisible()) {
        return await errorLocator.textContent();
    }

    return '';
}

/**
 * Check if element has specific class
 * @param {import('@playwright/test').Locator} locator - Element locator
 * @param {string} className - Class name to check
 * @returns {Promise<boolean>} True if element has the class
 */
export async function hasClass(locator, className) {
    const classes = await locator.getAttribute('class');
    return classes ? classes.split(' ').includes(className) : false;
}
