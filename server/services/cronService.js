import cron from 'node-cron';
import { db } from '../config/db.js';
import { emailService } from './emailService.js';
import { whatsappService } from './whatsappService.js';
import { WHATSAPP_TEMPLATES } from '../config/constants.js';

class CronService {
  initializeScheduledTasks() {
    console.log('[CRON SERVICE]: Registering automated systems...');

    // 1. 3-HOUR EXPIRATION ENGINE (Runs every 15 minutes)
    cron.schedule('*/15 * * * *', () => {
      this.cancelExpiredApprovedBookings();
    });

    // 2. STAY LIFECYCLE MONITOR & MESSAGING ENGINE (Runs daily at 09:00 AM)
    cron.schedule('0 9 * * *', () => {
      this.runLifecycleMessagingHooks();
    });

    console.log('[CRON SERVICE]: Expiration Engine (Hourly) and Lifecycle messaging (Daily) configured.');
  }

  // Task: Cancel APPROVED bookings that exceeded 3-hour time-to-live without payment
  async cancelExpiredApprovedBookings() {
    console.log('[CRON WORKER]: Scanning for expired APPROVED reservations...');
    const TTL_LIMIT_MS = 3 * 60 * 60 * 1000; // 3 Hours in milliseconds

    let expiredCount = 0;
    try {
      const expiredBookings = await db.bookings.findExpiredApproved(TTL_LIMIT_MS);

      for (const b of expiredBookings) {
        await db.bookings.updateStatus(b.id, 'CANCELED');
        expiredCount++;
        
        console.log(`[CRON EXPIRE]: Booking Ref ${b.id} CANCELED due to payment window expiration (TTL limit exceeded).`);
        
        whatsappService.sendLifecyclePing(
          b.guest_phone,
          WHATSAPP_TEMPLATES.BOOKING_CANCELED_EXPIRED(b)
        );
      }

      if (expiredCount > 0) {
        console.log(`[CRON WORKER]: Expiration run completed. Canceled ${expiredCount} bookings.`);
      } else {
        console.log('[CRON WORKER]: Expiration run completed. No expired bookings detected.');
      }
    } catch (err) {
      console.error('[CRON SERVICE ERROR]: Expiration scanner failed:', err.message);
    }
  }

  // Task: Scan stay calendars and dispatch relevant messaging alerts
  async runLifecycleMessagingHooks() {
    console.log('[CRON WORKER]: Triggering stay lifecycle messaging hooks...');
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Calculate yesterday's date string
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    try {
      const paidBookings = await db.bookings.findPaidBookings();

      for (const b of paidBookings) {
        // A. Next-Morning Comfort Check-in (Check-in was yesterday)
        if (b.check_in === yesterdayStr) {
          console.log(`[LIFECYCLE WORKER]: Dispatching comfort check-in to ${b.guest_name} (Checked in yesterday).`);
          emailService.sendCheckInFollowUp(b);
          whatsappService.sendLifecyclePing(
            b.guest_phone, 
            WHATSAPP_TEMPLATES.CHECK_IN_FOLLOW_UP(b)
          );
        }

        // B. Post-Checkout Review Request (Check-out is today)
        if (b.check_out === todayStr) {
          console.log(`[LIFECYCLE WORKER]: Dispatching review feedback link to ${b.guest_name} (Checking out today).`);
          emailService.sendCheckoutReviewRequest(b);
          whatsappService.sendLifecyclePing(
            b.guest_phone,
            WHATSAPP_TEMPLATES.CHECKOUT_REVIEW_REQUEST(b)
          );
        }
      }
    } catch (err) {
      console.error('[CRON SERVICE ERROR]: Lifecycle messaging scanner failed:', err.message);
    }

    // C. 90-Day Retention & Holiday Pings (Opted-in newsletter subscribers)
    await this.runHolidayRetentionAlerts();
  }

  // Marketing retention campaigns
  async runHolidayRetentionAlerts() {
    // Detect special national/holiday dates and trigger alerts
    const today = new Date();
    const month = today.getMonth() + 1; // 1-12
    const date = today.getDate(); // 1-31

    let holidayName = '';

    // Mock Date Matching for Kenyan Holiday Calendars & Valentine's Day
    if (month === 2 && date === 14) holidayName = "Valentine's Day";
    else if (month === 6 && date === 1) holidayName = 'Madaraka Day';
    else if (month === 10 && date === 20) holidayName = 'Mashujaa Day';

    if (holidayName) {
      console.log(`[CRON RETENTION]: Match found for ${holidayName}. Triggering marketing campaign pings...`);
      
      try {
        const activeSubscribers = await db.newsletters.getActive();
        activeSubscribers.forEach(sub => {
          emailService.sendHolidayMarketing(sub.email, holidayName);
        });
        
        console.log(`[CRON RETENTION]: Dispatched ${activeSubscribers.length} holiday campaigns.`);
      } catch (err) {
        console.error('[CRON SERVICE ERROR]: Holiday retention alerts failed:', err.message);
      }
    } else {
      console.log('[CRON RETENTION]: No holiday date match detected for today.');
    }
  }
}

export const cronService = new CronService();
