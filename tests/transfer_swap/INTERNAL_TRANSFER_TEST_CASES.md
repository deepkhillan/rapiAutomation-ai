# Internal Transfer – Test Cases (Crypto & Fiat)

**Feature:** Internal transfer of crypto and fiat between users on the platform (transfer to email/account).  
**Scope:** Positive and negative test cases for fiat (USD, USDT) and crypto (BTC, ETH, etc.) internal transfers.

---

## 1. POSITIVE – FIAT INTERNAL TRANSFER

### TC-TR-FIAT-01: Internal Transfer – Fiat (USD) – page loads and form is available

| Field | Detail |
|-------|--------|
| **Objective** | Verify Transfer page loads and fiat transfer form (amount, recipient) is visible. |
| **Preconditions** | User is logged in; Transfer/Internal Transfer is available in sidebar. |
| **Test Data** | N/A (page load only). |

**Steps:**

1. Navigate to **Transfer** (or **Internal Transfer**) via sidebar.
2. Wait for page to load (network idle / form visible).
3. Verify: amount input (or "You Pay" / "Amount" field) is visible.
4. Verify: recipient field (email or account ID) is present.
5. If wallet/asset type selector exists, verify Fiat or USD option is available.

**Expected results:**

- Transfer page loads without error.
- Form contains amount input and recipient (email/account) field.
- User can proceed to enter fiat transfer details.

---

### TC-TR-FIAT-02: Internal Transfer – Fiat (USD) – complete transfer successfully

| Field | Detail |
|-------|--------|
| **Objective** | Verify user can complete a fiat (USD) internal transfer end-to-end. |
| **Preconditions** | User is logged in; sufficient USD/fiat balance; valid recipient email on platform. |
| **Test Data** | Recipient: e.g. jot.antier@gmail.com; Amount: e.g. 1 USD (≥ minimum). |

**Steps:**

1. Navigate to **Transfer** page.
2. Select **Fiat** (or USD) as asset/wallet type if applicable.
3. Enter recipient email (or select from list if applicable).
4. Enter amount (e.g. 1 USD); ensure ≥ minimum transfer amount.
5. Verify any fee and "You Send" / "Recipient receives" summary.
6. Click **Transfer** / **Send**.
7. Enter transaction PIN when prompted.
8. Click **Confirm** / **Submit**.
9. Wait for success message or confirmation.

**Expected results:**

- Transfer is submitted without error.
- Success message is shown (e.g. "Transfer successful").
- Sender's fiat balance is debited; recipient's fiat balance is credited (verify via Wallets or Transaction History if needed).

---

### TC-TR-FIAT-03: Internal Transfer – Fiat (USDT) – form accepts USDT and completes

| Field | Detail |
|-------|--------|
| **Objective** | Verify USDT can be transferred internally (if USDT is offered as fiat/stablecoin). |
| **Preconditions** | User has USDT balance; recipient is valid. |
| **Test Data** | Asset: USDT; Amount: e.g. 1 USDT; Recipient: valid email. |

**Steps:**

1. Navigate to **Transfer** page.
2. Select **USDT** (or Fiat/Stablecoin → USDT) as asset.
3. Enter recipient email and amount (≥ minimum).
4. Submit transfer (PIN → Confirm).
5. Verify success and balance update (sender debited, recipient credited).

**Expected results:**

- USDT transfer completes successfully.
- Balances and Transaction History reflect the transfer.

---

### TC-TR-FIAT-04: Transaction History – new fiat internal transfer appears

| Field | Detail |
|-------|--------|
| **Objective** | Verify the fiat internal transfer appears in Transaction History with correct attributes. |
| **Preconditions** | A fiat internal transfer was just completed. |
| **Test Data** | Same amount and recipient as completed transfer. |

**Steps:**

1. Navigate to **Transaction History** (or relevant tab).
2. Locate latest transactions (newest first).
3. Find the internal transfer (type: Transfer / Internal; asset: USD or USDT).
4. Verify: amount, recipient (or "To"), fee (if any), status (Completed), timestamp.

**Expected results:**

- New transfer appears with correct amount, asset, type (Transfer/Internal), and status.
- Timestamp is correct; list is in reverse chronological order.

---

## 2. POSITIVE – CRYPTO INTERNAL TRANSFER

### TC-TR-CRYPTO-01: Internal Transfer – Crypto – page loads and asset selection available

| Field | Detail |
|-------|--------|
| **Objective** | Verify Transfer page shows crypto option and asset (coin) selection. |
| **Preconditions** | User is logged in; Transfer page is accessible. |
| **Test Data** | N/A. |

**Steps:**

1. Navigate to **Transfer** page.
2. Verify crypto asset selector or "Crypto" / "BTC" / "ETH" option is visible.
3. Verify amount input and recipient field are present.

**Expected results:**

- Crypto transfer form or asset selection (BTC, ETH, etc.) is available.
- User can select a crypto and enter amount and recipient.

---

### TC-TR-CRYPTO-02: Internal Transfer – Crypto (BTC) – complete transfer successfully

| Field | Detail |
|-------|--------|
| **Objective** | Verify user can complete a BTC internal transfer end-to-end. |
| **Preconditions** | User has sufficient BTC balance; valid recipient on platform. |
| **Test Data** | Asset: BTC; Amount: e.g. 0.0001 BTC (≥ minimum); Recipient: valid email. |

**Steps:**

1. Navigate to **Transfer** page.
2. Select **BTC** as asset/coin.
3. Enter recipient email and amount (≥ minimum).
4. Verify fee and summary; click **Transfer** / **Send**.
5. Enter PIN and confirm.
6. Wait for success message.

**Expected results:**

- BTC transfer completes successfully.
- Sender BTC balance debited; recipient BTC balance credited (verify via Wallets/History).

---

### TC-TR-CRYPTO-03: Internal Transfer – Crypto (ETH) – complete transfer successfully

| Field | Detail |
|-------|--------|
| **Objective** | Same as TC-TR-CRYPTO-02 for ETH. |
| **Preconditions** | User has sufficient ETH balance; valid recipient. |
| **Test Data** | Asset: ETH; Amount: e.g. 0.001 ETH (≥ minimum); Recipient: valid email. |

**Steps:**

1. Navigate to **Transfer** page.
2. Select **ETH**; enter recipient and amount.
3. Submit (PIN → Confirm); verify success.

**Expected results:**

- ETH internal transfer completes; balances and history updated correctly.

---

### TC-TR-CRYPTO-04: Internal Transfer – all listed crypto coins – form accepts each coin

| Field | Detail |
|-------|--------|
| **Objective** | Verify transfer form allows selection of every supported crypto (BTC, ETH, USDT, etc.). |
| **Preconditions** | User is logged in; Transfer page lists multiple coins. |
| **Test Data** | Each supported coin: BTC, ETH, USDT, etc. (from platform’s list). |

**Steps:**

1. Navigate to **Transfer** page.
2. For each coin in the supported list (e.g. BTC, ETH, USDT, other alts):
   - Select the coin.
   - Verify amount field and balance (if shown) update for that coin.
   - Optionally perform a minimal transfer for one or more coins (if balance allows).
3. Verify no coin is missing or broken in the selector.

**Expected results:**

- All listed crypto coins can be selected; form and balance display update per coin.
- No JavaScript or validation errors when switching coins.

---

### TC-TR-CRYPTO-05: Transaction History – new crypto internal transfer appears

| Field | Detail |
|-------|--------|
| **Objective** | Verify crypto internal transfer appears in Transaction History. |
| **Preconditions** | A crypto internal transfer was just completed. |
| **Test Data** | Same coin and amount as completed transfer. |

**Steps:**

1. Navigate to **Transaction History**.
2. Find the latest internal transfer (type: Transfer; asset: e.g. BTC or ETH).
3. Verify amount, coin, recipient/to, status, timestamp.

**Expected results:**

- Transfer appears with correct coin, amount, type, and status; ordering latest first.

---

## 3. NEGATIVE – FIAT INTERNAL TRANSFER

### TC-TR-NEG-FIAT-01: Fiat transfer – insufficient balance

| Field | Detail |
|-------|--------|
| **Objective** | System prevents fiat transfer when balance is insufficient. |
| **Preconditions** | User is logged in; fiat balance is known and less than test amount. |
| **Test Data** | Amount: greater than available USD/USDT (e.g. 1,000,000 USD). |

**Steps:**

1. Note current fiat balance (Wallets).
2. Go to **Transfer** → select Fiat/USD (or USDT).
3. Enter valid recipient email and amount **greater** than available balance.
4. Observe validation message or button state; if allowed, try to submit.

**Expected results:**

- "Insufficient balance" (or similar) message appears, or Transfer button is disabled.
- No transfer is executed; balances unchanged.

---

### TC-TR-NEG-FIAT-02: Fiat transfer – below minimum amount

| Field | Detail |
|-------|--------|
| **Objective** | Below-minimum fiat transfer is rejected or blocked. |
| **Preconditions** | User is logged in; minimum transfer amount is known (e.g. 1 USD). |
| **Test Data** | Amount: below minimum (e.g. 0.01 USD). |

**Steps:**

1. **Transfer** → Fiat/USD; enter valid recipient.
2. Enter amount below minimum.
3. Check for validation message or disabled Submit.
4. If possible, try to submit.

**Expected results:**

- Message indicates minimum amount (e.g. "Minimum transfer is 1 USD") or Submit is disabled.
- No transfer is placed.

---

### TC-TR-NEG-FIAT-03: Fiat transfer – invalid recipient email

| Field | Detail |
|-------|--------|
| **Objective** | Invalid or non-existent recipient is rejected. |
| **Preconditions** | User is logged in. |
| **Test Data** | Invalid: invalid-email, test@, @example.com; Non-existent: nonexistent.user@example.com. |

**Steps:**

1. **Transfer** → Fiat; enter **invalid email** (e.g. invalid-email, test@).
2. Enter valid amount; try to submit or tab out.
3. Verify validation error (invalid format).
4. Enter **valid format but non-existent** recipient (e.g. nonexistent.user@example.com); submit if allowed.

**Expected results:**

- Invalid format: validation error, submit blocked.
- Non-existent: error message (e.g. "Recipient not found") or transfer rejected; no balance change.

---

### TC-TR-NEG-FIAT-04: Fiat transfer – transfer to self (if applicable)

| Field | Detail |
|-------|--------|
| **Objective** | System prevents or warns when recipient is same as sender. |
| **Preconditions** | User is logged in; current user email is known. |
| **Test Data** | Recipient: same as logged-in user’s email. |

**Steps:**

1. **Transfer** → Fiat; enter **own email** as recipient.
2. Enter amount; try to submit.

**Expected results:**

- Error or warning (e.g. "Cannot transfer to yourself"); no transfer executed; balance unchanged.

---

## 4. NEGATIVE – CRYPTO INTERNAL TRANSFER

### TC-TR-NEG-CRYPTO-01: Crypto transfer – insufficient balance

| Field | Detail |
|-------|--------|
| **Objective** | System prevents crypto transfer when balance is insufficient. |
| **Preconditions** | User is logged in; crypto balance (e.g. BTC) is known and less than test amount. |
| **Test Data** | Coin: BTC; Amount: e.g. 10 BTC (above available). |

**Steps:**

1. Note current BTC (or selected coin) balance.
2. **Transfer** → select BTC; enter valid recipient and amount **greater** than balance.
3. Observe validation or button state; try submit if allowed.

**Expected results:**

- "Insufficient balance" (or similar); no transfer; balances unchanged.

---

### TC-TR-NEG-CRYPTO-02: Crypto transfer – below minimum amount

| Field | Detail |
|-------|--------|
| **Objective** | Below-minimum crypto transfer is rejected or blocked. |
| **Preconditions** | User is logged in; minimum transfer for coin is known (e.g. 0.0001 BTC). |
| **Test Data** | Coin: BTC; Amount: below minimum (e.g. 0.00000001 BTC). |

**Steps:**

1. **Transfer** → BTC; enter valid recipient and amount below minimum.
2. Check validation or Submit state; try submit if allowed.

**Expected results:**

- Minimum amount message or disabled Submit; no transfer executed.

---

### TC-TR-NEG-CRYPTO-03: Crypto transfer – invalid recipient email

| Field | Detail |
|-------|--------|
| **Objective** | Invalid or non-existent recipient is rejected for crypto transfer. |
| **Preconditions** | User is logged in. |
| **Test Data** | Invalid email; non-existent user email. |

**Steps:**

1. **Transfer** → select crypto; enter invalid email; valid amount.
2. Verify format validation.
3. Enter valid format, non-existent recipient; submit if allowed.

**Expected results:**

- Invalid format: validation error.
- Non-existent: error message; no crypto debited.

---

### TC-TR-NEG-CRYPTO-04: Crypto transfer – wrong network / unsupported address (if applicable)

| Field | Detail |
|-------|--------|
| **Objective** | If external address is ever allowed, wrong network or unsupported address is rejected. |
| **Preconditions** | Product supports external withdrawal or address field; test env allows. |
| **Test Data** | Wrong network address or unsupported format. |

**Steps:**

1. If Transfer supports external address: enter address for wrong network (e.g. ETH address for BTC).
2. Submit or blur field.

**Expected results:**

- Validation error or clear message; no transfer executed.

---

### TC-TR-NEG-CRYPTO-05: Crypto transfer – transfer to self (if applicable)

| Field | Detail |
|-------|--------|
| **Objective** | System prevents or warns when crypto transfer recipient is same as sender. |
| **Preconditions** | User is logged in. |
| **Test Data** | Recipient: own email. |

**Steps:**

1. **Transfer** → Crypto; enter own email; amount; submit.

**Expected results:**

- Error or warning; no transfer; balance unchanged.

---

## 5. GENERAL – INTERNAL TRANSFER

### TC-TR-GEN-01: Wallet balance consistency after fiat transfer

| Field | Detail |
|-------|--------|
| **Objective** | Sender and recipient wallet balances reflect the fiat transfer correctly. |
| **Preconditions** | Known balances before transfer; one fiat transfer completed. |
| **Test Data** | Transfer amount and fee (if any). |

**Steps:**

1. Record sender and recipient fiat balances (or sender only if recipient not accessible).
2. Complete fiat internal transfer (amount X, fee F).
3. Verify sender balance decreased by X + F (or as per product).
4. If recipient accessible, verify recipient balance increased by X (or X − fee).

**Expected results:**

- Balances match expected debit/credit; no double debit or credit.

---

### TC-TR-GEN-02: Wallet balance consistency after crypto transfer

| Field | Detail |
|-------|--------|
| **Objective** | Same as TC-TR-GEN-01 for crypto (e.g. BTC, ETH). |
| **Preconditions** | Known crypto balances; one crypto transfer completed. |
| **Test Data** | Coin, amount, fee. |

**Steps:**

1. Record sender and (if possible) recipient crypto balance for the coin.
2. Complete crypto internal transfer.
3. Verify sender debited, recipient credited (if visible); fee applied as documented.

**Expected results:**

- Balances consistent with single transfer; no duplicate debit/credit.

---

### TC-TR-GEN-03: PIN required for transfer

| Field | Detail |
|-------|--------|
| **Objective** | Transfer submission requires transaction PIN. |
| **Preconditions** | User is logged in; PIN is set. |
| **Test Data** | Valid transfer amount and recipient. |

**Steps:**

1. Fill transfer form (fiat or crypto); click **Transfer** / **Send**.
2. Verify PIN modal/screen appears.
3. Cancel or enter wrong PIN; verify transfer does not complete.
4. Enter correct PIN and confirm; verify transfer completes.

**Expected results:**

- PIN step is mandatory; wrong or skipped PIN prevents completion; correct PIN allows completion.

---

## Summary matrix – Internal Transfer

| ID | Category | Description |
|----|----------|-------------|
| TC-TR-FIAT-01 | Positive Fiat | Page loads, form available |
| TC-TR-FIAT-02 | Positive Fiat | Complete USD transfer successfully |
| TC-TR-FIAT-03 | Positive Fiat | USDT transfer successfully |
| TC-TR-FIAT-04 | Positive Fiat | Transaction History – fiat transfer |
| TC-TR-CRYPTO-01 | Positive Crypto | Page loads, asset selection available |
| TC-TR-CRYPTO-02 | Positive Crypto | BTC transfer successfully |
| TC-TR-CRYPTO-03 | Positive Crypto | ETH transfer successfully |
| TC-TR-CRYPTO-04 | Positive Crypto | All listed crypto coins – form accepts each |
| TC-TR-CRYPTO-05 | Positive Crypto | Transaction History – crypto transfer |
| TC-TR-NEG-FIAT-01 | Negative Fiat | Insufficient balance |
| TC-TR-NEG-FIAT-02 | Negative Fiat | Below minimum amount |
| TC-TR-NEG-FIAT-03 | Negative Fiat | Invalid recipient email |
| TC-TR-NEG-FIAT-04 | Negative Fiat | Transfer to self |
| TC-TR-NEG-CRYPTO-01 | Negative Crypto | Insufficient balance |
| TC-TR-NEG-CRYPTO-02 | Negative Crypto | Below minimum amount |
| TC-TR-NEG-CRYPTO-03 | Negative Crypto | Invalid recipient email |
| TC-TR-NEG-CRYPTO-04 | Negative Crypto | Wrong network / unsupported address |
| TC-TR-NEG-CRYPTO-05 | Negative Crypto | Transfer to self |
| TC-TR-GEN-01 | General | Wallet consistency – fiat |
| TC-TR-GEN-02 | General | Wallet consistency – crypto |
| TC-TR-GEN-03 | General | PIN required for transfer |

---

*Document version: 1.0 | Scope: Internal Transfer (Crypto & Fiat)*
