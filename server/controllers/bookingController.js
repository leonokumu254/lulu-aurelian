import crypto from 'crypto';
import { db } from '../config/db.js';
import { env } from '../config/env.js';
import { emailService } from '../services/emailService.js';
import { whatsappService } from '../services/whatsappService.js';
import { payheroService } from '../services/payheroService.js';

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const PAYMENT_TTL_MS     = 1 * 60 * 60 * 1000; // 1 hour (down from 3)
const MAX_ADULT_GUESTS   = 5;
const PEAK_GUEST_SURCHARGE = 1500; // KES — applied when adults === 5

// ─── HELPERS ────────────────────────────────────────────────────────────────

/**
 * Returns the next available check-in windows for a given unit so we can
 * inform a guest when their requested dates are already taken.
 */
async function getNextAvailableWindows(unitId, requestedNights, limit = 3) {
  const allBookings = await db.bookings.getAll();
  const activeForUnit = allBookings
    .filter(b =>
      b.unit_id === unitId &&
      ['PENDING', 'AUTHORIZING', 'PAID', 'CONFIRMED'].includes(b.status)
    )
    .map(b => ({
      in:  new Date(b.check_in),
      out: new Date(b.check_out)
    }))
    .sort((a, b) => a.in - b.in);

  const suggestions = [];
  let probe = new Date();
  probe.setHours(0, 0, 0, 0);
  probe.setDate(probe.getDate() + 1); // start from tomorrow

  let attempts = 0;
  while (suggestions.length < limit && attempts < 90) {
    attempts++;
    const probeOut = new Date(probe);
    probeOut.setDate(probeOut.getDate() + requestedNights);

    const overlap = activeForUnit.some(b =>
      probe < b.out && probeOut > b.in
    );

    if (!overlap) {
      suggestions.push({
        check_in:  probe.toISOString().split('T')[0],
        check_out: probeOut.toISOString().split('T')[0]
      });
      probe = new Date(probeOut); // jump past this window
    } else {
      probe.setDate(probe.getDate() + 1);
    }
  }

  return suggestions;
}

// ─── PHASE 1: DIRECT BOOKING (No staff approval — guests book instantly) ────

export const requestBooking = async (req, res, next) => {
  try {
    const {
      guest_name, guest_email, guest_phone,
      unit_id, check_in, check_out,
      adults = 1, children = 0,
      booking_type = 'entire',
      cleaning_dates
    } = req.body;

    const normalizedBookingType = booking_type === 'one_bedroom' ? 'one_bedroom' : 'entire';

    // ── Input validation ──────────────────────────────────────────────────
    if (!guest_name || !guest_email || !guest_phone || !unit_id || !check_in || !check_out) {
      return res.status(400).json({
        success: false,
        error: 'Missing required reservation fields.'
      });
    }

    const checkInDate  = new Date(check_in);
    const checkOutDate = new Date(check_out);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        error: 'Check-out date must be after check-in date.'
      });
    }

    // ── Guest count enforcement ───────────────────────────────────────────
    const adultCount   = parseInt(adults, 10)   || 1;
    const childCount   = parseInt(children, 10) || 0;
    const totalAdults  = adultCount;

    if (normalizedBookingType === 'one_bedroom' && totalAdults > 3) {
      return res.status(400).json({
        success: false,
        error: '1 Bedroom option accommodates up to 2-3 guests. For larger groups, please book the Entire Apartment.'
      });
    }

    if (totalAdults > MAX_ADULT_GUESTS) {
      return res.status(400).json({
        success: false,
        error: `Maximum guest capacity is ${MAX_ADULT_GUESTS} adults. For larger groups, please contact management.`
      });
    }

    // ── Price surcharge for 5-adult bookings ─────────────────────────────
    const hasPeakSurcharge = totalAdults === MAX_ADULT_GUESTS;

    // ── Overlap / double-booking check ───────────────────────────────────
    const allBookings = await db.bookings.getAll();
    const activeStatuses = ['PENDING', 'AUTHORIZING', 'PAID', 'CONFIRMED', 'BLOCKED', 'BOOKED', 'APPROVED'];
    const conflicting = allBookings.find(b => {
      const bUnit = (b.unit_id || b.suite || b.unit || '').toLowerCase();
      const bStatus = (b.status || '').toUpperCase();
      if (bUnit !== (unit_id || '').toLowerCase()) return false;
      if (!activeStatuses.includes(bStatus)) return false;

      const bIn = new Date(b.check_in || b.checkIn);
      const bOut = new Date(b.check_out || b.checkOut);
      return bIn < checkOutDate && bOut > checkInDate;
    });

    if (conflicting) {
      const nights = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      const suggestions = await getNextAvailableWindows(unit_id, nights);

      return res.status(409).json({
        success:             false,
        error:               'Those dates are no longer available for the selected suite.',
        conflict_period:     { check_in, check_out },
        next_available_windows: suggestions
      });
    }

    // ── Create booking row (PENDING → awaits payment) ─────────────────────
    const secureToken = 'sec_' + crypto.randomBytes(24).toString('hex');

    const newBooking = {
      id:              crypto.randomUUID(),
      guest_name:      guest_name.trim(),
      guest_email:     guest_email.trim().toLowerCase(),
      guest_phone:     guest_phone.trim(),
      unit_id:         unit_id.trim().toLowerCase(),
      booking_type:    normalizedBookingType,
      check_in,
      check_out,
      adults:          totalAdults,
      children:        childCount,
      has_peak_surcharge: hasPeakSurcharge ? 1 : 0,
      status:          'PENDING',
      secure_token:    secureToken,
      approved_by:     null,
      approved_at:     null,
      hold_expires_at: new Date(Date.now() + PAYMENT_TTL_MS),
      created_at:      new Date(),
      updated_at:      new Date(),
      cleaning_dates:  cleaning_dates || null
    };

    await db.bookings.create(newBooking);

    // ── Notify staff asynchronously ──────────────────────────────────────
    const allUsers   = await db.users.getAll();
    const staffEmails = allUsers
      .filter(u => u.role && (u.role.toUpperCase() === 'MANAGER' || u.role.toUpperCase() === 'AGENT'))
      .map(u => u.email);

    emailService.sendBookingConfirmation(newBooking).catch(err => console.error('[EMAIL ERROR]:', err));
    whatsappService.sendBookingStatusAlert(newBooking, 'PENDING').catch(err => console.error('[WHATSAPP ERROR]:', err));

    if (staffEmails.length > 0) {
      emailService.sendAgentBookingAlert(staffEmails, newBooking).catch(err => console.error('[AGENT ALERT ERROR]:', err));
    }

    return res.status(201).json({
      success: true,
      message: 'Reservation created. Please complete payment within 1 hour to secure your booking.',
      booking: {
        id:              newBooking.id,
        status:          newBooking.status,
        check_in:        newBooking.check_in,
        check_out:       newBooking.check_out,
        adults:          newBooking.adults,
        children:        newBooking.children,
        has_peak_surcharge: newBooking.has_peak_surcharge,
        hold_expires_at: newBooking.hold_expires_at,
        secure_token:    newBooking.secure_token
      }
    });

  } catch (error) {
    next(error);
  }
};


// ─── PAYMENT: Submit M-Pesa Till Transaction Code ───────────────────────────

export const initiatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { phone, secure_token } = req.body;

    const booking = await db.bookings.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking record not found.' });
    }

    // ── Auth: either session user or secure_token ownership ─────────────────
    const hasSessionAuth = req.user && req.user.email;
    const hasTokenAuth   = secure_token && booking.secure_token === secure_token;
    if (!hasSessionAuth && !hasTokenAuth) {
      return res.status(403).json({ success: false, error: 'Not authorized to pay for this booking.' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: `Booking cannot be paid — current status: ${booking.status}`
      });
    }

    // ── 1-hour hold expiry check ─────────────────────────────────────────
    const expiresAt = booking.hold_expires_at
      ? new Date(booking.hold_expires_at)
      : new Date(new Date(booking.created_at).getTime() + PAYMENT_TTL_MS);

    if (new Date() > expiresAt) {
      await db.bookings.updateStatus(booking.id, 'EXPIRED');
      return res.status(400).json({
        success: false,
        error: 'Your 1-hour payment hold has expired. Please create a new booking.'
      });
    }

    // Use requested phone or booking contact phone
    const targetPhone = phone || booking.guest_phone;
    if (!targetPhone) {
      return res.status(400).json({ success: false, error: 'M-Pesa phone number is required.' });
    }

    // ── Determine amount (dynamically fetched from DB rates)
    const unitPricing   = await db.pricing.getUnitPricing(booking.unit_id);
    const isOneBed      = booking.booking_type === 'one_bedroom';
    const BASE_PRICE    = isOneBed ? unitPricing.one_bedroom_price : unitPricing.entire_price;
    const nights        = Math.round(
      (new Date(booking.check_out) - new Date(booking.check_in)) / (1000 * 60 * 60 * 24)
    );
    const baseCost      = BASE_PRICE * nights;
    let discountPercent = 0;
    if (nights >= 30) discountPercent = 20;
    else if (nights >= 7) discountPercent = 10;
    else if (nights >= 3) discountPercent = 5;
    const lengthDiscountValue = baseCost * (discountPercent / 100);

    const surcharge     = booking.has_peak_surcharge ? PEAK_GUEST_SURCHARGE : 0;
    const totalAmount   = Math.max(0, baseCost - lengthDiscountValue) + surcharge;

    // Trigger PayHero STK Push
    console.log(`[PAYHERO STK PUSH]: Initiating checkout for booking ${booking.id} | Phone: ${targetPhone} | Amount: ${totalAmount}`);
    const stkResponse = await payheroService.initiateSTKPush(targetPhone, totalAmount, booking.id.substring(0, 8).toUpperCase());

    if (!stkResponse || !stkResponse.success) {
      return res.status(500).json({ success: false, error: 'Failed to initiate PayHero STK Push. Please verify your phone number and try again.' });
    }

    // ── Persist payment attempt with CheckoutRequestID as transaction_ref ──────────────────
    await db.payments.create({
      booking_id:       booking.id,
      amount:           totalAmount,
      currency:         'KES',
      gateway:          'MPESA',
      transaction_ref:  stkResponse.checkoutRequestId,
      status:           'PENDING'
    });

    // Transition booking status to AUTHORIZING (Awaiting Callback)
    await db.bookings.updateStatus(booking.id, 'AUTHORIZING');

    return res.status(200).json({
      success:       true,
      message:       'STK Push sent successfully! Please authorize on your phone.',
      checkoutRequestId: stkResponse.checkoutRequestId,
      transactionReference: stkResponse.transactionReference,
      amount:        totalAmount
    });

  } catch (error) {
    console.error('[PAYHERO STK PUSH ERROR]:', error.message);
    return res.status(500).json({ success: false, error: error.message || 'PayHero service communication error.' });
  }
};


// ─── STAFF ACTIONS: Manual Booking Approvals & Declines ─────────────────────

export const approveBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await db.bookings.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking record not found.' });
    }

    if (booking.status !== 'AUTHORIZING' && booking.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: `Cannot approve booking in status: ${booking.status}`
      });
    }

    // Find M-Pesa transaction reference (if any)
    const payments = await db.payments.findByBookingId(id);
    const latestPayment = payments && payments[0];
    const transactionRef = latestPayment ? latestPayment.transaction_ref : 'MANUAL_APPROVAL';

    // Update payment record to COMPLETED
    if (latestPayment) {
      await db.payments.updateStatus(latestPayment.transaction_ref, 'COMPLETED');
    }

    // Transition booking status to PAID
    const approvedBy = req.user ? req.user.name : 'Staff';
    const confirmedBooking = await db.bookings.updateStatus(id, 'PAID', {
      approved_by: approvedBy,
      approved_at: new Date()
    });

    console.log(`[STAFF APPROVAL]: ✅ Booking ${id} approved by ${approvedBy}. Payment Ref: ${transactionRef}`);

    // Send credentials and alert
    emailService.sendFulfillmentCredentials(confirmedBooking).catch(e => console.error('[EMAIL ERROR]:', e));
    whatsappService.sendBookingStatusAlert(confirmedBooking, 'PAID').catch(e => console.error('[WHATSAPP ERROR]:', e));

    return res.status(200).json({
      success: true,
      message: 'Booking approved and payment confirmed. Credentials dispatched to guest.',
      booking: confirmedBooking
    });
  } catch (error) {
    next(error);
  }
};

export const declineBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await db.bookings.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking record not found.' });
    }

    const deletableStatuses = ['PENDING', 'AUTHORIZING'];
    if (!deletableStatuses.includes(booking.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot decline booking in status: ${booking.status}`
      });
    }

    // Update associated payments to FAILED
    await db.payments.updateStatusByBookingId(id, 'FAILED');

    // Update booking status to DECLINED
    const declinedBooking = await db.bookings.updateStatus(id, 'DECLINED');

    console.log(`[STAFF DECLINE]: Booking ${id} declined.`);

    // Send cancellation/decline alert
    emailService.sendGuestCancellation(declinedBooking).catch(e => console.error('[EMAIL ERROR]:', e));

    return res.status(200).json({
      success: true,
      message: 'Booking request has been declined.',
      booking: declinedBooking
    });
  } catch (error) {
    next(error);
  }
};


// ─── WEBHOOK: Stanbic Transaction Notification Callback ─────────────────────
// Stanbic POSTs OutboundTransactionNotificationRequest to your CallbackUrl.
// Security: X-IBM-Client-Id header must match your Client Key.
// You MUST respond: { "ResultCode": 0, "ResultDesc": "Accepted" }

export const stanbicCallback = async (req, res, next) => {
  try {
    // ── Verify X-IBM-Client-Id header ────────────────────────────────────
    const { stanbicService } = await import('../services/stanbicService.js');
    if (env.NODE_ENV === 'production' && !stanbicService.verifyCallbackClientId(req)) {
      console.warn('[STANBIC CALLBACK]: Invalid X-IBM-Client-Id. Rejecting.');
      return res.status(401).json({ ResultCode: 1, ResultDesc: 'Unauthorized' });
    }

    // ── Extract exact spec fields ─────────────────────────────────────────
    // Spec: OutboundTransactionNotificationRequest
    const {
      TransID,            // Stanbic/bank transaction reference — use as our audit key
      BillRefNumber,      // echoes back the dbsReferenceId we sent (our booking ref)
      TransAmount,        // e.g. "KES 5,500.00"
      MSISDN,             // payer phone
      ThirdPartyTransID,  // M-Pesa receipt number
      TransTime,
      TransactionType
    } = req.body;

    if (!TransID) {
      console.warn('[STANBIC CALLBACK]: Missing TransID in payload.');
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' }); // always 200 to prevent retries
    }

    console.log(`[STANBIC CALLBACK]: Received — TransID: ${TransID}, BillRef: ${BillRefNumber}, Amount: ${TransAmount}, Phone: ${MSISDN}`);

    // ── Idempotency: skip if already processed ────────────────────────────
    const alreadyProcessed = await db.payments.findProcessedEvent(TransID);
    if (alreadyProcessed) {
      console.log(`[STANBIC CALLBACK]: Duplicate event ${TransID} — skipping.`);
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }
    await db.payments.recordProcessedEvent(TransID);

    // ── Match payment record by BillRefNumber (our dbsReferenceId) ────────
    const payment = await db.payments.findByRef(BillRefNumber);
    if (!payment) {
      console.warn(`[STANBIC CALLBACK]: No payment found for BillRefNumber: ${BillRefNumber}`);
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    // ── Fetch booking ─────────────────────────────────────────────────────
    const booking = await db.bookings.findById(payment.booking_id);
    if (!booking) {
      console.warn(`[STANBIC CALLBACK]: Booking ${payment.booking_id} not found.`);
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    if (booking.status !== 'AUTHORIZING') {
      console.warn(`[STANBIC CALLBACK]: Booking ${booking.id} in unexpected state: ${booking.status}. Ignoring.`);
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    // ── Transition: AUTHORIZING → PAID ────────────────────────────────────
    await db.payments.updateStatus(BillRefNumber, 'COMPLETED');
    const confirmedBooking = await db.bookings.updateStatus(booking.id, 'PAID');

    console.log(`[STANBIC CALLBACK]: ✅ Booking ${booking.id} PAID. TransID: ${TransID}, M-Pesa Receipt: ${ThirdPartyTransID}, Amount: ${TransAmount}`);

    // ── Send fulfillment credentials ──────────────────────────────────────
    emailService.sendFulfillmentCredentials(confirmedBooking).catch(e => console.error('[EMAIL ERROR]:', e));
    whatsappService.sendBookingStatusAlert(confirmedBooking, 'PAID').catch(e => console.error('[WHATSAPP ERROR]:', e));

    // ── MUST respond with this exact format ──────────────────────────────
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });

  } catch (error) {
    console.error('[STANBIC CALLBACK ERROR]:', error.message);
    // Still return 200 — if we 500, Stanbic will retry and cause duplicates
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
};



// ─── GUEST / STAFF QUERIES ───────────────────────────────────────────────────

export const getBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const list = await db.bookings.getAll(status);
    return res.status(200).json({ success: true, count: list.length, bookings: list });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const userEmail = req.user.email;
    const list = await db.bookings.findByGuestEmail(userEmail);
    return res.status(200).json({ success: true, count: list.length, bookings: list });
  } catch (error) {
    next(error);
  }
};

export const checkBookingStatus = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Missing secure access token.' });
    }

    const booking = await db.bookings.findByToken(token);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Unauthorized token reference.' });
    }

    return res.status(200).json({
      success: true,
      booking: {
        id:           booking.id,
        guest_name:   booking.guest_name,
        unit_id:      booking.unit_id,
        check_in:     booking.check_in,
        check_out:    booking.check_out,
        adults:       booking.adults,
        children:     booking.children,
        status:       booking.status,
        created_at:   booking.created_at,
        hold_expires_at: booking.hold_expires_at
      }
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await db.bookings.findById(id);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking record not found.' });
    }

    const cancellableStatuses = ['PENDING', 'AUTHORIZING'];
    if (!cancellableStatuses.includes(booking.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel booking in status: ${booking.status}. For paid bookings, please contact management.`
      });
    }

    const updatedBooking = await db.bookings.updateStatus(id, 'CANCELLED');
    await emailService.sendGuestCancellation(updatedBooking);

    return res.status(200).json({ success: true, message: 'Booking cancelled successfully.', booking: updatedBooking });
  } catch (error) {
    next(error);
  }
};

// ─── BLOCKED DATES (includes PENDING to prevent race conditions) ─────────────

export const getBlockedDates = async (req, res, next) => {
  try {
    const { unitId } = req.params;
    const allBookings = await db.bookings.getAll();
    const activeStatuses = ['PENDING', 'AUTHORIZING', 'PAID', 'CONFIRMED', 'BLOCKED', 'BOOKED', 'APPROVED'];

    const formatCleanDate = (d) => {
      if (!d) return '';
      if (d instanceof Date) return d.toISOString().split('T')[0];
      return String(d).split('T')[0];
    };

    const activeBookings = allBookings.filter(b => {
      const bUnit = (b.unit_id || b.suite || b.unit || '').toLowerCase();
      const bStatus = (b.status || '').toUpperCase();
      return bUnit === (unitId || '').toLowerCase() && activeStatuses.includes(bStatus);
    });

    const blocked = activeBookings.map(b => {
      const statusUpper = (b.status || '').toUpperCase();
      return {
        checkIn:   formatCleanDate(b.check_in || b.checkIn),
        checkOut:  formatCleanDate(b.check_out || b.checkOut),
        status:    statusUpper,
        isPending: statusUpper === 'PENDING' || statusUpper === 'AUTHORIZING',
        isPaid:    statusUpper === 'PAID' || statusUpper === 'CONFIRMED' || statusUpper === 'BLOCKED'
      };
    });

    return res.status(200).json({ success: true, blockedDates: blocked });
  } catch (error) {
    next(error);
  }
};

// ─── UNIT SETTINGS ───────────────────────────────────────────────────────────

export const getUnitSettings = async (req, res, next) => {
  try {
    const settings = await db.unit_settings.getAll();
    return res.status(200).json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

export const updateUnitSettings = async (req, res, next) => {
  try {
    const { unitId } = req.params;
    const { passcode, house_number, wifi_ssid, wifi_password } = req.body;

    const fieldsToUpdate = {};

    if (passcode !== undefined) {
      if (!passcode || passcode.length !== 4 || isNaN(passcode)) {
        return res.status(400).json({ success: false, error: 'Passcode must be exactly a 4-digit number.' });
      }
      fieldsToUpdate.passcode = passcode;
    }

    if (house_number !== undefined) {
      fieldsToUpdate.house_number = house_number.trim();
    }

    if (wifi_ssid !== undefined) {
      fieldsToUpdate.wifi_ssid = wifi_ssid.trim();
    }

    if (wifi_password !== undefined) {
      fieldsToUpdate.wifi_password = wifi_password.trim();
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ success: false, error: 'No fields provided for update.' });
    }

    await db.unit_settings.setSettings(unitId, fieldsToUpdate);

    let displayName = 'Skyview Hideaway';
    if (unitId === 'cocoa') displayName = 'Cocoa Retreat';
    if (unitId === 'neema') displayName = 'Neema Haven';

    return res.status(200).json({
      success: true,
      message: `Settings for ${displayName} updated successfully!`
    });
  } catch (error) {
    next(error);
  }
};

// ─── MANUAL DATE BLOCKING (Manager Personal Date Crossing / Indirect Bookings) ───

export const createManualBlock = async (req, res, next) => {
  try {
    const { unit_id, check_in, check_out, guest_name, reason, notes } = req.body;

    if (!unit_id || !check_in || !check_out) {
      return res.status(400).json({ success: false, error: 'Suite ID, check-in, and check-out dates are required.' });
    }

    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ success: false, error: 'Check-out date must be strictly after check-in date.' });
    }

    const title = guest_name || reason || 'Manager Hold';
    const blockId = 'block_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    const newBlock = {
      id: blockId,
      guest_name: `BLOCKED: ${title}`,
      guest_email: 'blocked@luluaurelian.co.ke',
      guest_phone: 'N/A',
      unit_id: unit_id.toLowerCase(),
      booking_type: 'entire',
      check_in,
      check_out,
      adults: 1,
      children: 0,
      has_peak_surcharge: 0,
      status: 'BLOCKED',
      secure_token: 'sec_block_' + crypto.randomUUID(),
      created_at: new Date(),
      updated_at: new Date()
    };

    await db.bookings.create(newBlock);

    return res.status(201).json({
      success: true,
      message: `Dates successfully blocked for ${unit_id.toUpperCase()}!`,
      booking: newBlock
    });
  } catch (error) {
    next(error);
  }
};

export const deleteManualBlock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await db.bookings.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking or block record not found.' });
    }

    await db.bookings.delete(id);

    return res.status(200).json({
      success: true,
      message: 'Date block removed successfully.'
    });
  } catch (error) {
    next(error);
  }
};
