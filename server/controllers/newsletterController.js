import { db } from '../config/db.js';
import { emailService } from '../services/emailService.js';

export const subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Please provide a subscriber email address.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if subscriber profile exists
    const subscriber = await db.newsletters.findByEmail(normalizedEmail);

    if (subscriber && subscriber.is_active) {
      return res.status(409).json({
        success: false,
        error: 'This email is already registered on the active roster.'
      });
    }

    // Create or reactivate subscription
    await db.newsletters.create(normalizedEmail);

    console.log(`[NEWSLETTER ENGINE]: Email registered: ${normalizedEmail}`);

    emailService.sendNewsletterWelcome(normalizedEmail).catch(err => {
      console.error('[NEWSLETTER ENGINE]: Failed to dispatch welcome email:', err);
    });

    return res.status(201).json({
      success: true,
      message: subscriber ? 'Subscription reactivated. Welcome back!' : 'Subscription successful. Welcome packet sent to inbox.'
    });

  } catch (error) {
    next(error);
  }
};

export const unsubscribe = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Please provide the unsubscriber email address.' });
    }

    const subscriber = await db.newsletters.findByEmail(email);
    if (!subscriber || !subscriber.is_active) {
      return res.status(404).json({
        success: false,
        error: 'Active subscription not matched for this email.'
      });
    }

    // Toggle opt-out status
    await db.newsletters.delete(subscriber.id);
    
    console.log(`[NEWSLETTER ENGINE]: Subscriber unsubscribed: ${subscriber.email}`);

    return res.status(200).json({
      success: true,
      message: 'You have been successfully removed from our distribution array.'
    });

  } catch (error) {
    next(error);
  }
};
