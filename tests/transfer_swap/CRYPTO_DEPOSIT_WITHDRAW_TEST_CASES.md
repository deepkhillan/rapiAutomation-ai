# Crypto Deposit & Withdraw – Test Cases (All Coins)

**Feature:** Crypto deposit (receive) and withdraw flows for all supported coins.  
**Scope:** Positive and negative test cases for viewing deposit addresses, initiating withdraw, validations, and per-coin coverage (BTC, ETH, USDT, etc.).

---

## 1. POSITIVE – CRYPTO DEPOSIT (ALL COINS)

### TC-DW-DEP-01: Deposit – Wallets/Deposit page loads and deposit section visible

| Field | Detail |
|-------|--------|
| **Objective** | Verify user can access deposit section (from Wallets or dedicated Deposit page). |
| **Preconditions** | User is logged in; Wallets or Deposit is available. |
| **Test Data** | N/A. |

**Steps:**

1. Navigate to **Wallets** (or **Deposit** / **Crypto Wallet**).
2. Locate **Deposit** action (button, tab, or per-coin "Deposit" link).
3. Verify deposit section or deposit entry point is visible.

**Expected results:**

- Deposit option is visible; user can proceed to view deposit info (address/QR).

---

### TC-DW-DEP-02: Deposit – BTC – deposit address and QR displayed

| Field | Detail |
|-------|--------|
| **Objective** | Verify BTC deposit address (and QR if applicable) is shown correctly. |
| **Preconditions** | User is logged in; BTC is a supported coin. |
| **Test Data** | Coin: BTC. |

**Steps:**

1. Open **Wallets** → Crypto (or **Deposit**).
2. Select or open **BTC** deposit.
3. Verify BTC deposit address is displayed (format valid for BTC network).
4. If QR code is shown, verify it is visible and matches address (optional: scan and compare).
5. Verify network label (e.g. "Bitcoin", "BTC") to avoid confusion with other chains.

**Expected results:**

- BTC address is displayed; format is valid (e.g. starts with 1, 3, or bc1).
- Network is clearly indicated (BTC, not ETH or other).
- No JavaScript or copy errors.

---

### TC-DW-DEP-03: Deposit – ETH – deposit address and network displayed

| Field | Detail |
|-------|--------|
| **Objective** | Verify ETH deposit address and network (e.g. ERC-20, Ethereum) are shown. |
| **Preconditions** | User is logged in; ETH is supported. |
| **Test Data** | Coin: ETH. |

**Steps:**

1. Open deposit for **ETH**.
2. Verify ETH address is displayed (valid Ethereum format: 0x + 40 hex chars).
3. Verify network name (Ethereum, ERC-20, etc.) is shown.
4. If QR is present, verify it is visible.

**Expected results:**

- ETH address format is valid; network is clearly indicated.
- User can copy address and use it for deposit on correct network.

---

### TC-DW-DEP-04: Deposit – USDT – address and network (ERC-20 / TRC-20 / etc.) displayed

| Field | Detail |
|-------|--------|
| **Objective** | Verify USDT deposit shows correct address and network (e.g. ERC-20, TRC-20). |
| **Preconditions** | User is logged in; USDT is supported; platform supports one or more USDT networks. |
| **Test Data** | Coin: USDT; Network: as per platform (e.g. ERC-20). |

**Steps:**

1. Open deposit for **USDT**.
2. Verify deposit address is displayed.
3. Verify **network** is clearly shown (e.g. "USDT (ERC-20)", "USDT (TRC-20)") to avoid wrong-network deposits.
4. Verify warning about using correct network is present if applicable.

**Expected results:**

- USDT address and network are correct; user is warned to use same network when depositing.

---

### TC-DW-DEP-05: Deposit – all supported coins – each shows deposit address/QR

| Field | Detail |
|-------|--------|
| **Objective** | For every supported crypto (BTC, ETH, USDT, and any other), deposit info is available and correct. |
| **Preconditions** | User is logged in; list of supported coins is known (from Wallets or API). |
| **Test Data** | All coins: e.g. BTC, ETH, USDT, BNB, SOL, XRP, etc. (as per platform). |

**Steps:**

1. Navigate to Wallets (Crypto) or Deposit.
2. For **each** supported coin in the list:
   - Open or select deposit for that coin.
   - Verify deposit address (and network for multi-network coins) is displayed.
   - Verify address format matches expected for that coin/network (e.g. BTC: 1/3/bc1; ETH: 0x; etc.).
   - Optionally verify "Copy" works for address.
3. Document any coin that fails to show address or shows wrong format.

**Expected results:**

- Every listed coin has a working deposit flow.
- Address format and network are correct per coin.
- No missing or broken deposit entry for any supported coin.

---

### TC-DW-DEP-06: Deposit – copy address works for each coin

| Field | Detail |
|-------|--------|
| **Objective** | "Copy address" (or similar) copies the correct deposit address to clipboard. |
| **Preconditions** | User is on deposit screen for a coin. |
| **Test Data** | At least BTC, ETH, USDT. |

**Steps:**

1. Open deposit for BTC; click **Copy** (address or "Copy address").
2. Paste elsewhere; verify pasted value matches displayed address.
3. Repeat for ETH and USDT (and optionally other coins).

**Expected results:**

- Copied value matches displayed address for each coin; no truncation or wrong value.

---

## 2. POSITIVE – CRYPTO WITHDRAW (ALL COINS)

### TC-DW-WTH-01: Withdraw – Withdraw section/page accessible

| Field | Detail |
|-------|--------|
| **Objective** | Verify user can open Withdraw flow (from Wallets or dedicated Withdraw). |
| **Preconditions** | User is logged in. |
| **Test Data** | N/A. |

**Steps:**

1. Navigate to **Wallets** (Crypto) or **Withdraw**.
2. Locate **Withdraw** action (button, tab, or per-coin "Withdraw").
3. Verify withdraw form or coin selection is visible.

**Expected results:**

- Withdraw entry point is visible; user can select coin and proceed.

---

### TC-DW-WTH-02: Withdraw – BTC – form accepts address and amount (happy path)

| Field | Detail |
|-------|--------|
| **Objective** | Verify user can fill BTC withdraw form and submit successfully (if balance allows). |
| **Preconditions** | User has sufficient BTC balance; valid external BTC address available for testing. |
| **Test Data** | Coin: BTC; Amount: e.g. 0.0001 BTC (≥ minimum); Address: valid BTC address (testnet or mainnet per env). |

**Steps:**

1. Open **Withdraw** → select **BTC**.
2. Enter valid BTC withdrawal address.
3. Enter amount (≥ minimum, ≤ balance); verify fee and "You Receive" (if shown).
4. Click **Withdraw** / **Submit**; enter PIN and confirm.
5. Wait for success or pending state (withdraw may be pending approval in some platforms).

**Expected results:**

- Form accepts valid address and amount.
- Submission succeeds or shows "Pending"; no generic error.
- Balance is debited (or reserved) as per product behavior.

---

### TC-DW-WTH-03: Withdraw – ETH – form accepts address and amount (happy path)

| Field | Detail |
|-------|--------|
| **Objective** | Same as TC-DW-WTH-02 for ETH. |
| **Preconditions** | User has sufficient ETH; valid Ethereum address. |
| **Test Data** | Coin: ETH; Amount: e.g. 0.001 ETH; Address: valid 0x address. |

**Steps:**

1. **Withdraw** → **ETH**; enter valid ETH address and amount.
2. Submit (PIN → Confirm); verify success or pending.

**Expected results:**

- ETH withdraw form works; submission succeeds or goes to pending; balance updated accordingly.

---

### TC-DW-WTH-04: Withdraw – USDT – correct network selection and submission

| Field | Detail |
|-------|--------|
| **Objective** | Verify USDT withdraw allows network selection (ERC-20, TRC-20, etc.) and accepts valid address. |
| **Preconditions** | User has USDT balance; platform supports USDT withdraw on one or more networks. |
| **Test Data** | Coin: USDT; Network: e.g. ERC-20; Address: valid for that network; Amount: ≥ minimum. |

**Steps:**

1. **Withdraw** → **USDT**.
2. Select network (e.g. ERC-20 or TRC-20).
3. Enter withdrawal address valid for selected network.
4. Enter amount; submit (PIN → Confirm).
5. Verify success or pending; verify network is shown in confirmation/history.

**Expected results:**

- Network selection is clear; address validation matches selected network.
- Withdraw completes or goes to pending; no wrong-network submission.

---

### TC-DW-WTH-05: Withdraw – all supported coins – form available and validations apply

| Field | Detail |
|-------|--------|
| **Objective** | For every supported withdrawable coin, form loads and validations (min, max, balance) apply. |
| **Preconditions** | User is logged in; list of coins that support withdraw is known. |
| **Test Data** | All withdrawable coins: BTC, ETH, USDT, etc. |

**Steps:**

1. For **each** coin that supports withdraw:
   - Open Withdraw for that coin.
   - Verify: coin name, balance (if shown), amount field, address field, network (if applicable).
   - Enter invalid address (wrong format); verify validation error.
   - Enter amount below minimum; verify minimum validation (if applicable).
   - Enter amount above balance; verify insufficient balance (or max) validation.
2. Optionally perform one successful withdraw per coin if test addresses and balance available.

**Expected results:**

- Every withdrawable coin has a working form.
- Address format validation and amount validations (min, balance/max) work per coin.
- No coin is missing or broken in withdraw list.

---

### TC-DW-WTH-06: Transaction History – withdraw appears with correct type and status

| Field | Detail |
|-------|--------|
| **Objective** | Withdraw appears in Transaction History (or Withdraw History) with correct attributes. |
| **Preconditions** | A withdraw was submitted (completed or pending). |
| **Test Data** | Same coin, amount, and address as submitted. |

**Steps:**

1. Navigate to **Transaction History** (or Withdraw History).
2. Find the withdraw (type: Withdraw; coin; amount).
3. Verify: coin, amount, address (masked or full per product), status (Pending/Completed/Failed), timestamp.
4. Verify ordering (latest first).

**Expected results:**

- Withdraw appears with correct coin, amount, type (Withdraw), and status.
- List is in reverse chronological order.

---

## 3. NEGATIVE – CRYPTO DEPOSIT

### TC-DW-NEG-DEP-01: Deposit – wrong network warning for multi-network coins

| Field | Detail |
|-------|--------|
| **Objective** | For coins on multiple networks (e.g. USDT), UI warns to use correct network. |
| **Preconditions** | User is on USDT (or similar) deposit screen. |
| **Test Data** | Coin: USDT. |

**Steps:**

1. Open **USDT** deposit.
2. Verify visible warning or text (e.g. "Only send USDT on ERC-20 to this address"; "Sending on wrong network may result in loss").
3. Verify network label is prominent (e.g. "USDT (ERC-20)").

**Expected results:**

- Clear warning and network label; user is informed of correct network.

---

### TC-DW-NEG-DEP-02: Deposit – unsupported coin (if applicable)

| Field | Detail |
|-------|--------|
| **Objective** | Coins not supported for deposit are not offered or show clear "Not available". |
| **Preconditions** | List of supported deposit coins is known. |
| **Test Data** | Any coin not in supported list (if UI exposes it). |

**Steps:**

1. Check Wallets/Deposit list; verify only supported coins show active "Deposit".
2. If an unsupported coin appears, open it and verify message like "Deposit not available" (no invalid address shown).

**Expected results:**

- No misleading deposit address for unsupported coins; clear unavailability if shown.

---

## 4. NEGATIVE – CRYPTO WITHDRAW

### TC-DW-NEG-WTH-01: Withdraw – insufficient balance

| Field | Detail |
|-------|--------|
| **Objective** | System prevents withdraw when balance is insufficient. |
| **Preconditions** | User is logged in; crypto balance is known (e.g. 0.001 BTC). |
| **Test Data** | Coin: BTC; Amount: e.g. 1 BTC (above balance). |

**Steps:**

1. Note current balance for coin (e.g. BTC).
2. **Withdraw** → BTC; enter valid address and amount **greater** than balance.
3. Verify "Insufficient balance" (or similar) or disabled Submit.
4. If allowed to submit, verify request is rejected with clear error.

**Expected results:**

- Withdraw is blocked or rejected; no balance debited; clear error message.

---

### TC-DW-NEG-WTH-02: Withdraw – below minimum amount

| Field | Detail |
|-------|--------|
| **Objective** | Below-minimum withdraw is rejected or blocked for each coin. |
| **Preconditions** | User is logged in; minimum withdraw per coin is known (e.g. 0.0001 BTC). |
| **Test Data** | Amount below minimum (e.g. 0.00000001 BTC). |

**Steps:**

1. **Withdraw** → select coin; enter valid address and amount **below** minimum.
2. Verify validation message (e.g. "Minimum withdrawal is 0.0001 BTC") or disabled Submit.
3. Try submit if allowed; verify rejection.

**Expected results:**

- Minimum amount enforced; no withdraw created; balances unchanged.

---

### TC-DW-NEG-WTH-03: Withdraw – invalid address format (per coin)

| Field | Detail |
|-------|--------|
| **Objective** | Invalid address format is rejected for each coin. |
| **Preconditions** | User is on withdraw form for a coin. |
| **Test Data** | Invalid: for BTC – random string, ETH address; for ETH – BTC address, too short; for USDT – wrong network address. |

**Steps:**

1. **Withdraw** → BTC; enter **invalid** address (e.g. "abc", or valid ETH 0x address).
2. Verify validation error (invalid address / wrong network).
3. Repeat for ETH (e.g. BTC address, too short).
4. For USDT: select network (e.g. ERC-20), enter address of different network (e.g. TRC-20); verify error.

**Expected results:**

- Invalid or wrong-network address is rejected before submit; clear error message per coin/network.

---

### TC-DW-NEG-WTH-04: Withdraw – above maximum (if applicable)

| Field | Detail |
|-------|--------|
| **Objective** | If daily/max withdraw limit exists, amount above limit is rejected. |
| **Preconditions** | User is logged in; max withdraw limit is known (e.g. 1 BTC/day). |
| **Test Data** | Amount above max (e.g. 2 BTC when max is 1). |

**Steps:**

1. **Withdraw** → enter amount above maximum limit.
2. Verify validation or rejection message (e.g. "Maximum withdrawal is 1 BTC per day").
3. Verify no withdraw is created.

**Expected results:**

- Max limit enforced; clear message; no partial or over-limit execution.

---

### TC-DW-NEG-WTH-05: Withdraw – PIN required and wrong PIN rejected

| Field | Detail |
|-------|--------|
| **Objective** | Withdraw submission requires PIN; wrong PIN prevents completion. |
| **Preconditions** | User is logged in; PIN is set. |
| **Test Data** | Valid address and amount; wrong PIN (e.g. 000000). |

**Steps:**

1. Fill withdraw form (valid address, amount); click **Withdraw** / **Submit**.
2. Verify PIN step appears.
3. Enter **wrong** PIN; confirm.
4. Verify error (e.g. "Invalid PIN"); withdraw not completed; balance unchanged.
5. Optionally: enter correct PIN and verify withdraw then completes.

**Expected results:**

- PIN is required; wrong PIN blocks withdraw; balance unchanged until correct PIN.

---

### TC-DW-NEG-WTH-06: Withdraw – all coins – invalid address validation per coin

| Field | Detail |
|-------|--------|
| **Objective** | For each withdrawable coin, address format validation is correct (no wrong-network accept). |
| **Preconditions** | User is logged in; list of withdrawable coins known. |
| **Test Data** | Per coin: wrong-format or wrong-network address. |

**Steps:**

1. For **each** withdrawable coin (BTC, ETH, USDT on ERC-20, USDT on TRC-20, etc.):
   - Open Withdraw for that coin/network.
   - Enter address that is valid for **another** coin or network (e.g. ETH address in BTC, BTC address in ETH, TRC-20 address when ERC-20 selected).
   - Verify validation error and that Submit is blocked or request is rejected.
2. Document any coin where wrong-format/wrong-network is incorrectly accepted.

**Expected results:**

- Every coin/network rejects invalid or wrong-network addresses; no mistaken acceptance.

---

## 5. SUMMARY MATRIX – DEPOSIT & WITHDRAW

| ID | Category | Description |
|----|----------|-------------|
| TC-DW-DEP-01 | Deposit Positive | Page loads, deposit section visible |
| TC-DW-DEP-02 | Deposit Positive | BTC – address and QR displayed |
| TC-DW-DEP-03 | Deposit Positive | ETH – address and network displayed |
| TC-DW-DEP-04 | Deposit Positive | USDT – address and network displayed |
| TC-DW-DEP-05 | Deposit Positive | **All coins** – each shows deposit address/QR |
| TC-DW-DEP-06 | Deposit Positive | Copy address works per coin |
| TC-DW-WTH-01 | Withdraw Positive | Withdraw section accessible |
| TC-DW-WTH-02 | Withdraw Positive | BTC – form and submit (happy path) |
| TC-DW-WTH-03 | Withdraw Positive | ETH – form and submit (happy path) |
| TC-DW-WTH-04 | Withdraw Positive | USDT – network selection and submit |
| TC-DW-WTH-05 | Withdraw Positive | **All coins** – form and validations |
| TC-DW-WTH-06 | Withdraw Positive | Transaction History – withdraw appears |
| TC-DW-NEG-DEP-01 | Deposit Negative | Wrong network warning (multi-network) |
| TC-DW-NEG-DEP-02 | Deposit Negative | Unsupported coin not offered / clear message |
| TC-DW-NEG-WTH-01 | Withdraw Negative | Insufficient balance |
| TC-DW-NEG-WTH-02 | Withdraw Negative | Below minimum amount |
| TC-DW-NEG-WTH-03 | Withdraw Negative | Invalid address format (per coin) |
| TC-DW-NEG-WTH-04 | Withdraw Negative | Above maximum (if applicable) |
| TC-DW-NEG-WTH-05 | Withdraw Negative | PIN required; wrong PIN rejected |
| TC-DW-NEG-WTH-06 | Withdraw Negative | **All coins** – invalid address validation |

---

*Document version: 1.0 | Scope: Crypto Deposit & Withdraw (All Coins)*
