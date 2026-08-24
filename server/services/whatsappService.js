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
      const settings = await db.unit_settings.getSettings(booking.unit_id);
      const bookingWithSettings = {
        ...booking,
        passcode: settings.passcode,
        house_number: settings.house_number,
        wifi_ssid: settings.wifi_ssid,
        wifi_password: settings.wifi_password
      };
      message = WHATSAPP_TEMPLATES.BOOKING_PAID_FULFILLMENT(bookingWithSettings);
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
