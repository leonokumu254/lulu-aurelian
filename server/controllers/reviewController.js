import crypto from 'crypto';
import { db } from '../config/db.js';

// Phase 4: Public guest submits review (Public Access - authenticated via secure_token)
export const submitReview = async (req, res, next) => {
  try {
    const { token } = req.query;
    const { rating, comment } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized. Missing secure token parameter.'
      });
    }

    if (!rating || rating < 1 || rating > 5) {
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

    // Verify stay fulfillment constraints (MUST be PAID status)
    if (booking.status !== 'PAID') {
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

    // Create Review record
    const newReview = {
      id: crypto.randomUUID(),
      booking_id: booking.id,
      rating: parseInt(rating, 10),
      comment: comment ? comment.trim() : '',
      is_published: true, // Default to published
      created_at: new Date(),
      updated_at: new Date()
    };

    await db.reviews.create(newReview);

    console.log(`[REVIEW SYSTEM]: Testimonial registered for Booking: ${booking.id}. Rating: ${rating}`);

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

    let bookings = await db.bookings.findByGuestEmail(req.user.email);
    let bookingId;
    
    if (bookings && bookings.length > 0) {
      bookingId = bookings[0].id;
    } else {
      // Create a dummy booking for the review to satisfy DB foreign key constraint
      const dummyBooking = {
        id: crypto.randomUUID(),
        guest_name: req.user.name,
        guest_email: req.user.email,
        guest_phone: null,
        unit_id: 'skyview',
        check_in: new Date().toISOString().split('T')[0],
        check_out: new Date().toISOString().split('T')[0],
        status: 'PAID',
        secure_token: crypto.randomUUID()
      };
      await db.bookings.create(dummyBooking);
      bookingId = dummyBooking.id;
    }

    const newReview = {
      id: crypto.randomUUID(),
      booking_id: bookingId,
      rating: parseInt(rating, 10),
      comment: comment ? comment.trim() : '',
      is_published: false, // Default to unpublished for moderation
      created_at: new Date(),
      updated_at: new Date()
    };

    await db.reviews.create(newReview);

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
