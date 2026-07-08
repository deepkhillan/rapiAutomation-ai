/**
 * Run all platform tests (auth-setup -> authenticated -> chromium),
 * merge JSON results, generate styled HTML report.
 */
const { spawnSync, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const jsonDir = path.join(ROOT, 'test-results', 'platform-json');
const mergedPath = path.join(ROOT, 'test-results', 'platform-merged.json');
const defaultJson = path.join(ROOT, 'test-results', 'platform-results.json');
const logPath = path.join(ROOT, 'platform-test-run-full.log');

const projects = ['auth-setup', 'authenticated', 'chromium'];

fs.mkdirSync(jsonDir, { recursive: true });
fs.mkdirSync(path.join(ROOT, 'test-results'), { recursive: true });

const logStream = fs.createWriteStream(logPath, { flags: 'w', encoding: 'utf8' });

function log(msg) {
    process.stdout.write(`${msg}\n`);
    logStream.write(`${msg}\n`);
}

function sleep(ms) {
    try {
        execFileSync('powershell', ['-Command', `Start-Sleep -Milliseconds ${ms}`], { stdio: 'ignore' });
    } catch (_) {}
}

function waitForJson(maxMs = 60000) {
    const start = Date.now();
    while (Date.now() - start < maxMs) {
        if (fs.existsSync(defaultJson)) {
            try {
                const raw = fs.readFileSync(defaultJson, 'utf8');
                if (raw.trim().startsWith('{')) return raw;
            } catch (_) {}
        }
        sleep(250);
    }
    return null;
}

const startedAt = new Date().toISOString();
log(`Platform test run started: ${startedAt}`);
log(`Environment: https://uat-eks.rapixchange.com`);
log(`Headless: ${process.env.PW_HEADLESS !== '0' ? 'yes' : 'no'}`);

if (fs.existsSync(defaultJson)) fs.unlinkSync(defaultJson);

log('\n========== Running all platform projects ==========\n');

const args = ['playwright', 'test', ...projects.flatMap((p) => ['--project', p])];
const result = spawnSync('npx', args, {
    cwd: ROOT,
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, PW_HEADLESS: process.env.PW_HEADLESS ?? '1' },
});

const rawJson = waitForJson(120000);
let anyFailed = result.status !== 0;

fs.mkdirSync(jsonDir, { recursive: true });`nif (rawJson) {
    fs.writeFileSync(mergedPath, rawJson, 'utf8');
    fs.writeFileSync(path.join(jsonDir, 'all-projects.json'), rawJson, 'utf8');
    try {
        const data = JSON.parse(rawJson);
        const stats = data.stats || {};
        log(`\nResults: ${stats.expected ?? 0} passed, ${stats.unexpected ?? 0} failed, ${stats.skipped ?? 0} skipped, ${stats.flaky ?? 0} flaky`);
    } catch (e) {
        log(`Warning: could not parse JSON stats: ${e.message}`);
    }
} else {
    anyFailed = true;
    log('Error: platform-results.json was not created after test run.');
    fs.writeFileSync(mergedPath, JSON.stringify({ suites: [], stats: {}, startedAt }, null, 2), 'utf8');
}

logStream.end();
log('\n========== Generating HTML report ==========\n');

const reportResult = spawnSync('node', ['scripts/generatePlatformReportHtml.cjs'], {
    cwd: ROOT,
    shell: true,
    stdio: 'inherit',
});

process.exit(anyFailed || reportResult.status !== 0 ? 1 : 0);