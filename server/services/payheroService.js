import { env } from '../config/env.js';

class PayHeroService {
  constructor() {
    this.apiUsername = env.PAYHERO_API_USERNAME || '';
    this.apiKey = env.PAYHERO_API_KEY || '';
    this.channelId = parseInt(env.PAYHERO_CHANNEL_ID, 10) || 0;
    this.callbackUrl = env.PAYHERO_CALLBACK_URL || 'https://www.luluaurelian.co.ke/api/payments/payhero/callback';
    this.baseUrl = 'https://backend.payhero.co.ke/api/v2';
  }

  /**
   * Generate Basic Auth header from API credentials.
   */
  getAuthHeader() {
    const token = Buffer.from(`${this.apiUsername}:${this.apiKey}`).toString('base64');
    return `Basic ${token}`;
  }

  /**
   * Initiate an M-Pesa STK Push via PayHero.
   *
   * @param {string} phoneNumber - Customer phone (e.g. '0712345678' or '254712345678')
   * @param {number} amount      - Payment amount in KES
   * @param {string} reference   - Unique external reference (e.g. booking ID)
   * @returns {{ success: boolean, transactionReference: string, data: object }}
   */
  async initiateSTKPush(phoneNumber, amount, reference) {
    const formattedPhone = this.formatPhone(phoneNumber);

    const payload = {
      amount: Math.ceil(amount),
      phone_number: formattedPhone,
      channel_id: this.channelId,
      provider: 'm-pesa',
      external_reference: reference,
      callback_url: this.callbackUrl,
      customer_name: ''
    };

    try {
      console.log(`[PAYHERO]: Initiating STK Push — Phone: ${formattedPhone}, Amount: ${amount}, Ref: ${reference}`);

      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const rawText = await response.text();
      let data = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (e) {
        throw new Error(`Invalid response from PayHero STK Push (HTTP ${response.status}): ${rawText.slice(0, 300) || 'Empty body'}`);
      }

      if (!response.ok) {
        const errMsg = data.message || data.error || data.detail || `PayHero STK Push failed (HTTP ${response.status})`;
        throw new Error(errMsg);
      }

      console.log(`[PAYHERO]: STK Push initiated successfully — Response:`, JSON.stringify(data));

      // PayHero returns a reference we can use to track the transaction
      // The exact field varies — common fields: reference, checkout_request_id, transaction_reference
      const transactionReference = data.reference || data.checkout_request_id || data.transaction_reference || reference;

      return {
        success: true,
        transactionReference,
        // Also expose as checkoutRequestId for backward compatibility with the existing flow
        checkoutRequestId: transactionReference,
        data
      };
    } catch (err) {
      console.error('[PAYHERO]: STK Push Error:', err.message);
      throw err;
    }
  }

  /**
   * Query the status of a PayHero transaction.
   *
   * @param {string} reference - The transaction reference or external_reference
   * @returns {{ status: string, data: object }}
   */
  async queryTransactionStatus(reference) {
    try {
      const response = await fetch(`${this.baseUrl}/transactions?reference=${encodeURIComponent(reference)}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });

      const rawText = await response.text();
      let data = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (e) {
        throw new Error(`Invalid response from PayHero Status Query (HTTP ${response.status}): ${rawText.slice(0, 300) || 'Empty body'}`);
      }

      if (!response.ok) {
        // If the transaction is not found or still processing, treat as PENDING
        if (response.status === 404) {
          return { status: 'PENDING', data };
        }
        throw new Error(data.message || data.error || `PayHero Status Query failed (HTTP ${response.status})`);
      }

      // Normalize PayHero status to our internal statuses
      // PayHero typically returns: SUCCESS, FAILED, PENDING, CANCELLED
      const payHeroStatus = (data.status || data.payment_status || '').toUpperCase();

      let normalizedStatus;
      if (payHeroStatus === 'SUCCESS' || payHeroStatus === 'COMPLETED') {
        normalizedStatus = 'COMPLETED';
      } else if (payHeroStatus === 'FAILED' || payHeroStatus === 'DECLINED') {
        normalizedStatus = 'FAILED';
      } else if (payHeroStatus === 'CANCELLED') {
        normalizedStatus = 'CANCELLED';
      } else {
        normalizedStatus = 'PENDING';
      }

      return {
        status: normalizedStatus,
        mpesaReceiptNumber: data.provider_reference || data.mpesa_reference || data.MpesaReceiptNumber || null,
        data
      };
    } catch (err) {
      console.error('[PAYHERO]: Status Query Error:', err.message);
      // Return PENDING on errors so the frontend keeps polling
      return { status: 'PENDING', data: { error: err.message } };
    }
  }

  /**
   * Format phone number to local Kenyan format (07xxxxxxxx) as PayHero expects.
   * Accepts: '0712345678', '+254712345678', '254712345678', '712345678'
   */
  formatPhone(phone) {
    let p = (phone || '').replace(/[^0-9]/g, '');
    if (p.startsWith('254')) p = '0' + p.slice(3);
    if (!p.startsWith('0')) p = '0' + p;
    return p;
  }
}

export const payheroService = new PayHeroService();
