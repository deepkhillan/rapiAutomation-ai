# Platform Test Run Report

**Generated:** 2026-06-26T12:16:04.670Z
**Environment:** https://uat-eks.rapixchange.com
**Duration:** 2.3h
**Overall:** FAIL

---

## Summary

| Metric | Count |
|--------|-------|
| Total tests | 137 |
| Passed | 84 |
| Failed | 46 |
| Flaky | 1 |
| Did not run | 6 |
| Pass rate | 61% |

---

## Results by area (failures)

| Area | Failed |
|------|--------|


---

## Failed tests (0)



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
