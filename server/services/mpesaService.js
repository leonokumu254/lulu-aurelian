import crypto from 'crypto';
import { env } from '../config/env.js';

class MpesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY || 'YOUR_APP_CONSUMER_KEY';
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET || 'YOUR_APP_CONSUMER_SECRET';
    this.passkey = process.env.MPESA_PASSKEY || 'YOUR_PASSKEY';
    this.shortcode = process.env.MPESA_SHORTCODE || '174379'; // Test shortcode
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
      CallBackURL: `https://www.luluaurelian.co.ke/api/payments/mpesa/callback`, // Must be HTTPS
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
}

export const mpesaService = new MpesaService();
