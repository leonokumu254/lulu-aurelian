# Payment Gateway Integration Architecture

To move from our instant-mocked payments to **real, fully functional payment processing**, you need to connect the application to the official Safaricom Daraja and PayPal APIs. 

Here is exactly what is required for both gateways and how the backend will handle and store the transactions.

---

## 1. M-Pesa STK Push (Safaricom Daraja)

To trigger a real STK Push on the client's phone, the backend must communicate directly with Safaricom.

### What you need from the Daraja Portal:
1. **Developer Account:** Register at [developer.safaricom.co.ke](https://developer.safaricom.co.ke/).
2. **Create an App:** Create a new App to receive your **Consumer Key** and **Consumer Secret**.
3. **Paybill/Till Credentials:** You need your **ShortCode** (Paybill/Till number) and your **Passkey** (Safaricom provides this when you go live).

### How the backend flow works:
1. **Auth:** Backend uses Consumer Key & Secret to request an OAuth Access Token from Safaricom.
2. **STK Push Request:** Backend sends a request to Daraja (`/mpesa/stkpush/v1/processrequest`) containing the client's phone number, amount, and a **Callback URL**.
3. **The Webhook (Crucial Step):** Safaricom processes the PIN entry on the client's phone asynchronously. Once the client enters their PIN, Safaricom sends a JSON payload to your **Callback URL** (which we already partially built as `POST /api/bookings/webhook/mpesa`).
4. **Validation:** The backend verifies the payload, extracts the M-Pesa Receipt Number, saves the payment in the database, and automatically changes the booking to `PAID`.

> [!WARNING]
> Your Callback URL *must* be publicly accessible on the internet (e.g., `https://your-domain.com/api/bookings/webhook/mpesa`) and secured with an SSL certificate, otherwise Safaricom cannot send the success confirmation!

---

## 2. PayPal / Credit Card Checkout

To process real international cards via PayPal, you will use the **PayPal REST APIs (v2)**.

### What you need from PayPal:
1. **Developer Account:** Go to [developer.paypal.com](https://developer.paypal.com/) and log in with your business account.
2. **Create an App:** Create a REST API App to receive your **Client ID** and **Client Secret**.

### How the backend flow works:
1. **Create Order:** When the user clicks "Pay with PayPal", the backend sends a request to PayPal to create an Order and returns an `approve_url`.
2. **Client Approval:** The frontend redirects the user to PayPal (or opens a secure popup) where they log in or enter their credit card details.
3. **Capture Payment:** After the user approves, PayPal redirects them back to your site. Your backend then calls the `Capture Order` API.
4. **Validation:** If the capture is successful, the backend receives a PayPal Transaction ID, saves it to the database, and marks the booking as `PAID`.

---

## 3. Storing Payments in the Database

Currently, the system only changes the booking status. To properly track accounting, we need a dedicated `payments` table. 

I have generated a new SQL schema update for you in your codebase: `database_updates.sql`.

### The `payments` table will track:
* **`booking_id`**: Links the payment to the specific reservation.
* **`amount`**: The exact amount paid.
* **`gateway`**: Whether it was MPESA or PAYPAL.
* **`transaction_ref`**: The official M-Pesa Receipt string (e.g., `QEW3ER45T`) or PayPal Capture ID.
* **`status`**: PENDING, COMPLETED, or FAILED.

### The New Backend Approval Flow:
1. Guest clicks "Pay Now".
2. Backend creates a `payments` row with status `PENDING`.
3. Gateway processes the money.
4. Gateway fires a success webhook to the backend.
5. Backend updates the `payments` row to `COMPLETED` and saves the official `transaction_ref`.
6. Backend updates the `bookings` table to `PAID` and dispatches the final WhatsApp confirmation.
