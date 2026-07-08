/**
 * Generate styled HTML platform test report from merged Playwright JSON results.
 * Input: test-results/platform-merged.json (or individual project JSON files)
 * Output: PLATFORM_TEST_RUN_REPORT.html
 */
const fs = require('fs');
const path = require('path');
const { generateCambixHtml, sanitizeNote: sanitizeFailureNote, resultLabel } = require('./cambixReportHtml.cjs');

const ROOT = process.cwd();
const MERGED = path.join(ROOT, 'test-results', 'platform-merged.json');
const OUT_HTML = path.join(ROOT, 'PLATFORM_TEST_RUN_REPORT.html');
const OUT_MD = path.join(ROOT, 'PLATFORM_TEST_RUN_REPORT.md');
const OUT_CSV = path.join(ROOT, 'PLATFORM_TEST_RUN_REPORT.csv');
const OUT_CSV_SUMMARY = path.join(ROOT, 'PLATFORM_TEST_RUN_SUMMARY.csv');

function resolveTestStatus(test) {
    const results = test.results || [];
    const last = results[results.length - 1] || {};
    const lastStatus = last.status;
    const flaky = results.length > 1
        && results.some((r) => r.status === 'failed' || r.status === 'timedOut')
        && (lastStatus === 'passed' || test.status === 'expected');
    if (flaky) return 'flaky';
    if (test.status === 'skipped' || lastStatus === 'skipped') return 'skipped';
    if (test.status === 'unexpected' || lastStatus === 'failed' || lastStatus === 'timedOut') return 'failed';
    return 'passed';
}

function extractTestId(title) {
    const m = (title || '').match(/TC-[A-Z0-9-]+/);
    return m ? m[0] : '';
}

function walkSuites(suites, project, parentTitle, tests) {
    for (const suite of suites || []) {
        const title = parentTitle ? `${parentTitle} › ${suite.title}` : (suite.title || '');
        for (const spec of suite.specs || []) {
            for (const test of spec.tests || []) {
                const results = test.results || [];
                const last = results[results.length - 1] || {};
                const status = resolveTestStatus(test);
                tests.push({
                    id: extractTestId(spec.title),
                    title: spec.title || '',
                    suite: title,
                    project: test.projectName || project,
                    status,
                    duration: last.duration || 0,
                    error: (last.error?.message || '').replace(/\x1B\[[0-9;]*m/g, '').slice(0, 500),
                    file: spec.file || '',
                });
            }
        }
        walkSuites(suite.suites, project, title, tests);
    }
}

function loadAllTests() {
    const tests = [];
    if (fs.existsSync(MERGED)) {
        const data = JSON.parse(fs.readFileSync(MERGED, 'utf8'));
        walkSuites(data.suites, 'all', '', tests);
        return { tests, stats: data.stats || {}, startedAt: data.startedAt, duration: data.stats?.duration || 0 };
    }
    const dir = path.join(ROOT, 'test-results', 'platform-json');
    if (!fs.existsSync(dir)) {
        console.error('No merged results found. Run: npm run test:platform');
        process.exit(1);
    }
    let totalDuration = 0;
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
        const project = file.replace('.json', '');
        const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
        walkSuites(data.suites, project, '', tests);
        totalDuration += data.stats?.duration || 0;
    }
    return { tests, stats: {}, startedAt: new Date().toISOString(), duration: totalDuration };
}

function areaFromTest(t) {
    const file = (t.file || t.suite || '').replace(/\\/g, '/');
    if (file.includes('login')) return 'Login';
    if (file.includes('signup')) return 'Signup';
    if (file.includes('buysell')) return 'Buy/Sell';
    if (file.includes('dashboard')) return 'Dashboard';
    if (file.includes('rapixpay')) return 'RapiX Pay';
    if (file.includes('transaction_history')) return 'Transaction History';
    if (file.includes('crypto_deposit')) return 'Deposit/Withdraw';
    if (file.includes('internal_transfer')) return 'Internal Transfer';
    if (file.includes('swap')) return 'Swap';
    if (file.includes('verify_url')) return 'URL Verification';
    if (file.includes('auth')) return 'Auth Setup';
    return 'Other';
}

function buildSummary(tests) {
    const summary = { passed: 0, failed: 0, skipped: 0, flaky: 0, total: 0 };
    for (const t of tests) {
        summary.total++;
        if (t.status === 'passed') summary.passed++;
        else if (t.status === 'failed') summary.failed++;
        else if (t.status === 'skipped') summary.skipped++;
        else if (t.status === 'flaky') summary.flaky++;
    }
    return summary;
}

function esc(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function statusBadge(status) {
    const colors = {
        passed: '#16a34a',
        failed: '#dc2626',
        skipped: '#6b7280',
        flaky: '#d97706',
        unknown: '#9ca3af',
    };
    const c = colors[status] || colors.unknown;
    return `<span class="badge" style="background:${c}">${status.toUpperCase()}</span>`;
}

function generateHtml(tests, summary, meta) {
    return generateCambixHtml(tests, summary, meta, areaFromTest);
}

function generateHtmlLegacy(tests, summary, meta) {
    const passRate = summary.total ? Math.round((summary.passed / summary.total) * 100) : 0;
    const overall = summary.failed === 0 && summary.flaky === 0 ? 'PASS' : 'FAIL';
    const overallColor = summary.failed === 0 ? '#16a34a' : '#dc2626';

    const byArea = {};
    for (const t of tests) {
        const area = areaFromTest(t);
        if (!byArea[area]) byArea[area] = { passed: 0, failed: 0, skipped: 0, flaky: 0, total: 0 };
        byArea[area].total++;
        byArea[area][t.status === 'unknown' ? 'failed' : t.status]++;
    }

    const areaRows = Object.entries(byArea)
        .sort((a, b) => b[1].failed - a[1].failed || a[0].localeCompare(b[0]))
        .map(([area, s]) => {
            const rate = s.total ? Math.round((s.passed / s.total) * 100) : 0;
            return `<tr>
        <td>${esc(area)}</td>
        <td class="num pass">${s.passed}</td>
        <td class="num fail">${s.failed}</td>
        <td class="num skip">${s.skipped}</td>
        <td class="num">${s.total}</td>
        <td class="num">${rate}%</td>
      </tr>`;
        }).join('');

    const testRows = tests
        .sort((a, b) => {
            const order = { failed: 0, flaky: 1, skipped: 2, passed: 3, unknown: 4 };
            return (order[a.status] ?? 5) - (order[b.status] ?? 5) || a.title.localeCompare(b.title);
        })
        .map((t) => `<tr class="row-${t.status}">
        <td>${statusBadge(t.status)}</td>
        <td><code>${esc(t.id || '—')}</code></td>
        <td>${esc(t.title)}</td>
        <td>${esc(areaFromTest(t))}</td>
        <td>${esc(t.project)}</td>
        <td class="num">${Math.round(t.duration / 1000)}s</td>
        <td class="err">${t.status === 'failed' ? esc(t.error) : ''}</td>
      </tr>`).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RapiXchange Platform Test Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0f172a; color: #e2e8f0; line-height: 1.5; }
    .header { background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%); padding: 2rem; border-bottom: 2px solid #334155; }
    .header h1 { font-size: 1.75rem; margin-bottom: 0.25rem; }
    .header .meta { color: #94a3b8; font-size: 0.9rem; }
    .overall { display: inline-block; margin-top: 1rem; padding: 0.5rem 1.5rem; border-radius: 8px; font-weight: 700; font-size: 1.25rem; background: ${overallColor}; color: #fff; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; padding: 1.5rem 2rem; }
    .card { background: #1e293b; border-radius: 12px; padding: 1.25rem; text-align: center; border: 1px solid #334155; }
    .card .value { font-size: 2.5rem; font-weight: 700; }
    .card .label { color: #94a3b8; font-size: 0.85rem; margin-top: 0.25rem; }
    .card.pass .value { color: #4ade80; }
    .card.fail .value { color: #f87171; }
    .card.skip .value { color: #9ca3af; }
    .card.rate .value { color: #60a5fa; }
    section { padding: 0 2rem 2rem; }
    section h2 { font-size: 1.25rem; margin-bottom: 1rem; color: #f1f5f9; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; }
    table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 8px; overflow: hidden; font-size: 0.875rem; }
    th { background: #334155; padding: 0.75rem; text-align: left; font-weight: 600; }
    td { padding: 0.6rem 0.75rem; border-bottom: 1px solid #334155; vertical-align: top; }
    tr.row-failed { background: rgba(220,38,38,0.08); }
    tr.row-flaky { background: rgba(217,119,6,0.08); }
    tr:hover { background: rgba(255,255,255,0.04); }
    .num { text-align: center; font-variant-numeric: tabular-nums; }
    .num.pass { color: #4ade80; }
    .num.fail { color: #f87171; }
    .num.skip { color: #9ca3af; }
    .badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: #fff; }
    .err { color: #fca5a5; font-size: 0.75rem; max-width: 320px; word-break: break-word; }
    code { background: #334155; padding: 0.1rem 0.35rem; border-radius: 3px; font-size: 0.8rem; }
    .footer { text-align: center; padding: 1.5rem; color: #64748b; font-size: 0.8rem; }
  </style>
</head>
<body>
  <div class="header">
    <h1>RapiXchange Platform Test Report</h1>
    <p class="meta">Environment: https://uat-eks.rapixchange.com &nbsp;|&nbsp; Generated: ${esc(new Date().toISOString())} &nbsp;|&nbsp; Duration: ${Math.round((meta.duration || 0) / 1000)}s</p>
    <div class="overall">${overall} — ${passRate}% pass rate</div>
  </div>

  <div class="cards">
    <div class="card"><div class="value">${summary.total}</div><div class="label">Total Tests</div></div>
    <div class="card pass"><div class="value">${summary.passed}</div><div class="label">Passed</div></div>
    <div class="card fail"><div class="value">${summary.failed}</div><div class="label">Failed</div></div>
    <div class="card skip"><div class="value">${summary.skipped}</div><div class="label">Skipped</div></div>
    <div class="card"><div class="value">${summary.flaky}</div><div class="label">Flaky</div></div>
    <div class="card rate"><div class="value">${passRate}%</div><div class="label">Pass Rate</div></div>
  </div>

  <section>
    <h2>Results by Feature Area</h2>
    <table>
      <thead><tr><th>Area</th><th>Passed</th><th>Failed</th><th>Skipped</th><th>Total</th><th>Pass Rate</th></tr></thead>
      <tbody>${areaRows}</tbody>
    </table>
  </section>

  <section>
    <h2>All Test Cases (${summary.total})</h2>
    <table>
      <thead><tr><th>Status</th><th>ID</th><th>Test Case</th><th>Area</th><th>Project</th><th>Duration</th><th>Error (if failed)</th></tr></thead>
      <tbody>${testRows}</tbody>
    </table>
  </section>

  <div class="footer">RapiXchange E2E Automation &nbsp;|&nbsp; Playwright &nbsp;|&nbsp; Log: platform-test-run-full.log</div>
</body>
</html>`;
}



function csvCell(value) {
    const s = String(value ?? '').replace(/\r?\n/g, ' ').trim();
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
}

function csvRow(cells) {
    return cells.map(csvCell).join(',');
}



function generateCsv(tests, summary, meta) {
    const generatedAt = new Date().toISOString();
    const env = 'https://uat-eks.rapixchange.com';
    const durationSec = Math.round((meta.duration || 0) / 1000);
    const passRate = summary.total ? Math.round((summary.passed / summary.total) * 100) : 0;
    const overall = summary.failed === 0 && summary.flaky === 0 ? 'PASS' : 'FAIL';

    const summaryLines = [
        csvRow(['Metric', 'Value']),
        csvRow(['Report Generated', generatedAt]),
        csvRow(['Environment', env]),
        csvRow(['Overall Result', overall]),
        csvRow(['Total Tests', summary.total]),
        csvRow(['Passed', summary.passed]),
        csvRow(['Failed', summary.failed]),
        csvRow(['Skipped', summary.skipped]),
        csvRow(['Flaky', summary.flaky]),
        csvRow(['Pass Rate (%)', passRate]),
        csvRow(['Duration (seconds)', durationSec]),
        '',
        csvRow(['Feature Area', 'Passed', 'Failed', 'Skipped', 'Flaky', 'Total', 'Pass Rate (%)']),
    ];

    const byArea = {};
    for (const t of tests) {
        const area = areaFromTest(t);
        if (!byArea[area]) byArea[area] = { passed: 0, failed: 0, skipped: 0, flaky: 0, total: 0 };
        byArea[area].total++;
        const key = t.status === 'unknown' ? 'failed' : t.status;
        byArea[area][key] = (byArea[area][key] || 0) + 1;
    }

    for (const [area, s] of Object.entries(byArea).sort((a, b) => a[0].localeCompare(b[0]))) {
        const rate = s.total ? Math.round(((s.passed || 0) / s.total) * 100) : 0;
        summaryLines.push(csvRow([area, s.passed || 0, s.failed || 0, s.skipped || 0, s.flaky || 0, s.total, rate]));
    }

    const sorted = [...tests].sort((a, b) => {
        const order = { failed: 0, flaky: 1, skipped: 2, passed: 3, unknown: 4 };
        return (order[a.status] ?? 5) - (order[b.status] ?? 5) || a.title.localeCompare(b.title);
    });

    const detailLines = [
        '',
        csvRow(['#', 'Test ID', 'Test Name', 'Module', 'Duration', 'Result', 'Notes']),
    ];

    sorted.forEach((t, i) => {
        detailLines.push(csvRow([
            i + 1,
            t.id || '',
            t.title.replace(/^TC-[A-Z0-9-]+:\s*/, ''),
            areaFromTest(t),
            `${Math.round((t.duration || 0) / 1000)}s`,
            resultLabel(t.status),
            t.status === 'failed' ? sanitizeFailureNote(t.error)
                : t.status === 'flaky' ? 'Passed on retry'
                : t.status === 'skipped' ? 'Skipped'
                : '',
        ]));
    });

    return {
        full: summaryLines.concat(detailLines).join('\n'),
        summaryOnly: summaryLines.join('\n'),
    };
}

function generateMd(tests, summary) {
    const passRate = summary.total ? Math.round((summary.passed / summary.total) * 100) : 0;
    const failed = tests.filter((t) => t.status === 'failed');
    return `# Platform Test Run Report

**Generated:** ${new Date().toISOString()}
**Environment:** https://uat-eks.rapixchange.com
**Overall:** ${summary.failed === 0 ? 'PASS' : 'FAIL'}

## Summary

| Metric | Count |
|--------|-------|
| Total | ${summary.total} |
| Passed | ${summary.passed} |
| Failed | ${summary.failed} |
| Skipped | ${summary.skipped} |
| Flaky | ${summary.flaky} |
| Pass rate | ${passRate}% |

## Failed Tests (${failed.length})

${failed.map((t, i) => `${i + 1}. **${t.id || t.title}** [${t.project}] — ${t.title}`).join('\n')}

See **PLATFORM_TEST_RUN_REPORT.html** for full styled report.
`;
}

const { tests, stats, duration } = loadAllTests();
const summary = {
    total: tests.length,
    passed: stats.expected ?? 0,
    failed: stats.unexpected ?? 0,
    skipped: stats.skipped ?? 0,
    flaky: stats.flaky ?? 0,
};
const html = generateHtml(tests, summary, { duration });
const md = generateMd(tests, summary);
const csv = generateCsv(tests, summary, { duration });

fs.writeFileSync(OUT_HTML, html, 'utf8');
fs.writeFileSync(OUT_MD, md, 'utf8');
fs.writeFileSync(OUT_CSV, csv.full, 'utf8');
fs.writeFileSync(OUT_CSV_SUMMARY, csv.summaryOnly, 'utf8');
console.log('HTML report:', OUT_HTML);
console.log('CSV report:', OUT_CSV);
console.log('CSV summary:', OUT_CSV_SUMMARY);
console.log('Markdown report:', OUT_MD);
console.log(`Total: ${summary.total} | Passed: ${summary.passed} | Failed: ${summary.failed} | Skipped: ${summary.skipped} | Flaky: ${summary.flaky}`);
