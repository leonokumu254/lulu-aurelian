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
   * @param {string} phoneNumber  - Customer phone (e.g. '0712345678' or '254712345678')
   * @param {number} amount       - Payment amount in KES
   * @param {string} reference    - Unique external reference (e.g. booking ID)
   * @param {string} customerName - Customer name (optional, for PayHero dashboard tracking)
   * @returns {{ success: boolean, transactionReference: string, data: object }}
   */
  async initiateSTKPush(phoneNumber, amount, reference, customerName = '') {
    const formattedPhone = this.formatPhone(phoneNumber);

    const payload = {
      amount: Math.ceil(amount),
      phone_number: formattedPhone,
      channel_id: this.channelId,
      provider: 'm-pesa',
      external_reference: reference,
      callback_url: this.callbackUrl,
      customer_name: customerName || ''
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
        let errMsg = data.message || data.error || data.detail;
        if (response.status === 401) {
          errMsg = `PayHero authentication failed (HTTP 401): ${errMsg || 'Unable to perform request'}. Please verify your PayHero API credentials and account status.`;
        } else if (!errMsg) {
          errMsg = `PayHero STK Push failed (HTTP ${response.status})`;
        }
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
      // Try multiple query parameter names since PayHero may accept different identifiers
      const queryUrls = [
        `${this.baseUrl}/transactions?checkout_request_id=${encodeURIComponent(reference)}`,
        `${this.baseUrl}/transactions?reference=${encodeURIComponent(reference)}`
      ];

      let data = {};
      let response = null;

      for (const url of queryUrls) {
        console.log(`[PAYHERO]: Querying transaction status — ${url}`);
        response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': this.getAuthHeader(),
            'Content-Type': 'application/json'
          }
        });

        const rawText = await response.text();
        try {
          data = rawText ? JSON.parse(rawText) : {};
        } catch (e) {
          throw new Error(`Invalid response from PayHero Status Query (HTTP ${response.status}): ${rawText.slice(0, 300) || 'Empty body'}`);
        }

        console.log(`[PAYHERO]: Status Query response (HTTP ${response.status}):`, JSON.stringify(data).slice(0, 500));

        // If we got a successful response (not 404), use it
        if (response.ok || response.status !== 404) {
          break;
        }
      }

      if (!response.ok) {
        if (response.status === 404) {
          return { status: 'PENDING', data };
        }
        throw new Error(data.message || data.error || `PayHero Status Query failed (HTTP ${response.status})`);
      }

      // Check all possible status locations (objects, nested response, arrays, data)
      const resObj = Array.isArray(data.response)
        ? data.response[0]
        : (data.response || (Array.isArray(data.data) ? data.data[0] : (data.data || data)));

      const rawStatus = (resObj && (resObj.status || resObj.Status || resObj.payment_status || resObj.PaymentStatus || resObj.state || resObj.State))
        || data.status || data.Status || data.payment_status || '';

      const payHeroStatus = String(rawStatus || '').toUpperCase();

      let normalizedStatus;
      if (['SUCCESS', 'COMPLETED', 'PAID', 'TRUE'].includes(payHeroStatus) || data.success === true || (resObj && (resObj.success === true || resObj.status === true))) {
        normalizedStatus = 'COMPLETED';
      } else if (['FAILED', 'DECLINED'].includes(payHeroStatus)) {
        normalizedStatus = 'FAILED';
      } else if (['CANCELLED', 'TIMEOUT', 'EXPIRED'].includes(payHeroStatus)) {
        normalizedStatus = 'CANCELLED';
      } else {
        normalizedStatus = 'PENDING';
      }

      console.log(`[PAYHERO]: Transaction ${reference} status resolved to: ${normalizedStatus}`);

      return {
        status: normalizedStatus,
        mpesaReceiptNumber: (resObj && (resObj.provider_reference || resObj.MpesaReceiptNumber || resObj.mpesa_reference || resObj.Receipt)) || null,
        data
      };
    } catch (err) {
      console.error('[PAYHERO]: Status Query Error:', err.message);
      return { status: 'PENDING', data: { error: err.message } };
    }
  }

  /**
   * Format phone number to international Kenyan format (254XXXXXXXXX) as PayHero expects.
   * Accepts: '0712345678', '+254712345678', '254712345678', '712345678'
   */
  formatPhone(phone) {
    let p = (phone || '').replace(/[^0-9]/g, '');
    if (p.startsWith('0')) {
      p = '254' + p.slice(1);
    } else if (!p.startsWith('254') && (p.startsWith('7') || p.startsWith('1'))) {
      p = '254' + p;
    }
    return p;
  }
}

export const payheroService = new PayHeroService();
