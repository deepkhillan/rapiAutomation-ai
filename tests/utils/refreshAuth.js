import path from 'path';
import { LoginPage } from '../pages/LoginPage.js';
import { providedCredentials } from './testData.js';

const AUTH_FILE = path.join(process.cwd(), 'playwright', '.auth', 'user.json');

export async function refreshAuthIfNeeded(page) {
    if (page.isClosed()) return;

    const onLogin = (page.url() || '').includes('/login');
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

    console.log('Session expired or missing JWT – re-authenticating...');
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(providedCredentials.email, providedCredentials.password);
    await loginPage.enterPin(providedCredentials.pin);
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 60000 }).catch(() => {});
    await page.context().storageState({ path: AUTH_FILE }).catch(() => {});
}