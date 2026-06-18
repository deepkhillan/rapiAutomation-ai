# Invite Friends / Referral – Test Cases (Positive & Negative)

**Feature:** Referral program – invite link/code, share options, invite by email, referral stats, and rewards tracking.  
**Scope:** Positive and negative test cases for invite page access, link/code visibility, sharing, email invite, and validation.  
**Status:** Documented – **not yet automated** (no spec file).

---

## 1. POSITIVE – INVITE PAGE & REFERRAL ASSETS

### TC-INV-POS-01: Invite Friends page loads from navigation

| Field | Detail |
|-------|--------|
| **Objective** | Verify user can access Invite Friends / Referral page. |
| **Preconditions** | User is logged in; referral program is enabled. |
| **Test Data** | N/A. |

**Steps:**

1. Log in with valid credentials (PIN if required).
2. Locate **Invite Friends**, **Referral**, or **Refer & Earn** in sidebar/menu.
3. Click link and wait for page load.

**Expected results:**

- Invite page loads without error.
- URL contains invite/referral-related path.
- Main invite content is visible (link, code, or share section).

---

### TC-INV-POS-02: Referral link is visible and copyable

| Field | Detail |
|-------|--------|
| **Objective** | Verify unique referral link is displayed and can be copied. |
| **Preconditions** | User on Invite Friends page. |
| **Test Data** | N/A. |

**Steps:**

1. Navigate to **Invite Friends**.
2. Locate referral **link** (URL containing referral code or user id).
3. Click **Copy** (or copy icon) if available.
4. Verify clipboard or "Copied" toast (if testable).

**Expected results:**

- Referral link is visible and formatted as valid URL.
- Copy action succeeds with user feedback.
- Link is unique to logged-in user (stable across sessions).

---

### TC-INV-POS-03: Referral code is visible and copyable

| Field | Detail |
|-------|--------|
| **Objective** | Verify referral code (alphanumeric) is shown and copyable. |
| **Preconditions** | Product displays separate referral code (not only link). |
| **Test Data** | N/A. |

**Steps:**

1. On Invite page, find **Referral Code** field or label.
2. Verify code format (e.g. 6–12 alphanumeric characters).
3. Copy code via copy button.

**Expected results:**

- Code is visible and matches code embedded in referral link (if both exist).
- Copy works; no empty or placeholder code.

---

### TC-INV-POS-04: Share options (social / native share) visible

| Field | Detail |
|-------|--------|
| **Objective** | Verify share buttons or share sheet options are available. |
| **Preconditions** | Invite page includes share UI. |
| **Test Data** | N/A. |

**Steps:**

1. On Invite page, locate share buttons (e.g. WhatsApp, Telegram, Email, **Share**).
2. Click one share option (non-destructive – cancel external share if opened).

**Expected results:**

- Share controls are visible and clickable.
- Pre-filled message contains referral link or code.
- No JS error on click.

---

### TC-INV-POS-05: Invite by email – valid email sends successfully

| Field | Detail |
|-------|--------|
| **Objective** | Verify user can send invite to a valid email address. |
| **Preconditions** | Invite-by-email form exists; rate limits not exceeded. |
| **Test Data** | Valid email: e.g. `invite.test@example.com`. |

**Steps:**

1. Open **Invite Friends** → email invite section.
2. Enter valid email address.
3. Click **Send Invite** / **Submit**.
4. Wait for success message.

**Expected results:**

- Success toast or confirmation (e.g. "Invitation sent").
- Email field clears or shows sent state.
- No server error.

---

### TC-INV-POS-06: Referral stats / invited users list visible

| Field | Detail |
|-------|--------|
| **Objective** | Verify referral dashboard shows stats (invited count, rewards, pending). |
| **Preconditions** | User has referral history or empty state UI. |
| **Test Data** | N/A. |

**Steps:**

1. On Invite page, locate stats: total invites, successful signups, rewards earned.
2. If list exists, verify table/cards render (even if empty).

**Expected results:**

- Stats section loads without error.
- Empty state message shown when no referrals (if applicable).
- Numbers are non-negative and consistent with list count.

---

### TC-INV-POS-07: Referral terms / how-it-works section visible

| Field | Detail |
|-------|--------|
| **Objective** | Verify program rules or FAQ are accessible. |
| **Preconditions** | Product shows referral program details. |
| **Test Data** | N/A. |

**Steps:**

1. On Invite page, find **How it works**, **Terms**, or FAQ accordion.
2. Expand or scroll to read rules (reward amount, eligibility).

**Expected results:**

- Program rules are visible and readable.
- No broken links in terms section.

---

### TC-INV-POS-08: Referral link works for new signup (end-to-end)

| Field | Detail |
|-------|--------|
| **Objective** | Verify referral code in signup attributes new user to referrer. |
| **Preconditions** | Signup with referral code/link supported; test referrer account exists. |
| **Test Data** | New user email (unique); referrer's code/link. |

**Steps:**

1. Copy referral link from referrer account.
2. Open link in new session/incognito → land on signup with code pre-filled.
3. Complete valid signup.
4. Log in as referrer → check invited users / stats increment.

**Expected results:**

- Referral code pre-filled or applied from URL.
- New user signup succeeds.
- Referrer stats update (pending or confirmed per business rules).

---

## 2. NEGATIVE – INVITE & REFERRAL VALIDATIONS

### TC-INV-NEG-01: Invite by email – empty email

| Field | Detail |
|-------|--------|
| **Objective** | Empty email cannot submit invite. |
| **Preconditions** | Email invite form visible. |
| **Test Data** | Email: empty. |

**Steps:**

1. Leave email field empty.
2. Click **Send Invite**.

**Expected results:**

- Validation error (e.g. "Email is required") or button disabled.
- No invite sent.

---

### TC-INV-NEG-02: Invite by email – invalid email format

| Field | Detail |
|-------|--------|
| **Objective** | Invalid email formats are rejected. |
| **Preconditions** | Email invite form visible. |
| **Test Data** | `invalid-email`, `test@`, `@example.com`, `test @mail.com`. |

**Steps:**

1. Enter each invalid email; attempt submit.
2. Verify validation per format.

**Expected results:**

- Format validation error; submit blocked.
- No invite sent for invalid formats.

---

### TC-INV-NEG-03: Invite by email – duplicate invite to same address

| Field | Detail |
|-------|--------|
| **Objective** | Duplicate invite to same email is handled (blocked or idempotent message). |
| **Preconditions** | Invite already sent to test email in last 24h (or per product rules). |
| **Test Data** | Same email as TC-INV-POS-05. |

**Steps:**

1. Send invite to email that was already invited.
2. Send again immediately.

**Expected results:**

- Message such as "Already invited" or success without duplicate spam.
- No duplicate entries in sent list (or clear duplicate indicator).

---

### TC-INV-NEG-04: Invite self (own email)

| Field | Detail |
|-------|--------|
| **Objective** | User cannot invite their own registered email. |
| **Preconditions** | Logged-in user email is known. |
| **Test Data** | Recipient = logged-in user's email. |

**Steps:**

1. Enter **own email** in invite form.
2. Submit.

**Expected results:**

- Error (e.g. "Cannot invite yourself"); no invite sent.

---

### TC-INV-NEG-05: Invite already registered user

| Field | Detail |
|-------|--------|
| **Objective** | Inviting an existing platform user is rejected or handled gracefully. |
| **Preconditions** | Target email already has an account. |
| **Test Data** | Existing user email on platform. |

**Steps:**

1. Enter email of existing user.
2. Submit invite.

**Expected results:**

- Error or info message (e.g. "User already registered").
- No false success; referrer stats unchanged incorrectly.

---

### TC-INV-NEG-06: Invalid referral code at signup

| Field | Detail |
|-------|--------|
| **Objective** | Invalid referral code on signup shows validation. |
| **Preconditions** | Signup page has optional referral code field. |
| **Test Data** | Code: `INVALID999`, `!!!`, empty with forced invalid URL param. |

**Steps:**

1. Open signup; enter invalid referral code manually or via bad URL param.
2. Complete other valid fields; submit.

**Expected results:**

- Invalid code error or code ignored with clear message.
- Signup blocked or proceeds without invalid referral attribution.

---

### TC-INV-NEG-07: XSS / SQL injection in invite email field

| Field | Detail |
|-------|--------|
| **Objective** | Malicious input in email field is sanitized and rejected. |
| **Preconditions** | Email invite form visible. |
| **Test Data** | `<script>alert(1)</script>@test.com`, `' OR '1'='1@test.com`. |

**Steps:**

1. Enter malicious strings in email field.
2. Submit.

**Expected results:**

- No script execution; validation error or safe rejection.
- No server 500 error.

---

### TC-INV-NEG-08: Rate limit – excessive invites

| Field | Detail |
|-------|--------|
| **Objective** | Platform enforces rate limit on bulk invites (if applicable). |
| **Preconditions** | Rate limiting enabled. |
| **Test Data** | Many rapid invite submissions (e.g. 10+ in 1 minute). |

**Steps:**

1. Send multiple invites in quick succession (different valid emails).
2. Observe after threshold.

**Expected results:**

- Rate limit message after threshold; further invites blocked temporarily.
- No application crash.

---

### TC-INV-NEG-09: Unauthorized access – invite page without login

| Field | Detail |
|-------|--------|
| **Objective** | Invite Friends page requires authentication. |
| **Preconditions** | User is logged out. |
| **Test Data** | Direct URL to `/invite` or similar. |

**Steps:**

1. Clear session / open incognito.
2. Navigate directly to invite/referral URL.

**Expected results:**

- Redirect to login or access denied.
- Referral link/code not exposed without auth.

---

### TC-INV-NEG-10: Copy referral link – page works without clipboard API failure breaking UI

| Field | Detail |
|-------|--------|
| **Objective** | Copy failure (permissions) shows fallback, not silent failure. |
| **Preconditions** | Browser may deny clipboard (optional simulated). |
| **Test Data** | N/A. |

**Steps:**

1. Click copy on referral link.
2. If copy fails, verify user sees error or manual select fallback.

**Expected results:**

- User feedback on success or failure; link remains selectable manually.

---

## 3. SUMMARY MATRIX – INVITE FRIENDS

| ID | Type | Automated |
|----|------|-----------|
| TC-INV-POS-01 to 08 | Positive | No |
| TC-INV-NEG-01 to 10 | Negative | No |

**Suggested spec (future):** `tests/invite_friends/invite_friends.spec.js`  
**Suggested npm script:** `test:invite`
