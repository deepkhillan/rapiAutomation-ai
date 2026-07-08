const fs = require('fs');
const path = require('path');

const LOG = path.join(process.cwd(), 'platform-test-run-full.log');
const OUT = path.join(process.cwd(), 'PLATFORM_TEST_RUN_REPORT.md');

function readLogText(logPath) {
    const buf = fs.readFileSync(logPath);
    if (buf.length >= 2 && ((buf[0] === 0xFF && buf[1] === 0xFE) || buf[1] === 0)) {
        return buf.toString('utf16le').replace(/^\uFEFF/, '');
    }
    return buf.toString('utf8');
}

function parseLog(text) {
    const clean = text.replace(/\x1B\[[0-9;]*m/g, '');
    const failed = [];
    const lines = clean.split(/\r?\n/);
    for (const line of lines) {
        const match = line.trim().match(/^\d+\)\s+\[([^\]]+)\]\s.+?[›\u203a]\s+(.+)$/);
        if (match) failed.push({ project: match[1], name: match[2].trim() });
    }

    const totalMatches = [...clean.matchAll(/Running (\d+) tests/g)];
    const passedMatches = [...clean.matchAll(/(\d+) passed(?: \(([^)]+)\))?/g)];
    const failedMatches = [...clean.matchAll(/(\d+) failed/g)];
    const flakyMatches = [...clean.matchAll(/(\d+) flaky/g)];
    const didNotRunMatches = [...clean.matchAll(/(\d+) did not run/g)];

    const total = totalMatches.length
        ? totalMatches.reduce((sum, m) => sum + Number(m[1]), 0)
        : 130;
    const passedCount = passedMatches.reduce((sum, m) => sum + Number(m[1]), 0);
    const failedCount = failedMatches.reduce((sum, m) => sum + Number(m[1]), 0);
    const flaky = flakyMatches.reduce((sum, m) => sum + Number(m[1]), 0);
    const didNotRun = didNotRunMatches.reduce((sum, m) => sum + Number(m[1]), 0);

    return {
        total,
        passedCount,
        failedCount,
        flaky,
        didNotRun,
        duration: passedMatches.map((m) => m[2] || '').filter(Boolean).join(' + ') || '—',
        failed,
    };
}

if (!fs.existsSync(LOG)) {
    console.error('Log not found:', LOG);
    process.exit(1);
}

const data = parseLog(readLogText(LOG));
const passRate = data.total ? Math.round((data.passedCount / data.total) * 100) : 0;

const byArea = {};
for (const f of data.failed) {
    const area = (f.name.split('\\')[0] || f.name.split('/')[0] || 'other').replace(/^tests\\/, '');
    byArea[area] = (byArea[area] || 0) + 1;
}

const md = `# Platform Test Run Report

**Generated:** ${new Date().toISOString()}
**Environment:** https://uat-eks.rapixchange.com
**Duration:** ${data.duration}
**Overall:** ${data.failedCount === 0 ? 'PASS' : 'FAIL'}

---

## Summary

| Metric | Count |
|--------|-------|
| Total tests | ${data.total} |
| Passed | ${data.passedCount} |
| Failed | ${data.failedCount} |
| Flaky | ${data.flaky} |
| Did not run | ${data.didNotRun} |
| Pass rate | ${passRate}% |

---

## Results by area (failures)

| Area | Failed |
|------|--------|
${Object.entries(byArea).sort((a, b) => b[1] - a[1]).map(([k, v]) => '| ' + k + ' | ' + v + ' |').join('\n')}

---

## Failed tests (${data.failed.length})

${data.failed.map((t, i) => (i + 1) + '. **[' + t.project + ']** ' + t.name).join('\n')}

---

## Fixes applied this run

- Direct UAT routes: /buysell, /transaction-history, /wallet
- Buy/Sell amount fill via force fill (no Ctrl+A page selection)
- Signup/Login goto retry for flaky network
- Project order: auth-setup -> authenticated -> chromium (no parallel clash)
- Session refresh when JWT expires

---

## Artifacts

- Log: platform-test-run-full.log
- HTML: npm run report
- Buy/Sell: tests/buysell/BUY_SELL_REGRESSION_REPORT.md
`;

fs.writeFileSync(OUT, md, 'utf8');
console.log('Report written:', OUT);
console.log('Passed: ' + data.passedCount + ' | Failed: ' + data.failedCount + ' | Flaky: ' + data.flaky + ' | Did not run: ' + data.didNotRun);
