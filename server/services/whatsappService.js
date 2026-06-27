import { WHATSAPP_TEMPLATES } from '../config/constants.js';
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
      const passcode = await db.unit_settings.getPasscode(booking.unit_id);
      const bookingWithPasscode = { ...booking, passcode };
      message = WHATSAPP_TEMPLATES.BOOKING_PAID_FULFILLMENT(bookingWithPasscode);
    } else {
      message = WHATSAPP_TEMPLATES.BOOKING_STATUS_ALERT(booking, status);
    }
    return this.sendWhatsapp(booking.guest_phone, message);
  }

  async sendLifecyclePing(phone, message) {
    return this.sendWhatsapp(phone, message);
  }
}

export const whatsappService = new WhatsappService();
