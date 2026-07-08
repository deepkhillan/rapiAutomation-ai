/**
 * Cambix-style professional HTML report template for management sharing.
 * White document layout, numbered sections, module tables, recommendations.
 */

function esc(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function sanitizeNote(error) {
    if (!error) return '';
    return String(error)
        .replace(/\x1B\[[0-9;]*m/g, '')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('at ') && !line.startsWith('Call log:'))
        .slice(0, 1)
        .join(' ')
        .replace(/\s+/g, ' ')
        .slice(0, 200);
}

function resultLabel(status) {
    const map = { passed: 'PASS', failed: 'FAIL', skipped: 'SKIPPED', flaky: 'FLAKY', unknown: 'UNKNOWN' };
    return map[status] || status.toUpperCase();
}

function resultBadge(status) {
    const cls = { passed: 'pass', failed: 'fail', skipped: 'skip', flaky: 'flaky', unknown: 'unknown' };
    return `<span class="result ${cls[status] || 'unknown'}">${resultLabel(status)}</span>`;
}

function formatReportDate(iso) {
    try {
        return new Date(iso).toLocaleString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
        });
    } catch {
        return iso || new Date().toISOString();
    }
}

function formatDuration(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

const MODULE_ORDER = [
    'Auth Setup', 'Login', 'Signup', 'Dashboard', 'Buy/Sell',
    'RapiX Pay', 'Transaction History', 'Deposit/Withdraw',
    'Internal Transfer', 'Swap', 'URL Verification', 'Other',
];

function groupByArea(tests, areaFromTest) {
    const groups = {};
    for (const t of tests) {
        const area = areaFromTest(t);
        if (!groups[area]) groups[area] = [];
        groups[area].push(t);
    }
    return groups;
}

function moduleTable(tests) {
    const rows = [...tests]
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((t) => {
            const note = t.status === 'failed' ? sanitizeNote(t.error)
                : t.status === 'skipped' ? 'Test skipped (environment or dependency)'
                : t.status === 'flaky' ? 'Passed on retry — investigate instability'
                : '—';
            return `<tr class="row-${t.status}">
          <td class="mono">${esc(t.id || '—')}</td>
          <td>${esc(t.title.replace(/^TC-[A-Z0-9-]+:\s*/, ''))}</td>
          <td class="center">${Math.round((t.duration || 0) / 1000)}s</td>
          <td class="center">${resultBadge(t.status)}</td>
          <td class="notes">${esc(note)}</td>
        </tr>`;
        }).join('');
    return `<table class="data-table">
      <thead><tr>
        <th style="width:12%">Test ID</th>
        <th style="width:38%">Test Name</th>
        <th style="width:10%">Duration</th>
        <th style="width:10%">Result</th>
        <th style="width:30%">Notes</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function moduleFindings(tests) {
    const failed = tests.filter((t) => t.status === 'failed');
    const flaky = tests.filter((t) => t.status === 'flaky');
    const passed = tests.filter((t) => t.status === 'passed').length;
    const lines = [`<li><strong>${passed}/${tests.length}</strong> test cases passed in this module.</li>`];
    if (flaky.length) {
        lines.push(`<li><strong>${flaky.length} flaky</strong> — passed on retry: ${flaky.map((t) => t.id || t.title.slice(0, 40)).join(', ')}.</li>`);
    }
    if (failed.length) {
        lines.push(`<li><strong>${failed.length} failed</strong> — ${failed.map((t) => t.id || 'unnamed').join(', ')}.</li>`);
    }
    return `<div class="findings-box"><strong>Module Findings:</strong><ul>${lines.join('')}</ul></div>`;
}

function buildRecommendations(failedTests, areaFromTest) {
    const priority = (t) => {
        const area = areaFromTest(t);
        if (['RapiX Pay', 'Internal Transfer', 'Buy/Sell'].includes(area)) return 'P1';
        if (t.error && t.error.includes('timeout')) return 'P2';
        return 'P2';
    };
    return failedTests.slice(0, 15).map((t, i) => {
        const ref = t.id || `FAIL-${i + 1}`;
        const issue = sanitizeNote(t.error) || `${areaFromTest(t)} test failure`;
        const shortName = t.title.replace(/^TC-[A-Z0-9-]+:\s*/, '').slice(0, 80);
        return `<tr>
        <td class="center"><span class="priority ${priority(t).toLowerCase()}">${priority(t)}</span></td>
        <td class="mono">${esc(ref)}</td>
        <td>${esc(shortName)}</td>
        <td>${esc(issue)}</td>
        <td>Investigate UAT behaviour and update automation locators or test data</td>
        <td>QA / Automation</td>
      </tr>`;
    }).join('');
}

function generateCambixHtml(tests, summary, meta, areaFromTest) {
    const generatedAt = new Date().toISOString();
    const durationSec = Math.round((meta.duration || 0) / 1000);
    const passRate = summary.total ? Math.round((summary.passed / summary.total) * 100) : 0;
    const overall = summary.failed === 0 && summary.flaky === 0 ? 'PASS' : 'FAIL';
    const env = 'https://uat-eks.rapixchange.com';

    const byArea = {};
    for (const t of tests) {
        const area = areaFromTest(t);
        if (!byArea[area]) byArea[area] = { passed: 0, failed: 0, skipped: 0, flaky: 0, total: 0 };
        byArea[area].total++;
        byArea[area][t.status === 'unknown' ? 'failed' : t.status]++;
    }

    const groups = groupByArea(tests, areaFromTest);
    const failedTests = tests.filter((t) => t.status === 'failed');

    const keyFindings = [];
    keyFindings.push(`<li><strong>${summary.passed} PASSED</strong> of ${summary.total} tests executed successfully on UAT.</li>`);
    if (summary.failed) keyFindings.push(`<li><strong>${summary.failed} FAILED</strong> — requires investigation before production release.</li>`);
    if (summary.flaky) keyFindings.push(`<li><strong>${summary.flaky} FLAKY</strong> — passed on retry; indicates timing or environment instability.</li>`);
    if (summary.skipped) keyFindings.push(`<li><strong>${summary.skipped} SKIPPED</strong> — conditional tests not run (OAuth, long regression, dependencies).</li>`);
    const topFailAreas = Object.entries(byArea)
        .filter(([, s]) => s.failed > 0)
        .sort((a, b) => b[1].failed - a[1].failed)
        .slice(0, 4)
        .map(([area, s]) => `<li><strong>${area}:</strong> ${s.failed} failure(s) of ${s.total} tests.</li>`);
    keyFindings.push(...topFailAreas);

    let sectionNum = 2;
    const moduleSections = MODULE_ORDER
        .filter((area) => groups[area] && groups[area].length)
        .map((area) => {
            const section = sectionNum++;
            const areaStats = byArea[area];
            return `<section class="page-section">
        <h2>${section}. ${esc(area)} Module Tests</h2>
        <p class="section-desc">Base: ${esc(env)} &nbsp;|&nbsp; Module coverage: ${areaStats.total} tests &nbsp;|&nbsp; Pass rate: ${areaStats.total ? Math.round((areaStats.passed / areaStats.total) * 100) : 0}%</p>
        ${moduleTable(groups[area])}
        ${moduleFindings(groups[area])}
      </section>`;
        }).join('');

    const coverageRows = Object.entries(byArea)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([area, s]) => {
            const rate = s.total ? Math.round((s.passed / s.total) * 100) : 0;
            const result = s.failed === 0 && s.flaky === 0 ? 'PASS' : s.failed > 0 ? 'FAIL' : 'PARTIAL';
            const resultCls = s.failed === 0 && s.flaky === 0 ? 'pass' : s.failed > 0 ? 'fail' : 'flaky';
            return `<tr>
        <td>${esc(area)}</td>
        <td class="center">${s.total}</td>
        <td class="center">${s.passed}</td>
        <td class="center">${s.failed}</td>
        <td class="center">${s.skipped}</td>
        <td class="center">${s.flaky}</td>
        <td class="center">${rate}%</td>
        <td class="center"><span class="result ${resultCls}">${result}</span></td>
      </tr>`;
        }).join('');

    const criticalFinding = summary.failed > 0
        ? `<div class="critical-box">
        <strong>Critical Finding:</strong> ${summary.failed} test case(s) failed on UAT (${passRate}% pass rate).
        Overall status: <strong>${overall}</strong>.
        Failed areas include ${Object.entries(byArea).filter(([, s]) => s.failed > 0).map(([a]) => a).slice(0, 5).join(', ')}.
        These should be reviewed before sign-off.
      </div>`
        : `<div class="success-box">
        <strong>All Clear:</strong> All executed tests passed. ${summary.flaky ? `${summary.flaky} flaky test(s) should still be stabilised.` : 'No failures detected.'}
      </div>`;

    const covSection = sectionNum++;
    const recSection = sectionNum;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RapiXchange Platform Test Report</title>
  <style>
    @page { size: A4; margin: 18mm 15mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Calibri, Arial, sans-serif;
      font-size: 11pt; color: #1a202c; background: #fff; line-height: 1.45;
    }
    .cover-header {
      background: linear-gradient(135deg, #0c2340 0%, #1a4480 100%);
      color: #fff; padding: 28px 36px 24px;
      display: flex; justify-content: space-between; align-items: flex-start;
    }
    .cover-header h1 { font-size: 22pt; font-weight: 700; letter-spacing: 0.5px; }
    .cover-header .tagline { font-size: 10pt; opacity: 0.9; margin-top: 6px; }
    .cover-header .doc-type { text-align: right; font-size: 9pt; opacity: 0.85; line-height: 1.6; }
    .meta-grid {
      display: grid; grid-template-columns: 160px 1fr 160px 1fr;
      border: 1px solid #cbd5e1; border-top: none; font-size: 10pt;
    }
    .meta-grid div { padding: 8px 14px; border-bottom: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; }
    .meta-grid div:nth-child(4n) { border-right: none; }
    .meta-grid .label { background: #f8fafc; font-weight: 600; color: #475569; }
    .content { padding: 28px 36px 40px; max-width: 1100px; margin: 0 auto; }
    h2 { font-size: 14pt; color: #0c2340; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 2px solid #1a4480; }
    h3 { font-size: 11pt; color: #334155; margin: 16px 0 8px; }
    .section-desc { color: #64748b; font-size: 9.5pt; margin-bottom: 14px; }
    .stat-row { display: flex; gap: 12px; margin: 20px 0; flex-wrap: wrap; }
    .stat-box {
      flex: 1; min-width: 100px; text-align: center; padding: 16px 10px;
      border: 1px solid #e2e8f0; border-radius: 4px; background: #f8fafc;
    }
    .stat-box .num { font-size: 28pt; font-weight: 700; line-height: 1; }
    .stat-box .lbl { font-size: 8.5pt; font-weight: 700; letter-spacing: 0.5px; margin-top: 6px; color: #64748b; }
    .stat-box.total .num { color: #1a4480; }
    .stat-box.pass .num { color: #059669; }
    .stat-box.fail .num { color: #dc2626; }
    .stat-box.skip .num { color: #6b7280; }
    .stat-box.flaky .num { color: #d97706; }
    .narrative { margin: 16px 0; text-align: justify; color: #334155; font-size: 10.5pt; }
    .critical-box {
      border-left: 4px solid #dc2626; background: #fef2f2; padding: 14px 16px;
      margin: 16px 0; font-size: 10pt; color: #7f1d1d;
    }
    .success-box {
      border-left: 4px solid #059669; background: #ecfdf5; padding: 14px 16px;
      margin: 16px 0; font-size: 10pt; color: #065f46;
    }
    .discoveries { margin: 16px 0 24px; }
    .discoveries ul { margin: 8px 0 0 20px; font-size: 10pt; }
    .discoveries li { margin-bottom: 5px; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin: 12px 0; }
    .data-table th {
      background: #1a4480; color: #fff; padding: 8px 10px; text-align: left; font-weight: 600;
    }
    .data-table td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
    .data-table tr:nth-child(even) { background: #f8fafc; }
    .data-table tr.row-failed { background: #fef2f2; }
    .data-table tr.row-flaky { background: #fffbeb; }
    .center { text-align: center; }
    .mono { font-family: Consolas, 'Courier New', monospace; font-size: 9pt; color: #1e40af; }
    .notes { font-size: 9pt; color: #64748b; }
    .result {
      display: inline-block; padding: 2px 8px; border-radius: 3px;
      font-size: 8pt; font-weight: 700; letter-spacing: 0.3px;
    }
    .result.pass { background: #d1fae5; color: #065f46; }
    .result.fail { background: #fee2e2; color: #991b1b; }
    .result.skip { background: #f1f5f9; color: #475569; }
    .result.flaky { background: #fef3c7; color: #92400e; }
    .result.unknown { background: #f1f5f9; color: #64748b; }
    .findings-box {
      background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 16px;
      margin-top: 12px; font-size: 9.5pt;
    }
    .findings-box ul { margin: 6px 0 0 18px; }
    .findings-box li { margin-bottom: 4px; }
    .priority { font-weight: 700; font-size: 9pt; padding: 2px 6px; border-radius: 3px; }
    .priority.p1 { background: #fee2e2; color: #991b1b; }
    .priority.p2 { background: #fef3c7; color: #92400e; }
    .page-section { margin-bottom: 32px; page-break-inside: avoid; }
    .page-section:nth-child(n+4) { page-break-before: auto; }
    .doc-footer {
      margin-top: 40px; padding-top: 16px; border-top: 2px solid #e2e8f0;
      text-align: center; font-size: 9pt; color: #94a3b8;
    }
    @media print {
      body { font-size: 10pt; }
      .cover-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .data-table th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page-section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>

  <div class="cover-header">
    <div>
      <h1>RAPIXCHANGE PLATFORM</h1>
      <div class="tagline">E2E Automation &nbsp;·&nbsp; UAT Environment &nbsp;·&nbsp; Playwright</div>
    </div>
    <div class="doc-type">
      Test Execution Report<br>
      Overall: <strong>${overall}</strong><br>
      ${passRate}% Pass Rate
    </div>
  </div>

  <div class="meta-grid">
    <div class="label">Environment</div><div>UAT (Production-like)</div>
    <div class="label">Base URL</div><div>${esc(env)}</div>
    <div class="label">Auth Account</div><div>Antier1@yopmail.com (Test User)</div>
    <div class="label">Report Date</div><div>${esc(formatReportDate(generatedAt))}</div>
    <div class="label">Test Framework</div><div>Playwright ${esc('1.58')}</div>
    <div class="label">Duration</div><div>${esc(formatDuration(durationSec))}</div>
    <div class="label">Test Approach</div><div>Browser E2E Automation (Headless Chromium)</div>
    <div class="label">Total Tests</div><div>${summary.total} test cases across ${Object.keys(byArea).length} modules</div>
  </div>

  <div class="content">

    <section class="page-section">
      <h2>1. Executive Summary</h2>
      <div class="stat-row">
        <div class="stat-box total"><div class="num">${summary.total}</div><div class="lbl">TESTS EXECUTED</div></div>
        <div class="stat-box pass"><div class="num">${summary.passed}</div><div class="lbl">PASSED</div></div>
        <div class="stat-box fail"><div class="num">${summary.failed}</div><div class="lbl">FAILED</div></div>
        <div class="stat-box skip"><div class="num">${summary.skipped}</div><div class="lbl">SKIPPED</div></div>
        <div class="stat-box flaky"><div class="num">${summary.flaky}</div><div class="lbl">FLAKY</div></div>
      </div>
      <p class="narrative">
        This test execution report covers the RapiXchange cryptocurrency exchange platform on the UAT environment.
        Testing was conducted using Playwright browser automation across authenticated feature flows (Buy/Sell, Swap,
        Internal Transfer, Deposit/Withdraw, RapiX Pay, Transaction History, Dashboard) and unauthenticated flows
        (Login, Signup, URL verification). A single auth session is established once and reused for all post-login tests.
      </p>
      ${criticalFinding}
      <div class="discoveries">
        <strong>Key Discoveries from this Run:</strong>
        <ul>${keyFindings.join('')}</ul>
      </div>
    </section>

    ${moduleSections}

    <section class="page-section">
      <h2>${covSection}. Module Coverage Summary</h2>
      <table class="data-table">
        <thead><tr>
          <th>Module</th><th>Total</th><th>Passed</th><th>Failed</th>
          <th>Skipped</th><th>Flaky</th><th>Pass Rate</th><th>Result</th>
        </tr></thead>
        <tbody>${coverageRows}</tbody>
      </table>
      <p class="section-desc" style="margin-top:12px">
        Coverage Summary: PASS=${summary.passed} | FAIL=${summary.failed} | SKIPPED=${summary.skipped} | FLAKY=${summary.flaky}
      </p>
    </section>

    <section class="page-section">
      <h2>${recSection}. Recommendations &amp; Action Items</h2>
      <table class="data-table">
        <thead><tr>
          <th style="width:8%">Priority</th>
          <th style="width:12%">Ref</th>
          <th style="width:22%">Issue</th>
          <th style="width:28%">Failure Detail</th>
          <th style="width:20%">Recommendation</th>
          <th style="width:10%">Owner</th>
        </tr></thead>
        <tbody>${buildRecommendations(failedTests, areaFromTest) || '<tr><td colspan="6" class="center">No failures — no action items required.</td></tr>'}</tbody>
      </table>
    </section>

    <div class="doc-footer">
      Report generated by RapiXchange E2E Automation &nbsp;|&nbsp; ${esc(formatReportDate(generatedAt))}<br>
      Confidential — For internal engineering and QA use only
    </div>
  </div>
</body>
</html>`;
}

module.exports = { generateCambixHtml, sanitizeNote, resultLabel };
