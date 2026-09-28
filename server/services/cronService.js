import cron from 'node-cron';
import { db } from '../config/db.js';
import { emailService } from './emailService.js';
import { whatsappService } from './whatsappService.js';
import { WHATSAPP_TEMPLATES } from '../config/constants.js';

const getEATDate = (offsetDays = 0) => {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi' }).format(d);
};

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

    // 3. MORNING CHECK-OUT REMINDER (Runs daily at 08:00 AM EAT — Before 10:00 AM check-out)
    cron.schedule('0 8 * * *', () => {
      this.runCheckoutMorningReminders();
    }, {
      timezone: 'Africa/Nairobi'
    });

    // 4. MORNING COMFORT CHECK-IN & RETENTION (Runs daily at 09:00 AM EAT)
    cron.schedule('0 9 * * *', () => {
      this.runMorningComfortAndRetention();
    }, {
      timezone: 'Africa/Nairobi'
    });

    // 5. CHECK-IN ACCESS & CREDENTIALS DISPATCHER (Runs daily at 1:00 PM / 13:00 EAT)
    // Guests can access the unit early from 1:00 PM ahead of official 2:00 PM check-in
    cron.schedule('0 13 * * *', () => {
      this.dispatchCheckInCredentials();
    }, {
      timezone: 'Africa/Nairobi'
    });

    // 6. POST-CHECKOUT REVIEW REQUEST (Runs daily at 12:00 PM EAT after departure)
    cron.schedule('0 12 * * *', () => {
      this.runPostCheckoutReviewRequests();
    }, {
      timezone: 'Africa/Nairobi'
    });

    console.log('[CRON SERVICE]: 8:00 AM Check-out, 9:00 AM Comfort, 1:00 PM Check-in credentials, and 12:00 PM Review crons initialized in Africa/Nairobi timezone.');
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

  // Task 3: 8:00 AM Check-out reminder before 10:00 AM departure
  async runCheckoutMorningReminders() {
    console.log('[CRON WORKER]: Triggering morning check-out guidelines (Departure today before 10:00 AM)...');
    const todayStr = getEATDate();

    try {
      const paidBookings = await db.bookings.findPaidBookings();
      for (const b of paidBookings) {
        if (b.check_out === todayStr) {
          console.log(`[CHECKOUT REMINDER]: Dispatching 10:00 AM check-out checklist to ${b.guest_name}.`);
          emailService.sendCheckoutMorningReminder(b).catch(e => console.error(e));
          whatsappService.sendCheckoutReminder(b).catch(e => console.error(e));
        }
      }
    } catch (err) {
      console.error('[CRON SERVICE ERROR]: Checkout reminder scan failed:', err.message);
    }
  }

  // Task 4: 9:00 AM Morning comfort check-in & holiday retention
  async runMorningComfortAndRetention() {
    console.log('[CRON WORKER]: Triggering next-morning comfort check-in hooks...');
    const yesterdayStr = getEATDate(-1);

    try {
      const paidBookings = await db.bookings.findPaidBookings();
      for (const b of paidBookings) {
        if (b.check_in === yesterdayStr) {
          console.log(`[COMFORT CHECK-IN]: Dispatching morning check-in follow-up to ${b.guest_name}.`);
          emailService.sendCheckInFollowUp(b).catch(e => console.error(e));
          whatsappService.sendLifecyclePing(b.guest_phone, WHATSAPP_TEMPLATES.CHECK_IN_FOLLOW_UP(b)).catch(e => console.error(e));
        }
      }
    } catch (err) {
      console.error('[CRON SERVICE ERROR]: Morning comfort check-in scan failed:', err.message);
    }

    await this.runHolidayRetentionAlerts();
  }

  // Task 5: 1:00 PM Check-In Access Details Dispatcher
  // Sent as from 1:00 PM on arrival day (check-in is after 2:00 PM, early access from 1:00 PM)
  async dispatchCheckInCredentials() {
    console.log('[CRON WORKER]: Triggering 1:00 PM check-in credentials dispatch (Early access from 1:00 PM)...');
    const todayStr = getEATDate();

    try {
      const paidBookings = await db.bookings.findPaidBookings();
      for (const b of paidBookings) {
        if (b.check_in === todayStr) {
          console.log(`[CHECK-IN DISPATCH]: Dispatching lockbox codes and Wi-Fi credentials to arriving guest ${b.guest_name} at 1:00 PM.`);
          emailService.sendCheckInCredentials(b).catch(e => console.error('[EMAIL ERROR]:', e));
          whatsappService.sendCheckInCredentials(b).catch(e => console.error('[WHATSAPP ERROR]:', e));
        }
      }
    } catch (err) {
      console.error('[CRON SERVICE ERROR]: 1:00 PM check-in credentials dispatch failed:', err.message);
    }
  }

  // Task 6: 12:00 PM Review Request (Post-checkout review)
  async runPostCheckoutReviewRequests() {
    console.log('[CRON WORKER]: Triggering post-checkout review requests...');
    const todayStr = getEATDate();

    try {
      const paidBookings = await db.bookings.findPaidBookings();
      for (const b of paidBookings) {
        if (b.check_out === todayStr) {
          console.log(`[REVIEW REQUEST]: Sending review feedback link to departed guest ${b.guest_name}.`);
          emailService.sendCheckoutReviewRequest(b).catch(e => console.error(e));
          whatsappService.sendLifecyclePing(b.guest_phone, WHATSAPP_TEMPLATES.CHECKOUT_REVIEW_REQUEST(b)).catch(e => console.error(e));
        }
      }
    } catch (err) {
      console.error('[CRON SERVICE ERROR]: Post-checkout review scan failed:', err.message);
    }
  }

  // Backward compatibility wrapper for old method name
  async runLifecycleMessagingHooks() {
    await this.runCheckoutMorningReminders();
    await this.runMorningComfortAndRetention();
    await this.dispatchCheckInCredentials();
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
