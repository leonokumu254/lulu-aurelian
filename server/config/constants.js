/**
 * Messaging templates for Emails and WhatsApp notifications for Lulu Aurelian Estate.
 * Contains only content values (text, subjects, preheaders, titles, and structure descriptors).
 * Stylistic layout and CSS formatting are handled separately by the dispatch services.
 */

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
      '✨ Care & Respect: Please treat the home and furnishings with care. Report any accidental damage as soon as possible.',
      '🧼 Cleanliness: Wash used dishes before checkout and dispose of trash in designated bins. Towels are strictly for personal drying (not for shoes or spills).',
      '🔇 Noise & Quiet Hours: Please keep noise to a respectful level, especially between 10:00 PM and 7:00 AM.',
      '🚭 Strictly No Smoking: Smoking or vaping is not permitted inside the apartment or on the balcony.',
      '👥 Registered Guests: Only registered guests on the reservation are allowed. No unauthorized parties or events.',
      '🌱 Live Plants: Please do not water or move the indoor plants, and ensure children do not pull at them.',
      '🌤️ Balcony & Top-Floor Safety: Supervise children on the balcony at all times. Washing machine on 2nd balcony requires express prior permission from host.',
      '🔐 Safety & Security: Always lock doors and windows when leaving the apartment.',
      '🛏️ Before Checkout: Check-out is before 10:00 AM. Ensure lights, appliances, and AC/heaters are turned off.'
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
      '✨ Care & Respect: Please treat the home and furnishings with care. Report accidental damage promptly.',
      '🧼 Cleanliness: Please clean up after yourself in common areas and wash used dishes before checkout.',
      '🔇 Quiet Hours: Please keep noise to a reasonable level, especially between 10:00 PM and 7:00 AM.',
      '🚭 Strictly No Smoking: Smoking or vaping is not permitted inside the property.',
      '👥 Registered Guests: Only registered guests on the reservation are allowed. No unauthorized parties or events.',
      '🔐 Security: Always lock doors and windows when leaving the property.',
      '🛏️ Before Checkout: Check-out is strictly before 10:00 AM. Ensure all lights and appliances are turned off.'
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
      '✨ Care & Respect: Please treat the home and furnishings with care. Report accidental damage promptly.',
      '🧼 Cleanliness: Kindly clean up after yourself and wash used dishes before checkout.',
      '🔇 Consideration: Please keep noise to a respectful level, especially between 10:00 PM and 7:00 AM.',
      '🚭 Strictly No Smoking: Smoking or vaping is not permitted inside the property.',
      '👥 Registered Guests: Only registered guests on the reservation are permitted. No parties or events.',
      '🔐 Security & Balcony: Ensure the balcony door is securely latched during high winds. Always lock doors when leaving.',
      '🛏️ Before Checkout: Check-out is strictly before 10:00 AM. Ensure lights and appliances are turned off.'
    ]
  }
};

// ==========================================
// COMPREHENSIVE HOUSE RULES & GUIDELINES
// ==========================================
export const DEFAULT_HOUSE_RULES = {
  skyview: {
    unit_id: 'skyview',
    title: '🏡 House Rules & Guest Guidelines',
    subtitle: 'Welcome to Lulu Aurelian Apartment Skyview Hideaway!',
    welcomeNote: 'We’re delighted to host you. To ensure a comfortable, safe, and enjoyable stay for everyone, please take a moment to review the guidelines below. These help us maintain the quality of the space and provide a positive experience for all guests!',
    specialGatewayText: '🌿 Welcome to Lulu Aurelian Apartments - Skyview Gateway\n\nWe’re honored to share our top-floor apartment with you. This space has been prepared with care, thoughtfulness, and a love for comfort. To help us maintain its beauty for all who stay, we kindly ask that you take a moment to read the guidelines below.',
    sections: [
      {
        id: 'care',
        icon: '✨',
        title: '1. Care & Respect for the Property',
        items: [
          'Please treat the home and all furnishings with care.',
          'Report any accidental damage or breakage as soon as possible—early communication helps us resolve issues smoothly.',
          'Please use coasters, placemats, and protective surfaces where provided.',
          'Only use appliances and amenities for their intended purposes.'
        ]
      },
      {
        id: 'cleanliness',
        icon: '🧼',
        title: '2. Cleanliness',
        items: [
          'Kindly clean up after yourself in common areas and the kitchen.',
          'Wash used dishes or load them into the dishwasher before checkout.',
          'Dispose of trash in the designated bins.',
          'Wipe up spills promptly to avoid stains or damage.',
          'Please use towels only for their intended purpose (personal drying). Towels must not be used for cleaning shoes, spills, or any other inappropriate purpose.',
          'Guests are expected to leave the apartment in a tidy condition. Extra cleaning due to negligence or misuse of items may incur additional charges.',
          'Leave furniture and items in the same place you found them.'
        ]
      },
      {
        id: 'noise',
        icon: '🔇',
        title: '3. Noise & Consideration',
        items: [
          'Please keep noise to a reasonable level, especially between 10:00 PM and 7:00 AM.',
          'Be considerate of neighbors and other guests at all times.'
        ]
      },
      {
        id: 'smoking',
        icon: '🚭',
        title: '4. Smoking & Vaping',
        items: [
          'Smoking or vaping inside the property is not allowed.',
          'If you smoke outdoors, please use the provided ashtrays and dispose of cigarette waste responsibly.'
        ]
      },
      {
        id: 'guests',
        icon: '👥',
        title: '5. Guests & Visitors',
        items: [
          'Only registered guests are allowed on the property unless otherwise approved.',
          'No parties or events without prior consent.'
        ]
      },
      {
        id: 'pets',
        icon: '🐾',
        title: '6. Pets (If applicable)',
        items: [
          'Pets are welcome only if approved in advance.',
          'Please clean up after your pet and ensure they do not damage furniture or disturb neighbors.'
        ]
      },
      {
        id: 'safety',
        icon: '🔐',
        title: '7. Safety & Security',
        items: [
          'Always lock doors and windows when leaving the property.',
          'Do not tamper with smoke detectors, security devices, or safety equipment.',
          'Familiarize yourself with emergency exits and procedures.'
        ]
      },
      {
        id: 'checkout',
        icon: '🛏️',
        title: '8. Before Checkout',
        items: [
          'Please follow the checkout instructions provided.',
          'Leave used towels in the designated area.',
          'Ensure all lights, appliances, and AC/heating units are turned off.'
        ]
      },
      {
        id: 'plants',
        icon: '🌱',
        title: 'Live Plants',
        items: [
          'You’ll notice several live plants throughout the apartment. These are part of the home’s atmosphere and are cared for regularly.',
          'Please do not water or move the plants, and kindly ensure children do not play with or pull at them.',
          'Your help keeps them healthy and thriving.'
        ]
      },
      {
        id: 'balcony',
        icon: '🌤️',
        title: 'Balcony & Safety',
        items: [
          'The apartment sits on the top floor, offering a beautiful view and calming outdoor space.',
          'Please supervise children at all times when using the balcony.',
          'Avoid leaning over railings or adjusting balcony furniture.',
          'Enjoy the space responsibly and mindfully.',
          'All items in the units are at your disposal to use except the washing machine in the second balcony that requires express permission from the host to use.'
        ]
      }
    ],
    closingMessage: 'Thank you for respecting the space and being a considerate guest. Your cooperation helps us maintain a wonderful experience for everyone. We hope your time in this space is peaceful, memorable, and filled with beautiful moments! 💛',
    supportContacts: {
      safaricom: '0112299384',
      airtel: '0756958531'
    }
  },
  cocoa: {
    unit_id: 'cocoa',
    title: '🏡 House Rules & Guest Guidelines',
    subtitle: 'Welcome to Lulu Aurelian Furnished Apartments - Cocoa Home!',
    welcomeNote: 'We’re delighted to host you and hope you enjoy your stay. To ensure a comfortable, safe, and enjoyable stay for everyone, please take a moment to review the guidelines below.',
    sections: [
      {
        id: 'care',
        icon: '✨',
        title: '1. Care & Respect for the Property',
        items: [
          'Please treat the home and all furnishings with care.',
          'Report any accidental damage or breakage as soon as possible—early communication helps us resolve issues smoothly.',
          'Please use coasters, placemats, and protective surfaces where provided.',
          'Only use appliances and amenities for their intended purposes.'
        ]
      },
      {
        id: 'cleanliness',
        icon: '🧼',
        title: '2. Cleanliness',
        items: [
          'Kindly clean up after yourself in common areas and the kitchen.',
          'Wash used dishes before checkout.',
          'Dispose of trash in designated bins and wipe spills promptly.',
          'Please use towels only for personal drying (not for cleaning shoes or spills).',
          'Guests are expected to leave the apartment in a tidy condition.'
        ]
      },
      {
        id: 'noise',
        icon: '🔇',
        title: '3. Noise & Consideration',
        items: [
          'Please keep noise to a reasonable level, especially between 10:00 PM and 7:00 AM.',
          'Be considerate of neighbors and other guests at all times.'
        ]
      },
      {
        id: 'smoking',
        icon: '🚭',
        title: '4. Smoking & Vaping',
        items: [
          'Smoking or vaping inside the property is strictly not allowed.',
          'If you smoke outdoors, please use the provided ashtrays and dispose of cigarette waste responsibly.'
        ]
      },
      {
        id: 'guests',
        icon: '👥',
        title: '5. Guests & Visitors',
        items: [
          'Only registered guests are allowed on the property unless otherwise approved.',
          'No parties or events without prior consent.'
        ]
      },
      {
        id: 'safety',
        icon: '🔐',
        title: '6. Safety & Security',
        items: [
          'Always lock doors and windows when leaving the property.',
          'Do not tamper with safety devices or equipment.'
        ]
      },
      {
        id: 'checkout',
        icon: '🛏️',
        title: '7. Before Checkout',
        items: [
          'Check-out is strictly before 10:00 AM.',
          'Leave used towels in the designated area.',
          'Ensure all lights and appliances are turned off.'
        ]
      }
    ],
    closingMessage: 'Thank you for choosing Cocoa Home and treating this property with care. We hope your stay is peaceful and memorable! 💛',
    supportContacts: {
      safaricom: '0112299384',
      airtel: '0756958531'
    }
  },
  neema: {
    unit_id: 'neema',
    title: '🏡 House Rules & Guest Guidelines',
    subtitle: 'Welcome to Lulu Aurelian Furnished Apartments - Neema Home!',
    welcomeNote: 'We’re delighted to host you and hope you enjoy your stay. To ensure a comfortable, safe, and enjoyable stay for everyone, please review the guidelines below.',
    sections: [
      {
        id: 'care',
        icon: '✨',
        title: '1. Care & Respect for the Property',
        items: [
          'Please treat the home and all furnishings with care.',
          'Report any accidental damage or breakage as soon as possible.',
          'Only use appliances and amenities for their intended purposes.'
        ]
      },
      {
        id: 'cleanliness',
        icon: '🧼',
        title: '2. Cleanliness',
        items: [
          'Kindly clean up after yourself in common areas and the kitchen.',
          'Wash used dishes before checkout.',
          'Dispose of trash in designated bins and wipe spills promptly.',
          'Please use towels only for personal drying.'
        ]
      },
      {
        id: 'noise',
        icon: '🔇',
        title: '3. Noise & Consideration',
        items: [
          'Please keep noise to a reasonable level, especially between 10:00 PM and 7:00 AM.',
          'Be considerate of neighbors at all times.'
        ]
      },
      {
        id: 'smoking',
        icon: '🚭',
        title: '4. Smoking & Vaping',
        items: [
          'Smoking or vaping inside the property is strictly not allowed.',
          'If you smoke outdoors, please use the provided ashtrays.'
        ]
      },
      {
        id: 'guests',
        icon: '👥',
        title: '5. Guests & Visitors',
        items: [
          'Only registered guests are allowed on the property unless otherwise approved.',
          'No parties or events without prior consent.'
        ]
      },
      {
        id: 'safety',
        icon: '🔐',
        title: '6. Safety & Security',
        items: [
          'Always lock doors and windows when leaving the property.',
          'Please ensure the balcony door is securely latched during high winds.'
        ]
      },
      {
        id: 'checkout',
        icon: '🛏️',
        title: '7. Before Checkout',
        items: [
          'Check-out is strictly before 10:00 AM.',
          'Leave used towels in the designated area and turn off all lights.'
        ]
      }
    ],
    closingMessage: 'Thank you for choosing Neema Home and being a wonderful guest. We hope your stay is peaceful and restful! 💛',
    supportContacts: {
      safaricom: '0112299384',
      airtel: '0756958531'
    }
  }
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
    return {
      text: `Dear ${booking.guest_name}, We have received your booking request for ${details.name}.`,
      title: 'Reservation Request Received',
      subject: `Reservation Request Received: Ref #${booking.id.substring(0, 8)}`,
      preheader: `Your booking for ${details.name} is awaiting payment.`,
      heroImage: unitId === 'cocoa' 
        ? 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/827123623.jpg?k=1984bd8ee32203a3d8e7b9b68a2793fcd784a2f434594d2e3189fccc77ee602f&o='
        : unitId === 'neema'
        ? 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/827123567.jpg?k=69b2a1ce45be6fe744d09881cf8b0f20898a61b5ce737fa36787147be35acada&o='
        : 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/773920322.jpg?k=f1777694ce60ac5b3585f28b1e970fb84c1fb5acc577d36cd81e44846279dd91&o=',
      badge: 'Action Required',
      headingLine1: 'Awaiting',
      headingLine2: 'Payment',
      paragraphs: [
        `Dear ${booking.guest_name},`,
        `We have received your booking request for <strong>${details.name}</strong> (Check-in: ${booking.check_in}, Check-out: ${booking.check_out}).`
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
   * Content for payment success confirmation email.
   * Sent immediately after successful payment.
   * Informs the client that payment succeeded and that complete check-in details
   * will be sent as from 1:00 PM on their check-in day.
   */
  PAYMENT_SUCCESS_CONFIRMATION: (booking) => {
    const unitId = (booking.unit_id || 'skyview').toLowerCase();
    const details = UNIT_WELCOME_DETAILS[unitId] || UNIT_WELCOME_DETAILS.skyview;
    return {
      text: `Dear ${booking.guest_name}, thank you for your payment! Your reservation for ${details.fullName || details.name} is fully confirmed. Full check-in details (lock box code, apartment number, Wi-Fi credentials) will be sent as from 1:00 PM on your check-in day (${booking.check_in}). Location: ${details.location}. Check-in: After 2:00 PM. Check-out: Before 10:00 AM.`,
      title: 'Payment Successful - Booking Confirmed',
      subject: `Payment Confirmed: Your Stay at ${details.name} is Secured! (Ref #${booking.id.substring(0, 8).toUpperCase()})`,
      preheader: `Payment received successfully! Check-in details will be sent from 1:00 PM on your arrival day.`,
      heroImage: unitId === 'cocoa' 
        ? 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/827123623.jpg?k=1984bd8ee32203a3d8e7b9b68a2793fcd784a2f434594d2e3189fccc77ee602f&o='
        : unitId === 'neema'
        ? 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/827123567.jpg?k=69b2a1ce45be6fe744d09881cf8b0f20898a61b5ce737fa36787147be35acada&o='
        : 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/773920322.jpg?k=f1777694ce60ac5b3585f28b1e970fb84c1fb5acc577d36cd81e44846279dd91&o=',
      badge: 'Payment Received & Secured',
      headingLine1: 'Payment',
      headingLine2: 'Successful!',
      paragraphs: [
        `Dear ${booking.guest_name},`,
        `Thank you for choosing <strong>${details.fullName || details.name}</strong>. We are delighted to confirm that your payment has been received successfully and your booking is fully secured!`,
        `<strong>Check-In Date:</strong> ${booking.check_in}<br/><strong>Check-Out Date:</strong> ${booking.check_out}<br/><strong>Check-in Time:</strong> After 2:00 PM<br/><strong>Check-out Time:</strong> Before 10:00 AM`
      ],
      alertText: `🕒 <strong>Check-In Details Timing:</strong><br/>
Check-in is officially as from <strong>2:00 PM</strong>, but guests can access the unit earlier than planned. <strong>Your full check-in details (lock box code, apartment number, and Wi-Fi credentials) will be sent to you as from 1:00 PM</strong> on your arrival day (${booking.check_in}).`,
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
    const lockboxCode = booking.passcode || '';
    const aptNumber = booking.house_number || details.apartmentNo || '';
    const wifiSSID = booking.wifi_ssid || details.wifiUsername || details.wifiSSID;
    const wifiPass = booking.wifi_password || details.wifiPassword || details.wifiPass;

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
      heroImage: unitId === 'cocoa' 
        ? 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/827123623.jpg?k=1984bd8ee32203a3d8e7b9b68a2793fcd784a2f434594d2e3189fccc77ee602f&o='
        : unitId === 'neema'
        ? 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/827123567.jpg?k=69b2a1ce45be6fe744d09881cf8b0f20898a61b5ce737fa36787147be35acada&o='
        : 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/773920322.jpg?k=f1777694ce60ac5b3585f28b1e970fb84c1fb5acc577d36cd81e44846279dd91&o=',
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
      heroImage: unitId === 'cocoa' 
        ? 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/827123623.jpg?k=1984bd8ee32203a3d8e7b9b68a2793fcd784a2f434594d2e3189fccc77ee602f&o='
        : unitId === 'neema'
        ? 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/827123567.jpg?k=69b2a1ce45be6fe744d09881cf8b0f20898a61b5ce737fa36787147be35acada&o='
        : 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/773920322.jpg?k=f1777694ce60ac5b3585f28b1e970fb84c1fb5acc577d36cd81e44846279dd91&o=',
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
      heroImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQd-WSmf7IU8rhoVMkpn_IpS8lY_CY7akhhm1gaF7HPA&s=10',
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
      heroImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSx1QRw7IQroE1OvYqdqcw1U3-J1lI3WUFl_1-IedA0LQ&s=10',
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
      heroImage: unitId === 'cocoa' 
        ? 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/827123623.jpg?k=1984bd8ee32203a3d8e7b9b68a2793fcd784a2f434594d2e3189fccc77ee602f&o='
        : unitId === 'neema'
        ? 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/827123567.jpg?k=69b2a1ce45be6fe744d09881cf8b0f20898a61b5ce737fa36787147be35acada&o='
        : 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/773920322.jpg?k=f1777694ce60ac5b3585f28b1e970fb84c1fb5acc577d36cd81e44846279dd91&o=',
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

  GUEST_CANCELLATION: (booking) => {
    const unitId = (booking.unit_id || 'skyview').toLowerCase();
    const details = UNIT_WELCOME_DETAILS[unitId] || UNIT_WELCOME_DETAILS.skyview;
    return {
      text: `Dear ${booking.guest_name}, Your booking at ${details.name} (Ref #${booking.id.substring(0, 8)}) has been cancelled. We'd love to know why.`,
      title: 'Booking Cancelled',
      subject: `Booking Cancelled: Ref #${booking.id.substring(0, 8)}`,
      preheader: `Your reservation has been cancelled successfully.`,
      heroImage: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/773920301.jpg?k=a54142f102014f7ca339af537b0a4c026ed95739c5a2550dfc39f8129ef294ff&o=',
      badge: 'Status Update',
      headingLine1: 'Booking',
      headingLine2: 'Cancelled',
      paragraphs: [
        `Dear ${booking.guest_name},`,
        `This email confirms that your booking request for <strong>${details.name}</strong> (Check-in: ${booking.check_in}) has been successfully cancelled.`,
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
      heroImage: 'https://a0.muscache.com/im/pictures/hosting/Hosting-1563631404126316993/original/a65cf4e4-7976-4589-80e2-47668ea56329.jpeg?im_w=1200',
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
    return `Hello *${booking.guest_name}*, thank you for your payment! Your reservation for *${details.fullName || details.name}* is fully confirmed.

📅 *Stay Dates:* ${booking.check_in} to ${booking.check_out}
🕒 *Check-In Time:* After 2:00 PM
🕘 *Check-Out Time:* Before 10:00 AM

📍 *Location:* ${details.location}
🗺️ *Google Maps Pin:* ${details.mapUrl}

🔑 *Check-in Access Details:*
Your complete check-in access details (apartment number, door lock box code, and Wi-Fi credentials) will be sent to you as from *1:00 PM* on your check-in day (${booking.check_in}), allowing you early access to the unit.

Should you need any assistance, feel free to reach out:
Safaricom: 0112299384
Airtel: 0756958531

Warm Regards,
LuluAurelian team`;
  },

  /**
   * WhatsApp check-in credentials sent as from 1:00 PM on check-in day.
   */
  CHECK_IN_CREDENTIALS: (booking) => {
    const unitId = (booking.unit_id || 'skyview').toLowerCase();
    const details = UNIT_WELCOME_DETAILS[unitId] || UNIT_WELCOME_DETAILS.skyview;
    const lockboxCode = booking.passcode || '';
    const aptNumber = booking.house_number || details.apartmentNo || '';
    const wifiSSID = booking.wifi_ssid || details.wifiUsername || details.wifiSSID;
    const wifiPass = booking.wifi_password || details.wifiPassword || details.wifiPass;

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

