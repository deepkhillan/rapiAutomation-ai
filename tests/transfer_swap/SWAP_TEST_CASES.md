# Crypto Swap Test Cases (RapiXchange – from screenshots)

## Sign in once

All swap tests use **one sign-in** for the whole run: the `auth-setup` project runs first (login + save storage state to `playwright/.auth/user.json`), then the `authenticated` project runs all swap tests with that stored auth. No login in each test.

---

## Flow from UI

1. **Tap Swapping tab** – Sidebar → "Swapping" (Crypto Swap / Fiat Swap page).
2. **Crypto Swap tab** – Ensure "Crypto Swap" is selected (not Fiat Swap).
3. **Select pair ETH–USDT** – Use **"Choose your asset"** modal for both:
   - **You Pay:** open pay coin selector → modal "Choose your asset" → select **ETH**.
   - **You Receive:** open receive coin selector → same modal → select **USDT** (or USDT-ETH).
4. **You Pay amount** – Enter **0.005** in the "You Pay" / "Enter value" field (ETH).
5. **Click Swap** – Orange "Swap" button at bottom → opens confirmation modal.
6. **Click Continue** – In "Crypto Swap" modal → **Continue**.
7. **Success** – Popup **"Successfully Swap"** and "You have successfully Swap 0.005 ETH"; toast: "Your swap order has been successfully executed."

---

## Insufficient balance

If the pay amount is **greater than available balance** (e.g. 20 ETH when balance is 17.7 ETH):

- Order must **not** be executed.
- User sees validation message: **"Insufficient balance"** (red notification as in screenshot).

---

## Test cases

| Test ID   | Description |
|-----------|-------------|
| **TC-SW-01** | Tap Swapping → Crypto Swap → select ETH, USDT (Choose your asset) → enter 0.005 in You Pay → click Swap → confirmation modal visible |
| **TC-SW-02** | Full flow: ETH→USDT 0.005 → Swap → Continue → assert Successfully Swap popup |
| **TC-SW-03** | After full flow, verify "successfully swap" text on popup to confirm order completed |
| **TC-SW-04** | Swap page loads; Crypto Swap tab and You Pay / You Receive visible |
| **TC-SW-05** | You Pay amount 0.005 accepted; Swap button visible |
| **TC-SW-06** | Insufficient balance: enter 20 ETH (above balance) → validation "Insufficient balance" shown, order not executed |

---

## Run

```bash
npm run test:swap
```

(Runs swap-auth setup once, then all swap tests with stored auth.)
