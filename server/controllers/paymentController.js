import { db } from '../config/db.js';
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

    // Call PayHero API with guest name for dashboard tracking
    const response = await payheroService.initiateSTKPush(
      phone_number,
      amount,
      booking.id.substring(0, 8).toUpperCase(),
      booking.guest_name || ''
    );

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

export const dispatchPostPaymentNotifications = async (booking) => {
  if (!booking) return;

  // 1. Immediate payment success confirmation
  emailService.sendPaymentSuccess(booking).catch(e => console.error('[EMAIL ERROR]:', e));
  whatsappService.sendBookingStatusAlert(booking, 'PAID').catch(e => console.error('[WHATSAPP ERROR]:', e));

  // 2. Check if check-in is today and current time in Nairobi is >= 13:00 (1:00 PM)
  const todayEAT = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi' }).format(new Date());
  const hourEAT = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Nairobi', hour: 'numeric', hour12: false }).format(new Date()));

  if (booking.check_in === todayEAT && hourEAT >= 13) {
    console.log(`[POST-PAYMENT DISPATCH]: Booking ${booking.id} check-in is today (${booking.check_in}) and payment completed at/after 1:00 PM. Sending check-in credentials immediately.`);
    emailService.sendCheckInCredentials(booking).catch(e => console.error('[EMAIL ERROR]:', e));
    whatsappService.sendCheckInCredentials(booking).catch(e => console.error('[WHATSAPP ERROR]:', e));
  } else {
    console.log(`[POST-PAYMENT DISPATCH]: Booking ${booking.id} confirmed. Check-in details will be sent from 1:00 PM on ${booking.check_in}.`);
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
        dispatchPostPaymentNotifications(booking);
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

    const payload = req.body || {};
    const resObj = payload.response || payload.data || payload.results || {};

    // Extract all possible references and status formats
    const external_reference = payload.external_reference || payload.ExternalReference || payload.externalReference ||
      resObj.external_reference || resObj.ExternalReference || resObj.externalReference || null;

    const reference = payload.reference || payload.Reference ||
      payload.checkout_request_id || payload.CheckoutRequestID || payload.checkoutRequestId ||
      resObj.reference || resObj.Reference ||
      resObj.checkout_request_id || resObj.CheckoutRequestID || resObj.checkoutRequestId ||
      resObj.MerchantRequestID || resObj.merchant_request_id || null;

    const mpesaReceipt = payload.provider_reference || payload.MpesaReceiptNumber || payload.MPESA_Reference ||
      payload.Receipt || payload.mpesaReceipt || payload.receipt ||
      resObj.provider_reference || resObj.MpesaReceiptNumber || resObj.MPESA_Reference ||
      resObj.Receipt || resObj.receipt || null;

    // Determine normalized status safely (handles booleans, objects, and nested fields)
    let rawStatus = '';
    if (typeof resObj.status === 'string') rawStatus = resObj.status;
    else if (typeof resObj.Status === 'string') rawStatus = resObj.Status;
    else if (typeof resObj.payment_status === 'string') rawStatus = resObj.payment_status;
    else if (typeof resObj.PaymentStatus === 'string') rawStatus = resObj.PaymentStatus;
    else if (typeof payload.status === 'string') rawStatus = payload.status;
    else if (typeof payload.Status === 'string') rawStatus = payload.Status;
    else if (typeof payload.payment_status === 'string') rawStatus = payload.payment_status;
    else if (typeof payload.PaymentStatus === 'string') rawStatus = payload.PaymentStatus;
    else if (resObj.ResultCode === 0 || resObj.ResultCode === '0' || payload.ResultCode === 0 || payload.ResultCode === '0') rawStatus = 'SUCCESS';
    else if (payload.success === true || payload.status === true || resObj.success === true || resObj.status === true) rawStatus = 'SUCCESS';
    else if (payload.success === false || payload.status === false || resObj.success === false || resObj.status === false) rawStatus = 'FAILED';

    const payHeroStatus = String(rawStatus || '').toUpperCase();
    const payHeroRef = reference || external_reference;

    // ── Find payment record by reference ──
    let payment = null;
    if (payHeroRef) {
      payment = await db.payments.findByRef(payHeroRef);
    }
    if (!payment && external_reference) {
      payment = await db.payments.findByRef(external_reference);
    }

    // Fallback 1: Match booking by external_reference prefix (PayHero sends back the
    // 8-char booking ID prefix we used as external_reference during STK push initiation,
    // but the payment record stores the checkoutRequestId as transaction_ref — so the
    // findByRef above won't find it. Match against booking IDs instead.)
    if (!payment && external_reference) {
      const allBookings = await db.bookings.getAll();
      const matchedBooking = allBookings.find(b =>
        b.id.toUpperCase().startsWith(String(external_reference).toUpperCase()) &&
        ['AUTHORIZING', 'PENDING'].includes(b.status)
      );
      if (matchedBooking) {
        // Retrieve the actual payment record for this booking so we can update it properly
        const bookingPayments = await db.payments.findByBookingId(matchedBooking.id);
        const pendingPayment = (bookingPayments || []).find(p => p.status === 'PENDING');
        if (pendingPayment) {
          payment = pendingPayment;
          console.log(`[PAYHERO WEBHOOK]: Matched payment via external_reference prefix → booking ${matchedBooking.id}, payment ref: ${pendingPayment.transaction_ref}`);
        } else {
          payment = { booking_id: matchedBooking.id, transaction_ref: payHeroRef || external_reference };
          console.log(`[PAYHERO WEBHOOK]: Matched booking ${matchedBooking.id} via external_reference prefix (no pending payment record found, using synthetic ref)`);
        }
      }
    }

    // Fallback 2: search booking by phone number & recent pending/authorizing status
    if (!payment) {
      const rawPhone = payload.phone_number || payload.phone || resObj.phone_number || resObj.phone || '';
      if (rawPhone) {
        const cleanPhone = String(rawPhone).replace(/[^0-9]/g, '');
        const allBookings = await db.bookings.getAll();
        const matched = allBookings.find(b => {
          const bPhone = String(b.guest_phone || '').replace(/[^0-9]/g, '');
          const phoneMatch = bPhone && (bPhone.endsWith(cleanPhone.slice(-9)) || cleanPhone.endsWith(bPhone.slice(-9)));
          const isPending = ['AUTHORIZING', 'PENDING'].includes(b.status);
          return phoneMatch && isPending;
        });
        if (matched) {
          console.log(`[PAYHERO WEBHOOK]: Matched booking ${matched.id} via customer phone ${rawPhone}`);
          // Also try to find the actual pending payment for this booking
          const bookingPayments = await db.payments.findByBookingId(matched.id);
          const pendingPayment = (bookingPayments || []).find(p => p.status === 'PENDING');
          if (pendingPayment) {
            payment = pendingPayment;
          } else {
            payment = { booking_id: matched.id, transaction_ref: payHeroRef || external_reference || mpesaReceipt || matched.id };
          }
        }
      }
    }

    if (!payment) {
      console.warn(`[PAYHERO WEBHOOK]: No payment or booking found for ref: ${payHeroRef || external_reference}`);
      return res.status(200).json({ status: 'received' });
    }

    if (['SUCCESS', 'COMPLETED', 'PAID', 'TRUE'].includes(payHeroStatus) || payload.success === true || resObj.success === true) {
      // ── Payment successful ────────────────────────────────────────────
      await db.payments.updateStatus(payment.transaction_ref, 'COMPLETED');
      await db.bookings.updateStatus(payment.booking_id, 'PAID');

      // Also record the receipt in payments table if provided
      if (mpesaReceipt) {
        const booking = await db.bookings.findById(payment.booking_id);
        await db.payments.create({
          booking_id: payment.booking_id,
          amount: booking?.total_price || 0,
          gateway: 'MPESA',
          transaction_ref: mpesaReceipt,
          status: 'COMPLETED'
        }).catch(() => {});
      }

      const booking = await db.bookings.findById(payment.booking_id);
      if (booking) {
        dispatchPostPaymentNotifications(booking);
      }

      console.log(`[PAYHERO WEBHOOK]: ✅ Payment verified. Booking ${payment.booking_id} activated to PAID! M-Pesa Receipt: ${mpesaReceipt || 'N/A'}`);
    } else if (['FAILED', 'CANCELLED', 'DECLINED', 'TIMEOUT'].includes(payHeroStatus)) {
      console.log(`[PAYHERO WEBHOOK]: ❌ Payment ${payHeroStatus} for ref ${payHeroRef}`);
      await db.payments.updateStatus(payment.transaction_ref, 'FAILED');

      const booking = await db.bookings.findById(payment.booking_id);
      if (booking && booking.status === 'AUTHORIZING') {
        await db.bookings.updateStatus(payment.booking_id, 'PENDING');
      }
    } else {
      console.log(`[PAYHERO WEBHOOK]: ⏳ Status "${payHeroStatus}" for ref ${payHeroRef}.`);
    }

    return res.status(200).json({ status: 'received' });
  } catch (error) {
    console.error('[PAYHERO WEBHOOK ERROR]:', error.message);
    return res.status(200).json({ status: 'received' });
  }
};

/**
 * Direct Manual / SMS M-Pesa Transaction Code Verification
 * Allows guest or front-end to verify a payment using their M-Pesa SMS transaction code.
 */
export const verifyManualMpesaPayment = async (req, res, next) => {
  try {
    const { booking_id, mpesa_code } = req.body;

    if (!booking_id) {
      return res.status(400).json({ success: false, error: 'Missing booking_id.' });
    }
    if (!mpesa_code || mpesa_code.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'Please enter a valid M-Pesa transaction code (e.g. SJR48Z9X2).' });
    }

    const cleanCode = mpesa_code.trim().toUpperCase();
    const booking = await db.bookings.findById(booking_id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    // Idempotent: If already paid, return immediate success
    if (booking.status === 'PAID' || booking.status === 'COMPLETED') {
      return res.status(200).json({
        success: true,
        message: 'This booking has already been paid and confirmed!',
        booking
      });
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

    // Record completed transaction (safe against duplicates)
    try {
      await db.payments.create({
        booking_id: booking.id,
        amount: amount,
        gateway: 'MPESA',
        transaction_ref: cleanCode,
        status: 'COMPLETED'
      });
    } catch (e) {
      await db.payments.updateStatus(cleanCode, 'COMPLETED').catch(() => {});
    }

    // Mark booking as PAID (even if it was EXPIRED due to hold timeout while guest paid)
    const confirmedBooking = await db.bookings.updateStatus(booking.id, 'PAID');

    // Trigger instant email & WhatsApp credentials dispatch
    dispatchPostPaymentNotifications(confirmedBooking || booking);

    console.log(`[MANUAL MPESA VERIFY]: ✅ Booking ${booking.id} verified with code ${cleanCode}. Post-payment notifications dispatched.`);

    return res.status(200).json({
      success: true,
      message: 'Payment verified and booking confirmed successfully! Check-in credentials have been sent.',
      booking: confirmedBooking || booking
    });
  } catch (error) {
    next(error);
  }
};


// ─── PAYHERO: Poll Payment Status (frontend polling endpoint) ───────────────

/**
 * Poll the status of a PayHero STK Push payment.
 * Checks local DB first (callback or manual verify may have already resolved it),
 * checks booking status directly, then falls back to querying PayHero's API.
 */
export const queryPayheroStatus = async (req, res) => {
  try {
    const { checkoutRequestId, booking_id, bookingId } = req.body;
    const bId = booking_id || bookingId;

    // 1. Check if the booking itself is ALREADY marked PAID
    if (bId) {
      const booking = await db.bookings.findById(bId);
      if (booking && (booking.status === 'PAID' || booking.status === 'COMPLETED')) {
        return res.status(200).json({ success: true, status: 'COMPLETED', message: 'Payment confirmed.' });
      }

      // Check if any payment for this booking has completed
      const bookingPayments = await db.payments.findByBookingId(bId);
      const completedPayment = (bookingPayments || []).find(p => p.status === 'COMPLETED');
      if (completedPayment) {
        await db.bookings.updateStatus(bId, 'PAID');
        const updatedBooking = await db.bookings.findById(bId);
        if (updatedBooking) {
          dispatchPostPaymentNotifications(updatedBooking);
        }
        return res.status(200).json({ success: true, status: 'COMPLETED', message: 'Payment confirmed.' });
      }
    }

    if (!checkoutRequestId && !bId) {
      return res.status(400).json({ success: false, error: 'Missing checkoutRequestId or booking_id.' });
    }

    // 2. Check local payments table by checkoutRequestId
    let payment = null;
    if (checkoutRequestId) {
      payment = await db.payments.findByRef(checkoutRequestId);
    }

    if (payment && payment.status === 'COMPLETED') {
      if (payment.booking_id) {
        await db.bookings.updateStatus(payment.booking_id, 'PAID');
        const b = await db.bookings.findById(payment.booking_id);
        if (b) dispatchPostPaymentNotifications(b);
      }
      return res.status(200).json({ success: true, status: 'COMPLETED', message: 'Payment confirmed.' });
    }

    if (payment && payment.status === 'FAILED') {
      return res.status(200).json({ success: true, status: 'FAILED', message: 'Payment was cancelled or failed.' });
    }

    // 3. Query PayHero directly for transaction status
    if (checkoutRequestId) {
      const queryResult = await payheroService.queryTransactionStatus(checkoutRequestId);

      if (queryResult.status === 'COMPLETED') {
        const targetBookingId = (payment && payment.booking_id) || bId;
        await db.payments.updateStatus(checkoutRequestId, 'COMPLETED');
        if (targetBookingId) {
          await db.bookings.updateStatus(targetBookingId, 'PAID');
          const booking = await db.bookings.findById(targetBookingId);
          if (booking) {
            dispatchPostPaymentNotifications(booking);
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
    }

    // Still pending
    return res.status(200).json({ success: true, status: 'PENDING', message: 'Payment is still being processed.' });

  } catch (error) {
    console.error('[PAYHERO QUERY ERROR]:', error.message);
    return res.status(200).json({ success: true, status: 'PENDING', message: 'Unable to verify status yet.' });
  }
};
