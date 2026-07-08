# Platform Test Run Report

**Generated:** 2026-07-08T12:52:52.982Z
**Environment:** https://uat-eks.rapixchange.com
**Overall:** FAIL

## Summary

| Metric | Count |
|--------|-------|
| Total | 132 |
| Passed | 96 |
| Failed | 20 |
| Skipped | 9 |
| Flaky | 7 |
| Pass rate | 73% |

## Failed Tests (20)

1. **TC-NEG-07** [authenticated] — TC-NEG-07: Page refresh after order does not duplicate – single entry in history
2. **TC-BS-POS-04** [authenticated] — TC-BS-POS-04: Exchange form (amount input or card) is visible on Buy
3. **TC-BS-NEG-01** [authenticated] — TC-BS-NEG-01: Buy with amount below minimum – button disabled, validation shown, or no success on submit
4. **TC-BS-NEG-02** [authenticated] — TC-BS-NEG-02: Buy with empty amount – submit not possible, validation, or no success on submit
5. **TC-DASH-POS-03** [authenticated] — TC-DASH-POS-03: Sidebar navigation links visible (Wallets, Buy/Sell, etc.)
6. **TC-RP-01** [authenticated] — TC-RP-01: Valid Rapix Pay Order Flow
7. **TC-RP-02** [authenticated] — TC-RP-02: Negative - Zero orders
8. **TC-RP-02** [authenticated] — TC-RP-02: Negative - Negative orders
9. **TC-DW-DEP-04** [authenticated] — TC-DW-DEP-04: Deposit – USDT – address and network displayed
10. **TC-DW-DEP-05** [authenticated] — TC-DW-DEP-05: Deposit – all supported coins – each shows deposit entry or address
11. **TC-DW-WTH-01** [authenticated] — TC-DW-WTH-01: Withdraw – section/page accessible
12. **TC-DW-WTH-02** [authenticated] — TC-DW-WTH-02: Withdraw – BTC – form has address and amount fields
13. **TC-DW-WTH-03** [authenticated] — TC-DW-WTH-03: Withdraw – ETH – form has address and amount fields
14. **TC-DW-NEG-WTH-03** [authenticated] — TC-DW-NEG-WTH-03: Withdraw – invalid address format shows validation
15. **TC-TR-E2E-CRYPTO** [authenticated] — TC-TR-E2E-CRYPTO: Internal Transfer – Crypto 0.1 – full flow, Continue, PIN 111111, order completed
16. **TC-TR-NEG-FIAT-02** [authenticated] — TC-TR-NEG-FIAT-02: Fiat transfer – below minimum amount shows validation
17. **TC-TR-NEG-CRYPTO-01** [authenticated] — TC-TR-NEG-CRYPTO-01: Crypto transfer – insufficient balance shows validation
18. **TC-SW-02** [authenticated] — TC-SW-02: Crypto Swap – full flow: default pair, click Continue, then verify Successfully Swap popup
19. **TC-LP-04** [chromium] — TC-LP-04: Navigation to signup page from login
20. **TC-SN-PH-01** [chromium] — TC-SN-PH-01: Phone number too short (less than 10 digits)

See **PLATFORM_TEST_RUN_REPORT.html** for full styled report.
