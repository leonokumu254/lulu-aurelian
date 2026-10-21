import { WHATSAPP_TEMPLATES, UNIT_WELCOME_DETAILS } from '../config/constants.js';
import { db } from '../config/db.js';

class WhatsappService {
  async sendWhatsapp(to, message) {
    console.log('\n========================================================================');
    console.log(`[WHATSAPP API DISPATCH] Recipient: ${to}`);
    console.log('------------------------------------------------------------------------');
    console.log(message);
    console.log('========================================================================\n');
    return { success: true, trackingId: `wa-tx-${Date.now()}` };
  }

  async sendBookingStatusAlert(booking, status) {
    let message;
    if (status === 'PAID') {
      message = WHATSAPP_TEMPLATES.BOOKING_PAID_CONFIRMATION(booking);
    } else {
      message = WHATSAPP_TEMPLATES.BOOKING_STATUS_ALERT(booking, status);
    }
    return this.sendWhatsapp(booking.guest_phone, message);
  }

  async sendCheckInCredentials(booking) {
    const settings = await db.unit_settings.getSettings(booking.unit_id);
    const unitKey = (booking.unit_id || 'skyview').toLowerCase();
    const canon = UNIT_WELCOME_DETAILS[unitKey] || UNIT_WELCOME_DETAILS.skyview;
    const isDummy = (val) => !val || typeof val !== 'string' || !val.trim() || val.includes('LuluAurelian_') || val.includes('Luxury2026');

    const bookingWithSettings = {
      ...booking,
      passcode: (!isDummy(settings?.passcode)) ? settings.passcode.trim() : (canon.passcode || '9010'),
      house_number: (settings?.house_number && String(settings.house_number).trim()) ? String(settings.house_number).trim() : (canon.house_number || canon.apartmentNo),
      wifi_ssid: (!isDummy(settings?.wifi_ssid)) ? settings.wifi_ssid.trim() : (canon.wifiSSID || canon.wifiUsername),
      wifi_password: (!isDummy(settings?.wifi_password)) ? settings.wifi_password.trim() : (canon.wifiPass || canon.wifiPassword)
    };
    const message = WHATSAPP_TEMPLATES.CHECK_IN_CREDENTIALS(bookingWithSettings);
    return this.sendWhatsapp(booking.guest_phone, message);
  }

  async sendCheckoutReminder(booking) {
    const message = WHATSAPP_TEMPLATES.CHECKOUT_MORNING_REMINDER(booking);
    return this.sendWhatsapp(booking.guest_phone, message);
  }

  async sendStaffPaymentAlert(booking, paymentInfo = {}) {
    const staffPhone = '254112299384'; // Central Manager & Concierge line
    const message = WHATSAPP_TEMPLATES.STAFF_PAYMENT_ALERT(booking, paymentInfo);
    return this.sendWhatsapp(staffPhone, message);
  }

  async sendStaffReviewAlert(review, booking) {
    const staffPhone = '254112299384';
    const ratingStars = '★'.repeat(Math.max(1, Math.min(5, review.rating)));
    const guestName = booking?.guest_name || 'Guest';
    const unitName = booking?.unit_id ? booking.unit_id.toUpperCase() : 'ESTATE';
    const message = `⭐ *NEW GUEST REVIEW RECEIVED* ⭐\n\n*Suite:* ${unitName}\n*Guest:* ${guestName}\n*Rating:* ${ratingStars} (${review.rating}/5)\n\n*Review:*\n"${review.comment || 'No comment'}"\n\n_Review can be moderated in the Staff Portal._`;
    return this.sendWhatsapp(staffPhone, message);
  }

  async sendLifecyclePing(phone, message) {
    return this.sendWhatsapp(phone, message);
  }
}

export const whatsappService = new WhatsappService();
