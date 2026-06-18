# Pending Coverage – Partially Automated Features

**Purpose:** Positive and negative test cases that are **documented** in feature-specific files but **not yet implemented** in Playwright specs.  
**Reference specs:** See linked spec files for what is already automated.

---

## A. Buy / Sell – pending cases

**Automated in:** `tests/buysell/buysell.spec.js`  
**Full detail in:** `tests/buysell/CRYPTO_EXCHANGE_TEST_CASES.md`

### Positive (pending)

| ID | Description |
|----|-------------|
| TC-BUY-04 | BUY – fee calculation and decimal precision |
| TC-SELL-04 | SELL – fee calculation and decimal precision |
| TC-CROSS-01 | Wallet, Order History, and Transaction History consistency after BUY |
| TC-CROSS-02 | Wallet, Order History, and Transaction History consistency after SELL |
| TC-CROSS-03 | Multi-order execution consistency |
| TC-GEN-01 | Fees calculation accuracy (reusable) |
| TC-GEN-02 | Decimal precision handling |
| TC-GEN-03 | Rounding logic |
| TC-GEN-04 | Multi-order execution consistency |

### Negative (pending)

| ID | Description |
|----|-------------|
| TC-NEG-01 | BUY – insufficient fiat balance |
| TC-NEG-02 | SELL – insufficient crypto balance |
| TC-NEG-04 | SELL – below minimum order amount |
| TC-NEG-05 | Cancelled order (if product supports) |
| TC-NEG-06 | Network failure during order placement |
| TC-NEG-08 | Partial execution (if applicable) |

*Note: TC-NEG-03 (BUY below min) and TC-NEG-07 (refresh duplicate) are automated as TC-BS-NEG-01 and TC-NEG-07.*

---

## B. Wallets – Deposit & Withdraw – pending cases

**Automated in:** `tests/transfer_swap/crypto_deposit_withdraw.spec.js`  
**Full detail in:** `tests/transfer_swap/CRYPTO_DEPOSIT_WITHDRAW_TEST_CASES.md`

### Positive (pending)

| ID | Description |
|----|-------------|
| TC-DW-DEP-06 | Deposit – copy address works for each coin |
| TC-DW-WTH-04 | Withdraw – USDT – correct network selection and submission |
| TC-DW-WTH-05 | Withdraw – all supported coins – form available and validations apply |
| TC-DW-WTH-06 | Transaction History – withdraw appears with correct type and status |

### Negative (pending)

| ID | Description |
|----|-------------|
| TC-DW-NEG-DEP-01 | Deposit – wrong network warning for multi-network coins |
| TC-DW-NEG-DEP-02 | Deposit – unsupported coin (if applicable) |
| TC-DW-NEG-WTH-02 | Withdraw – below minimum amount |
| TC-DW-NEG-WTH-04 | Withdraw – above maximum (if applicable) |
| TC-DW-NEG-WTH-05 | Withdraw – PIN required and wrong PIN rejected |
| TC-DW-NEG-WTH-06 | Withdraw – all coins – invalid address validation per coin |

---

## C. Internal Transfer – pending cases

**Automated in:** `tests/transfer_swap/internal_transfer.spec.js`  
**Full detail in:** `tests/transfer_swap/INTERNAL_TRANSFER_TEST_CASES.md`

### Positive (pending)

| ID | Description |
|----|-------------|
| TC-TR-FIAT-02 | Fiat (USD) – complete transfer successfully (standalone, non-E2E) |
| TC-TR-FIAT-03 | Fiat (USDT) – form accepts USDT and completes |
| TC-TR-FIAT-04 | Transaction History – new fiat internal transfer appears |
| TC-TR-CRYPTO-02 | Crypto (BTC) – complete transfer successfully (standalone) |
| TC-TR-CRYPTO-03 | Crypto (ETH) – complete transfer successfully |
| TC-TR-CRYPTO-04 | All listed crypto coins – form accepts each coin |
| TC-TR-CRYPTO-05 | Transaction History – new crypto internal transfer appears |
| TC-TR-GEN-01 | Wallet balance consistency after fiat transfer |
| TC-TR-GEN-02 | Wallet balance consistency after crypto transfer |
| TC-TR-GEN-03 | PIN required for transfer |

### Negative (pending)

| ID | Description |
|----|-------------|
| TC-TR-NEG-FIAT-01 | Fiat – insufficient balance |
| TC-TR-NEG-FIAT-04 | Fiat – transfer to self |
| TC-TR-NEG-CRYPTO-02 | Crypto – below minimum amount |
| TC-TR-NEG-CRYPTO-04 | Crypto – wrong network / unsupported address |
| TC-TR-NEG-CRYPTO-05 | Crypto – transfer to self |

*Note: TC-TR-NEG-FIAT-02/03 and TC-TR-NEG-CRYPTO-01/03 exist in spec but may `test.skip()` if UI not found.*

---

## D. Swap – pending / light coverage

**Automated in:** `tests/transfer_swap/swap.spec.js`  
**Full detail in:** `tests/transfer_swap/SWAP_TEST_CASES.md`

### Positive (pending / extend)

| ID | Description |
|----|-------------|
| TC-SW-FIAT-POS-03 | Fiat Swap – complete swap within limits (happy path) |
| TC-SW-FIAT-POS-04 | Fiat Swap – transaction history entry after success |

### Negative (pending)

| ID | Description |
|----|-------------|
| TC-SW-FIAT-NEG-02 | Fiat Swap – insufficient balance |
| TC-SW-FIAT-NEG-03 | Fiat Swap – below minimum amount |
| TC-SW-NEG-07 | Crypto Swap – wrong PIN rejected |
| TC-SW-NEG-08 | Crypto Swap – page refresh does not duplicate swap |

---

## E. Fully unautomated features

| Feature | Test case document |
|---------|-------------------|
| P2P | `tests/p2p/P2P_TEST_CASES.md` (10 positive + 10 negative) |
| Invite Friends | `tests/invite_friends/INVITE_FRIENDS_TEST_CASES.md` (8 positive + 10 negative) |
| Settings | `tests/settings/SETTINGS_TEST_CASES.md` (10 positive + 12 negative) |

---

## Summary counts

| Category | Positive pending | Negative pending |
|----------|------------------|------------------|
| Buy/Sell | 9 | 6 |
| Deposit/Withdraw | 4 | 6 |
| Internal Transfer | 10 | 5 |
| Swap | 2 | 4 |
| P2P | 10 | 10 |
| Invite Friends | 8 | 10 |
| Settings | 10 | 12 |
| **Total** | **53** | **53** |
