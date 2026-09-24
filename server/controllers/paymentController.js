import { db } from '../config/db.js';
import { mpesaService } from '../services/mpesaService.js';
import { paypalService } from '../services/paypalService.js';
import { payheroService } from '../services/payheroService.js';
import { emailService } from '../services/emailService.js';
import { whatsappService } from '../services/whatsappService.js';

export const initiateMpesaPayment = async (req, res, next) => {
  try {
    const { booking_id, phone_number } = req.body;
    const booking = await db.bookings.findById(booking_id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }
    if (booking.status !== 'APPROVED') {
      return res.status(400).json({ success: false, error: 'Booking is not awaiting payment.' });
    }

    // Determine amount dynamically
    let amount = booking.total_price;
    if (!amount) {
      const unitPricing = await db.pricing.getUnitPricing(booking.unit_id);
      const isOneBed = booking.booking_type === 'one_bedroom';
      const baseRate = isOneBed ? unitPricing.one_bedroom_price : unitPricing.entire_price;
      const nights = Math.max(1, Math.round((new Date(booking.check_out) - new Date(booking.check_in)) / (1000 * 60 * 60 * 24)));
      amount = baseRate * nights;
    }

    // Call PayHero API
    const response = await payheroService.initiateSTKPush(phone_number, amount, booking.id.substring(0, 8).toUpperCase());

    // Save PENDING transaction in DB with CheckoutRequestID as the transaction ref temporarily to link the webhook later
    await db.payments.create({
      booking_id: booking.id,
      amount: amount,
      gateway: 'MPESA',
      transaction_ref: response.checkoutRequestId, 
      status: 'PENDING'
    });

    res.status(200).json({
      success: true,
      message: 'STK Push sent to your phone. Please enter your M-Pesa PIN to complete payment.',
      checkoutRequestId: response.checkoutRequestId
    });
  } catch (error) {
    next(error);
  }
};

export const mpesaCallback = async (req, res, next) => {
  try {
    console.log('[MPESA WEBHOOK]: Received callback payload', JSON.stringify(req.body));
    const callbackData = req.body.Body.stkCallback;
    const checkoutRequestId = callbackData.CheckoutRequestID;
    const resultCode = callbackData.ResultCode;

    if (resultCode === 0) {
      // Payment Successful
      const mpesaReceiptNumber = callbackData.CallbackMetadata.Item.find(item => item.Name === 'MpesaReceiptNumber').Value;
      
      // Find the payment by checkoutRequestId
      const payment = await db.payments.findByRef(checkoutRequestId);
      if (payment) {
        // Update payment to COMPLETED and update the transaction ref to the actual Receipt Number
        await db.payments.updateStatus(checkoutRequestId, 'COMPLETED');
        // A direct SQL query could update the ref, but updating status is enough for tracking.
        
        // Mark booking as PAID
        await db.bookings.updateStatus(payment.booking_id, 'PAID');
        
        // Dispatch fulfillment credentials email!
        const booking = await db.bookings.findById(payment.booking_id);
        emailService.sendFulfillmentCredentials(booking).catch(e => console.error(e));
        whatsappService.sendBookingStatusAlert(booking, 'PAID').catch(e => console.error(e));
        console.log(`[MPESA WEBHOOK]: Payment ${mpesaReceiptNumber} verified and booking ${booking.id} activated!`);
      }
    } else {
      // Payment failed/cancelled by user
      console.log(`[MPESA WEBHOOK]: Payment failed for Request ID ${checkoutRequestId} - ${callbackData.ResultDesc}`);
      await db.payments.updateStatus(checkoutRequestId, 'FAILED');
    }

    // Acknowledge receipt to Safaricom
    res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
  } catch (error) {
    console.error('[MPESA WEBHOOK ERROR]:', error.message);
    res.status(500).json({ ResultCode: 1, ResultDesc: "Internal Server Error" });
  }
};

/**
 * Poll the status of an M-Pesa STK Push payment.
 * Checks local DB first (callback may have already resolved it),
 * then falls back to querying Safaricom's STK Push Query API.
 */
export const queryMpesaStatus = async (req, res) => {
  try {
    const { checkoutRequestId } = req.body;

    if (!checkoutRequestId) {
      return res.status(400).json({ success: false, error: 'Missing checkoutRequestId.' });
    }

    // 1. Check local DB first — the callback may have already handled it
    const payment = await db.payments.findByRef(checkoutRequestId);

    if (payment && payment.status === 'COMPLETED') {
      return res.status(200).json({ success: true, status: 'COMPLETED', message: 'Payment confirmed.' });
    }

    if (payment && payment.status === 'FAILED') {
      return res.status(200).json({ success: true, status: 'FAILED', message: 'Payment was cancelled or failed.' });
    }

    // 2. Query Safaricom directly
    const queryResult = await mpesaService.querySTKPushStatus(checkoutRequestId);
    const resultCode = String(queryResult.ResultCode);

    if (resultCode === '0') {
      // Payment successful — update records (idempotent if callback already did this)
      if (payment) {
        await db.payments.updateStatus(checkoutRequestId, 'COMPLETED');
        await db.bookings.updateStatus(payment.booking_id, 'PAID');

        const booking = await db.bookings.findById(payment.booking_id);
        if (booking) {
          emailService.sendFulfillmentCredentials(booking).catch(e => console.error('[EMAIL ERROR]:', e));
          whatsappService.sendBookingStatusAlert(booking, 'PAID').catch(e => console.error('[WHATSAPP ERROR]:', e));
        }
      }
      return res.status(200).json({ success: true, status: 'COMPLETED', message: 'Payment confirmed.' });
    }

    if (resultCode === '1032') {
      // Cancelled by user — revert booking to PENDING so they can retry
      if (payment) {
        await db.payments.updateStatus(checkoutRequestId, 'FAILED');
        await db.bookings.updateStatus(payment.booking_id, 'PENDING');
      }
      return res.status(200).json({ success: true, status: 'CANCELLED', message: 'Payment cancelled by user.' });
    }

    if (resultCode === '1037') {
      // Timeout — user didn't respond
      if (payment) {
        await db.payments.updateStatus(checkoutRequestId, 'FAILED');
        await db.bookings.updateStatus(payment.booking_id, 'PENDING');
      }
      return res.status(200).json({ success: true, status: 'TIMEOUT', message: 'STK Push timed out. Please try again.' });
    }

    if (resultCode === 'PENDING') {
      return res.status(200).json({ success: true, status: 'PENDING', message: 'Payment is still being processed.' });
    }

    // Any other result code = failure
    if (payment) {
      await db.payments.updateStatus(checkoutRequestId, 'FAILED');
      await db.bookings.updateStatus(payment.booking_id, 'PENDING');
    }
    return res.status(200).json({
      success: true,
      status: 'FAILED',
      message: queryResult.ResultDesc || 'Payment failed.'
    });

  } catch (error) {
    console.error('[MPESA QUERY ERROR]:', error.message);
    // Return PENDING rather than error so frontend keeps polling
    return res.status(200).json({ success: true, status: 'PENDING', message: 'Unable to verify status yet.' });
  }
};

export const initiatePaypalPayment = async (req, res, next) => {
  try {
    const { booking_id } = req.body;
    const booking = await db.bookings.findById(booking_id);
  
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    let amount = booking.total_price;
    if (!amount) {
      const unitPricing = await db.pricing.getUnitPricing(booking.unit_id);
      const isOneBed = booking.booking_type === 'one_bedroom';
      const baseRate = isOneBed ? unitPricing.one_bedroom_price : unitPricing.entire_price;
      const nights = Math.max(1, Math.round((new Date(booking.check_out) - new Date(booking.check_in)) / (1000 * 60 * 60 * 24)));
      amount = baseRate * nights;
    }

    const response = await paypalService.createOrder(amount, booking.id.substring(0, 8).toUpperCase());

    // Save PENDING transaction
    await db.payments.create({
      booking_id: booking.id,
      amount: amount,
      gateway: 'PAYPAL',
      transaction_ref: response.orderId,
      status: 'PENDING'
    });

    const approveLink = response.links.find(link => link.rel === 'approve').href;
    
    res.status(200).json({
      success: true,
      orderId: response.orderId,
      approveLink: approveLink
    });
  } catch (error) {
    next(error);
  }
};

export const capturePaypalPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    
    const response = await paypalService.captureOrder(orderId);
    
    if (response.success) {
      const payment = await db.payments.findByRef(orderId);
      if (payment) {
        await db.payments.updateStatus(orderId, 'COMPLETED');
        await db.bookings.updateStatus(payment.booking_id, 'PAID');
        
        const booking = await db.bookings.findById(payment.booking_id);
        emailService.sendFulfillmentCredentials(booking).catch(e => console.error(e));
        whatsappService.sendBookingStatusAlert(booking, 'PAID').catch(e => console.error(e));
      }

      res.status(200).json({ success: true, message: 'Payment successfully captured.' });
    } else {
      res.status(400).json({ success: false, error: 'Payment capture failed.' });
    }
  } catch (error) {
    next(error);
  }
};

// ─── PAYHERO: STK Push Callback (PayHero server-to-server webhook) ──────────

export const payheroCallback = async (req, res) => {
  try {
    console.log('[PAYHERO WEBHOOK]: Received callback payload', JSON.stringify(req.body));

    // PayHero callback fields — extract what's available
    const {
      external_reference,        // Our booking reference (first 8 chars of booking ID)
      status,                    // e.g. 'SUCCESS', 'FAILED', 'CANCELLED'
      payment_status,            // alternate field name
      provider_reference,        // M-Pesa receipt number
      MpesaReceiptNumber,        // alternate field name
      MPESA_Reference,           // alternate field name
      reference,                 // PayHero transaction reference
      amount,
      phone_number
    } = req.body;

    const payHeroStatus = (status || payment_status || '').toUpperCase();
    const mpesaReceipt = provider_reference || MpesaReceiptNumber || MPESA_Reference || null;
    const payHeroRef = reference || external_reference || null;

    if (!payHeroRef && !external_reference) {
      console.warn('[PAYHERO WEBHOOK]: Missing reference fields in payload.');
      return res.status(200).json({ status: 'received' });
    }

    // ── Find the payment record by transaction_ref OR by matching external_reference ──
    let payment = null;

    // Try finding by PayHero reference (stored as transaction_ref during initiation)
    if (payHeroRef) {
      payment = await db.payments.findByRef(payHeroRef);
    }

    // Fallback: search by external_reference (our booking ref prefix)
    if (!payment && external_reference) {
      payment = await db.payments.findByRef(external_reference);
    }

    if (!payment) {
      console.warn(`[PAYHERO WEBHOOK]: No payment found for ref: ${payHeroRef || external_reference}`);
      return res.status(200).json({ status: 'received' });
    }

    if (payHeroStatus === 'SUCCESS' || payHeroStatus === 'COMPLETED') {
      // ── Payment successful ────────────────────────────────────────────
      await db.payments.updateStatus(payment.transaction_ref, 'COMPLETED');
      await db.bookings.updateStatus(payment.booking_id, 'PAID');

      const booking = await db.bookings.findById(payment.booking_id);
      if (booking) {
        emailService.sendFulfillmentCredentials(booking).catch(e => console.error('[EMAIL ERROR]:', e));
        whatsappService.sendBookingStatusAlert(booking, 'PAID').catch(e => console.error('[WHATSAPP ERROR]:', e));
      }

      console.log(`[PAYHERO WEBHOOK]: ✅ Payment verified. Booking ${payment.booking_id} activated! M-Pesa Receipt: ${mpesaReceipt || 'N/A'}`);
    } else if (payHeroStatus === 'FAILED' || payHeroStatus === 'CANCELLED' || payHeroStatus === 'DECLINED') {
      // ── Payment failed/cancelled ──────────────────────────────────────
      console.log(`[PAYHERO WEBHOOK]: ❌ Payment ${payHeroStatus} for ref ${payHeroRef} — ${req.body.description || ''}`);
      await db.payments.updateStatus(payment.transaction_ref, 'FAILED');

      // Revert booking to PENDING so guest can retry
      const booking = await db.bookings.findById(payment.booking_id);
      if (booking && booking.status === 'AUTHORIZING') {
        await db.bookings.updateStatus(payment.booking_id, 'PENDING');
      }
    } else {
      console.log(`[PAYHERO WEBHOOK]: ⏳ Unhandled status "${payHeroStatus}" for ref ${payHeroRef}. Ignoring.`);
    }

    // Always acknowledge receipt to PayHero
    return res.status(200).json({ status: 'received' });
  } catch (error) {
    console.error('[PAYHERO WEBHOOK ERROR]:', error.message);
    // Always return 200 to prevent PayHero retry loops
    return res.status(200).json({ status: 'received' });
  }
};


// ─── PAYHERO: Poll Payment Status (frontend polling endpoint) ───────────────

/**
 * Poll the status of a PayHero STK Push payment.
 * Checks local DB first (callback may have already resolved it),
 * then falls back to querying PayHero's transaction status API.
 */
export const queryPayheroStatus = async (req, res) => {
  try {
    const { checkoutRequestId } = req.body;

    if (!checkoutRequestId) {
      return res.status(400).json({ success: false, error: 'Missing checkoutRequestId.' });
    }

    // 1. Check local DB first — the callback may have already handled it
    const payment = await db.payments.findByRef(checkoutRequestId);

    if (payment && payment.status === 'COMPLETED') {
      return res.status(200).json({ success: true, status: 'COMPLETED', message: 'Payment confirmed.' });
    }

    if (payment && payment.status === 'FAILED') {
      return res.status(200).json({ success: true, status: 'FAILED', message: 'Payment was cancelled or failed.' });
    }

    // 2. Query PayHero directly for transaction status
    const queryResult = await payheroService.queryTransactionStatus(checkoutRequestId);

    if (queryResult.status === 'COMPLETED') {
      // Payment successful — update records (idempotent if callback already did this)
      if (payment) {
        await db.payments.updateStatus(checkoutRequestId, 'COMPLETED');
        await db.bookings.updateStatus(payment.booking_id, 'PAID');

        const booking = await db.bookings.findById(payment.booking_id);
        if (booking) {
          emailService.sendFulfillmentCredentials(booking).catch(e => console.error('[EMAIL ERROR]:', e));
          whatsappService.sendBookingStatusAlert(booking, 'PAID').catch(e => console.error('[WHATSAPP ERROR]:', e));
        }
      }
      return res.status(200).json({ success: true, status: 'COMPLETED', message: 'Payment confirmed.' });
    }

    if (queryResult.status === 'CANCELLED') {
      if (payment) {
        await db.payments.updateStatus(checkoutRequestId, 'FAILED');
        await db.bookings.updateStatus(payment.booking_id, 'PENDING');
      }
      return res.status(200).json({ success: true, status: 'CANCELLED', message: 'Payment cancelled by user.' });
    }

    if (queryResult.status === 'FAILED') {
      if (payment) {
        await db.payments.updateStatus(checkoutRequestId, 'FAILED');
        await db.bookings.updateStatus(payment.booking_id, 'PENDING');
      }
      return res.status(200).json({ success: true, status: 'FAILED', message: 'Payment failed. Please try again.' });
    }

    // Still pending
    return res.status(200).json({ success: true, status: 'PENDING', message: 'Payment is still being processed.' });

  } catch (error) {
    console.error('[PAYHERO QUERY ERROR]:', error.message);
    // Return PENDING rather than error so frontend keeps polling
    return res.status(200).json({ success: true, status: 'PENDING', message: 'Unable to verify status yet.' });
  }
};
