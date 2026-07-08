import path from 'path';
import { LoginPage } from '../pages/LoginPage.js';
import { providedCredentials } from './testData.js';

const AUTH_FILE = path.join(process.cwd(), 'playwright', '.auth', 'user.json');

export async function refreshAuthIfNeeded(page) {
    if (page.isClosed()) return;

    const url = page.url() || '';
    const onLogin = url.includes('/login');

    const hasJwt = await page.evaluate(() => {
        try {
            const raw = localStorage.getItem('persist:root');
            if (!raw) return false;
            const auth = JSON.parse(JSON.parse(raw).auth || '{}');
            return typeof auth.jwt === 'string' && auth.jwt.length > 20;
        } catch {
            return false;
        }
    }).catch(() => false);

    if (!onLogin && hasJwt) return;

    if (!onLogin && !hasJwt) {
        await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
        await page.waitForTimeout(1500);
        const navOk = await page.locator('aside a, nav a, a:has-text("Wallets")').first()
            .isVisible({ timeout: 5000 }).catch(() => false);
        if (navOk && !(page.url() || '').includes('/login')) return;
    }

    if (!(page.url() || '').includes('/login') && hasJwt) return;

    console.log('Session expired or missing JWT – re-authenticating...');
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(providedCredentials.email, providedCredentials.password);
    await loginPage.enterPin(providedCredentials.pin);
    await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 60000 }).catch(() => {});
    await page.context().storageState({ path: AUTH_FILE }).catch(() => {});
}
