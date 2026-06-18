# P2P Trading – Test Cases (Positive & Negative)

**Feature:** Peer-to-peer (P2P) crypto/fiat trading – browse ads, place orders, pay/confirm, cancel, and dispute flows.  
**Scope:** Positive and negative test cases for P2P marketplace access, order placement, payment confirmation, cancellation, and validations.  
**Status:** Documented – **not yet automated** (no spec file).

---

## 1. POSITIVE – P2P PAGE & NAVIGATION

### TC-P2P-POS-01: P2P page loads from sidebar

| Field | Detail |
|-------|--------|
| **Objective** | Verify user can access the P2P section from the main navigation. |
| **Preconditions** | User is logged in; P2P is enabled for the account/region. |
| **Test Data** | N/A (page load only). |

**Steps:**

1. Log in with valid credentials and complete PIN if prompted.
2. Locate **P2P** (or **P2P Trading** / **Peer to Peer**) in the sidebar or top navigation.
3. Click the P2P link.
4. Wait for page load (network idle / main content visible).

**Expected results:**

- P2P page loads without error (no 404/500).
- URL contains a P2P-related path (e.g. `/p2p`).
- Main P2P content area is visible (marketplace, buy/sell tabs, or ad list).

---

### TC-P2P-POS-02: P2P marketplace – Buy and Sell tabs visible

| Field | Detail |
|-------|--------|
| **Objective** | Verify P2P marketplace shows Buy and Sell (or equivalent) options. |
| **Preconditions** | User is on P2P page. |
| **Test Data** | N/A. |

**Steps:**

1. Navigate to **P2P**.
2. Verify **Buy** and **Sell** tabs (or toggle) are visible and clickable.
3. Click **Buy** tab – verify buy-side ad list or filters load.
4. Click **Sell** tab – verify sell-side ad list or filters load.

**Expected results:**

- Both Buy and Sell views are accessible.
- Switching tabs updates the ad list or form without error.
- No blank or broken UI after tab switch.

---

### TC-P2P-POS-03: P2P – filter by fiat currency and crypto asset

| Field | Detail |
|-------|--------|
| **Objective** | Verify user can filter P2P ads by fiat (e.g. USD) and crypto (e.g. USDT, BTC). |
| **Preconditions** | User is on P2P marketplace; filters are available. |
| **Test Data** | Fiat: USD; Crypto: USDT (or BTC). |

**Steps:**

1. Open **P2P** → **Buy** tab.
2. Select fiat currency (e.g. USD) from filter/dropdown.
3. Select crypto asset (e.g. USDT) from filter/dropdown.
4. Apply filters and wait for ad list to refresh.

**Expected results:**

- Filter controls are visible and interactive.
- Ad list updates to show matching offers (or empty state if none).
- Selected fiat and crypto are reflected in the UI.

---

### TC-P2P-POS-04: P2P – view merchant/ad details

| Field | Detail |
|-------|--------|
| **Objective** | Verify user can open an ad and see price, limits, payment methods, and merchant info. |
| **Preconditions** | At least one P2P ad is listed. |
| **Test Data** | Any available ad. |

**Steps:**

1. On P2P **Buy** tab, select an ad from the list.
2. Open ad detail (click row or **Buy** / **Trade** button).
3. Verify displayed fields: price/rate, min/max amount, payment method(s), merchant name/rating (if shown), available quantity.

**Expected results:**

- Ad detail panel or page opens without error.
- Price, limits, and payment methods are clearly shown.
- User can proceed to place an order from the detail view.

---

### TC-P2P-POS-05: P2P Buy – place order successfully (happy path)

| Field | Detail |
|-------|--------|
| **Objective** | Verify user can place a P2P buy order within ad limits. |
| **Preconditions** | User is logged in; sufficient balance or payment method as required; valid ad available. |
| **Test Data** | Amount within ad min/max (e.g. 50 USD worth of USDT). |

**Steps:**

1. Navigate to **P2P** → **Buy**; filter and select a suitable ad.
2. Enter amount within min/max limits.
3. Review summary (rate, total, fee if any).
4. Click **Buy** / **Place Order** / **Confirm**.
5. Complete any required steps (payment method selection, PIN, terms checkbox).
6. Wait for order confirmation.

**Expected results:**

- Order is created successfully.
- Success message or order detail page is shown.
- Order appears in **My Orders** / **Order History** with status (e.g. Pending payment / Awaiting release).
- Balances or escrow state updates per product rules.

---

### TC-P2P-POS-06: P2P Sell – place sell order successfully (happy path)

| Field | Detail |
|-------|--------|
| **Objective** | Verify user can place a P2P sell order (or create sell ad) within limits. |
| **Preconditions** | User has sufficient crypto balance; sell flow or ad creation is available. |
| **Test Data** | Amount within limits (e.g. 0.01 BTC or equivalent). |

**Steps:**

1. Navigate to **P2P** → **Sell**.
2. Select ad or create sell order with amount, price, and payment method.
3. Submit order (PIN if required).
4. Verify confirmation and order in history.

**Expected results:**

- Sell order is placed without error.
- Crypto is locked/escrowed or reserved as per platform rules.
- Order visible in P2P order history with correct status.

---

### TC-P2P-POS-07: P2P – mark payment as paid (buyer flow)

| Field | Detail |
|-------|--------|
| **Objective** | Verify buyer can mark fiat payment as completed for a pending P2P buy order. |
| **Preconditions** | A P2P buy order exists in "Awaiting payment" or similar status. |
| **Test Data** | Existing pending buy order. |

**Steps:**

1. Open **P2P** → **My Orders** (or order detail from notification).
2. Select pending buy order.
3. Click **I have paid** / **Mark as paid** (if applicable).
4. Upload proof of payment if required.
5. Confirm action.

**Expected results:**

- Order status updates (e.g. "Paid" / "Awaiting seller release").
- Seller is notified (if product supports notifications).
- No duplicate status change on repeat click.

---

### TC-P2P-POS-08: P2P – seller releases crypto (seller flow)

| Field | Detail |
|-------|--------|
| **Objective** | Verify seller can release crypto after confirming payment. |
| **Preconditions** | Sell order in "Paid" / "Awaiting release" status. |
| **Test Data** | Existing order awaiting release. |

**Steps:**

1. Open **P2P** → **My Orders** as seller.
2. Select order with payment marked paid.
3. Click **Release** / **Confirm received** (PIN if required).
4. Wait for completion.

**Expected results:**

- Order completes successfully.
- Buyer receives crypto; seller receives fiat (or balance updates correctly).
- Order status becomes **Completed**.

---

### TC-P2P-POS-09: P2P – cancel pending order (if supported)

| Field | Detail |
|-------|--------|
| **Objective** | Verify user can cancel a P2P order in cancellable state. |
| **Preconditions** | Order is in Pending / Awaiting payment (before irreversible step). |
| **Test Data** | Cancellable P2P order. |

**Steps:**

1. Open **My Orders** → select cancellable order.
2. Click **Cancel** and confirm in modal.
3. Verify order status and balance/escrow.

**Expected results:**

- Order is cancelled; status shows **Cancelled**.
- Locked funds are returned to available balance.
- No partial or duplicate cancellation.

---

### TC-P2P-POS-10: P2P – transaction history reflects completed P2P trade

| Field | Detail |
|-------|--------|
| **Objective** | Verify completed P2P trade appears in Transaction History with correct attributes. |
| **Preconditions** | A P2P order was completed. |
| **Test Data** | Same order as TC-P2P-POS-08. |

**Steps:**

1. Navigate to **Transaction History** (or P2P order history).
2. Locate the completed P2P transaction.
3. Verify: type (P2P Buy/Sell), asset, amount, counterparty (masked if needed), status **Completed**, timestamp.

**Expected results:**

- P2P transaction is listed with correct type and amounts.
- Status and timestamp match the completed order.

---

## 2. NEGATIVE – P2P VALIDATIONS & EDGE CASES

### TC-P2P-NEG-01: P2P – amount below minimum

| Field | Detail |
|-------|--------|
| **Objective** | System rejects P2P order below ad or platform minimum. |
| **Preconditions** | User on ad detail with known min amount. |
| **Test Data** | Amount below minimum (e.g. 0.01 USD when min is 10 USD). |

**Steps:**

1. Open P2P ad; enter amount **below** minimum.
2. Observe validation or button state; attempt submit if enabled.

**Expected results:**

- Validation message (e.g. "Minimum amount is X") or submit disabled.
- No order created; balances unchanged.

---

### TC-P2P-NEG-02: P2P – amount above maximum / ad limit

| Field | Detail |
|-------|--------|
| **Objective** | System rejects amount above ad max or available quantity. |
| **Preconditions** | Ad has max limit or limited quantity. |
| **Test Data** | Amount above max (e.g. 10,000 USD when max is 500 USD). |

**Steps:**

1. Enter amount above ad maximum.
2. Try to place order.

**Expected results:**

- Validation error or capped amount; order not placed beyond limit.

---

### TC-P2P-NEG-03: P2P – insufficient balance (sell / crypto lock)

| Field | Detail |
|-------|--------|
| **Objective** | Sell order blocked when crypto balance is insufficient. |
| **Preconditions** | User crypto balance is less than sell amount. |
| **Test Data** | Sell amount greater than available balance. |

**Steps:**

1. **P2P** → **Sell**; enter amount above available crypto.
2. Attempt to submit.

**Expected results:**

- "Insufficient balance" (or similar); no order placed.

---

### TC-P2P-NEG-04: P2P – empty or zero amount

| Field | Detail |
|-------|--------|
| **Objective** | Empty or zero amount cannot submit P2P order. |
| **Preconditions** | User on P2P order form. |
| **Test Data** | Amount: empty, 0, 0.00. |

**Steps:**

1. Leave amount empty; verify submit disabled or validation.
2. Enter **0**; verify same.

**Expected results:**

- Submit blocked or validation shown; no order created.

---

### TC-P2P-NEG-05: P2P – invalid counterparty / blocked merchant

| Field | Detail |
|-------|--------|
| **Objective** | Trading with invalid or blocked counterparty is prevented. |
| **Preconditions** | Platform supports merchant block list or invalid ad state. |
| **Test Data** | Blocked merchant ad or removed ad. |

**Steps:**

1. Attempt to trade on a removed, expired, or blocked ad (if testable).
2. Observe error handling.

**Expected results:**

- Clear error (e.g. "Ad no longer available"); no order placed.

---

### TC-P2P-NEG-06: P2P – wrong PIN on confirm/release

| Field | Detail |
|-------|--------|
| **Objective** | Wrong transaction PIN rejects release or order confirmation. |
| **Preconditions** | PIN required for P2P confirm/release. |
| **Test Data** | PIN: 000000 (incorrect). |

**Steps:**

1. Initiate release or confirm requiring PIN.
2. Enter **wrong PIN**; submit.

**Expected results:**

- PIN error shown; action not completed; order state unchanged.

---

### TC-P2P-NEG-07: P2P – cancel completed order not allowed

| Field | Detail |
|-------|--------|
| **Objective** | Completed or released orders cannot be cancelled. |
| **Preconditions** | Order in **Completed** status. |
| **Test Data** | Completed P2P order. |

**Steps:**

1. Open completed order detail.
2. Verify **Cancel** is hidden or disabled; attempt cancel if visible.

**Expected results:**

- Cancel not available or rejected; order remains Completed.

---

### TC-P2P-NEG-08: P2P – duplicate "mark as paid" does not double-credit

| Field | Detail |
|-------|--------|
| **Objective** | Repeated "I have paid" does not corrupt order or balances. |
| **Preconditions** | Order already marked paid. |
| **Test Data** | Paid P2P order. |

**Steps:**

1. Mark order as paid once (success).
2. Refresh page; attempt **Mark as paid** again if button still visible.

**Expected results:**

- No duplicate credit/release; idempotent state; clear UI for next step only.

---

### TC-P2P-NEG-09: P2P – unsupported payment method selection

| Field | Detail |
|-------|--------|
| **Objective** | User cannot select payment method not offered by the ad. |
| **Preconditions** | Ad lists specific payment methods only. |
| **Test Data** | Payment method not in ad list. |

**Steps:**

1. On order form, verify only ad-supported payment methods are selectable.
2. If custom method input exists, enter unsupported method.

**Expected results:**

- Only valid methods selectable; invalid selection blocked with validation.

---

### TC-P2P-NEG-10: P2P – page refresh during pending order does not duplicate

| Field | Detail |
|-------|--------|
| **Objective** | Refreshing during pending P2P order does not create duplicate orders. |
| **Preconditions** | One P2P order in pending state. |
| **Test Data** | Single pending order. |

**Steps:**

1. Place P2P order (pending state).
2. Refresh browser on order detail or history page.
3. Count orders and verify balances.

**Expected results:**

- Exactly one order in history; no duplicate debit/credit.

---

## 3. SUMMARY MATRIX – P2P

| ID | Type | Automated |
|----|------|-----------|
| TC-P2P-POS-01 to 10 | Positive | No |
| TC-P2P-NEG-01 to 10 | Negative | No |

**Suggested spec (future):** `tests/p2p/p2p.spec.js`  
**Suggested npm script:** `test:p2p`
