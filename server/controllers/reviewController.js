import crypto from 'crypto';
import { db } from '../config/db.js';
import { emailService } from '../services/emailService.js';
import { whatsappService } from '../services/whatsappService.js';

// Asynchronously notify Managers and Agents when a guest submits a review
async function notifyStaffOfNewReview(review, booking) {
  try {
    const allUsers = await db.users.getAll();
    const staffUsers = (allUsers || []).filter(u =>
      u.role && (u.role.toUpperCase() === 'MANAGER' || u.role.toUpperCase() === 'AGENT')
    );
    const staffEmails = staffUsers.map(u => u.email).filter(Boolean);

    if (staffEmails.length > 0) {
      console.log(`[REVIEW NOTIFICATION]: Dispatching new review alert to ${staffEmails.length} staff:`, staffEmails.join(', '));
      emailService.sendStaffReviewAlert(staffEmails, review, booking).catch(err => {
        console.error('[REVIEW EMAIL ALERT ERROR]:', err.message);
      });
    }

    whatsappService.sendStaffReviewAlert(review, booking).catch(err => {
      console.error('[REVIEW WHATSAPP ALERT ERROR]:', err.message);
    });
  } catch (err) {
    console.warn('[REVIEW NOTIFICATION ERROR]: Could not notify staff of review:', err.message);
  }
}

// Phase 4: Public guest submits review (Public Access - authenticated via secure_token)
export const submitReview = async (req, res, next) => {
  try {
    const token = req.query.token || req.body.token;
    const { comment } = req.body;
    let starRating = parseInt(req.body.rating, 10);
    if ((!starRating || isNaN(starRating) || starRating < 1) && req.body.nps) {
      const npsNum = parseInt(req.body.nps, 10);
      starRating = Math.max(1, Math.min(5, Math.round(npsNum / 2)));
    } else if (starRating > 5) {
      starRating = Math.max(1, Math.min(5, Math.round(starRating / 2)));
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized. Missing secure token parameter.'
      });
    }

    if (!starRating || starRating < 1 || starRating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid rating integer scale between 1 and 5.'
      });
    }

    // Lookup booking by secure token
    const booking = await db.bookings.findByToken(token);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Invalid token reference. Reservation record not matched.'
      });
    }

    // Verify stay fulfillment constraints (MUST be PAID or COMPLETED status)
    if (!['PAID', 'COMPLETED'].includes(booking.status)) {
      return res.status(403).json({
        success: false,
        error: 'Access Denied. Reviews can only be submitted for completed/paid stays.'
      });
    }

    // Enforce 1:1 booking-to-review limit
    const existingReview = await db.reviews.findByBookingId(booking.id);
    if (existingReview) {
      return res.status(409).json({
        success: false,
        error: 'Review already submitted for this booking stay. Action restricted.'
      });
    }

    // Sanitize comment to prevent XSS and limit length
    const cleanComment = (comment || '')
      .trim()
      .slice(0, 1000)
      .replace(/[<>]/g, '');

    // Create Review record
    const newReview = {
      id: crypto.randomUUID(),
      booking_id: booking.id,
      rating: starRating,
      comment: cleanComment,
      is_published: true, // Published for guests with verified tokens
      created_at: new Date(),
      updated_at: new Date()
    };

    await db.reviews.create(newReview);

    // Notify Managers and Agents immediately
    notifyStaffOfNewReview(newReview, booking);

    console.log(`[REVIEW SYSTEM]: Testimonial registered for Booking: ${booking.id}. Rating: ${starRating}`);

    return res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Review published.',
      review: {
        id: newReview.id,
        rating: newReview.rating,
        comment: newReview.comment,
        created_at: newReview.created_at
      }
    });

  } catch (error) {
    next(error);
  }
};

// Authenticated Guest submits review generic
export const submitReviewAuthenticated = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid rating integer scale between 1 and 5.'
      });
    }

    // Verify guest has an actual fulfilled booking
    let bookings = await db.bookings.findByGuestEmail(req.user.email);
    const eligibleBooking = (bookings || []).find(b => ['PAID', 'COMPLETED'].includes(b.status));
    
    if (!eligibleBooking) {
      return res.status(403).json({
        success: false,
        error: 'Reviews can only be submitted after completing a stay at Lulu Aurelian Estate.'
      });
    }

    // Check if this booking was already reviewed
    const existing = await db.reviews.findByBookingId(eligibleBooking.id);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'You have already submitted a review for your recent stay.'
      });
    }

    const cleanComment = (comment || '')
      .trim()
      .slice(0, 1000)
      .replace(/[<>]/g, '');

    const newReview = {
      id: crypto.randomUUID(),
      booking_id: eligibleBooking.id,
      rating: parseInt(rating, 10),
      comment: cleanComment,
      is_published: false, // Moderation hold for general authenticated reviews
      created_at: new Date(),
      updated_at: new Date()
    };

    await db.reviews.create(newReview);

    // Notify Managers and Agents immediately
    notifyStaffOfNewReview(newReview, eligibleBooking);

    console.log(`[REVIEW SYSTEM]: Testimonial registered by ${req.user.email}. Rating: ${rating}`);

    return res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Your review has been submitted.',
      review: {
        id: newReview.id,
        rating: newReview.rating,
        comment: newReview.comment,
        created_at: newReview.created_at
      }
    });

  } catch (error) {
    next(error);
  }
};

// Retrieve Published Reviews (Public Access)
export const getPublishedReviews = async (req, res, next) => {
  try {
    const list = await db.reviews.getAllPublished();

    return res.status(200).json({
      success: true,
      count: list.length,
      reviews: list
    });
  } catch (error) {
    next(error);
  }
};

// Staff Moderation: Get all reviews
export const getAllReviews = async (req, res, next) => {
  try {
    const list = await db.reviews.getAll();
    return res.status(200).json({
      success: true,
      reviews: list
    });
  } catch (error) {
    next(error);
  }
};

// Staff Moderation: Toggle publish flag or delete review (Staff Access Only)
export const moderateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_published } = req.body;

    let review = await db.reviews.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review record not found.' });
    }

    if (is_published !== undefined) {
      review = await db.reviews.updatePublish(id, is_published);
      console.log(`[REVIEW MODERATION]: Review ${id} is_published set to ${review.is_published} by Staff.`);
    }

    return res.status(200).json({
      success: true,
      message: 'Review moderated successfully.',
      review
    });
  } catch (error) {
    next(error);
  }
};

// Delete Review (Staff Access Only)
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const success = await db.reviews.delete(id);

    if (!success) {
      return res.status(404).json({ success: false, error: 'Review record not found.' });
    }

    console.log(`[REVIEW MODERATION]: Review ${id} deleted by Staff.`);

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
