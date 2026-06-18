# RapiXchange Platform – Full Test Coverage (Positive & Negative)

This document lists **all features** on the platform and their **positive** and **negative** test cases so the **whole platform can be checked in one go**.

---

## 1. Environment & URL

| ID | Type | Description | Spec |
|----|------|-------------|------|
| TC-URL-01 | Positive | UAT URL (rapixchange.com) is used | `tests/verify_url.spec.js` |

---

## 2. Login

| ID | Type | Description | Spec |
|----|------|-------------|------|
| TC-LP-01 | Positive | Login page loads successfully | `tests/login/login.positive.spec.js` |
| TC-LP-02 | Positive | All login form elements visible and interactive | same |
| TC-LP-03 | Positive | Password visibility toggle | same |
| TC-LP-04 | Positive | Navigation to signup from login | same |
| TC-LP-05 | Positive | Navigation to forgot password | same |
| TC-LP-06 | Positive | Account type switch (User / Agent) | same |
| TC-LP-07 | Positive | Email and password fields accept input | same |
| TC-LP-08 | Positive | Login button clickable | same |
| TC-LP-09 | Positive | Google Sign In visible and clickable | same |
| TC-LP-10 | Positive | Passkey Login visible and clickable | same |
| TC-LP-11 | Positive | Form fields can be cleared and refilled | same |
| TC-LP-12 | Positive | Form state maintained on account type switch | same |
| TC-LP-13 | Positive | Forgot password link accessible | same |
| TC-LP-14 | Positive | Signup link accessible | same |
| TC-LP-15 | Positive | Login form accepts valid email format | same |
| TC-LP-16 | Positive | Successful login with valid User credentials | same |
| TC-LP-17 | Positive | Successful login with valid Agent credentials | same |
| TC-LN-01 | Negative | Login with empty email and password | `tests/login/login.negative.spec.js` |
| TC-LN-02 | Negative | Invalid email – missing @ | same |
| TC-LN-03 | Negative | Invalid email – missing domain | same |
| TC-LN-04 | Negative | Invalid email – no username | same |
| TC-LN-05 | Negative | Unregistered email | same |
| TC-LN-06+ | Negative | Wrong password, SQL/XSS, etc. | same |

---

## 3. Signup

| ID | Type | Description | Spec |
|----|------|-------------|------|
| TC-SP-01 | Positive | Successful signup with valid User data | `tests/signup/signup.positive.spec.js` |
| TC-SP-03 | Positive | Signup with optional referral code | same |
| TC-SP-04 | Positive | Password visibility toggle | same |
| TC-SP-05 | Positive | Confirm password visibility toggle | same |
| TC-SP-06 | Positive | Navigation to login from signup | same |
| TC-SP-08 | Positive | Terms and conditions checkbox | same |
| TC-SP-09 | Positive | All form fields editable and accept input | same |
| TC-SP-10 | Positive | Signup form elements visible and interactive | same |
| TC-SN-01 | Negative | Submit with all empty fields | `tests/signup/signup.negative.spec.js` |
| TC-SN-02 | Negative | Invalid email – missing @ | same |
| TC-SN-03 | Negative | Invalid email – missing domain | same |
| TC-SN-04 | Negative | Password mismatch | same |
| TC-SN-05 | Negative | Submit without accepting terms | same |
| TC-SN-06 to TC-SN-21 | Negative | Missing/invalid name, email, password, phone; SQL/XSS; boundary; whitespace | same |
| TC-SN-PH-01 to 06 | Negative | Phone validation (short, long, leading zero, special chars, spaces, country code) | `tests/signup/signup.phone_validation.spec.js` |

---

## 4. Buy / Sell

| ID | Type | Description | Spec |
|----|------|-------------|------|
| BUY all coins | Positive | Place BUY orders for all coins from dropdown (USD amount) | `tests/buysell/buysell.spec.js` |
| SELL all coins | Positive | Place SELL orders for all coins from dropdown | same |
| Wallet & history | Positive | Verify wallet balance and transaction history after orders | same |
| TC-NEG-07 | Negative | Page refresh after order does not duplicate – single entry in history | same |
| TC-BS-POS-01 | Positive | Buy/Sell page loads and URL contains buysell | same |
| TC-BS-POS-02 | Positive | Buy tab visible and clickable | same |
| TC-BS-POS-03 | Positive | Sell tab visible and clickable | same |
| TC-BS-POS-04 | Positive | Exchange form (amount input or card) visible on Buy | same |
| TC-BS-NEG-01 | Negative | Buy with amount below minimum – button disabled or validation shown | same |
| TC-BS-NEG-02 | Negative | Buy with empty amount – submit not possible or validation | same |

---

## 5. Wallets

| ID | Type | Description | Spec |
|----|------|-------------|------|
| TC-DW-DEP-01 | Positive | Wallets page loads; deposit section visible | `tests/transfer_swap/crypto_deposit_withdraw.spec.js` |
| TC-DW-DEP-02 | Positive | BTC – deposit address/QR displayed | same |
| TC-DW-DEP-03 | Positive | ETH – deposit address/network displayed | same |
| TC-DW-DEP-04 | Positive | USDT – address and network displayed | same |
| TC-DW-DEP-05 | Positive | All supported coins – each shows deposit entry or address | same |
| TC-DW-WTH-01 | Positive | Withdraw – section/page accessible | same |
| TC-DW-WTH-02 | Positive | Withdraw – BTC – form has address and amount fields | same |
| TC-DW-WTH-03 | Positive | Withdraw – ETH – form has address and amount fields | same |
| TC-DW-NEG-WTH-01 | Negative | Withdraw – insufficient balance shows validation | same |
| TC-DW-NEG-WTH-03 | Negative | Withdraw – invalid address format shows validation | same |

---

## 6. Internal Transfer

| ID | Type | Description | Spec |
|----|------|-------------|------|
| TC-TR-E2E-CRYPTO | Positive | Crypto 0.1 – full flow: form → Send → Continue → PIN → order completed | `tests/transfer_swap/internal_transfer.spec.js` (project: transfer) |
| TC-TR-E2E-FIAT | Positive | Fiat 10 – Fiat tab → Internal Transfer → Send USD → Continue → PIN → order completed | same |
| TC-TR-01 | Positive | Fiat (USD) – page loads and form available | same |
| TC-TR-02 | Positive | Crypto – page loads and asset selection available | same |
| TC-TR-03 | Positive | Transfer to user email – form accepts email | same |
| TC-TR-NEG-FIAT-02 | Negative | Fiat – below minimum amount shows validation | same |
| TC-TR-NEG-FIAT-03 | Negative | Fiat – invalid recipient email shows validation | same |
| TC-TR-NEG-CRYPTO-01 | Negative | Crypto – insufficient balance shows validation | same |
| TC-TR-NEG-CRYPTO-03 | Negative | Crypto – invalid recipient email shows validation | same |

---

## 7. Swapping (Crypto Swap & Fiat Swap)

| ID | Type | Description | Spec |
|----|------|-------------|------|
| TC-SW-01 | Positive | Swapping tab → select ETH-USDT → enter 0.005 You Pay → Swap → review modal | `tests/transfer_swap/swap.spec.js` (project: swap) |
| TC-SW-02 | Positive | Full flow ETH→USDT 0.005 → Continue → Successfully Swap popup | same |
| TC-SW-03 | Positive | Success popup shows "successfully swap" text | same |
| TC-SW-04 | Positive | Swap page loads – Crypto Swap tab, You Pay / You Receive visible | same |
| TC-SW-05 | Positive | You Pay amount accepts 0.005; Swap button visible | same |
| TC-SW-06 | Negative | Insufficient balance – validation shown, no success popup | same |
| TC-SW-07 | Positive | Swap with default pair (BTC-USDT) – place order | same |
| TC-SW-FIAT-POS-01 | Positive | Fiat Swap tab visible on Swap page | same |
| TC-SW-FIAT-POS-02 | Positive | Fiat Swap tab click – form or content visible | same |
| TC-SW-FIAT-NEG-01 | Negative | Fiat Swap – zero amount does not execute (button disabled or validation) | same |

---

## 8. RapiX Pay

| ID | Type | Description | Spec |
|----|------|-------------|------|
| TC-RP-01 | Positive | Valid RapiX Pay order flow: balance before/after, history count, recent transactions | `tests/rapixpay/rapixpay.spec.js` |
| TC-RP-02 (0) | Negative | Zero orders – balance unchanged | same |
| TC-RP-02 (-5) | Negative | Negative orders – balance unchanged | same |
| TC-RP-NEG-03 | Negative | Invalid recipient email shows validation (or Continue disabled) | same |

---

## 9. Transaction History

| ID | Type | Description | Spec |
|----|------|-------------|------|
| TC-TH-POS-01 | Positive | Transaction History page loads and sidebar link works | `tests/transaction_history/transaction_history.spec.js` |
| TC-TH-POS-02 | Positive | Table or content area visible | same |
| TC-TH-POS-03 | Positive | RapiX Pay tab (if present) clickable | same |
| TC-TH-NEG-01 | Negative | Invalid filter does not break page | same |
| (Covered in RapiX Pay) | Positive | History count and latest row in RapiX Pay flow | `tests/rapixpay/rapixpay.spec.js` |
| (Covered in Buy/Sell) | Positive | History after BUY/SELL orders | `tests/buysell/buysell.spec.js` |

---

## 10. Dashboard

| ID | Type | Description | Spec |
|----|------|-------------|------|
| TC-DASH-POS-01 | Positive | After login, main app loads (not login page) | `tests/dashboard/dashboard.spec.js` |
| TC-DASH-POS-02 | Positive | Balance/summary or main content visible | same |
| TC-DASH-POS-03 | Positive | Sidebar navigation links visible (Wallets, Buy/Sell) | same |

---

## 11. Features Not Yet Automated (Documented for Coverage)

Full positive and negative test cases are documented in dedicated files:

| Feature | Positive | Negative | Document |
|---------|----------|----------|----------|
| **P2P** | TC-P2P-POS-01 to 10 | TC-P2P-NEG-01 to 10 | `tests/p2p/P2P_TEST_CASES.md` |
| **Invite Friends** | TC-INV-POS-01 to 08 | TC-INV-NEG-01 to 10 | `tests/invite_friends/INVITE_FRIENDS_TEST_CASES.md` |
| **Settings** | TC-SET-POS-01 to 10 | TC-SET-NEG-01 to 12 | `tests/settings/SETTINGS_TEST_CASES.md` |

**Partially automated features** (gaps not yet in specs): see `tests/PENDING_COVERAGE_TEST_CASES.md`  
(Buy/Sell, Deposit/Withdraw, Internal Transfer, Swap – 53 positive + 53 negative pending across those areas.)

---

## Running the Whole Platform in One Go


Use the **platform** script to run all feature specs in sequence (URL check, login, signup, buy/sell, RapiX Pay, deposit/withdraw, swap with auth, internal transfer with auth):

```bash
npm run test:platform
```

Individual feature scripts:

| Script | What it runs |
|--------|----------------|
| `npm run test` | All tests (chromium; transfer/swap specs need their projects) |
| `npm run test:url` | URL verification (rapixchange.com) |
| `npm run test:login` | Login positive + negative |
| `npm run test:signup` | Signup positive + negative |
| `npm run test:phone` | Signup phone validation |
| `npm run test:dashboard` | Dashboard – post-login visibility |
| `npm run test:buysell` | Buy/Sell – all coins + focused positive/negative |
| `npm run test:rapixpay` | RapiX Pay – valid order + negative (0 / negative orders / invalid email) |
| `npm run test:deposit:withdraw` | Wallets – deposit/withdraw for BTC, ETH, USDT + negative |
| `npm run test:swap` | Swapping – Crypto Swap + Fiat Swap (with saved auth) |
| `npm run test:transfer` | Internal Transfer (with saved auth) |
| `npm run test:history` | Transaction History – positive + negative |

To run **everything** including auth-dependent flows in one command:

```bash
npm run test:platform
```

This runs: URL → Login → Signup → Phone validation → Dashboard → Buy/Sell → RapiX Pay → Deposit/Withdraw → Transaction History → Swap (project swap) → Internal Transfer (project transfer).
