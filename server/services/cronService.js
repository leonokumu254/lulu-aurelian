import cron from 'node-cron';
import { db } from '../config/db.js';
import { emailService } from './emailService.js';
import { whatsappService } from './whatsappService.js';
import { WHATSAPP_TEMPLATES } from '../config/constants.js';

class CronService {
  initializeScheduledTasks() {
    console.log('[CRON SERVICE]: Registering automated systems...');

    // 1. EXPIRED PENDING HOLDS (Runs every 5 minutes — 1hr TTL)
    cron.schedule('*/5 * * * *', () => {
      this.expireUnpaidPendingBookings();
    });

    // 2. STUCK AUTHORIZING BOOKINGS (Runs every 30 minutes)
    cron.schedule('*/30 * * * *', () => {
      this.expireStuckAuthorizingBookings();
    });

    // 3. STAY LIFECYCLE MONITOR & MESSAGING ENGINE (Runs daily at 09:00 AM)
    cron.schedule('0 9 * * *', () => {
      this.runLifecycleMessagingHooks();
    });

    console.log('[CRON SERVICE]: Expiry Engine (5-min), Authorizing Sweeper (30-min), and Lifecycle messaging (Daily) configured.');
  }

  // Task 1: Expire PENDING bookings whose 1-hour hold has elapsed
  async expireUnpaidPendingBookings() {
    console.log('[CRON WORKER]: Scanning for expired PENDING holds...');
    let expiredCount = 0;
    try {
      const expired = await db.bookings.findExpiredPending();

      for (const b of expired) {
        await db.bookings.updateStatus(b.id, 'EXPIRED');
        expiredCount++;
        console.log(`[CRON EXPIRE]: Booking ${b.id} EXPIRED — 1-hour payment hold elapsed.`);

        whatsappService.sendLifecyclePing(
          b.guest_phone,
          WHATSAPP_TEMPLATES.BOOKING_CANCELED_EXPIRED(b)
        ).catch(() => {});
      }

      if (expiredCount > 0) {
        console.log(`[CRON WORKER]: Expired ${expiredCount} unpaid PENDING bookings.`);
      } else {
        console.log('[CRON WORKER]: No expired PENDING bookings found.');
      }
    } catch (err) {
      console.error('[CRON ERROR]: Pending expiry scan failed:', err.message);
    }
  }

  // Task 2: Expire AUTHORIZING bookings that never received a webhook (stuck for >2h)
  async expireStuckAuthorizingBookings() {
    console.log('[CRON WORKER]: Scanning for stuck AUTHORIZING bookings...');
    try {
      const stuck = await db.bookings.findExpiredAuthorizing();

      for (const b of stuck) {
        await db.bookings.updateStatus(b.id, 'PAYMENT_FAILED');
        console.log(`[CRON EXPIRE]: Booking ${b.id} marked PAYMENT_FAILED — no webhook received in 2h.`);
      }

      if (stuck.length > 0) {
        console.log(`[CRON WORKER]: Cleaned up ${stuck.length} stuck AUTHORIZING bookings.`);
      }
    } catch (err) {
      console.error('[CRON ERROR]: Authorizing sweep failed:', err.message);
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
