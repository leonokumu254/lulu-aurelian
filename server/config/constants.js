/**
 * Messaging templates for Emails and WhatsApp notifications for Lulu Aurelian Estate.
 * Contains only content values (text, subjects, preheaders, titles, and structure descriptors).
 * Stylistic layout and CSS formatting are handled separately by the dispatch services.
 */

// ==========================================
// EAST AFRICA TIME (EAT - UTC+3) HELPERS
// ==========================================

/**
 * Formats date values strictly in East Africa Time (Africa/Nairobi, UTC+3) into human-readable strings.
 * Example: 'Saturday, 10 October 2026' or '10 Oct 2026'
 */
export const formatDateEAT = (dateInput, { short = false } = {}) => {
  if (!dateInput) return 'N/A';
  try {
    let d;
    if (typeof dateInput === 'string') {
      const match = dateInput.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (match) {
        const [, year, month, day] = match;
        // Midday UTC ensures conversion to Africa/Nairobi matches the exact intended day
        d = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 12, 0, 0));
      } else {
        d = new Date(dateInput);
      }
    } else if (dateInput instanceof Date) {
      d = dateInput;
    } else {
      d = new Date(dateInput);
    }

    if (isNaN(d.getTime())) return String(dateInput);

    if (short) {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Nairobi',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(d);
    }

    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Nairobi',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d);
  } catch (err) {
    return String(dateInput);
  }
};

/**
 * Normalizes any date value to 'YYYY-MM-DD' in East Africa Time (Africa/Nairobi).
 */
export const normalizeDateEAT = (dateInput) => {
  if (!dateInput) return '';
  if (typeof dateInput === 'string') {
    const match = dateInput.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) {
      const y = match[1];
      const m = match[2].padStart(2, '0');
      const d = match[3].padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi' }).format(d);
};

/**
 * Returns today's date formatted as YYYY-MM-DD in East Africa Time (Africa/Nairobi).
 */
export const getTodayEAT = () => {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi' }).format(new Date());
};

/**
 * Returns current hour (0-23) in East Africa Time (Africa/Nairobi).
 */
export const getCurrentHourEAT = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Nairobi',
    hour: 'numeric',
    hourCycle: 'h23'
  }).formatToParts(new Date());
  const hourPart = parts.find(p => p.type === 'hour');
  return hourPart ? parseInt(hourPart.value, 10) : new Date().getUTCHours() + 3;
};

/**
 * Returns formatted time string in East Africa Time (e.g., '1:30 PM EAT').
 */
export const formatTimeEAT = (dateInput = new Date()) => {
  try {
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    const timeStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Nairobi',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(d);
    return `${timeStr} EAT`;
  } catch (e) {
    return 'EAT';
  }
};

// ==========================================
// UNIT SPECIFIC WELCOME DETAILS
// ==========================================
export const UNIT_WELCOME_DETAILS = {
  skyview: {
    unitId: 'skyview',
    name: 'SkyView',
    fullName: 'Lulu Aurelian Furnished Apartments- SkyView',
    greeting: 'Welcome to Lulu Aurelian Furnished Apartments- SkyView!',
    welcomeNote: 'We’re delighted to host you and hope you enjoy your stay.🤗',
    apartmentNo: '16 (Top floor)',
    floor: 'Top floor (Apartment 16)',
    house_number: '16',
    keyAccess: 'The key is in the lock box located just outside the door.',
    wifiSSID: 'Pearl_16',
    wifiPass: 'PearlSL_16',
    wifiUsername: 'Pearl_16',
    wifiPassword: 'PearlSL_16',
    location: 'Skyline Apartments, off Nyeri - Nairobi Road next to former Rubis Petrol Station. Skuta, Nyeri.',
    mapUrl: 'https://maps.google.com/?q=-0.433276973199735,36.96868842933756',
    checkInTime: 'After 2:00 PM',
    checkOutTime: 'Before 10:00 AM',
    specialNote: 'All items in the units are at your disposal to use except the washing machine in the second balcony that the guest needs express permission from the host to use.',
    contacts: {
      safaricom: '0112299384',
      airtel: '0756958531'
    },
    directions: 'Skyline Apartments, off Nyeri - Nairobi Road next to former Rubis Petrol Station. Skuta, Nyeri. Apartment No: 16 (Top floor).',
    rules: [
      'Make Yourself at Home: Please treat the home, cozy furnishings, and decor with care. If anything spills or breaks, just let us know right away!',
      'Comfort & Freshness: Fresh towels are ready for you. A quick rinse of kitchen dishes before you check out is deeply appreciated.',
      'Peaceful Nights: Mountain evenings are wonderfully quiet. We observe restful hours between 10:00 PM and 7:00 AM.',
      'Fresh & Smoke-Free: Indoor air stays crisp and clean. You are welcome to smoke on the balcony with provided ashtrays.',
      'Visitors & Friends: If you would like to invite a friend over for tea or lunch, just give us a quick heads-up beforehand!',
      'Live Plants: Please enjoy our green friends without watering or moving them, and ensure little ones do not pull at leaves.',
      'Balcony & Amenities: Supervise children on the top-floor balcony. If you need to use the second balcony washing machine, just text us to get set up!',
      'Peace of Mind: Please lock the front door and secure windows whenever you step out.',
      'Stress-Free Checkout: Check-out is at 10:00 AM so we can get the space sparkling for our next guests (need extra time? Just ask!). Please turn off lights and appliances before locking up.'
    ]
  },
  cocoa: {
    unitId: 'cocoa',
    name: 'Cocoa Home',
    fullName: 'Lulu Aurelian Furnished Apartments- Cocoa Home',
    greeting: 'Welcome to Lulu Aurelian Furnished Apartments- Cocoa Home!',
    welcomeNote: 'We’re delighted to host you and hope you enjoy your stay.',
    apartmentNo: '19 (First floor)',
    floor: 'First floor (Apartment 19)',
    house_number: '19',
    keyAccess: 'The key is in the lock box located just outside the door.',
    wifiSSID: 'MK_Ny-0',
    wifiPass: 'CMutwiri',
    wifiUsername: 'MK_Ny-0',
    wifiPassword: 'CMutwiri',
    wifiExtension: { username: 'Bedroom', password: 'CMutwiri' },
    location: 'Skyline Apartments, off Nyeri - Nairobi Road next to former Rubis Petrol Station. Skuta, Nyeri.',
    mapUrl: 'https://maps.google.com/?q=-0.433276973199735,36.96868842933756',
    checkInTime: 'After 2:00 PM',
    checkOutTime: 'Before 10:00 AM',
    contacts: {
      safaricom: '0112299384',
      airtel: '0756958531'
    },
    directions: 'Skyline Apartments, off Nyeri - Nairobi Road next to former Rubis Petrol Station. Skuta, Nyeri. Apartment No: 19 (First floor).',
    rules: [
      'Make Yourself at Home: Please treat the plush cocoa-toned furnishings and decor with gentle care. If anything spills or breaks, just let us know!',
      'Comfort & Freshness: Fresh towels are ready for your stay. A quick rinse of kitchen dishes before departure makes our team smile.',
      'Peaceful Living: Please keep noise to a respectful level, especially during quiet hours from 10:00 PM to 7:00 AM.',
      'Fresh & Smoke-Free: Indoor spaces are 100% smoke-free. Feel free to use the balcony with provided ashtrays.',
      'Visitors & Friends: If you would like to host a friend for coffee or lunch, just give us a quick heads-up beforehand.',
      'Peace of Mind: Please lock doors and latch windows whenever you head out exploring.',
      'Stress-Free Checkout: Check-out is at 10:00 AM so we can get the space sparkling for our next guests (need extra time? Just ask!). Ensure lights and appliances are switched off.'
    ]
  },
  neema: {
    unitId: 'neema',
    name: 'Neema home',
    fullName: 'Lulu Aurelian Furnished Apartments- Neema home',
    greeting: 'Welcome to Lulu Aurelian Furnished Apartments- Neema home!',
    welcomeNote: 'We’re delighted to host you and hope you enjoy your stay.',
    apartmentNo: 'SL- 2 (First floor)',
    floor: 'First floor (Apartment SL- 2)',
    house_number: 'SL- 2',
    keyAccess: 'The key is in the lock box located just outside the door.',
    wifiSSID: 'AURELIAN',
    wifiPass: 'Lulu_26#',
    wifiUsername: 'AURELIAN',
    wifiPassword: 'Lulu_26#',
    location: 'Skyline Apartments, off Nyeri - Nairobi Road next to former Rubis Petrol Station. Skuta, Nyeri.',
    mapUrl: 'https://maps.google.com/?q=-0.433276973199735,36.96868842933756',
    checkInTime: 'After 2:00 PM',
    checkOutTime: 'Before 10:00 AM',
    contacts: {
      safaricom: '0112299384',
      airtel: '0756958531'
    },
    directions: 'Skyline Apartments, off Nyeri - Nairobi Road next to former Rubis Petrol Station. Skuta, Nyeri. Apartment No: SL- 2 (First floor).',
    rules: [
      'Make Yourself at Home: Please treat the bedding and furnishings with care. If an accident occurs, just drop our team a quick text!',
      'Comfort & Freshness: Fluffy towels are ready for you. Kindly give used cookware and dishes a quick rinse before departure.',
      'Peaceful Haven: Enjoy quiet, restful hours from 10:00 PM to 7:00 AM for a deeply refreshing night of sleep.',
      'Fresh & Smoke-Free: We maintain a 100% smoke-free home indoors. You are welcome to smoke on the balcony with provided ashtrays.',
      'Visitors & Friends: If you would like to invite a friend over for a chat, please let us know beforehand.',
      'Peace of Mind & Balcony: Please ensure the balcony door is securely latched during breezy afternoons, and always lock doors when leaving.',
      'Stress-Free Checkout: Check-out is at 10:00 AM so we can get the space sparkling for our next guests (need extra time? Just ask!). Please switch off lights and appliances before locking up.'
    ]
  }
};

// ==========================================
// COMPREHENSIVE HOUSE RULES & GUIDELINES
// ==========================================
export const DEFAULT_HOUSE_RULES = {
  skyview: {
    unit_id: 'skyview',
    title: 'House Rules & Guest Guidelines',
    subtitle: 'Welcome to Lulu Aurelian Apartment Skyview Hideaway (Top Floor)!',
    welcomeNote: 'We’re so happy to welcome you! This mountain retreat was prepared with care and comfort in mind so you can unwind and feel right at home. Here are a few friendly guidelines to ensure your stay—and everyone else’s—is smooth, safe, and truly relaxing.',
    specialGatewayText: 'Welcome to Lulu Aurelian Apartments - Skyview Gateway\n\nWe’re honored to share our top-floor apartment with you. This space has been prepared with care, thoughtfulness, and a genuine love for comfort. To help us maintain its beauty for everyone who stays, we kindly invite you to review our guidelines below.',
    sections: [
      {
        id: 'care',
        icon: 'care',
        title: '1. Make Yourself at Home',
        items: [
          'Please treat the apartment, cozy furnishings, and decor with the same love you’d treat your own home.',
          'Accidents happen—if anything spills or breaks, please let us know right away! Early communication helps us fix or replace things easily without any stress.',
          'Feel free to use the coasters and placemats on tables to keep the wood and stone surfaces looking pristine.',
          'All appliances and kitchen amenities are here for your enjoyment—please use them as intended.'
        ]
      },
      {
        id: 'cleanliness',
        icon: 'cleanliness',
        title: '2. Keeping Things Fresh & Clean',
        items: [
          'We love keeping the living space and kitchen welcoming for you—a quick tidy-up of personal items as you go keeps the space feeling open and relaxing.',
          'Before checking out, a quick rinse or wash of your used plates, cups, and cookware is deeply appreciated by our cleaning crew.',
          'Trash bins are placed conveniently throughout the home—please pop waste inside and wipe up any quick spills.',
          'Our plush white towels are provided exclusively for your personal drying and bathing comfort. To help us keep them fresh and stain-free, please do not use them to wipe down shoes, luggage, or floor spills.',
          'Leaving the home reasonably tidy helps us turn it around promptly and beautifully for the next arriving guest.'
        ]
      },
      {
        id: 'noise',
        icon: 'noise',
        title: '3. Peaceful Nights & Good Neighbors',
        items: [
          'Sound carries softly in the fresh mountain air. We kindly ask for quiet, restful hours between 10:00 PM and 7:00 AM.',
          'Our neighbors in the building are lovely people—thank you for helping us maintain a peaceful, respectful neighborhood atmosphere.'
        ]
      },
      {
        id: 'smoking',
        icon: 'smoking',
        title: '4. Smoke-Free Sanctuary',
        items: [
          'To keep the apartment smelling fresh, crisp, and allergen-free for all travelers, indoor smoking and vaping are not permitted.',
          'You are warmly welcome to step out onto the private balcony to smoke—please use the provided ashtrays and keep the balcony door closed so smoke doesn’t drift inside.'
        ]
      },
      {
        id: 'guests',
        icon: 'guests',
        title: '5. Visitors & Friends',
        items: [
          'Your booking covers the guests listed on your reservation. If you’d like to host a friend for coffee or lunch, just give us a quick heads-up beforehand!',
          'Our home is intended as a calm sanctuary, so large parties, loud celebrations, and unauthorized overnight visitors are not permitted.'
        ]
      },
      {
        id: 'pets',
        icon: 'pets',
        title: '6. Furry Friends',
        items: [
          'We love pets! Just be sure to check in with us in advance so we can confirm if your four-legged companion can be accommodated.',
          'Please make sure pets stay off the beds, don’t disturb our neighbors, and that any messes are cleaned up promptly.'
        ]
      },
      {
        id: 'safety',
        icon: 'safety',
        title: '7. Your Safety & Peace of Mind',
        items: [
          'For your comfort and peace of mind, please remember to lock the front door and latch the windows whenever you head out exploring.',
          'Smoke detectors and safety devices are here to protect you—please keep them clear and undisturbed.',
          'Take a quick moment to familiarize yourself with the building stairs and emergency exits when you settle in.'
        ]
      },
      {
        id: 'checkout',
        icon: 'checkout',
        title: '8. Stress-Free Checkout',
        items: [
          'Check-out is at 10:00 AM so we can get the space sparkling clean for our next guests. If you need a bit of extra time, just let us know and we’ll do our best to accommodate you!',
          'Please place your used towels together in the bathroom basket or hamper.',
          'Give the lights, electronics, and heating or AC a quick switch-off before locking the door behind you.'
        ]
      },
      {
        id: 'plants',
        icon: 'plants',
        title: '9. Our Green Friends (Live Plants)',
        items: [
          'You’ll notice several live plants around the apartment—they bring fresh oxygen, nature, and positive energy into the home!',
          'Our team takes care of their regular watering and nourishment, so no need to water or move them. Please ensure little hands don’t tug on the leaves.',
          'Your gentle appreciation keeps them happy and thriving!'
        ]
      },
      {
        id: 'balcony',
        icon: 'balcony',
        title: '10. Penthouse Balcony & High Views',
        items: [
          'The top-floor balcony offers panoramic views of Nyeri’s rolling hills—the ideal spot for morning coffee or evening sunsets.',
          'Please always keep a watchful eye on young children whenever they enjoy the balcony.',
          'For your safety, please avoid leaning over the railings or climbing on balcony furniture.',
          'Everything in the apartment is here for your enjoyment! If you’d like to use the washing machine on the second balcony, just send us a quick text and we’ll gladly get you set up.'
        ]
      }
    ],
    closingMessage: 'Thank you so much for being a thoughtful and considerate guest. Your care helps us keep this home a joyful retreat for everyone. We hope your time here is peaceful, memorable, and filled with warm moments!',
    supportContacts: {
      safaricom: '0112299384',
      airtel: '0756958531'
    }
  },
  cocoa: {
    unit_id: 'cocoa',
    title: 'House Rules & Guest Guidelines',
    subtitle: 'Welcome to Lulu Aurelian Furnished Apartments - Cocoa Retreat!',
    welcomeNote: 'We’re so delighted to have you stay with us at Cocoa Retreat. Designed for serene, sophisticated living, we invite you to review these friendly guidelines so your stay is completely relaxing, seamless, and comfortable.',
    sections: [
      {
        id: 'care',
        icon: 'care',
        title: '1. Caring for Your Home Away from Home',
        items: [
          'Please enjoy and treat the plush cocoa-toned furnishings, artwork, and decor with gentle care.',
          'Spills and accidents happen—if anything gets damaged, please let us know right away! Early communication makes it simple and easy for us to take care of it.',
          'Kindly use the provided coasters and mats to protect our lovely tabletops and counters.',
          'Kitchen appliances and entertainment features are all yours to enjoy—please use them as intended.'
        ]
      },
      {
        id: 'cleanliness',
        icon: 'cleanliness',
        title: '2. Cleanliness & Kitchen Care',
        items: [
          'A quick tidy-up of kitchen counters and living spaces as you go keeps the retreat feeling luxurious and open.',
          'Please give used dishes and cookware a quick wash or rinse before your departure.',
          'Trash bins are ready for your use—please toss waste inside and wipe up spills while they’re fresh.',
          'Our white towels are provided exclusively for your personal drying and bathing comfort. To keep them fresh and stain-free for every guest, please avoid using them to wipe down shoes, luggage, or spills.',
          'Leaving the apartment reasonably tidy helps our housekeeping team prepare the space smoothly for the next traveler.'
        ]
      },
      {
        id: 'noise',
        icon: 'noise',
        title: '3. Peaceful Nights & Good Neighbors',
        items: [
          'Please keep music and conversation to a respectful volume, particularly during quiet hours from 10:00 PM to 7:00 AM.',
          'Our neighbors in the building appreciate the tranquil atmosphere—thank you for being mindful of those around you.'
        ]
      },
      {
        id: 'smoking',
        icon: 'smoking',
        title: '4. Smoke-Free Sanctuary',
        items: [
          'To keep the retreat smelling sweet and fresh for everyone, indoor smoking and vaping are not permitted.',
          'You are welcome to smoke outside on the balcony—please use the provided ashtrays and close the sliding door so smoke stays outside.'
        ]
      },
      {
        id: 'guests',
        icon: 'guests',
        title: '5. Visitors & Friends',
        items: [
          'Your stay covers the guests on your booking. If you plan to invite a friend over for tea or dinner, please let us know beforehand!',
          'Cocoa Retreat is a tranquil space, so we do not host parties, large gatherings, or unregistered overnight guests.'
        ]
      },
      {
        id: 'safety',
        icon: 'safety',
        title: '6. Your Safety & Security',
        items: [
          'Please lock the entry door and latch windows whenever you leave the retreat.',
          'Safety devices and fire equipment are installed for your security—please keep them undisturbed.',
          'Your lockbox passcode is private for your booking—please keep it secure.'
        ]
      },
      {
        id: 'checkout',
        icon: 'checkout',
        title: '7. Stress-Free Checkout',
        items: [
          'Check-out is at 10:00 AM so we can get the space sparkling clean for our next guests. If you need a bit of extra time, just let us know!',
          'Please place your used towels in the bathroom laundry basket.',
          'Before you close the door, please ensure kitchen appliances, lights, and electronics are turned off.'
        ]
      }
    ],
    closingMessage: 'Thank you for choosing Cocoa Retreat and treating this home with genuine love and care. We hope your stay is filled with comfort, calm, and memorable moments!',
    supportContacts: {
      safaricom: '0112299384',
      airtel: '0756958531'
    }
  },
  neema: {
    unit_id: 'neema',
    title: 'House Rules & Guest Guidelines',
    subtitle: 'Welcome to Lulu Aurelian Furnished Apartments - Neema Haven!',
    welcomeNote: 'A warm welcome to Neema Haven! Designed as a restful sanctuary, we invite you to review these friendly guidelines so your stay is wonderfully peaceful, safe, and rejuvenating.',
    sections: [
      {
        id: 'care',
        icon: 'care',
        title: '1. Make Yourself at Home',
        items: [
          'Please treat the bedding, furnishings, and home amenities with kindness and care.',
          'If an accident or breakage occurs, just drop our team a quick text—early communication helps us resolve things without any worry!',
          'All appliances and comforts are here for you to enjoy—please use them as intended.'
        ]
      },
      {
        id: 'cleanliness',
        icon: 'cleanliness',
        title: '2. Keeping Things Fresh & Clean',
        items: [
          'Tidying up after yourself in the kitchen and common areas keeps the haven feeling light and spacious.',
          'Please wash or rinse used cookware and dishes before you head out.',
          'Trash bins are ready for you—please dispose of waste inside and wipe up spills promptly.',
          'Our fluffy towels are provided exclusively for your personal drying and bathing comfort. Please ensure they are not used to clean shoes, luggage, or floor spills.'
        ]
      },
      {
        id: 'noise',
        icon: 'noise',
        title: '3. Peaceful Nights & Good Neighbors',
        items: [
          'Please keep volume and music to a gentle level, especially during quiet hours from 10:00 PM to 7:00 AM.',
          'Thank you for being thoughtful of our neighbors throughout the building.'
        ]
      },
      {
        id: 'smoking',
        icon: 'smoking',
        title: '4. Smoke-Free Sanctuary',
        items: [
          'To keep indoor air clean and fresh for every guest, smoking and vaping are not permitted inside.',
          'You are welcome to step onto the balcony to smoke—please use the provided ashtrays and close the door behind you.'
        ]
      },
      {
        id: 'guests',
        icon: 'guests',
        title: '5. Visitors & Friends',
        items: [
          'Your stay is reserved for the guests listed on your booking. If you’d like to invite a guest over for a chat, please let us know beforehand.',
          'To preserve the peaceful haven for everyone, we do not host parties or unregistered overnight visitors.'
        ]
      },
      {
        id: 'safety',
        icon: 'safety',
        title: '6. Your Safety & Security',
        items: [
          'Always lock the front door and secure windows whenever you step out.',
          'When mountain winds pick up, please ensure the balcony door is firmly latched.',
          'Keep your lockbox passcode private for your own peace of mind.'
        ]
      },
      {
        id: 'checkout',
        icon: 'checkout',
        title: '7. Stress-Free Checkout',
        items: [
          'Check-out is at 10:00 AM so we can get the space sparkling clean for our next guests. If you need a bit of extra time, just let us know!',
          'Please leave used towels in the designated bathroom basket.',
          'A quick turn-off of the lights and appliances before locking up is deeply appreciated.'
        ]
      }
    ],
    closingMessage: 'Thank you for choosing Neema Haven and being such a thoughtful, wonderful guest. We hope your stay leaves you refreshed, inspired, and deeply rested!',
    supportContacts: {
      safaricom: '0112299384',
      airtel: '0756958531'
    }
  }
};

// Helper to retrieve legitimate, high-resolution website suite image assets
export const getUnitHeroImage = (unitId) => {
  const id = (unitId || 'skyview').toLowerCase();
  if (id === 'cocoa') return 'https://www.luluaurelian.co.ke/assets/cocoa/cocoa_1.jpg';
  if (id === 'neema') return 'https://www.luluaurelian.co.ke/assets/Neema/neema_1.jpeg';
  return 'https://www.luluaurelian.co.ke/assets/skyview/skyview_1.jpg';
};

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
    const unitId = (booking.unit_id || 'skyview').toLowerCase();
    const details = UNIT_WELCOME_DETAILS[unitId] || UNIT_WELCOME_DETAILS.skyview;
    const inDateReadable = formatDateEAT(booking.check_in);
    const outDateReadable = formatDateEAT(booking.check_out);

    return {
      text: `Dear ${booking.guest_name}, We have received your booking request for ${details.name} (${inDateReadable} to ${outDateReadable}).`,
      title: 'Reservation Request Received',
      subject: `Reservation Request Received: Ref #${booking.id.substring(0, 8)}`,
      preheader: `Your booking for ${details.name} is awaiting payment.`,
      heroImage: getUnitHeroImage(unitId),
      badge: 'Action Required',
      headingLine1: 'Awaiting',
      headingLine2: 'Payment',
      paragraphs: [
        `Dear ${booking.guest_name},`,
        `We have received your booking request for <strong>${details.name}</strong>.<br/>
         <strong>Check-In Date:</strong> ${inDateReadable} (from 2:00 PM EAT)<br/>
         <strong>Check-Out Date:</strong> ${outDateReadable} (by 10:00 AM EAT)`
      ],
      alertText: 'Your reservation status is currently <strong>AWAITING PAYMENT</strong>. Please ensure your payment is completed within the payment hold window to secure your dates.',
      bookingRef: booking.id.substring(0, 8).toUpperCase(),
      button: {
        label: 'Pay Now',
        url: `https://www.luluaurelian.co.ke/#/portal?token=${booking.secure_token}`
      }
    };
  },

  /**
   * Content for payment success confirmation email.
   * Sent immediately after successful payment.
   * Informs the client that payment succeeded and that complete check-in details
   * are sent immediately (if payment is past 1:00 PM EAT today) or will be sent as from 1:00 PM EAT on arrival day.
   */
  PAYMENT_SUCCESS_CONFIRMATION: (booking) => {
    const unitId = (booking.unit_id || 'skyview').toLowerCase();
    const details = UNIT_WELCOME_DETAILS[unitId] || UNIT_WELCOME_DETAILS.skyview;
    const inDateReadable = formatDateEAT(booking.check_in);
    const outDateReadable = formatDateEAT(booking.check_out);

    const isDummy = (val) => !val || typeof val !== 'string' || !val.trim() || val.includes('LuluAurelian_') || val.includes('Luxury2026');
    const wifiSSID = (!isDummy(booking.wifi_ssid)) ? booking.wifi_ssid.trim() : (details.wifiUsername || details.wifiSSID);
    const wifiPass = (!isDummy(booking.wifi_password)) ? booking.wifi_password.trim() : (details.wifiPassword || details.wifiPass);

    const todayEAT = getTodayEAT();
    const checkInNorm = normalizeDateEAT(booking.check_in);
    const currentHourEAT = getCurrentHourEAT();
    const isPast1pmOnCheckInDay = checkInNorm && checkInNorm <= todayEAT && currentHourEAT >= 13;

    const alertMessage = isPast1pmOnCheckInDay
      ? `🔑 <strong>Immediate Check-In Access Dispatched:</strong><br/>
Since your check-in is today (<strong>${inDateReadable}</strong>) and payment has been confirmed past 1:00 PM EAT, <strong>your complete digital check-in credentials (smart lock box code, Wi-Fi credentials, and apartment guide) have been dispatched to you immediately</strong> via separate email and WhatsApp.`
      : `🕒 <strong>Check-In Details Timing:</strong><br/>
Check-in is officially as from <strong>2:00 PM EAT</strong>, but guests can access the unit early from 1:00 PM EAT. <strong>Your full check-in details (lock box code, apartment number, and Wi-Fi credentials) will be sent to you as from 1:00 PM EAT</strong> on your arrival day (${inDateReadable}).`;

    return {
      text: `Dear ${booking.guest_name}, thank you for your payment! Your reservation for ${details.fullName || details.name} is fully confirmed. Stay Dates: ${inDateReadable} to ${outDateReadable}. Location: ${details.location}. Wi-Fi Network: ${wifiSSID} | Password: ${wifiPass}. Check-in: After 2:00 PM EAT. Check-out: Before 10:00 AM EAT.`,
      title: 'Payment Successful - Booking Confirmed',
      subject: `Payment Confirmed: Your Stay at ${details.name} is Secured! (Ref #${booking.id.substring(0, 8).toUpperCase()})`,
      preheader: `Payment received successfully! Stay dates: ${inDateReadable} to ${outDateReadable}.`,
      heroImage: getUnitHeroImage(unitId),
      badge: 'Payment Received & Secured',
      headingLine1: 'Payment',
      headingLine2: 'Successful!',
      paragraphs: [
        `Dear ${booking.guest_name},`,
        `Thank you for choosing <strong>${details.fullName || details.name}</strong>. We are delighted to confirm that your payment has been received successfully and your booking is fully secured!`,
        `<strong>Check-In Date:</strong> ${inDateReadable}<br/>
         <strong>Check-Out Date:</strong> ${outDateReadable}<br/>
         <strong>Check-in Time:</strong> After 2:00 PM EAT (Early entry from 1:00 PM EAT)<br/>
         <strong>Check-out Time:</strong> Before 10:00 AM EAT`
      ],
      alertText: alertMessage,
      bookingRef: booking.id.substring(0, 8).toUpperCase(),
      button: {
        label: 'View Booking Itinerary',
        url: `https://www.luluaurelian.co.ke/#/portal?token=${booking.secure_token}`
      }
    };
  },

  /**
   * Content for fulfillment credentials and check-in access email.
   * Sent as from 1:00 PM on check-in day.
   */
  FULFILLMENT_CREDENTIALS: (booking) => {
    const unitId = (booking.unit_id || 'skyview').toLowerCase();
    const details = UNIT_WELCOME_DETAILS[unitId] || UNIT_WELCOME_DETAILS.skyview;
    const isDummy = (val) => !val || typeof val !== 'string' || !val.trim() || val.includes('LuluAurelian_') || val.includes('Luxury2026');
    const lockboxCode = (!isDummy(booking.passcode)) ? booking.passcode.trim() : (details.passcode || '');
    const aptNumber = (booking.house_number && String(booking.house_number).trim()) ? String(booking.house_number).trim() : (details.apartmentNo || details.house_number || '');
    const wifiSSID = (!isDummy(booking.wifi_ssid)) ? booking.wifi_ssid.trim() : (details.wifiUsername || details.wifiSSID);
    const wifiPass = (!isDummy(booking.wifi_password)) ? booking.wifi_password.trim() : (details.wifiPassword || details.wifiPass);

    let textMessage = '';
    let credentialItems = [];

    if (unitId === 'skyview') {
      textMessage = `Welcome to Lulu Aurenian Furnished Apartments- SkyView!\n\n` +
        `We’re delighted to host you and hope you enjoy your stay.🤗\n\n` +
        `📍 Location: Skyline Apartments, off Nyeri - Nairobi Road next to former Rubis Petrol Station. Skuta, Nyeri.\n\n` +
        `Apartment No: 16 (Top floor)\n` +
        `🔑 Key Access:\nThe key is in the lock box located just outside the door.\n\n` +
        `🔐 Lock box code: ${lockboxCode}\n\n` +
        `📶 Wi-Fi Details:\nUsername: ${wifiSSID}\nPassword: ${wifiPass}\n\n` +
        `🕒 Check-in: After 2:00 PM\n` +
        `🕘 Check-out: Before 10:00 AM\n\n` +
        `🔊 All items in the units are at your disposal to use except the washing machine in the second balcony that the guest needs express permission from the host to use.\n\n` +
        `Should you need any assistance during your stay, feel free to reach out.\n\n` +
        `Thank you!\n\n` +
        `Warm Regards,\nLuluAurelian team\n\n` +
        `Safaricom: 0112299384\n` +
        `Airtel: 0756958531`;

      credentialItems = [
        { label: 'Apartment No', value: '16 (Top floor)' },
        { label: '🔑 Key Access', value: 'Key is in the lock box located just outside the door.' },
        { label: '🔐 Lock Box Code', value: lockboxCode },
        { label: '📶 Wi-Fi Username', value: wifiSSID },
        { label: '📶 Wi-Fi Password', value: wifiPass },
        { label: '🕒 Check-in', value: 'After 2:00 PM' },
        { label: '🕘 Check-out', value: 'Before 10:00 AM' },
        { label: '🔊 Balcony Appliance Policy', value: 'All items in the units are at your disposal to use except the washing machine in the second balcony (requires express permission from host).' }
      ];
    } else if (unitId === 'cocoa') {
      textMessage = `Welcome to Lulu Aurelian Furnished Apartments- Cocoa Home!\n\n` +
        `We’re delighted to host you and hope you enjoy your stay.\n\n` +
        `Apartment No: 19 (First floor)\n` +
        `🔑 Key Access:\nThe key is in the lock box located just outside the door.\n\n` +
        `Lock box code: ${lockboxCode}\n\n` +
        `📶 Wi-Fi Details:\nUser name: ${wifiSSID}\npassword: ${wifiPass}\n\n` +
        `Extension in the bedroom:\nUser name: Bedroom\nPassword: CMutwiri\n\n` +
        `🕒 Check-in: After 2:00 PM\n` +
        `🕘 Check-out: Before 10:00 AM.\n\n` +
        `Should you need any assistance during your stay, feel free to reach out.\n\n` +
        `Thank you!\nLuluaurelian\n\n` +
        `Safaricom: 0112299384\n` +
        `Airtel: 0756958531`;

      credentialItems = [
        { label: 'Apartment No', value: '19 (First floor)' },
        { label: '🔑 Key Access', value: 'Key is in the lock box located just outside the door.' },
        { label: '🔐 Lock Box Code', value: lockboxCode },
        { label: '📶 Wi-Fi User Name', value: wifiSSID },
        { label: '📶 Wi-Fi Password', value: wifiPass },
        { label: '📶 Bedroom Extender', value: 'User: Bedroom | Pass: CMutwiri' },
        { label: '🕒 Check-in', value: 'After 2:00 PM' },
        { label: '🕘 Check-out', value: 'Before 10:00 AM' }
      ];
    } else {
      // Neema
      textMessage = `Welcome to Lulu Aurelian Furnished Apartments- Neema home!\n\n` +
        `We’re delighted to host you and hope you enjoy your stay.\n\n` +
        `Apartment No: SL- 2 (First floor)\n` +
        `🔑 Key Access:\nThe key is in the lock box located just outside the door.\n\n` +
        `Lock box code: ${lockboxCode}\n\n` +
        `📶 Wi-Fi Details:\nUser name: ${wifiSSID}\npassword: ${wifiPass}\n\n` +
        `🕒 Check-in: After 2:00 PM\n` +
        `🕘 Check-out: Before 10:00 AM.\n\n` +
        `Should you need any assistance during your stay, feel free to reach out.\n\n` +
        `Thank you!\nLuluAurelian team\n\n` +
        `Safaricom: 0112299384\n` +
        `Airtel: 0756958531`;

      credentialItems = [
        { label: 'Apartment No', value: 'SL- 2 (First floor)' },
        { label: '🔑 Key Access', value: 'Key is in the lock box located just outside the door.' },
        { label: '🔐 Lock Box Code', value: lockboxCode },
        { label: '📶 Wi-Fi User Name', value: wifiSSID },
        { label: '📶 Wi-Fi Password', value: wifiPass },
        { label: '🕒 Check-in', value: 'After 2:00 PM' },
        { label: '🕘 Check-out', value: 'Before 10:00 AM' }
      ];
    }

    return {
      text: textMessage,
      title: `${details.greeting || details.fullName}`,
      subject: `${details.fullName} - Your Check-In Access Details`,
      preheader: `Your door lockbox code and arrival instructions for ${details.name}.`,
      heroImage: getUnitHeroImage(unitId),
      badge: 'Check-In Access Pass',
      headingLine1: 'Welcome to',
      headingLine2: `${details.name}!`,
      paragraphs: [
        `Dear ${booking.guest_name},`,
        `<strong>${details.greeting || details.fullName}</strong>`,
        `${details.welcomeNote || 'We’re delighted to host you and hope you enjoy your stay.'}`
      ],
      credentials: {
        title: '🔑 Unit Access & Credentials',
        items: credentialItems
      },
      rules: {
        title: 'Stay Guidelines',
        items: details.rules
      },
      contacts: details.contacts,
      bookingRef: booking.id.substring(0, 8).toUpperCase(),
      button: {
        label: 'View Itinerary & Coordinates',
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
      text: `Thank you for subscribing to Lulu Aurelian Estate! Discover luxury and tranquil hospitality in Nyeri.`,
      title: 'Experience luxury at Lulu Aurelian Estate!',
      subject: 'Experience luxury at Lulu Aurelian Estate - Welcome to Our Circle',
      preheader: 'Discover Lulu Aurelian Estate, where luxury meets serene comfort.',
      heroImage: 'https://www.luluaurelian.co.ke/assets/skyview/skyview_1.jpg',
      badge: 'Welcome to the Estate',
      headingLine1: "Experience Luxury at",
      headingLine2: 'Lulu Aurelian Estate!',
      paragraphs: [
        'Thank you for joining the Lulu Aurelian Estate circle!',
        'Discover Lulu Aurelian Estate, where luxury meets comfort. Enjoy key features like scenic mountain views, spacious designer suites, and world-class hospitality for an unforgettable stay.'
      ],
      button: {
        label: 'Explore Our Suites',
        url: 'https://www.luluaurelian.co.ke/#/units'
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
      text: `Dear ${name}, Welcome to Lulu Aurelian Estate! Your guest account has been successfully created.`,
      title: 'Experience luxury at Lulu Aurelian Estate!',
      subject: 'Welcome to Lulu Aurelian Estate - Your Account is Ready',
      preheader: 'Discover Lulu Aurelian Estate, where luxury meets comfort.',
      heroImage: 'https://www.luluaurelian.co.ke/assets/skyview/skyview_1.jpg',
      badge: 'Welcome to the Estate',
      headingLine1: 'Experience Luxury at',
      headingLine2: 'Lulu Aurelian Estate!',
      paragraphs: [
        `Dear ${name},`,
        "We are delighted to welcome you to the Lulu Aurelian Estate family. Where luxury meets comfort, offering scenic views, plush suites, and seamless boutique hospitality.",
        'Your guest account is now fully provisioned. You can manage your bookings, check-in details, and loyalty rewards directly from your guest portal.'
      ],
      button: {
        label: 'Access Guest Portal',
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
      heroImage: 'https://www.luluaurelian.co.ke/assets/skyview/skyview_1.jpg',
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
   * Content for morning check-in arrival reminder (Day of Check-in).
   * Sent from: server/services/emailService.js -> sendCheckInDayReminder(booking)
   * Triggered by: Daily stay lifecycle cron at 9:00 AM on check_in day
   */
  CHECK_IN_DAY_REMINDER: (booking) => {
    const unitId = (booking.unit_id || 'skyview').toLowerCase();
    const details = UNIT_WELCOME_DETAILS[unitId] || UNIT_WELCOME_DETAILS.skyview;
    return {
      text: `Good morning ${booking.guest_name}, today is your check-in day at ${details.name}! Location: ${details.location}. Google Maps Pin: ${details.mapUrl}`,
      title: 'Today is Your Check-in Day',
      subject: `Today is Your Check-in Day - ${details.name.toUpperCase()}`,
      preheader: `Welcome to Lulu Aurelian! Your check-in location and directions for ${details.name}.`,
      heroImage: getUnitHeroImage(unitId),
      badge: 'Welcome to Lulu Aurelian',
      headingLine1: 'Today is Your',
      headingLine2: 'Check-in Day.',
      paragraphs: [
        `Dear ${booking.guest_name},`,
        `We are delighted to welcome you to <strong>${details.name}</strong> today!`,
        `Your suite is prepared and your check-in window opens at <strong>14:00 PM (2:00 PM)</strong>.`,
        `Please use the Google Maps location pin below to navigate directly to the property entrance. If you need any assistance upon arrival, our team is on standby to assist you.`
      ],
      button: {
        label: 'View Stay Credentials',
        url: `https://www.luluaurelian.co.ke/#/portal?token=${booking.secure_token}`
      }
    };
  },

  /**
   * Content for morning comfort check-in email (Morning after check-in).
   * Sent from: server/services/emailService.js -> sendCheckInFollowUp(booking)
   * Triggered by: Daily stay lifecycle cron (server/services/cronService.js -> runLifecycleMessagingHooks)
   */
  CHECK_IN_FOLLOW_UP: (booking) => {
    const unitId = (booking.unit_id || 'skyview').toLowerCase();
    const details = UNIT_WELCOME_DETAILS[unitId] || UNIT_WELCOME_DETAILS.skyview;
    return {
      text: `Good morning ${booking.guest_name}, We hope you had a restful night in the ${details.name} suite. Google Maps Pin: ${details.mapUrl}`,
      title: 'Morning Comfort Check-in',
      subject: `Morning Comfort Check-in - ${details.name}`,
      preheader: `Checking in on your stay at ${details.name}`,
      heroImage: 'https://www.luluaurelian.co.ke/assets/skyview/skyview_5.jpg',
      badge: 'Guest Services',
      headingLine1: 'Good',
      headingLine2: 'Morning.',
      paragraphs: [
        `Dear ${booking.guest_name},`,
        `We hope you had a restful night in the <strong>${details.name}</strong> suite.`,
        'This is our morning comfort check-in. Below is your property location pin on Google Maps for your convenience during day trips or taxi pickups. If you need any assistance, breakfast additions, private tours, or custom housekeeping schedules, please respond directly to this email.'
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
    const unitId = (booking.unit_id || 'skyview').toLowerCase();
    const details = UNIT_WELCOME_DETAILS[unitId] || UNIT_WELCOME_DETAILS.skyview;
    return {
      text: `Dear ${booking.guest_name}, Thank you for choosing ${details.name} (Lulu Aurelian Estate) for your stay.`,
      title: 'Share Your Experience',
      subject: `Share Your Stay Experience at ${details.name} (Ref #${booking.id.substring(0, 8)})`,
      preheader: `We trust you had a flawless experience.`,
      heroImage: 'https://www.luluaurelian.co.ke/rateus.jpg',
      badge: 'Guest Feedback',
      headingLine1: 'How was your',
      headingLine2: 'Stay?',
      paragraphs: [
        `Dear ${booking.guest_name},`,
        `Thank you for choosing ${details.name} for your stay. We trust you had a flawless experience.`,
        'As we continuously refine our boutique hospitality, we would highly value your review. It only takes a minute.'
      ],
      button: {
        label: 'Leave a Review',
        url: `https://www.luluaurelian.co.ke/#/review?token=${booking.secure_token}`
      }
    };
  },

  /**
   * Content for morning check-out reminder email.
   * Sent before 10:00 AM on check-out day (e.g., at 8:00 AM EAT).
   */
  CHECKOUT_MORNING_REMINDER: (booking) => {
    const unitId = (booking.unit_id || 'skyview').toLowerCase();
    const details = UNIT_WELCOME_DETAILS[unitId] || UNIT_WELCOME_DETAILS.skyview;
    return {
      text: `Good morning,\n\nThank you so much for booking with us!\nWe hope you had a good stay.\n\nAs you prepare to check out, please take a moment to review the following:\n\n🕙 Check-out Time:\nBefore 10:00 AM. Our housekeeper will be there at 10:10 AM to reset the house.\n\n✨ Lights & Windows:\nPlease ensure all lights are turned off, windows are closed, and the door is locked behind you when you leave.\n\n✨ Towels & Linen:\nKindly leave used towels and linens in the laundry basket provided in each room before you check out.\n\n🔑 Keys:\nPlease return the key to the lockbox and scramble the code afterward. Use the same code you used to open the lockbox.\n\nWe hope to welcome you again.\n\nRegards,\nLuluAurelian team`,
      title: 'Check-out Guidelines - Lulu Aurelian',
      subject: `Check-out Guidelines for ${details.name} (Check-out Before 10:00 AM)`,
      preheader: `Thank you for staying with us! Please review the check-out guidelines before 10:00 AM.`,
      heroImage: 'https://www.luluaurelian.co.ke/time.jpg',
      badge: 'Check-out Notice',
      headingLine1: 'Check-out',
      headingLine2: 'Guidelines',
      paragraphs: [
        'Good morning,',
        'Thank you so much for booking with us! We hope you had a good stay.',
        'As you prepare to check out, please take a moment to review the following:'
      ],
      checklist: [
        {
          title: '🕙 Check-out Time:',
          desc: 'Before <strong>10:00 AM</strong>. Our housekeeper will be there at 10:10 AM to reset the house.'
        },
        {
          title: '✨ Lights & Windows:',
          desc: 'Please ensure all lights are turned off, windows are closed, and the door is locked behind you when you leave.'
        },
        {
          title: '✨ Towels & Linen:',
          desc: 'Kindly leave used towels and linens in the laundry basket provided in each room before you check out.'
        },
        {
          title: '🔑 Keys:',
          desc: 'Please return the key to the lockbox and scramble the code afterward. Use the same code you used to open the lockbox.'
        }
      ],
      closing: 'We hope to welcome you again.<br/><br/>Regards,<br/><strong>LuluAurelian team</strong>',
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
      text: `Wishing you a joyful and memorable ${holidayName} from all of us at Lulu Aurelian Estate!`,
      title: `Happy ${holidayName}`,
      subject: `Happy ${holidayName} from Lulu Aurelian Estate`,
      preheader: `Exclusive 15% rate deduction on all bookings made in the next 14 days.`,
      heroImage: 'https://www.luluaurelian.co.ke/golden_pearl.jpg',
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
      heroImage: blogData.heroImage || 'https://www.luluaurelian.co.ke/golden_pearl.jpg',
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

  GUEST_CANCELLATION: (booking) => {
    const unitId = (booking.unit_id || 'skyview').toLowerCase();
    const details = UNIT_WELCOME_DETAILS[unitId] || UNIT_WELCOME_DETAILS.skyview;
    const inDateReadable = formatDateEAT(booking.check_in);
    return {
      text: `Dear ${booking.guest_name}, Your booking at ${details.name} (Ref #${booking.id.substring(0, 8)}) has been cancelled. We'd love to know why.`,
      title: 'Booking Cancelled',
      subject: `Booking Cancelled: Ref #${booking.id.substring(0, 8)}`,
      preheader: `Your reservation has been cancelled successfully.`,
      heroImage: getUnitHeroImage(unitId),
      badge: 'Status Update',
      headingLine1: 'Booking',
      headingLine2: 'Cancelled',
      paragraphs: [
        `Dear ${booking.guest_name},`,
        `This email confirms that your booking request for <strong>${details.name}</strong> (Check-in: ${inDateReadable}) has been successfully cancelled.`,
        'We would love to understand what happened. Could you please take a moment to reply to this email and let us know your reason for cancelling? Your feedback helps us improve our luxury experience for future stays.'
      ],
      button: {
        label: 'Provide Feedback',
        url: 'mailto:info@luluaurelian.co.ke'
      }
    };
  },

  /**
   * Content for staff/agent onboarding invitation email.
   * Sent from: server/routes/usersRoutes.js -> POST /api/users/invite
   */
  AGENT_INVITATION: (name, role, inviteToken) => {
    const displayRole = role === 'Manager' ? 'Primary Host' : 'Co-host';
    return {
      text: `Dear ${name}, you have been invited to co-manage listings on Lulu Aurelian Estate.`,
      title: 'Co-host Invitation',
      subject: `Invitation to co-host on Lulu Aurelian Estate`,
      preheader: `You have been invited to help manage our listings.`,
      heroImage: 'https://www.luluaurelian.co.ke/assets/skyview/skyview_1.jpg',
      badge: 'Co-host Request',
      headingLine1: 'Co-host',
      headingLine2: 'Invitation',
      paragraphs: [
        `Dear ${name},`,
        `You have been invited to co-host listings on Lulu Aurelian Estate as a <strong>${displayRole}</strong>.`,
        'As a co-host, you will be able to help manage reservations, oversee operations, and ensure guests have a flawless experience.',
        'Please review this request. If you agree, click the button below to accept your invitation and set up your access permissions.'
      ],
      button: {
        label: 'Accept Invitation',
        url: `https://www.luluaurelian.co.ke/#/auth/reset?token=${inviteToken}`
      }
    };
  },

  /**
   * Operations Notification for Managers & Agents upon Confirmed Payment.
   */
  STAFF_PAYMENT_ALERT: (booking, paymentInfo = {}) => {
    const unitId = (booking.unit_id || 'skyview').toLowerCase();
    const details = UNIT_WELCOME_DETAILS[unitId] || UNIT_WELCOME_DETAILS.skyview;
    const ref = (booking.id || '').substring(0, 8).toUpperCase();
    const inDateReadable = formatDateEAT(booking.check_in);
    const outDateReadable = formatDateEAT(booking.check_out);
    const amountStr = Number(paymentInfo.amount || booking.total_price || 0).toLocaleString('en-KE');
    const gateway = paymentInfo.gateway || 'M-PESA (Buy Goods)';
    const tx = paymentInfo.transaction_ref || 'CONFIRMED';
    const timeEAT = formatTimeEAT();

    const todayEAT = getTodayEAT();
    const checkInNorm = normalizeDateEAT(booking.check_in);
    const currentHourEAT = getCurrentHourEAT();
    const isPast1pmOnCheckInDay = checkInNorm && checkInNorm <= todayEAT && currentHourEAT >= 13;

    const accessDispatchStatus = isPast1pmOnCheckInDay
      ? '🟢 <strong>Check-in credentials dispatched immediately</strong> to guest (Check-in is today and payment completed past 1:00 PM EAT).'
      : `🟡 Check-in credentials scheduled to dispatch at <strong>1:00 PM EAT</strong> on arrival day (${inDateReadable}).`;

    return {
      text: `[PAYMENT CONFIRMED] KES ${amountStr} received for ${details.name} (Ref #${ref}) from ${booking.guest_name}. Check-in: ${inDateReadable}, Check-out: ${outDateReadable}. Gateway Ref: ${tx}.`,
      title: 'Operations Alert · Payment Confirmed',
      subject: `[ALERT] Payment Confirmed: KES ${amountStr} - ${details.name} (#${ref})`,
      preheader: `Payment received: KES ${amountStr} for ${details.name} from ${booking.guest_name}.`,
      heroImage: getUnitHeroImage(unitId),
      badge: 'STAFF OPERATIONS ALERT · PAYMENT RECEIVED',
      headingLine1: 'Payment Confirmed',
      headingLine2: `#${ref}`,
      paragraphs: [
        `Hello Team,`,
        `A payment has been confirmed and verified on the estate booking engine at <strong>${timeEAT}</strong>. The suite dates are locked.`,
        `<strong>Guest Details:</strong><br/>
         • Name: <strong>${booking.guest_name || 'Guest'}</strong><br/>
         • Phone: <strong>${booking.guest_phone || 'N/A'}</strong><br/>
         • Email: <strong>${booking.guest_email || 'N/A'}</strong><br/>
         • Party: <strong>${booking.adults || 1} Adult(s)</strong>${booking.children ? `, ${booking.children} Child(ren)` : ''}`,
        `<strong>Reservation Details:</strong><br/>
         • Suite: <strong>${details.fullName || details.name}</strong><br/>
         • Check-in: <strong>${inDateReadable}</strong> (from 2:00 PM EAT)<br/>
         • Check-out: <strong>${outDateReadable}</strong> (by 10:00 AM EAT)`,
        `<strong>Transaction Audit:</strong><br/>
         • Total Amount: <strong style="color: #1a9e35; font-size: 16px;">KES ${amountStr}</strong><br/>
         • Payment Gateway: <strong>${gateway}</strong><br/>
         • Transaction Reference: <strong style="font-family: monospace;">${tx}</strong><br/>
         • Automated Dispatch: ${accessDispatchStatus}`
      ],
      alertText: `🔑 <strong>Unit Access Credentials:</strong><br/>
Apartment: <strong>${details.apartmentNo}</strong> | Lock Box Code: <strong>${booking.passcode || 'Assigned'}</strong> | Wi-Fi: <strong>${details.wifiSSID || details.wifiUsername}</strong> (Password: <strong>${details.wifiPass || details.wifiPassword}</strong>)`,
      bookingRef: ref,
      button: {
        label: 'Open Staff Operations Portal',
        url: 'https://www.luluaurelian.co.ke/#/portal'
      }
    };
  }
};

// ==========================================
// WHATSAPP TEMPLATES
// ==========================================
export const WHATSAPP_TEMPLATES = {
  /**
   * WhatsApp text alert sent to notify guests of status updates (APPROVED, DECLINED, etc.)
   */
  BOOKING_STATUS_ALERT: (booking, status) => {
    const unitId = (booking.unit_id || 'skyview').toLowerCase();
    const details = UNIT_WELCOME_DETAILS[unitId] || UNIT_WELCOME_DETAILS.skyview;
    return `Hello *${booking.guest_name}*, this is Lulu Aurelian Estate. Your booking for *${details.name}* is currently *${status}*.

📍 *Location:* ${details.location}
🗺️ *Google Maps Pin:* ${details.mapUrl}

Status updates and receipt coordinates will be dispatched to your email at ${booking.guest_email}. Reference ID: ${booking.id.substring(0, 8).toUpperCase()}`;
  },

  /**
   * WhatsApp text alert sent immediately after successful payment.
   * Informs the client that payment was successful and that check-in details
   * will be sent as from 1:00 PM on their check-in day.
   */
  BOOKING_PAID_CONFIRMATION: (booking) => {
    const unitId = (booking.unit_id || 'skyview').toLowerCase();
    const details = UNIT_WELCOME_DETAILS[unitId] || UNIT_WELCOME_DETAILS.skyview;
    const inDateReadable = formatDateEAT(booking.check_in);
    const outDateReadable = formatDateEAT(booking.check_out);

    const todayEAT = getTodayEAT();
    const checkInNorm = normalizeDateEAT(booking.check_in);
    const currentHourEAT = getCurrentHourEAT();
    const isPast1pmOnCheckInDay = checkInNorm && checkInNorm <= todayEAT && currentHourEAT >= 13;

    const accessNote = isPast1pmOnCheckInDay
      ? `🔑 *Immediate Access Details Dispatched:* Since check-in is today and payment completed past 1:00 PM EAT, your complete check-in access details (apartment number, lock box code, and Wi-Fi credentials) have been dispatched to you immediately via separate message.`
      : `🔑 *Check-in Access Details:* Your complete check-in access details (apartment number, door lock box code, and Wi-Fi credentials) will be sent to you as from *1:00 PM EAT* on your check-in day (${inDateReadable}), allowing you early access to the unit.`;

    return `Hello *${booking.guest_name}*, thank you for your payment! Your reservation for *${details.fullName || details.name}* is fully confirmed.

📅 *Stay Dates:* ${inDateReadable} to ${outDateReadable}
🕒 *Check-In Time:* After 2:00 PM EAT (Early entry from 1:00 PM EAT)
🕘 *Check-Out Time:* Before 10:00 AM EAT

📍 *Location:* ${details.location}
🗺️ *Google Maps Pin:* ${details.mapUrl}

${accessNote}

Should you need any assistance, feel free to reach out:
Safaricom: 0112299384
Airtel: 0756958531

Warm Regards,
LuluAurelian team`;
  },

  /**
   * WhatsApp alert sent to estate managers and agents upon confirmed payment.
   */
  STAFF_PAYMENT_ALERT: (booking, paymentInfo = {}) => {
    const unitId = (booking.unit_id || 'skyview').toLowerCase();
    const details = UNIT_WELCOME_DETAILS[unitId] || UNIT_WELCOME_DETAILS.skyview;
    const ref = (booking.id || '').substring(0, 8).toUpperCase();
    const inDateReadable = formatDateEAT(booking.check_in);
    const outDateReadable = formatDateEAT(booking.check_out);
    const amountStr = Number(paymentInfo.amount || booking.total_price || 0).toLocaleString('en-KE');
    const tx = paymentInfo.transaction_ref || 'VERIFIED';
    const gateway = paymentInfo.gateway || 'M-PESA';

    return `🔔 *[STAFF ALERT: PAYMENT CONFIRMED]* 🔔

A guest payment has been verified on Lulu Aurelian Estate!

🏨 *Suite:* ${details.name}
🔖 *Booking Ref:* #${ref}
👤 *Guest:* ${booking.guest_name || 'Guest'} (${booking.guest_phone || 'N/A'})
💰 *Amount Paid:* KES ${amountStr}
💳 *Gateway / Ref:* ${gateway} · ${tx}
📅 *Check-In:* ${inDateReadable} (from 2:00 PM EAT)
📅 *Check-Out:* ${outDateReadable} (by 10:00 AM EAT)

View and manage on Staff Portal: https://www.luluaurelian.co.ke/#/portal`;
  },

  /**
   * WhatsApp check-in credentials sent as from 1:00 PM on check-in day.
   */
  CHECK_IN_CREDENTIALS: (booking) => {
    const unitId = (booking.unit_id || 'skyview').toLowerCase();
    const details = UNIT_WELCOME_DETAILS[unitId] || UNIT_WELCOME_DETAILS.skyview;
    const isDummy = (val) => !val || typeof val !== 'string' || !val.trim() || val.includes('LuluAurelian_') || val.includes('Luxury2026');
    const lockboxCode = (!isDummy(booking.passcode)) ? booking.passcode.trim() : (details.passcode || '');
    const aptNumber = (booking.house_number && String(booking.house_number).trim()) ? String(booking.house_number).trim() : (details.apartmentNo || details.house_number || '');
    const wifiSSID = (!isDummy(booking.wifi_ssid)) ? booking.wifi_ssid.trim() : (details.wifiUsername || details.wifiSSID);
    const wifiPass = (!isDummy(booking.wifi_password)) ? booking.wifi_password.trim() : (details.wifiPassword || details.wifiPass);

    if (unitId === 'skyview') {
      return `Welcome to Lulu Aurenian Furnished Apartments- SkyView!

We’re delighted to host you  and hope you enjoy your stay.🤗

📍 Location: Skyline Apartments, off Nyeri - Nairobi Road next to  former Rubis Petrol Station. Skuta, Nyeri.
🗺️ Google Maps Pin: https://maps.google.com/?q=-0.433276973199735,36.96868842933756

Apartment No: ${aptNumber || '16 (Top floor)'}
🔑 Key Access:
The key is in the lock box located just outside the door.

🔐 Lock box code: ${lockboxCode}

📶 Wi-Fi Details:

Username: ${wifiSSID}
Password:  ${wifiPass}

🕒 Check-in: After  2:00 PM
🕘 Check-out: Before 10:00 AM

🔊 All items in the units are at your disposal to use except the washing machine  in the second balcony that the guest needs express permission from the host  to use.

Should you need any assistance during your stay, feel free to reach out.

Thank you!

Warm Regards,

LuluAurelian team

Safaricom-0112299384
Airtel-0756958531`;
    }

    if (unitId === 'cocoa') {
      return `Welcome to Lulu Aurelian Furnished Apartments- Cocoa Home!

We’re delighted to host you  and hope you enjoy your stay.

📍 Location: Skyline Apartments, off Nyeri - Nairobi Road next to  former Rubis Petrol Station. Skuta, Nyeri.
🗺️ Google Maps Pin: https://maps.google.com/?q=-0.433276973199735,36.96868842933756

Apartment No: ${aptNumber || '19 (First floor)'}
🔑 Key Access:

The key is in the lock box located just outside the door.

Lock box code: ${lockboxCode}

📶 Wi-Fi Details:
User name: ${wifiSSID}
password: ${wifiPass}

Extension in the bedroom:
User name: Bedroom 
Password: CMutwiri 

🕒 Check-in: After 2:00 PM
🕘 Check-out: Before 10:00 AM.

Should you need any assistance during your stay, feel free to reach out.

Thank you!
Luluaurelian

Safaricom- 112 299384 
*Airtel-0756 958531*`;
    }

    // Neema
    return `Welcome to Lulu Aurelian Furnished Apartments- Neema home!

We’re delighted to host you  and hope you enjoy your stay.

📍 Location: Skyline Apartments, off Nyeri - Nairobi Road next to  former Rubis Petrol Station. Skuta, Nyeri.
🗺️ Google Maps Pin: https://maps.google.com/?q=-0.433276973199735,36.96868842933756

Apartment No: ${aptNumber || 'SL- 2  (First floor)'}
🔑 Key Access:

The key is in the lock box located just outside the door.

Lock box code: ${lockboxCode}

📶 Wi-Fi Details:
User name: ${wifiSSID}
password: ${wifiPass}

🕒 Check-in: After 2:00 PM
🕘 Check-out: Before 10:00 AM.

Should you need any assistance during your stay, feel free to reach out.

Thank you!
LuluAurelian team

Safaricom- 112 299384 
*Airtel-0756 958531*`;
  },

  /**
   * Alias for backward compatibility
   */
  BOOKING_PAID_FULFILLMENT: (booking) => {
    return WHATSAPP_TEMPLATES.CHECK_IN_CREDENTIALS(booking);
  },

  /**
   * Alias for check-in day arrival
   */
  CHECK_IN_DAY_ARRIVAL: (booking) => {
    return WHATSAPP_TEMPLATES.CHECK_IN_CREDENTIALS(booking);
  },

  /**
   * WhatsApp text alert sent when an approved reservation expires due to unpaid TTL (3 hours)
   */
  BOOKING_CANCELED_EXPIRED: (booking) => {
    return `Dear ${booking.guest_name}, your approved reservation ${booking.id.substring(0, 8)} has been canceled because the strict 3-hour payment window expired.`;
  },

  /**
   * WhatsApp morning comfort follow-up ping the morning after check-in
   */
  CHECK_IN_FOLLOW_UP: (booking) => {
    const unitId = (booking.unit_id || 'skyview').toLowerCase();
    const details = UNIT_WELCOME_DETAILS[unitId] || UNIT_WELCOME_DETAILS.skyview;
    return `Good morning *${booking.guest_name}*, we hope you had a comfortable night in your suite at *${details.name}*.

📍 *Estate Location:* ${details.location}
🗺️ *Google Maps Pin:* ${details.mapUrl}

If there is anything we can do to improve your experience, please let us know!`;
  },

  /**
   * WhatsApp morning check-out reminder sent before 10:00 AM on check-out day
   */
  CHECKOUT_MORNING_REMINDER: (booking) => {
    return `Good morning ,

Thank you so much for booking with us!

We hope you had a good stay.  

As you prepare to check out, please take a moment to review the following:

🕙 Check-out Time:

Before  10:00 AM. Our house keeper will be there at 10:10 Am to reset the house. 

✨ Lights & Windows.

Please ensure all lights are turned off, windows are closed, and the door is locked behind you when you leave.

✨ Towels & Linen.

Kindly leave used towels and linens in the laundry basket provided in each room before you check out.

🔑 Keys.

Please return the key to the lockbox and scramble the code afterward.
Use the same code you used to open the lockbox.

We hope to welcome you again. 

Regards,


LuluAurelian team`;
  },

  /**
   * WhatsApp feedback request ping sent on the day of checkout
   */
  CHECKOUT_REVIEW_REQUEST: (booking) => {
    return `Hello *${booking.guest_name}*, we trust your stay was flawless. To help us maintain our standards, please review us: https://www.luluaurelian.co.ke/#/review?token=${booking.secure_token}`;
  }
};

