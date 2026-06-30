import { env } from '../config/env.js';

/**
 * Stanbic Bank Kenya — Kilele API
 * ─────────────────────────────────────────────────────────────────
 * STK Push (M-Pesa Checkout):
 *   Sandbox base: https://sandbox.connect.stanbicbank.co.ke
 *   Endpoint:     POST /api/sandbox/mpesa-checkout/
 *   Auth:         OAuth2 Bearer Token (client_credentials)
 *   Token URL:    /api/sandbox/auth/oauth2/token
 *   Auth Header:  "Auth: Bearer <token>"
 *
 * Transaction Notification (Callback to your server):
 *   Stanbic POSTs to your CallbackUrl with OutboundTransactionNotificationRequest
 *   Your server must respond: { "ResultCode": 0, "ResultDesc": "Accepted" }
 *   Security: X-IBM-Client-Id header (your Client Key)
 *
 * Request body fields (exact names from spec):
 *   dbsReferenceId  — your unique reference per request (idempotency key)
 *   billAccountRef  — your Stanbic Paybill account number (provided by bank)
 *   amount          — string e.g. "5500.00"
 *   mobileNumber    — "254712XXXXXX" format
 *
 * Callback payload fields (OutboundTransactionNotificationRequest):
 *   TransID           — Stanbic/M-Pesa transaction reference (your audit key)
 *   TransAmount       — e.g. "KES 5,500.00"
 *   BillRefNumber     — the PAYER.REF / your dbsReferenceId that you sent
 *   MSISDN            — customer phone
 *   ThirdPartyTransID — M-Pesa receipt number
 *   TransTime, TransactionType, BusinessShortCode, BusinessAccountNo, etc.
 *
 * Support: kilele@stanbic.com
 */

const SANDBOX_BASE = 'https://sandbox.connect.stanbicbank.co.ke';
const LIVE_BASE    = 'https://api.connect.stanbicbank.co.ke'; // Confirm live URL from Kilele portal when going live

class StanbicService {
  constructor() {
    this.clientKey     = env.STANBIC_CLIENT_KEY    || process.env.STANBIC_CLIENT_KEY    || '';
    this.clientSecret  = env.STANBIC_CLIENT_SECRET || process.env.STANBIC_CLIENT_SECRET || '';
    this.billAccountRef = env.STANBIC_SHORTCODE    || process.env.STANBIC_SHORTCODE     || ''; // Paybill account number from bank
    this.isSandbox     = env.NODE_ENV !== 'production';
    this.baseUrl       = this.isSandbox ? SANDBOX_BASE : LIVE_BASE;
  }

  // ────────────────────────────────────────────────────────────────
  // Step 1 — Obtain OAuth2 Bearer Token
  // POST /api/sandbox/auth/oauth2/token
  // Header: Authorization: Basic base64(clientKey:clientSecret)
  // Body:   grant_type=client_credentials
  // ────────────────────────────────────────────────────────────────
  async getAccessToken() {
    const credentials = Buffer.from(`${this.clientKey}:${this.clientSecret}`).toString('base64');
    const tokenPath = this.isSandbox
      ? '/api/sandbox/auth/oauth2/token'
      : '/api/auth/oauth2/token'; // Confirm live path from Kilele portal

    const response = await fetch(`${this.baseUrl}${tokenPath}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`[STANBIC AUTH]: Token fetch failed — ${data.error_description || data.message || JSON.stringify(data)}`);
    }

    return data.access_token;
  }

  // ────────────────────────────────────────────────────────────────
  // Step 2 — Initiate STK Push
  // POST /api/sandbox/mpesa-checkout/
  // Header: Auth: Bearer <token>
  //
  // @param mobileNumber  — customer phone in 254XXXXXXXXX format
  // @param amount        — integer KES amount
  // @param dbsReferenceId — your unique reference (use booking ID prefix)
  // ────────────────────────────────────────────────────────────────
  async initiateSTKPush(mobileNumber, amount, dbsReferenceId) {
    const token = await this.getAccessToken();

    // Normalize phone to 254XXXXXXXXX
    let phone = mobileNumber.replace(/[^0-9]/g, '');
    if (phone.startsWith('0'))  phone = '254' + phone.slice(1);
    if (phone.startsWith('+'))  phone = phone.slice(1);

    const stkPath = this.isSandbox
      ? '/api/sandbox/mpesa-checkout/'
      : '/api/mpesa-checkout/'; // Confirm live path

    const payload = {
      dbsReferenceId:  dbsReferenceId,         // your idempotency key / booking ref
      billAccountRef:  this.billAccountRef,     // Paybill account number from bank
      amount:          String(Math.ceil(amount) + '.00'), // spec expects string e.g. "5500.00"
      mobileNumber:    phone                    // 254712XXXXXX
    };

    console.log(`[STANBIC STK]: Initiating push → phone: ${phone}, amount: ${payload.amount}, ref: ${dbsReferenceId}`);

    const response = await fetch(`${this.baseUrl}${stkPath}`, {
      method: 'POST',
      headers: {
        'Auth':          `Bearer ${token}`,  // spec uses "Auth" not "Authorization"
        'Content-Type':  'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok || (data.responseCode && data.responseCode !== '0')) {
      throw new Error(`[STANBIC STK]: Push failed — ${data.responseMessage || data.statusMessage || JSON.stringify(data)}`);
    }

    // Success response: { dbsReferenceId, status: "Success", statusMessage: "Request processed successfully" }
    return {
      success:        true,
      transactionId:  data.dbsReferenceId,  // echoes back your reference
      status:         data.status,
      statusMessage:  data.statusMessage,
      raw:            data
    };
  }

  // ────────────────────────────────────────────────────────────────
  // Step 3 — Verify incoming Transaction Notification callback
  //
  // Stanbic sends X-IBM-Client-Id header = your Client Key
  // Callback payload is OutboundTransactionNotificationRequest:
  //   TransID         — Stanbic transaction reference
  //   BillRefNumber   — the dbsReferenceId you sent (matches your booking ref)
  //   TransAmount     — e.g. "KES 5,500.00"
  //   MSISDN          — payer phone number
  //   ThirdPartyTransID — M-Pesa receipt number
  //
  // Your server must respond: { "ResultCode": 0, "ResultDesc": "Accepted" }
  // ────────────────────────────────────────────────────────────────
  verifyCallbackClientId(req) {
    const incomingClientId = req.headers['x-ibm-client-id'];
    if (!incomingClientId || incomingClientId !== this.clientKey) {
      return false;
    }
    return true;
  }
}

export const stanbicService = new StanbicService();
