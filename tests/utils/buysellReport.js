/**
 * Writes Buy/Sell regression summary for quick manual review (JSON + Markdown).
 */

import fs from 'fs';
import path from 'path';

const REPORT_JSON = path.join(process.cwd(), 'tests', 'buysell', 'BUY_SELL_REGRESSION_REPORT.json');
const REPORT_MD = path.join(process.cwd(), 'tests', 'buysell', 'BUY_SELL_REGRESSION_REPORT.md');

/**
 * @param {{
 *   coins: string[],
 *   buyResults: { coin: string, success: boolean, message: string }[],
 *   sellResults: { coin: string, success: boolean, message: string }[],
 *   locatorChecks: { name: string, ok: boolean, detail?: string }[],
 *   issues: string[],
 *   durationMs?: number,
 * }} data
 */
export function writeBuySellRegressionReport(data) {
    const buyOk = data.buyResults.filter((r) => r.success);
    const buyFail = data.buyResults.filter((r) => !r.success);
    const sellOk = data.sellResults.filter((r) => r.success);
    const sellFail = data.sellResults.filter((r) => !r.success);
    const locatorFail = (data.locatorChecks || []).filter((c) => !c.ok);

    const report = {
        generatedAt: new Date().toISOString(),
        environment: 'https://uat-eks.rapixchange.com',
        durationMs: data.durationMs ?? null,
        summary: {
            totalCoins: data.coins.length,
            buy: { passed: buyOk.length, failed: buyFail.length, passRate: pct(buyOk.length, data.coins.length) },
            sell: { passed: sellOk.length, failed: sellFail.length, passRate: pct(sellOk.length, data.coins.length) },
            locators: { passed: (data.locatorChecks || []).length - locatorFail.length, failed: locatorFail.length },
            warnings: data.issues.length,
        },
        coins: data.coins,
        buyResults: data.buyResults,
        sellResults: data.sellResults,
        locatorChecks: data.locatorChecks || [],
        issues: data.issues,
    };

    fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2));

    const md = [
        '# Buy/Sell Regression Report',
        '',
        `**Generated:** ${report.generatedAt}`,
        `**Environment:** UAT (\`uat-eks.rapixchange.com\`)`,
        data.durationMs ? `**Duration:** ${Math.round(data.durationMs / 60000)} min` : '',
        '',
        '## Executive summary',
        '',
        '| Metric | Passed | Failed | Pass rate |',
        '|--------|--------|--------|-----------|',
        `| **BUY orders** | ${buyOk.length} | ${buyFail.length} | ${report.summary.buy.passRate} |`,
        `| **SELL orders** | ${sellOk.length} | ${sellFail.length} | ${report.summary.sell.passRate} |`,
        `| **Locators** | ${report.summary.locators.passed} | ${report.summary.locators.failed} | — |`,
        '',
        `**Coins tested:** ${data.coins.length} — ${data.coins.join(', ')}`,
        '',
        '## BUY results (per coin)',
        '',
        ...data.buyResults.map((r) => `- ${r.success ? '✅' : '❌'} **${r.coin}** — ${r.message}`),
        '',
        '## SELL results (per coin)',
        '',
        ...data.sellResults.map((r) => `- ${r.success ? '✅' : '❌'} **${r.coin}** — ${r.message}`),
        '',
        '## Locator health',
        '',
        ...(data.locatorChecks || []).map((c) => `- ${c.ok ? '✅' : '❌'} ${c.name}${c.detail ? ` — ${c.detail}` : ''}`),
        '',
        '## Warnings / non-blocking issues',
        '',
        ...(data.issues.length ? data.issues.map((i) => `- ${i}`) : ['- None']),
        '',
        '---',
        '*Use this report for Buy/Sell smoke/regression — re-run `npm run test:buysell` after UI changes.*',
    ].filter(Boolean).join('\n');

    fs.writeFileSync(REPORT_MD, md);
    return { report, paths: { json: REPORT_JSON, md: REPORT_MD } };
}

function pct(ok, total) {
    if (!total) return '0%';
    return `${Math.round((ok / total) * 100)}%`;
}
