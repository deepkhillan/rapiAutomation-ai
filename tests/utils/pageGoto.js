/**
 * Resilient page.goto for flaky UAT network.
 */
export async function gotoWithRetry(page, url, options = {}) {
    const { retries = 3, waitUntil = 'domcontentloaded', timeout = 60000 } = options;
    let lastError;

    for (let attempt = 0; attempt < retries; attempt++) {
        if (page.isClosed()) {
            throw new Error(`Cannot navigate to ${url}: page is closed`);
        }
        try {
            await page.goto(url, { waitUntil, timeout });
            return;
        } catch (error) {
            lastError = error;
            const msg = String(error?.message || error);
            const retryable = /timeout|ERR_NETWORK|ERR_CONNECTION|ERR_INTERNET|net::/i.test(msg);
            if (!retryable || attempt >= retries - 1) break;
            await page.waitForTimeout(2000 * (attempt + 1)).catch(() => {});
        }
    }

    throw lastError;
}