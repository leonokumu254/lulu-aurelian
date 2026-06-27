import { env } from '../config/env.js';

class PaypalService {
  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID || 'YOUR_PAYPAL_CLIENT_ID';
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'YOUR_PAYPAL_CLIENT_SECRET';
    this.environment = env.NODE_ENV === 'production' ? 'live' : 'sandbox';
    this.baseUrl = this.environment === 'sandbox' 
      ? 'https://api-m.sandbox.paypal.com' 
      : 'https://api-m.paypal.com';
  }

  async getAccessToken() {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    try {
      const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error_description || 'Failed to get PayPal token');
      return data.access_token;
    } catch (err) {
      console.error('[PAYPAL]: Auth Error:', err.message);
      throw err;
    }
  }

  async createOrder(amount, reference) {
    const token = await this.getAccessToken();
    try {
      const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            reference_id: reference,
            amount: {
              currency_code: 'USD',
              value: (amount / 130).toFixed(2) // Convert KES to USD approximate
            },
            description: `Booking ${reference}`
          }],
          application_context: {
            return_url: 'https://www.luluaurelian.co.ke/payment-success',
            cancel_url: 'https://www.luluaurelian.co.ke/payment-cancelled'
          }
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create PayPal order');
      return { success: true, orderId: data.id, links: data.links };
    } catch (err) {
      console.error('[PAYPAL]: Order Create Error:', err.message);
      throw err;
    }
  }

  async captureOrder(orderId) {
    const token = await this.getAccessToken();
    try {
      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to capture PayPal order');
      return { success: true, captureId: data.purchase_units[0].payments.captures[0].id, data };
    } catch (err) {
      console.error('[PAYPAL]: Order Capture Error:', err.message);
      throw err;
    }
  }
}

export const paypalService = new PaypalService();
