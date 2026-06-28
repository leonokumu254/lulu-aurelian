import crypto from 'crypto';
import { db } from '../config/db.js';
import { env } from '../config/env.js';
import { emailService } from '../services/emailService.js';
import { whatsappService } from '../services/whatsappService.js';

// Phase 1: Guest Requests Booking (Public Access)
export const requestBooking = async (req, res, next) => {
  try {
    const { guest_name, guest_email, guest_phone, unit_id, check_in, check_out, cleaning_dates } = req.body;

    // Validate request inputs
    if (!guest_name || !guest_email || !guest_phone || !unit_id || !check_in || !check_out) {
      return res.status(400).json({
        success: false,
        error: 'Missing required reservation fields.'
      });
    }

    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        error: 'Check-out date must be post check-in date.'
      });
    }

    // Generate high-entropy secure token for passwordless verification
    const secureToken = 'sec_' + crypto.randomBytes(24).toString('hex');

    const newBooking = {
      id: crypto.randomUUID(),
      guest_name: guest_name.trim(),
      guest_email: guest_email.trim().toLowerCase(),
      guest_phone: guest_phone.trim(),
      unit_id: unit_id.trim().toLowerCase(),
      check_in,
      check_out,
      status: 'PENDING',
      secure_token: secureToken,
      approved_by: null, 
      approved_at: null,
      created_at: new Date(),
      updated_at: new Date(),
      cleaning_dates: cleaning_dates || null
    };

    // Store in relational memory
    await db.bookings.create(newBooking);

    // Fetch all agents and managers to alert them
    const allUsers = await db.users.getAll();
    const agentEmails = allUsers
      .filter(u => u.role && (u.role.toUpperCase() === 'MANAGER' || u.role.toUpperCase() === 'AGENT'))
      .map(u => u.email);

    // Dispatch automated communications asynchronously (do not block the response)
    emailService.sendBookingConfirmation(newBooking).catch(err => console.error('[EMAIL ERROR]:', err));
    whatsappService.sendBookingStatusAlert(newBooking, 'APPROVED').catch(err => console.error('[WHATSAPP ERROR]:', err));
    
    if (agentEmails.length > 0) {
      emailService.sendAgentBookingAlert(agentEmails, newBooking).catch(err => console.error('[AGENT ALERT ERROR]:', err));
    }

    return res.status(201).json({
      success: true,
      message: 'Booking reserved. Awaiting payment within 3 hours.',
      booking: {
        id: newBooking.id,
        status: newBooking.status,
        check_in: newBooking.check_in,
        check_out: newBooking.check_out,
        secure_token: newBooking.secure_token // Returned to allow guest to check status
      }
    });

  } catch (error) {
    next(error);
  }
};

// Phase 2: Staff Moderation - Approve Booking (Staff Access Only)
export const approveBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const booking = await db.bookings.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking record not found.' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: `Cannot approve booking that is currently ${booking.status}.`
      });
    }

    // Update status and audit metadata
    const updatedBooking = await db.bookings.updateStatus(id, 'APPROVED', {
      approved_by: req.user.id,
      approved_at: new Date()
    });

    // Alert guest via WhatsApp/email that booking is approved (3h TTL commences)
    await whatsappService.sendBookingStatusAlert(updatedBooking, 'APPROVED');

    console.log(`[MODERATION ENGINE]: Booking ${updatedBooking.id} APPROVED by Staff ID: ${req.user.id}. 3-Hour countdown triggered.`);

    return res.status(200).json({
      success: true,
      message: 'Booking approved. 3-hour payment TTL initiated.',
      booking: updatedBooking
    });

  } catch (error) {
    next(error);
  }
};

// Phase 2: Staff Moderation - Decline Booking (Staff Access Only)
export const declineBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await db.bookings.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking record not found.' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: `Cannot decline booking that is currently ${booking.status}.`
      });
    }

    const updatedBooking = await db.bookings.updateStatus(id, 'DECLINED');

    await whatsappService.sendBookingStatusAlert(updatedBooking, 'DECLINED');

    return res.status(200).json({
      success: true,
      message: 'Booking request declined successfully.',
      booking: updatedBooking
    });

  } catch (error) {
    next(error);
  }
};

// Guest or Staff - Cancel Booking
export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await db.bookings.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking record not found.' });
    }

    if (booking.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel booking that is currently ${booking.status}.`
      });
    }

    const updatedBooking = await db.bookings.updateStatus(id, 'CANCELLED');

    // Dispatch automated cancellation receipt email to the guest asking for feedback
    await emailService.sendGuestCancellation(updatedBooking);

    return res.status(200).json({
      success: true,
      message: 'Booking canceled successfully.',
      booking: updatedBooking
    });

  } catch (error) {
    next(error);
  }
};

// Phase 3: Initiate Instant Payment via M-Pesa STK or PayPal
export const initiatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { method, phone } = req.body; // 'mpesa' or 'paypal'
    
    const booking = await db.bookings.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking record not found.' });
    }

    if (booking.status !== 'APPROVED') {
      return res.status(400).json({ success: false, error: 'Booking is not awaiting payment.' });
    }

    // 3-hour expiration check
    const now = new Date();
    const createdTime = new Date(booking.created_at);
    const hoursDiff = (now - createdTime) / (1000 * 60 * 60);

    if (hoursDiff > 3) {
      await db.bookings.updateStatus(booking.id, 'CANCELED');
      return res.status(400).json({ success: false, error: 'The 3-hour payment window for this booking has expired. Please create a new booking.' });
    }

    // Mock instant payment success for M-Pesa / PayPal
    const updatedBooking = await db.bookings.updateStatus(booking.id, 'PAID');

    // Auto-deliver data bundle (Location details, digital key lock passcode, wifi, rules)
    await emailService.sendFulfillmentCredentials(updatedBooking);
    
    // Notify check-in credentials dispatched via WhatsApp
    await whatsappService.sendBookingStatusAlert(updatedBooking, 'PAID');

    return res.status(200).json({
      success: true,
      message: `Payment via ${method.toUpperCase()} processed successfully!`,
      booking: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// Phase 3: Fulfillment Gateway - M-Pesa Callback Webhook (Public Gateway Access)
export const verifyPaymentWebhook = async (req, res, next) => {
  try {
    // Validate Webhook Signature
    const clientSecret = req.headers['x-mpesa-secret'] || req.query.secret;
    if (clientSecret !== env.MPESA_CALLBACK_SECRET) {
      console.warn('[SECURITY VIOLATION]: Webhook received invalid verification secret.');
      return res.status(401).json({ success: false, error: 'Unauthorized callback signature.' });
    }

    // Expected M-Pesa Paybill payload schema
    // { TransactionType, TransID, TransAmount, BillRefNumber (matches booking_id or token) }
    const { TransID, TransAmount, BillRefNumber } = req.body;

    if (!TransID || !TransAmount || !BillRefNumber) {
      return res.status(400).json({
        success: false,
        error: 'Incomplete gateway payload structure.'
      });
    }

    // Match by booking ID or secure_token
    let booking = await db.bookings.findById(BillRefNumber);
    if (!booking) {
      booking = await db.bookings.findByToken(BillRefNumber);
    }

    if (!booking) {
      console.warn(`[FULFILLMENT WARNING]: Callback transaction ${TransID} has no matching booking reference: ${BillRefNumber}`);
      return res.status(404).json({ success: false, error: 'Reference transaction not matched.' });
    }

    // Verify booking is in valid state (must be APPROVED to pay)
    if (booking.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        error: `Transaction rejected. Booking ${booking.id} is currently in status: ${booking.status}`
      });
    }

    // Transition to PAID
    const updatedBooking = await db.bookings.updateStatus(booking.id, 'PAID');

    console.log(`[PAYMENT RESOLVER]: Payment verified for Booking ${updatedBooking.id}. Amount: $${TransAmount}. TxRef: ${TransID}`);

    // Auto-deliver data bundle (Location details, digital key lock passcode, wifi, rules)
    await emailService.sendFulfillmentCredentials(updatedBooking);
    
    // Notify check-in credentials dispatched via WhatsApp
    await whatsappService.sendBookingStatusAlert(updatedBooking, 'PAID');

    return res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Payment recognized and fulfillment credentials dispatched.'
    });

  } catch (error) {
    next(error);
  }
};

// Staff Query - Get All Bookings (Staff Access Only)
export const getBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    const list = await db.bookings.getAll(status);

    return res.status(200).json({
      success: true,
      count: list.length,
      bookings: list
    });
  } catch (error) {
    next(error);
  }
};

// Guest Query - Get My Bookings (Guest Access)
export const getMyBookings = async (req, res, next) => {
  try {
    const userEmail = req.user.email;
    const list = await db.bookings.findByGuestEmail(userEmail);
    return res.status(200).json({
      success: true,
      count: list.length,
      bookings: list
    });
  } catch (error) {
    next(error);
  }
};

// Guest Status Check (Public Access - No password required, authenticates via secure_token query parameter)
export const checkBookingStatus = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Missing secure access token in parameter query.'
      });
    }

    const booking = await db.bookings.findByToken(token);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Unauthorized token reference.'
      });
    }

    return res.status(200).json({
      success: true,
      booking: {
        id: booking.id,
        guest_name: booking.guest_name,
        unit_id: booking.unit_id,
        check_in: booking.check_in,
        check_out: booking.check_out,
        status: booking.status,
        created_at: booking.created_at
      }
    });

  } catch (error) {
    next(error);
  }
};

// Retrieve passcode settings for both units
export const getUnitSettings = async (req, res, next) => {
  try {
    const settings = await db.unit_settings.getAll();
    return res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    next(error);
  }
};

// Update unit passcode
export const updateUnitSettings = async (req, res, next) => {
  try {
    const { unitId } = req.params;
    const { passcode } = req.body;

    if (!passcode || passcode.length !== 4 || isNaN(passcode)) {
      return res.status(400).json({
        success: false,
        error: 'Passcode must be exactly a 4-digit number.'
      });
    }

    await db.unit_settings.setPasscode(unitId, passcode);

    return res.status(200).json({
      success: true,
      message: `Passcode for ${unitId === 'cocoa' ? 'Cocoa Retreat' : 'Skyview Hideaway'} updated successfully!`
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve blocked dates for calendar UI
export const getBlockedDates = async (req, res, next) => {
  try {
    const { unitId } = req.params;
    const allBookings = await db.bookings.getAll(); // Assuming getAll is available, or write a custom query.
    // Filter active bookings for the requested unit
    const activeBookings = allBookings.filter(b => 
      b.unit_id === unitId && 
      (b.status === 'APPROVED' || b.status === 'PAID')
    );

    const blocked = activeBookings.map(b => ({
      checkIn: b.check_in,
      checkOut: b.check_out
    }));

    return res.status(200).json({
      success: true,
      blockedDates: blocked
    });
  } catch (error) {
    next(error);
  }
};
