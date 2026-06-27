import { db } from '../config/db.js';
import { mpesaService } from '../services/mpesaService.js';
import { paypalService } from '../services/paypalService.js';
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

    // Call Daraja API
    const response = await mpesaService.initiateSTKPush(phone_number, booking.total_price, booking.id.substring(0, 8).toUpperCase());

    // Save PENDING transaction in DB with CheckoutRequestID as the transaction ref temporarily to link the webhook later
    await db.payments.create({
      booking_id: booking.id,
      amount: booking.total_price,
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

export const initiatePaypalPayment = async (req, res, next) => {
  try {
    const { booking_id } = req.body;
    const booking = await db.bookings.findById(booking_id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    const response = await paypalService.createOrder(booking.total_price, booking.id.substring(0, 8).toUpperCase());

    // Save PENDING transaction
    await db.payments.create({
      booking_id: booking.id,
      amount: booking.total_price,
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
