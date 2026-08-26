import crypto from 'crypto';
import { env } from '../config/env.js';

class MpesaService {
  constructor() {
    this.consumerKey = env.MPESA_CONSUMER_KEY || 'YOUR_APP_CONSUMER_KEY';
    this.consumerSecret = env.MPESA_CONSUMER_SECRET || 'YOUR_APP_CONSUMER_SECRET';
    this.passkey = env.MPESA_PASSKEY || 'YOUR_PASSKEY';
    this.shortcode = env.MPESA_SHORTCODE || '174379'; // Test shortcode
    this.environment = env.NODE_ENV === 'production' ? 'api' : 'sandbox'; // sandbox vs api (live)
    this.baseUrl = `https://${this.environment}.safaricom.co.ke`;
  }

  async getOAuthToken() {
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    try {
      const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: { Authorization: `Basic ${auth}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.errorMessage || 'Failed to get M-Pesa token');
      return data.access_token;
    } catch (err) {
      console.error('[MPESA]: Auth Error:', err.message);
      throw err;
    }
  }

  generatePassword(timestamp) {
    return Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');
  }

  async initiateSTKPush(phoneNumber, amount, reference) {
    const token = await this.getOAuthToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = this.generatePassword(timestamp);
    
    const formatPhone = (phone) => {
      let p = phone.replace(/[^0-9]/g, '');
      if (p.startsWith('0')) p = '254' + p.slice(1);
      if (p.startsWith('+')) p = p.slice(1);
      return p;
    };
    
    const formattedPhone = formatPhone(phoneNumber);
 
    const payload = {
      BusinessShortCode: this.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.ceil(amount),
      PartyA: formattedPhone,
      PartyB: this.shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: env.MPESA_CALLBACK_URL || `https://www.luluaurelian.co.ke/api/payments/mpesa/callback`, // Must be HTTPS
      AccountReference: reference,
      TransactionDesc: `Booking ${reference}`
    };

    try {
      const response = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.errorMessage || 'STK Push failed');
      
      return { success: true, checkoutRequestId: data.CheckoutRequestID, data };
    } catch (err) {
      console.error('[MPESA]: STK Push Error:', err.message);
      throw err;
    }
  }

  /**
   * Query the status of an STK Push transaction.
   * Endpoint: POST /mpesa/stkpushquery/v1/query
   * 
   * ResultCode values:
   *   0    — Payment successful
   *   1032 — Cancelled by user
   *   1037 — Timeout (user didn't respond)
   *   1    — Insufficient balance / other failure
   * 
   * If the transaction is still processing, Safaricom returns a non-200
   * with errorCode "500.01.01".
   */
  async querySTKPushStatus(checkoutRequestId) {
    const token = await this.getOAuthToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = this.generatePassword(timestamp);

    const payload = {
      BusinessShortCode: this.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    };

    try {
      const response = await fetch(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      // Non-200 with "being processed" means still pending
      if (!response.ok) {
        if (data.errorCode === '500.01.01' || (data.errorMessage && data.errorMessage.includes('being processed'))) {
          return { ResultCode: 'PENDING', ResultDesc: 'Transaction is still being processed.' };
        }
        throw new Error(data.errorMessage || `STK Query failed (HTTP ${response.status})`);
      }

      return data;
    } catch (err) {
      console.error('[MPESA]: STK Query Error:', err.message);
      // Return PENDING so frontend keeps polling instead of showing an error
      return { ResultCode: 'PENDING', ResultDesc: err.message };
    }
  }
}

export const mpesaService = new MpesaService();
