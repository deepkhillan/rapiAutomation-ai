# Crypto Exchange – Detailed Test Cases (BUY & SELL)

**Feature:** Crypto exchange BUY and SELL order flows  
**Scope:** Order placement, wallet balance validation, transaction history, cross-page consistency, negative and edge cases.

---

## 1. BUY ORDER FLOW

### TC-BUY-01: Place a BUY order successfully (happy path)

| Field | Detail |
|-------|--------|
| **Objective** | Verify user can place a BUY crypto order end-to-end. |
| **Preconditions** | User is logged in; user has sufficient fiat balance (e.g. USD/USDT); Buy/Sell page is accessible; at least one crypto is available for trading. |
| **Test Data** | Coin: e.g. BTC or ETH; Fiat amount: e.g. 10 USD (≥ minimum order amount). |

**Steps:**

1. Navigate to **Buy/Sell** (or **Exchange**) page.
2. Select **Buy** tab.
3. Select the crypto to buy (e.g. BTC).
4. Enter the fiat amount to pay (e.g. 10) in the “You Pay” field.
5. Verify displayed “You Receive” (crypto amount) and any fee.
6. Click **Buy** (or **Exchange**).
7. Enter transaction PIN when prompted.
8. Click **Confirm** / **Submit**.
9. Wait for order processing (success message or redirect).

**Expected results:**

- Order is submitted without error.
- Success message or confirmation is shown (e.g. “Order placed successfully”).
- No generic server/validation error.
- User remains on a valid post-order state (confirmation or back to form).

---

### TC-BUY-02: Wallet balances BEFORE and AFTER BUY – fiat debited, crypto credited

| Field | Detail |
|-------|--------|
| **Objective** | Validate that after a BUY order, fiat is debited and crypto is credited correctly, including fees. |
| **Preconditions** | Same as TC-BUY-01; user has known fiat and crypto balances. |
| **Test Data** | Coin: e.g. BTC; Amount: e.g. 20 USD; note minimum and fee % if known. |

**Steps:**

1. Navigate to **Wallets** page.
2. **Capture BEFORE balances:**
   - Fiat balance (e.g. USD or USDT) — record value.
   - Crypto balance for the coin to buy (e.g. BTC) — record value.
3. Navigate to **Buy/Sell**.
4. Select **Buy** tab and the same crypto (e.g. BTC).
5. Enter fiat amount (e.g. 20).
6. **Record** displayed fee and “You Receive” (crypto quantity).
7. Submit order (Buy → PIN → Confirm).
8. Wait for success/confirmation.
9. Navigate back to **Wallets**.
10. **Capture AFTER balances:**
    - Fiat balance (USD/USDT).
    - Crypto balance (e.g. BTC).

**Expected results:**

- **Fiat:** `Fiat_after = Fiat_before − (order_amount + fee)` (or equivalent; fee may be included in debited amount depending on product).
- **Crypto:** `Crypto_after = Crypto_before + received_crypto_quantity` (same precision as UI).
- Wallet balances reflect the executed quantity and fees; no unexplained discrepancies.
- If multiple wallets (e.g. Available vs Locked), the correct wallet is debited/credited.

---

### TC-BUY-03: Transaction History – new BUY transaction and attributes

| Field | Detail |
|-------|--------|
| **Objective** | Verify the BUY order appears in Transaction History with correct attributes and ordering. |
| **Preconditions** | A BUY order was just placed (e.g. after TC-BUY-02). |
| **Test Data** | Same coin and amount as in the placed order. |

**Steps:**

1. Navigate to **Transaction History** (or **Master Trxn History** / relevant tab).
2. Locate the latest transaction(s); ensure list is sorted by date/time (newest first).
3. Find the new BUY transaction (by coin, amount, and approximate time).
4. Verify the following for that transaction:

   - **Coin / Asset:** Matches the crypto bought (e.g. BTC).
   - **Amount:** Matches the executed quantity (crypto received).
   - **Price:** Matches (or is consistent with) the execution price.
   - **Fee:** Matches the fee shown at order placement (or fee policy).
   - **Order type:** BUY.
   - **Status:** One of Pending / Completed / Failed (as per business rules).
   - **Timestamp:** Present and consistent with order time.
5. Verify ordering: the new BUY is at the top (or among the most recent) of the list.

**Expected results:**

- New BUY transaction appears in the list.
- Coin, amount, price, fee, order type (BUY), and status are correct.
- Timestamp is correct and list is in reverse chronological order (latest on top).
- No duplicate entries for the same order (unless product supports multiple entries by design).

---

### TC-BUY-04: BUY – fee calculation and decimal precision

| Field | Detail |
|-------|--------|
| **Objective** | Validate fee calculation and decimal handling for a BUY order. |
| **Preconditions** | User logged in; fee structure known (e.g. % or fixed). |
| **Test Data** | Known fiat amount (e.g. 100 USD) and known fee rate (e.g. 1%). |

**Steps:**

1. On Buy/Sell, select **Buy** and a coin.
2. Enter a specific fiat amount (e.g. 100).
3. Record: “You Pay”, “You Receive”, and “Fee” (or equivalent).
4. Calculate expected fee (e.g. 100 × 1% = 1) and expected crypto (using displayed rate).
5. Submit order and complete with PIN.
6. In Transaction History, open the new BUY and verify fee and amounts.
7. On Wallets, verify debited/credited amounts match (with allowed rounding).

**Expected results:**

- Fee matches documented fee logic (within rounding rules).
- Decimal precision is consistent (e.g. 2 for fiat, 8 for BTC) and no obvious rounding errors.
- Sum of debits/credits is consistent with “You Pay”, “You Receive”, and fee.

---

## 2. SELL ORDER FLOW

### TC-SELL-01: Place a SELL order successfully (happy path)

| Field | Detail |
|-------|--------|
| **Objective** | Verify user can place a SELL crypto order end-to-end. |
| **Preconditions** | User is logged in; user has sufficient crypto balance to sell; Buy/Sell page is accessible. |
| **Test Data** | Coin: e.g. BTC or ETH; Amount: crypto to sell (e.g. 0.001 BTC) or fiat equivalent, ≥ minimum. |

**Steps:**

1. Navigate to **Buy/Sell** (or **Exchange**) page.
2. Select **Sell** tab.
3. Select the crypto to sell (e.g. BTC).
4. Enter the amount to sell (crypto or fiat equivalent, per UI).
5. Verify displayed “You Receive” (fiat) and any fee.
6. Click **Sell** (or **Exchange**).
7. Enter transaction PIN when prompted.
8. Click **Confirm** / **Submit**.
9. Wait for order processing.

**Expected results:**

- Order is submitted without error.
- Success message or confirmation is shown.
- No generic server/validation error.
- User sees valid post-order state.

---

### TC-SELL-02: Wallet balances BEFORE and AFTER SELL – crypto debited, fiat credited

| Field | Detail |
|-------|--------|
| **Objective** | Validate that after a SELL order, crypto is debited and fiat is credited correctly, including fees. |
| **Preconditions** | Same as TC-SELL-01; user has known crypto and fiat balances. |
| **Test Data** | Coin: e.g. BTC; Amount: e.g. 0.001 BTC (or equivalent in fiat); note fee. |

**Steps:**

1. Navigate to **Wallets** page.
2. **Capture BEFORE balances:**
   - Crypto balance for the coin to sell (e.g. BTC).
   - Fiat balance (e.g. USD/USDT).
3. Navigate to **Buy/Sell**.
4. Select **Sell** tab and the same crypto (e.g. BTC).
5. Enter amount to sell (crypto or fiat).
6. **Record** fee and “You Receive” (fiat).
7. Submit order (Sell → PIN → Confirm).
8. Wait for success/confirmation.
9. Navigate back to **Wallets**.
10. **Capture AFTER balances:**
    - Crypto balance (e.g. BTC).
    - Fiat balance (USD/USDT).

**Expected results:**

- **Crypto:** `Crypto_after = Crypto_before − sold_crypto_quantity` (exact or within rounding).
- **Fiat:** `Fiat_after = Fiat_before + received_fiat − fee` (or as per product: fee may be deducted from received fiat).
- Balances reflect executed quantity and fees; no unexplained discrepancies.

---

### TC-SELL-03: Transaction History – new SELL transaction and attributes

| Field | Detail |
|-------|--------|
| **Objective** | Verify the SELL order appears in Transaction History with correct attributes and ordering. |
| **Preconditions** | A SELL order was just placed (e.g. after TC-SELL-02). |
| **Test Data** | Same coin and amount as in the placed order. |

**Steps:**

1. Navigate to **Transaction History** (or relevant tab).
2. Locate the latest transactions (newest first).
3. Find the new SELL transaction.
4. Verify for that transaction:

   - **Coin / Asset:** Matches the crypto sold (e.g. BTC).
   - **Amount:** Matches the executed quantity (crypto sold).
   - **Price:** Consistent with execution.
   - **Fee:** Matches fee shown at order placement.
   - **Order type:** SELL.
   - **Status:** Pending / Completed / Failed (as applicable).
   - **Timestamp:** Correct and in chronological order.
5. Verify list ordering: latest on top.

**Expected results:**

- New SELL transaction appears with correct coin, amount, price, fee, type (SELL), and status.
- Timestamp ordering is correct (latest on top).
- No duplicate entries for the same order.

---

### TC-SELL-04: SELL – fee calculation and decimal precision

| Field | Detail |
|-------|--------|
| **Objective** | Validate fee and decimal handling for a SELL order. |
| **Preconditions** | User logged in; fee structure known. |
| **Test Data** | Known crypto amount (e.g. 0.01 BTC) and fee rate. |

**Steps:**

1. On Buy/Sell, select **Sell** and a coin.
2. Enter a specific amount (crypto or fiat).
3. Record: amount sold, “You Receive”, and fee.
4. Calculate expected fee and fiat received.
5. Submit order and complete with PIN.
6. In Transaction History, verify fee and amounts.
7. On Wallets, verify debited/credited amounts match (with allowed rounding).

**Expected results:**

- Fee matches documented logic; decimals are consistent; no unreasonable rounding errors.
- Wallet and transaction history amounts align.

---

## 3. CROSS-PAGE CONSISTENCY

### TC-CROSS-01: Wallet, Order History, and Transaction History consistency after BUY

| Field | Detail |
|-------|--------|
| **Objective** | Ensure Wallet page, Order History (if available), and Transaction History show consistent values after a BUY. |
| **Preconditions** | One or more BUY orders completed in the session. |
| **Test Data** | Order amount, coin, and fee from placed BUY(s). |

**Steps:**

1. After placing a BUY order, record: coin, fiat spent, crypto received, fee.
2. Open **Wallets** and record fiat and crypto balances for that coin.
3. Open **Transaction History** and find the BUY(s); record amount, fee, status.
4. If **Order History** exists, open it and find the same order(s); record type (BUY), amount, status.
5. Cross-check: wallet deltas vs transaction amounts; transaction vs order history (amount, type, status).

**Expected results:**

- Wallet balances are consistent with the sum of transactions (BUY adds crypto, deducts fiat + fee).
- Transaction History and Order History (if present) show the same order with matching amount, type, and status.
- No duplicate or missing entries for the same order across pages.

---

### TC-CROSS-02: Wallet, Order History, and Transaction History consistency after SELL

| Field | Detail |
|-------|--------|
| **Objective** | Same as TC-CROSS-01 for SELL orders. |
| **Preconditions** | One or more SELL orders completed. |
| **Test Data** | Order amount, coin, and fee from placed SELL(s). |

**Steps:**

1. After placing a SELL order, record: coin, crypto sold, fiat received, fee.
2. Open **Wallets** and record crypto and fiat balances.
3. Open **Transaction History** and find the SELL(s).
4. If **Order History** exists, find the same order(s).
5. Cross-check wallet deltas, transaction amounts, and order history.

**Expected results:**

- Wallet balances are consistent with SELL transactions (crypto debited, fiat credited minus fee if applicable).
- Transaction History and Order History show matching SELL(s); no duplicates or missing entries.

---

### TC-CROSS-03: Multi-order execution consistency

| Field | Detail |
|-------|--------|
| **Objective** | Verify that multiple BUY/SELL orders in sequence result in consistent balances and history. |
| **Preconditions** | User has sufficient balance for multiple small orders. |
| **Test Data** | e.g. BUY 10 USD BTC, then SELL half of received BTC (or small amounts). |

**Steps:**

1. Record initial fiat and crypto balances (Wallets).
2. Place BUY order (e.g. 10 USD of BTC); complete and record amounts.
3. Place second order (e.g. SELL part of BTC); complete and record amounts.
4. Open Wallets and verify final fiat and crypto.
5. Open Transaction History and verify both orders appear in order (latest on top); verify amounts and types.
6. If Order History exists, verify both orders there with correct type and status.

**Expected results:**

- Final wallet balances match sequential application of both orders (including fees).
- Both orders appear in Transaction History and Order History with correct type (BUY/SELL), amount, and status.
- No duplicate or missing entries; ordering is correct.

---

## 4. NEGATIVE & EDGE CASES

### TC-NEG-01: BUY – insufficient fiat balance

| Field | Detail |
|-------|--------|
| **Objective** | System prevents BUY when fiat balance is insufficient. |
| **Preconditions** | User logged in; fiat balance known and lower than test amount. |
| **Test Data** | Fiat amount greater than available balance (e.g. 1,000,000 USD). |

**Steps:**

1. Note current fiat balance on Wallets.
2. Go to Buy/Sell → Buy; select a coin.
3. Enter fiat amount **greater** than available balance.
4. Observe button state and any validation message.
5. If allowed to proceed, submit order (Buy → PIN → Confirm).

**Expected results:**

- Either: “Buy” is disabled or a validation message appears (e.g. “Insufficient balance”) before submit.
- Or: Order is rejected after submit with a clear error (e.g. “Insufficient fiat balance”).
- No fiat is debited and no crypto is credited; balances unchanged on Wallets.

---

### TC-NEG-02: SELL – insufficient crypto balance

| Field | Detail |
|-------|--------|
| **Objective** | System prevents SELL when crypto balance is insufficient. |
| **Preconditions** | User logged in; crypto balance known and lower than test amount. |
| **Test Data** | Crypto amount (or fiat equivalent) greater than available crypto. |

**Steps:**

1. Note current crypto balance for a coin on Wallets.
2. Go to Buy/Sell → Sell; select that coin.
3. Enter amount **greater** than available crypto.
4. Observe validation or button state.
5. If allowed, submit order.

**Expected results:**

- Validation or error (e.g. “Insufficient crypto balance”); no execution.
- No crypto debited and no fiat credited; balances unchanged.

---

### TC-NEG-03: Below minimum order amount (BUY)

| Field | Detail |
|-------|--------|
| **Objective** | Below-minimum BUY amount is rejected or blocked. |
| **Preconditions** | User logged in; minimum order amount known (e.g. 10 USD). |
| **Test Data** | Amount below minimum (e.g. 0.01 or 1 USD). |

**Steps:**

1. Buy/Sell → Buy; select a coin.
2. Enter amount below minimum.
3. Check for validation message or disabled Buy button.
4. If possible, try to submit.

**Expected results:**

- Message indicates minimum amount (e.g. “Minimum order is 10 USD”) or Buy is disabled.
- No order is placed; balances unchanged.

---

### TC-NEG-04: Below minimum order amount (SELL)

| Field | Detail |
|-------|--------|
| **Objective** | Below-minimum SELL amount is rejected or blocked. |
| **Preconditions** | User logged in; minimum sell amount known. |
| **Test Data** | Amount below minimum. |

**Steps:**

1. Buy/Sell → Sell; select a coin.
2. Enter amount below minimum.
3. Check validation or button state; try submit if allowed.

**Expected results:**

- Minimum amount message or disabled Sell; no order placed; balances unchanged.

---

### TC-NEG-05: Cancelled order

| Field | Detail |
|-------|--------|
| **Objective** | If cancellation is supported, cancelled order does not change balances and appears with correct status. |
| **Preconditions** | Product supports order cancellation (e.g. pending orders). |
| **Test Data** | Place an order that can be cancelled (if applicable). |

**Steps:**

1. Place a BUY or SELL order (or use a pending order type if available).
2. Before execution (or as per flow), cancel the order.
3. Check Wallets: fiat and crypto should be unchanged (or reverted if already reserved).
4. Check Transaction/Order History: order status = Cancelled (or equivalent).

**Expected results:**

- Balances reflect no execution (or reversal).
- Order appears as Cancelled in history; no duplicate “Completed” entry for the same order.

---

### TC-NEG-06: Network failure during order placement

| Field | Detail |
|-------|--------|
| **Objective** | On network failure during submit, either order is not executed or user gets clear feedback and consistent state. |
| **Preconditions** | Ability to simulate network failure (e.g. disconnect network or throttle). |
| **Test Data** | Any valid order amount. |

**Steps:**

1. Start placing a BUY or SELL order (amount, then Submit).
2. Before or during PIN confirmation, disconnect network (or simulate failure).
3. Observe error message and UI state.
4. Reconnect network; check Wallets and Transaction History.

**Expected results:**

- User sees an error (e.g. “Network error” / “Request failed”), not a false success.
- Either no order is created (balances unchanged, no new transaction) or a single “Failed”/“Pending” transaction with clear status; no double debit/credit.

---

### TC-NEG-07: Page refresh after order placement

| Field | Detail |
|-------|--------|
| **Objective** | After placing an order, refresh does not duplicate the order and data remains consistent. |
| **Preconditions** | User just completed a BUY or SELL (success screen or back on form). |
| **Test Data** | One completed order. |

**Steps:**

1. Place a BUY or SELL order and complete it (success message or confirmation).
2. Note success message or order ID if shown.
3. Refresh the page (F5 or browser refresh).
4. Navigate to Wallets and Transaction History.
5. Verify: one order in history; balances match the single order (no double execution).

**Expected results:**

- Refresh does not resubmit the order.
- Transaction History shows exactly one entry for that order; balances are correct (no double debit/credit).

---

### TC-NEG-08: Partial execution (if applicable)

| Field | Detail |
|-------|--------|
| **Objective** | If partial fills are supported, balances and history reflect partial execution correctly. |
| **Preconditions** | Product supports partial order execution; test environment allows partial fill. |
| **Test Data** | Order size that may be partially filled. |

**Steps:**

1. Place an order (BUY or SELL) that may be partially filled.
2. After execution (or timeout), check Wallets: debits/credits should match filled quantity only.
3. Check Transaction/Order History: status (e.g. Partially Filled) and filled amount vs total amount.

**Expected results:**

- Only filled portion affects balances; fee applies per business rules (e.g. on filled amount).
- History shows correct filled quantity, remaining quantity, and status.

---

## 5. GENERAL VALIDATIONS (reusable across BUY/SELL)

### TC-GEN-01: Fees calculation accuracy

- For each fee type (%, fixed, tiered): run one BUY and one SELL with known amount and rate; verify displayed and post-order fee (Transaction History / Wallets) match documented logic within rounding rules.

### TC-GEN-02: Decimal precision handling

- Use amounts that produce many decimals (e.g. 10 USD for BTC). Verify UI and Transaction History use consistent precision (e.g. 2 for fiat, 8 for BTC); no obviously wrong truncation or rounding.

### TC-GEN-03: Rounding logic

- Document rounding rule (e.g. half-up, truncate). Run orders that trigger rounding at boundaries; verify wallet and transaction amounts align with the stated rule.

### TC-GEN-04: Multi-order execution consistency

- Covered in TC-CROSS-03; can be extended with more than two orders (e.g. BUY, BUY, SELL) and verify cumulative balances and history.

---

## Summary matrix

| ID | Category | Description |
|----|----------|-------------|
| TC-BUY-01 | BUY Order | Place BUY successfully |
| TC-BUY-02 | BUY Order | Wallet balances before/after BUY (fiat debited, crypto credited) |
| TC-BUY-03 | BUY Order | Transaction History – new BUY, attributes, ordering |
| TC-BUY-04 | BUY Order | Fee and decimal precision (BUY) |
| TC-SELL-01 | SELL Order | Place SELL successfully |
| TC-SELL-02 | SELL Order | Wallet balances before/after SELL (crypto debited, fiat credited) |
| TC-SELL-03 | SELL Order | Transaction History – new SELL, attributes, ordering |
| TC-SELL-04 | SELL Order | Fee and decimal precision (SELL) |
| TC-CROSS-01 | Cross-Page | Consistency after BUY (Wallet, Order History, Transaction History) |
| TC-CROSS-02 | Cross-Page | Consistency after SELL |
| TC-CROSS-03 | Cross-Page | Multi-order consistency |
| TC-NEG-01 | Negative | BUY – insufficient fiat |
| TC-NEG-02 | Negative | SELL – insufficient crypto |
| TC-NEG-03 | Negative | BUY – below minimum amount |
| TC-NEG-04 | Negative | SELL – below minimum amount |
| TC-NEG-05 | Negative | Cancelled order |
| TC-NEG-06 | Negative | Network failure during placement |
| TC-NEG-07 | Negative | Page refresh after placement |
| TC-NEG-08 | Negative | Partial execution (if supported) |
| TC-GEN-01 to 04 | General | Fees, decimals, rounding, multi-order |

---

*Document version: 1.0 | Scope: Crypto exchange BUY/SELL order flows and dependent system updates.*
