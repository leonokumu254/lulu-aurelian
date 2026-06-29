/**
 * Messaging templates for Emails and WhatsApp notifications for Lulu Aurelian Estate.
 * Contains only content values (text, subjects, preheaders, titles, and structure descriptors).
 * Stylistic layout and CSS formatting are handled separately by the dispatch services.
 */

// ==========================================
// EMAIL CONTENT TEMPLATES
// ==========================================
export const EMAIL_TEMPLATES = {
  /**
   * Content for booking confirmation email.
   * Sent from: server/services/emailService.js -> sendBookingConfirmation(booking)
   * Triggered by: public guest booking requests (server/controllers/bookingController.js -> requestBooking)
   */
  BOOKING_CONFIRMATION: (booking) => {
    return {
      text: `Dear ${booking.guest_name}, We have received your booking request for Unit ${booking.unit_id}.`,
      title: 'Reservation Request Received',
      subject: `Reservation Request Received: Ref #${booking.id.substring(0, 8)}`,
      preheader: `Your booking for Unit ${booking.unit_id} is awaiting payment.`,
      heroImage: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/773920322.jpg?k=f1777694ce60ac5b3585f28b1e970fb84c1fb5acc577d36cd81e44846279dd91&o=',
      badge: 'Action Required',
      headingLine1: 'Awaiting',
      headingLine2: 'Payment',
      paragraphs: [
        `Dear ${booking.guest_name},`,
        `We have received your booking request for <strong>Unit ${booking.unit_id}</strong> (Check-in: ${booking.check_in}).`
      ],
      alertText: 'Your reservation status is currently <strong>AWAITING PAYMENT</strong>. Please ensure your payment is completed within the strict 3-hour payment window to secure your dates.',
      bookingRef: booking.id.substring(0, 8).toUpperCase(),
      button: {
        label: 'Pay Now',
        url: `https://www.luluaurelian.co.ke/#/portal?token=${booking.secure_token}`
      }
    };
  },

  /**
   * Content for fulfillment credentials email.
   * Sent from: server/services/emailService.js -> sendFulfillmentCredentials(booking)
   * Triggered by: successful payments (server/controllers/bookingController.js -> verifyPaymentWebhook, or server/controllers/paymentController.js -> mpesaCallback/capturePaypalPayment)
   */
  FULFILLMENT_CREDENTIALS: (booking) => {
    return {
      text: `Dear ${booking.guest_name}, Thank you for completing your deposit payment! Your stay is fully SECURED.`,
      title: 'Your Stay Credentials',
      subject: `Your Stay Credentials - Unit ${booking.unit_id.toUpperCase()}`,
      preheader: `Your digital lock passcode and check-in instructions for Unit ${booking.unit_id}.`,
      heroImage: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/827123623.jpg?k=1984bd8ee32203a3d8e7b9b68a2793fcd784a2f434594d2e3189fccc77ee602f&o=',
      badge: 'Stay Secured',
      headingLine1: "You're almost",
      headingLine2: 'There.',
      paragraphs: [
        `Dear ${booking.guest_name},`,
        `Thank you for completing your payment. Your stay is fully secured. Below is your check-in access credentials bundle for <strong>Unit ${booking.unit_id.toUpperCase()}</strong>:`
      ],
      credentials: {
        title: 'Credentials Bundle',
        items: [
          { label: 'Check-In Date & Time', value: `${booking.check_in} from 14:00 PM (2:00 PM)` },
          { label: 'Check-Out Date & Time', value: `${booking.check_out} at 11:00 AM(11:00)` },
          { label: 'Location', value: 'Skyline Apartments, Nyeri' },
          { label: 'Key Box PIN', value: booking.passcode || '9841', extra: '(To retrieve the room key from the lock box)' },
          { label: 'Wi-Fi SSID', value: 'LuluAurelian_Luxury_5G' },
          { label: 'Wi-Fi Password', value: 'AurelianLuxury2026!' }
        ]
      },
      rules: {
        title: 'Stay Rules & Guidelines',
        items: [
          'Strict No-Smoking policy inside the suite.',
          'Check-out time is strictly 11:00 AM.'
        ]
      },
      button: {
        label: 'View Itinerary',
        url: `https://www.luluaurelian.co.ke/#/portal?token=${booking.secure_token}`
      }
    };
  },

  /**
   * Content for newsletter subscription welcome email.
   * Sent from: server/services/emailService.js -> sendNewsletterWelcome(email)
   * Triggered by: new/renewed newsletter registrations (server/controllers/newsletterController.js -> subscribe)
   */
  NEWSLETTER_WELCOME: (email) => {
    return {
      text: `Thank you for subscribing to the Pearl Apartments newsletter!`,
      title: 'Aurelian Newsletter',
      subject: 'Welcome to the Lulu Aurelian Circle',
      preheader: 'You are now on the exclusive list.',
      heroImage: 'https://a0.muscache.com/im/pictures/hosting/Hosting-1563631404126316993/original/a65cf4e4-7976-4589-80e2-47668ea56329.jpeg?im_w=1200',
      badge: 'Exclusive Updates',
      headingLine1: "You're on the",
      headingLine2: 'List.',
      paragraphs: [
        'Thank you for subscribing to the Lulu Aurelian Estate newsletter!',
        'As part of our inner circle, you will now receive curated travel blogs, exclusive booking rates, and sneak previews of upcoming luxury suites directly to your inbox.'
      ],
      button: {
        label: 'Explore Suites',
        url: 'https://www.luluaurelian.co.ke'
      }
    };
  },

  /**
   * Content for guest account creation welcome email.
   * Sent from: server/services/emailService.js -> sendAccountCreationWelcome(email, name)
   * Triggered by: new guest registration (server/controllers/authController.js -> register, googleLogin)
   */
  ACCOUNT_CREATION_WELCOME: (email, name) => {
    return {
      text: `Dear ${name}, Welcome to Lulu Aurelian Estate family! Your guest account has been successfully created.`,
      title: 'Welcome to Lulu Aurelian',
      subject: 'Welcome to Pearl Apartments - Account Created Successfully',
      preheader: 'Your guest account has been successfully created.',
      heroImage: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/827123567.jpg?k=69b2a1ce45be6fe744d09881cf8b0f20898a61b5ce737fa36787147be35acada&o=',
      badge: 'Welcome to the Pack',
      headingLine1: 'Welcome to the',
      headingLine2: 'Family!',
      paragraphs: [
        `Dear ${name},`,
        "We're tail-waggingly excited to have you here. As part of our luxury family, you'll be the first to know about new suite drops, special events, and our 10-night loyalty rewards.",
        'Your guest account has been successfully provisioned. You can now use your dashboard to securely manage your stays.'
      ],
      button: {
        label: 'Access Dashboard',
        url: 'https://www.luluaurelian.co.ke/#/portal'
      }
    };
  },

  /**
   * Content for mass newsletter campaigns dispatched from Content Studio.
   */
  NEWSLETTER_CAMPAIGN: (subject, bodyContentHtml) => {
    return {
      text: subject,
      title: 'Lulu Aurelian Updates',
      subject: subject,
      preheader: 'Latest news from the Estate.',
      heroImage: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/827123567.jpg?k=69b2a1ce45be6fe744d09881cf8b0f20898a61b5ce737fa36787147be35acada&o=',
      badge: 'Estate Dispatch',
      headingLine1: 'The Latest',
      headingLine2: 'From Lulu Aurelian',
      paragraphs: [],
      htmlOverride: bodyContentHtml, // Indicates custom body to override paragraphs
      button: {
        label: 'Visit The Estate',
        url: 'https://www.luluaurelian.co.ke'
      }
    };
  },

  /**
   * Content for morning comfort check-in email.
   * Sent from: server/services/emailService.js -> sendCheckInFollowUp(booking)
   * Triggered by: Daily stay lifecycle cron (server/services/cronService.js -> runLifecycleMessagingHooks)
   */
  CHECK_IN_FOLLOW_UP: (booking) => {
    return {
      text: `Good morning ${booking.guest_name}, We hope you had a restful night in the ${booking.unit_id.toUpperCase()} suite.`,
      title: 'Morning Comfort Check-in',
      subject: `Morning Comfort Check-in - Suite ${booking.unit_id.toUpperCase()}`,
      preheader: `Checking in on your stay at Unit ${booking.unit_id.toUpperCase()}`,
      heroImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQd-WSmf7IU8rhoVMkpn_IpS8lY_CY7akhhm1gaF7HPA&s=10',
      badge: 'Guest Services',
      headingLine1: 'Good',
      headingLine2: 'Morning.',
      paragraphs: [
        `Dear ${booking.guest_name},`,
        `We hope you had a restful night in the <strong>${booking.unit_id.toUpperCase()}</strong> suite.`,
        'This is our morning comfort check-in. If you need any assistance, breakfast additions, private tours, or custom housekeeping schedules, please respond directly to this email and your concierge will assist you immediately.'
      ],
      button: {
        label: 'Contact Concierge',
        url: 'mailto:info@luluaurelian.co.ke'
      }
    };
  },

  /**
   * Content for post-checkout review request email.
   * Sent from: server/services/emailService.js -> sendCheckoutReviewRequest(booking)
   * Triggered by: Daily stay lifecycle cron (server/services/cronService.js -> runLifecycleMessagingHooks)
   */
  CHECKOUT_REVIEW_REQUEST: (booking) => {
    return {
      text: `Dear ${booking.guest_name}, Thank you for choosing Pearl Apartments (Lulu Aurelian Estate) for your stay.`,
      title: 'Share Your Experience',
      subject: `Share Your Stay Experience (Ref #${booking.id.substring(0, 8)})`,
      preheader: `We trust you had a flawless experience.`,
      heroImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSx1QRw7IQroE1OvYqdqcw1U3-J1lI3WUFl_1-IedA0LQ&s=10',
      badge: 'Guest Feedback',
      headingLine1: 'How was your',
      headingLine2: 'Stay?',
      paragraphs: [
        `Dear ${booking.guest_name},`,
        'Thank you for choosing Lulu Aurelian Estate for your stay. We trust you had a flawless experience.',
        'As we continuously refine our boutique hospitality, we would highly value your review. It only takes a minute.'
      ],
      button: {
        label: 'Leave a Review',
        url: `https://www.luluaurelian.co.ke/#/review?token=${booking.secure_token}`
      }
    };
  },

  /**
   * Content for holiday marketing campaign emails.
   * Sent from: server/services/emailService.js -> sendHolidayMarketing(email, holidayName)
   * Triggered by: Daily holiday retention cron (server/services/cronService.js -> runHolidayRetentionAlerts)
   */
  HOLIDAY_MARKETING: (email, holidayName) => {
    return {
      text: `Wishing you a joyful and memorable ${holidayName} from all of us at Pearl Apartments!`,
      title: `Happy ${holidayName}`,
      subject: `Happy ${holidayName} from Lulu Aurelian Estate`,
      preheader: `Exclusive 15% rate deduction on all bookings made in the next 14 days.`,
      heroImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTj2gI876xu5CH8Fy5dCJoVMLdy5rPSHkV8RrkUBiXOJA&s=10',
      badge: 'Holiday Special',
      headingLine1: 'Happy',
      headingLine2: `${holidayName}!`,
      paragraphs: [
        'Dear Valued Guest,',
        `Wishing you a joyful and memorable ${holidayName} from all of us at Lulu Aurelian Estate!`,
        'To celebrate this occasion, we are offering an exclusive 15% rate multiplier deduction on all bookings made in the next 14 days.'
      ],
      promo: {
        label: 'Use Code',
        code: 'FESTIVEPEARL'
      },
      button: {
        label: 'Claim Offer',
        url: 'https://www.luluaurelian.co.ke'
      }
    };
  },

  /**
   * Content for custom newsletter and blog broadcast campaigns.
   * Sent from: server/services/emailService.js -> sendNewsletterBlog(email, blogData)
   * Triggered by: Admin manual broadcast or news publish triggers
   */
  NEWSLETTER_BLOG: (blogData) => {
    return {
      text: `${blogData.title} - Read our latest update on Lulu Aurelian Estate.`,
      title: blogData.emailTitle || 'Aurelian Chronicles',
      subject: blogData.subject || `Lulu Aurelian: ${blogData.title}`,
      preheader: blogData.excerpt || 'Read our latest update and luxury travel logs.',
      heroImage: blogData.heroImage || 'https://a0.muscache.com/im/pictures/hosting/Hosting-1563631404126316993/original/a65cf4e4-7976-4589-80e2-47668ea56329.jpeg?im_w=1200',
      badge: blogData.badge || 'Aurelian Club',
      headingLine1: blogData.headingLine1 || 'Latest',
      headingLine2: blogData.headingLine2 || 'Update',
      paragraphs: blogData.paragraphs || [
        blogData.content || 'Welcome to our latest update.'
      ],
      button: blogData.button || {
        label: 'Read Full Post',
        url: 'https://www.luluaurelian.co.ke'
      }
    };
  },

  /**
   * Content for guest cancellation email.
   * Sent from: server/services/emailService.js -> sendGuestCancellation(booking)
   * Triggered by: Guest cancelling their own booking (server/controllers/bookingController.js -> cancelBooking)
   */
  GUEST_CANCELLATION: (booking) => {
    return {
      text: `Dear ${booking.guest_name}, Your booking ${booking.id.substring(0, 8)} has been cancelled. We'd love to know why.`,
      title: 'Booking Cancelled',
      subject: `Booking Cancelled: Ref #${booking.id.substring(0, 8)}`,
      preheader: `Your reservation has been cancelled successfully.`,
      heroImage: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/773920301.jpg?k=a54142f102014f7ca339af537b0a4c026ed95739c5a2550dfc39f8129ef294ff&o=',
      badge: 'Status Update',
      headingLine1: 'Booking',
      headingLine2: 'Cancelled',
      paragraphs: [
        `Dear ${booking.guest_name},`,
        `This email confirms that your booking request for <strong>Unit ${booking.unit_id.toUpperCase()}</strong> (Check-in: ${booking.check_in}) has been successfully cancelled.`,
        'We would love to understand what happened. Could you please take a moment to reply to this email and let us know your reason for cancelling? Your feedback helps us improve our luxury experience for future stays.'
      ],
      button: {
        label: 'Provide Feedback',
        url: 'mailto:info@luluaurelian.co.ke'
      }
    };
  }
};

// ==========================================
// WHATSAPP TEMPLATES
// ==========================================
export const WHATSAPP_TEMPLATES = {
  /**
   * WhatsApp text alert sent to notify guests of status updates (APPROVED, DECLINED, PAID, etc.)
   * Sent from: server/services/whatsappService.js -> sendBookingStatusAlert(booking, status)
   * Triggered by: booking updates or request creation (server/controllers/bookingController.js)
   */
  BOOKING_STATUS_ALERT: (booking, status) => {
    return `Hello *${booking.guest_name}*, this is Lulu Aurelian Estate. Your booking for Unit *${booking.unit_id.toUpperCase()}* is currently *${status}*. Status updates and receipt coordinates will be dispatched to your email at ${booking.guest_email}. Reference ID: ${booking.id.substring(0, 8)}`;
  },

  /**
   * WhatsApp text alert sent after successful payment with occupancy details, credentials, and house rules.
   * Sent from: server/services/whatsappService.js -> sendBookingStatusAlert(booking, 'PAID')
   * Triggered by: successful payments (server/controllers/bookingController.js)
   */
  BOOKING_PAID_FULFILLMENT: (booking) => {
    return `Dear *${booking.guest_name}*, thank you for your payment! Your reservation for Unit *${booking.unit_id.toUpperCase()}* is fully confirmed.

*Stay Details & Occupancy Dates:*
• Check-In: ${booking.check_in} from 14:00 PM (2:00 PM)
• Check-Out: ${booking.check_out} at 11:00 AM (11:00 AM)

*Location:*
• Skyline Apartments, Nyeri

*Credentials:*
• Key Box PIN: *${booking.passcode || '9841'}* (To retrieve room key from the lock box)
• Wi-Fi SSID: LuluAurelian_Luxury_5G
• Wi-Fi Password: AurelianLuxury2026!

*House Rules:*
1. Strict No-Smoking policy inside the suite.
2. Check-out is strictly 11:00 AM.

We look forward to hosting you!`;
  },

  /**
   * WhatsApp text alert sent when an approved reservation expires due to unpaid TTL (3 hours)
   * Sent from: server/services/cronService.js -> cancelExpiredApprovedBookings()
   * Triggered by: Expiration check cron (runs every 15 minutes)
   */
  BOOKING_CANCELED_EXPIRED: (booking) => {
    return `Dear ${booking.guest_name}, your approved reservation ${booking.id.substring(0, 8)} has been canceled because the strict 3-hour payment window expired.`;
  },

  /**
   * WhatsApp morning comfort follow-up ping the morning after check-in
   * Sent from: server/services/cronService.js -> runLifecycleMessagingHooks()
   * Triggered by: Daily lifecycle messaging cron at 9:00 AM
   */
  CHECK_IN_FOLLOW_UP: (booking) => {
    return `Good morning *${booking.guest_name}*, we hope you had a comfortable night in your suite. If there is anything we  can do to improve your experience, please let us know!`;
  },

  /**
   * WhatsApp feedback request ping sent on the day of checkou
   * Sent from: server/services/cronService.js -> runLifecycleMessagingHooks()
   * Triggered by: Daily lifecycle messaging cron at 9:00 AM
   */
  CHECKOUT_REVIEW_REQUEST: (booking) => {
    return `Hello *${booking.guest_name}*, we trust your stay was flawless. To help us maintain our standards, please review us: https://www.luluaurelian.co.ke/#/review?token=${booking.secure_token}`;
  }
};
