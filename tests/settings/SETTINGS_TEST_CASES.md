# Settings – Test Cases (Positive & Negative)

**Feature:** User account settings – profile, security, language, notifications, transaction PIN, and preferences.  
**Scope:** Positive and negative test cases for settings page access, profile updates, language change, security options, and validation.  
**Status:** Documented – **not yet automated** (no spec file).

---

## 1. POSITIVE – SETTINGS PAGE & PROFILE

### TC-SET-POS-01: Settings page loads from navigation

| Field | Detail |
|-------|--------|
| **Objective** | Verify user can access Settings from profile menu or sidebar. |
| **Preconditions** | User is logged in. |
| **Test Data** | N/A. |

**Steps:**

1. Log in with valid credentials (PIN if required).
2. Open **Settings** via avatar menu, gear icon, or sidebar link.
3. Wait for settings page/panel to load.

**Expected results:**

- Settings page loads without error.
- Settings sections visible (Profile, Security, Language, Notifications, etc. as applicable).

---

### TC-SET-POS-02: Profile – view current user information

| Field | Detail |
|-------|--------|
| **Objective** | Verify profile section displays current name, email, phone (read-only or editable). |
| **Preconditions** | User on Settings → Profile. |
| **Test Data** | Known test account data. |

**Steps:**

1. Navigate to **Settings** → **Profile** (or Account).
2. Verify displayed email matches logged-in user.
3. Verify name/phone fields show current values.

**Expected results:**

- Profile data matches account; no other user's data shown.
- Sensitive fields masked if required (e.g. partial phone).

---

### TC-SET-POS-03: Profile – update display name successfully

| Field | Detail |
|-------|--------|
| **Objective** | Verify user can update full name / display name and save. |
| **Preconditions** | Name field is editable. |
| **Test Data** | New name: `Test User Updated`. |

**Steps:**

1. **Settings** → **Profile**; edit **Full Name**.
2. Enter new valid name.
3. Click **Save** / **Update**.
4. Refresh page; verify name persisted.

**Expected results:**

- Success message shown.
- Name updated across profile and header (if shown).
- Change persists after refresh.

---

### TC-SET-POS-04: Language – change application language

| Field | Detail |
|-------|--------|
| **Objective** | Verify user can switch UI language (e.g. English ↔ Spanish). |
| **Preconditions** | Multiple languages supported. |
| **Test Data** | Language: Spanish (or second available locale). |

**Steps:**

1. **Settings** → **Language** (or Preferences).
2. Select second language from dropdown/list.
3. Save if required; wait for UI reload.
4. Verify key labels change language (e.g. Wallets, Buy/Sell).

**Expected results:**

- Language switches without error.
- Selection persists after logout/login (if product stores preference).

---

### TC-SET-POS-05: Security – change password successfully

| Field | Detail |
|-------|--------|
| **Objective** | Verify user can change password with current password verification. |
| **Preconditions** | Change password feature available. |
| **Test Data** | Current password; new strong password (revert after test). |

**Steps:**

1. **Settings** → **Security** → **Change Password**.
2. Enter current password, new password, confirm new password.
3. Submit; verify success.
4. Log out; log in with **new** password (revert in teardown if needed).

**Expected results:**

- Password changed successfully.
- Old password no longer works; new password works.

---

### TC-SET-POS-06: Security – change transaction PIN successfully

| Field | Detail |
|-------|--------|
| **Objective** | Verify user can update 6-digit transaction PIN. |
| **Preconditions** | PIN change supported; current PIN known. |
| **Test Data** | Current PIN; new PIN (revert after test). |

**Steps:**

1. **Settings** → **Security** → **Change PIN**.
2. Enter current PIN, new PIN, confirm new PIN.
3. Save; complete any email/2FA step if required.
4. Perform a transaction requiring PIN with **new** PIN.

**Expected results:**

- PIN updated; old PIN rejected on transactions.
- New PIN accepted.

---

### TC-SET-POS-07: Notifications – toggle email/push preferences

| Field | Detail |
|-------|--------|
| **Objective** | Verify notification toggles save correctly. |
| **Preconditions** | Notification settings exist. |
| **Test Data** | Toggle one option off then on. |

**Steps:**

1. **Settings** → **Notifications**.
2. Toggle e.g. **Email alerts** off → Save.
3. Refresh; verify toggle remains off.
4. Toggle back on → Save.

**Expected results:**

- Toggle state persists after save and refresh.

---

### TC-SET-POS-08: 2FA / Google Authenticator – enable flow (if available)

| Field | Detail |
|-------|--------|
| **Objective** | Verify 2FA setup wizard completes (QR, verify code). |
| **Preconditions** | 2FA optional and test account allows enable/disable. |
| **Test Data** | Authenticator app or test TOTP. |

**Steps:**

1. **Settings** → **Security** → **Enable 2FA**.
2. Scan QR or enter secret; enter verification code.
3. Complete setup; verify 2FA shown as enabled.

**Expected results:**

- 2FA enabled; login may require OTP on next sign-in per product rules.

---

### TC-SET-POS-09: Logout from settings or profile menu

| Field | Detail |
|-------|--------|
| **Objective** | Verify logout ends session from settings area. |
| **Preconditions** | User logged in. |
| **Test Data** | N/A. |

**Steps:**

1. From Settings or profile menu, click **Log out**.
2. Confirm if modal appears.
3. Attempt to access protected route.

**Expected results:**

- User redirected to login; session cleared.
- Protected pages require login again.

---

### TC-SET-POS-10: Settings – API keys / session management view (if available)

| Field | Detail |
|-------|--------|
| **Objective** | Verify API or active sessions list loads for security-conscious users. |
| **Preconditions** | Feature exists on platform. |
| **Test Data** | N/A. |

**Steps:**

1. Open **Settings** → **API** or **Active Sessions**.
2. Verify list or empty state.

**Expected results:**

- Section loads without error; revoke buttons disabled or functional per design.

---

## 2. NEGATIVE – SETTINGS VALIDATIONS & SECURITY

### TC-SET-NEG-01: Profile – empty name on save

| Field | Detail |
|-------|--------|
| **Objective** | Empty name cannot be saved. |
| **Preconditions** | Editable name field. |
| **Test Data** | Name: empty or whitespace only. |

**Steps:**

1. Clear name field; click **Save**.

**Expected results:**

- Validation error; previous name retained.

---

### TC-SET-NEG-02: Profile – invalid phone format

| Field | Detail |
|-------|--------|
| **Objective** | Invalid phone number rejected on profile update. |
| **Preconditions** | Phone field editable. |
| **Test Data** | `abc`, `12`, `+!!!`, too long number. |

**Steps:**

1. Enter invalid phone; save.

**Expected results:**

- Format validation error; no save.

---

### TC-SET-NEG-03: Change password – wrong current password

| Field | Detail |
|-------|--------|
| **Objective** | Password change fails with incorrect current password. |
| **Preconditions** | Change password form open. |
| **Test Data** | Wrong current: `WrongPass@123`; new: valid strong password. |

**Steps:**

1. Enter wrong current password and valid new password.
2. Submit.

**Expected results:**

- Error (e.g. "Current password incorrect"); password unchanged.

---

### TC-SET-NEG-04: Change password – new password mismatch

| Field | Detail |
|-------|--------|
| **Objective** | Confirm password must match new password. |
| **Preconditions** | Change password form open. |
| **Test Data** | New: `New@123456`; Confirm: `New@123457`. |

**Steps:**

1. Enter matching current; mismatched new/confirm.
2. Submit.

**Expected results:**

- "Passwords do not match" validation; no change.

---

### TC-SET-NEG-05: Change password – weak new password

| Field | Detail |
|-------|--------|
| **Objective** | Weak password rejected by policy. |
| **Preconditions** | Password policy enforced. |
| **Test Data** | `123`, `password`, `abc` (no upper/special). |

**Steps:**

1. Enter valid current; weak new password.
2. Submit.

**Expected results:**

- Policy validation message; password unchanged.

---

### TC-SET-NEG-06: Change PIN – wrong current PIN

| Field | Detail |
|-------|--------|
| **Objective** | PIN change fails with wrong current PIN. |
| **Preconditions** | PIN change form available. |
| **Test Data** | Current PIN: `000000` (wrong). |

**Steps:**

1. Enter wrong current PIN and valid new PIN.
2. Submit.

**Expected results:**

- PIN error; PIN unchanged.

---

### TC-SET-NEG-07: Change PIN – new PIN mismatch or invalid length

| Field | Detail |
|-------|--------|
| **Objective** | PIN confirm must match; length must be 6 digits (or product rule). |
| **Preconditions** | PIN change form available. |
| **Test Data** | New: `111111`; Confirm: `111112`; or `12345` (5 digits). |

**Steps:**

1. Test mismatch; then test too short PIN.
2. Submit each case.

**Expected results:**

- Validation errors; PIN unchanged.

---

### TC-SET-NEG-08: Email change – invalid email format (if editable)

| Field | Detail |
|-------|--------|
| **Objective** | Invalid email rejected on profile email change. |
| **Preconditions** | Email change supported. |
| **Test Data** | `not-an-email`, `test@`. |

**Steps:**

1. Attempt to change email to invalid format.
2. Save.

**Expected results:**

- Format validation; email unchanged.

---

### TC-SET-NEG-09: Unauthorized access – settings without login

| Field | Detail |
|-------|--------|
| **Objective** | Settings requires authentication. |
| **Preconditions** | Logged out session. |
| **Test Data** | Direct URL to `/settings`. |

**Steps:**

1. Navigate to settings URL without auth.

**Expected results:**

- Redirect to login; no profile data exposed.

---

### TC-SET-NEG-10: XSS / SQL injection in profile name field

| Field | Detail |
|-------|--------|
| **Objective** | Malicious input in name field is sanitized or rejected. |
| **Preconditions** | Editable name field. |
| **Test Data** | `<script>alert(1)</script>`, `' OR '1'='1`. |

**Steps:**

1. Enter malicious name; save.
2. Reload profile page.

**Expected results:**

- No script execution; stored value escaped or rejected.
- No server error.

---

### TC-SET-NEG-11: Language – unsaved navigation away shows warning (if applicable)

| Field | Detail |
|-------|--------|
| **Objective** | Unsaved profile changes prompt user or are discarded safely. |
| **Preconditions** | Form has dirty state. |
| **Test Data** | Edit name without saving. |

**Steps:**

1. Change name; navigate away without save.
2. Return to profile.

**Expected results:**

- Either unsaved changes warning or revert to saved value; no partial corrupt state.

---

### TC-SET-NEG-12: Disable 2FA without verification blocked (if applicable)

| Field | Detail |
|-------|--------|
| **Objective** | Disabling 2FA requires current 2FA or password confirmation. |
| **Preconditions** | 2FA enabled on account. |
| **Test Data** | N/A. |

**Steps:**

1. Attempt disable 2FA without entering OTP/password.

**Expected results:**

- Action blocked until verification; 2FA remains enabled.

---

## 3. SUMMARY MATRIX – SETTINGS

| ID | Type | Automated |
|----|------|-----------|
| TC-SET-POS-01 to 10 | Positive | No |
| TC-SET-NEG-01 to 12 | Negative | No |

**Suggested spec (future):** `tests/settings/settings.spec.js`  
**Suggested npm script:** `test:settings`
