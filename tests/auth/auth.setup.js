/**
 * Shared auth setup – sign in once and save storage state for all post-login feature tests.
 * Creates playwright/.auth/user.json (used by the `authenticated` Playwright project).
 */

import { test as setup } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { LoginPage } from '../pages/LoginPage.js';
import { providedCredentials } from '../utils/testData.js';

const AUTH_FILE = path.join(process.cwd(), 'playwright', '.auth', 'user.json');

setup('Sign in once for authenticated feature tests', async ({ page }) => {
    setup.setTimeout(180000);
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(providedCredentials.email, providedCredentials.password);
    await loginPage.enterPin(providedCredentials.pin);

    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 60000 }).catch(() => {});
    await page.waitForFunction(() => {
        try {
            const raw = localStorage.getItem('persist:root');
            if (!raw) return false;
            const auth = JSON.parse(JSON.parse(raw).auth || '{}');
            return typeof auth.jwt === 'string' && auth.jwt.length > 20;
        } catch {
            return false;
        }
    }, { timeout: 60000 });

    const dir = path.dirname(AUTH_FILE);
    fs.mkdirSync(dir, { recursive: true });
    await page.context().storageState({ path: AUTH_FILE });
});
