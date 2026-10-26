import { db } from '../config/db.js';

// Format date values to YYYY-MM-DD
const formatToDateStr = (val) => {
  if (!val) return '';
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const s = String(val).trim();
  if (s.includes('T')) return s.split('T')[0];
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return s.slice(0, 10);
};

/**
 * Calculates real analytics and KPIs for the Manager Portal
 * Endpoint: GET /api/analytics/metrics
 */
export const getAnalyticsMetrics = async (req, res, next) => {
  try {
    const allBookings = await db.bookings.getAll();
    let allPayments = [];
    try {
      allPayments = await db.payments.getAll();
    } catch (pErr) {
      console.warn('[ANALYTICS]: Could not fetch payments:', pErr.message);
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Standard suite pricing defaults
    const SUITE_DEFAULTS = {
      skyview: 5500,
      cocoa: 5000,
      neema: 5000
    };

    const isPaidStatus = (status) => {
      const s = String(status || '').toUpperCase();
      return ['PAID', 'COMPLETED', 'CONFIRMED', 'OCCUPIED', 'APPROVED', 'SETTLED'].includes(s);
    };

    // Helper to calculate nights between check_in and check_out
    const calculateNights = (inDate, outDate) => {
      if (!inDate || !outDate) return 1;
      const d1 = new Date(inDate);
      const d2 = new Date(outDate);
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 1;
      const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
      return Math.max(1, diff);
    };

    // Calculate real revenue for a booking
    const getBookingAmount = (b) => {
      const price = Number(b.total_price);
      if (!isNaN(price) && price >= 500) {
        return price;
      }
      const unitKey = String(b.unit_id || 'skyview').toLowerCase();
      const base = SUITE_DEFAULTS[unitKey] || 5000;
      const nights = calculateNights(b.check_in, b.check_out);
      return base * nights;
    };

    // Helper to extract booking timestamp
    const getBookingDate = (b) => {
      if (b.created_at) {
        const d = new Date(b.created_at);
        if (!isNaN(d.getTime())) return d;
      }
      if (b.check_in) {
        const d = new Date(b.check_in);
        if (!isNaN(d.getTime())) return d;
      }
      return now;
    };

    // Normalize and augment all confirmed bookings
    const confirmedBookings = allBookings
      .filter(b => isPaidStatus(b.status))
      .map(b => {
        const amount = getBookingAmount(b);
        const nights = calculateNights(b.check_in, b.check_out);
        const bookingDate = getBookingDate(b);
        const monthKey = `${bookingDate.getFullYear()}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}`;
        return {
          ...b,
          calculated_amount: amount,
          calculated_nights: nights,
          booking_date: bookingDate,
          month_key: monthKey
        };
      });

    // Sort descending by date (most recent first)
    confirmedBookings.sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime());

    // 1. Current Month & Last Month metrics
    let thisMonthRevenue = 0;
    let thisMonthBookingsCount = 0;
    let thisMonthNights = 0;

    let lastMonthRevenue = 0;
    let lastMonthBookingsCount = 0;
    let lastMonthNights = 0;

    const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

    // Suite breakdown accumulators for current month (and all-time)
    const suiteMetrics = {
      skyview: { id: 'skyview', name: 'Skyview Hideaway', revenue: 0, bookings: 0, nights: 0, allTimeRevenue: 0 },
      cocoa: { id: 'cocoa', name: 'Cocoa Retreat', revenue: 0, bookings: 0, nights: 0, allTimeRevenue: 0 },
      neema: { id: 'neema', name: 'Neema Haven', revenue: 0, bookings: 0, nights: 0, allTimeRevenue: 0 }
    };

    // Historical 6-month tracking
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const key = `${y}-${String(m + 1).padStart(2, '0')}`;
      monthlyTrend.push({
        key,
        year: y,
        monthIndex: m,
        monthName: monthNames[m],
        label: `${monthNames[m]} ${y}`,
        revenue: 0,
        bookings: 0,
        nights: 0
      });
    }

    confirmedBookings.forEach(b => {
      const unitKey = String(b.unit_id || '').toLowerCase();
      const targetSuite = suiteMetrics[unitKey] || suiteMetrics.skyview;
      targetSuite.allTimeRevenue += b.calculated_amount;

      // Check current month
      if (b.month_key === currentMonthKey) {
        thisMonthRevenue += b.calculated_amount;
        thisMonthBookingsCount += 1;
        thisMonthNights += b.calculated_nights;
        targetSuite.revenue += b.calculated_amount;
        targetSuite.bookings += 1;
        targetSuite.nights += b.calculated_nights;
      } else if (b.month_key === lastMonthKey) {
        lastMonthRevenue += b.calculated_amount;
        lastMonthBookingsCount += 1;
        lastMonthNights += b.calculated_nights;
      }

      // Trend match
      const trendItem = monthlyTrend.find(t => t.key === b.month_key);
      if (trendItem) {
        trendItem.revenue += b.calculated_amount;
        trendItem.bookings += 1;
        trendItem.nights += b.calculated_nights;
      }
    });

    // Cross-check payments table for any additional recorded payments
    allPayments.forEach(p => {
      if (p.status && ['COMPLETED', 'PAID', 'SUCCESS'].includes(String(p.status).toUpperCase())) {
        const pDate = new Date(p.created_at || now);
        const pKey = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}`;
        const matched = confirmedBookings.some(b => b.id === p.booking_id);
        const amt = Number(p.amount);
        if (!matched && !isNaN(amt) && amt >= 500) {
          if (pKey === currentMonthKey) {
            thisMonthRevenue += amt;
          } else if (pKey === lastMonthKey) {
            lastMonthRevenue += amt;
          }
          const tItem = monthlyTrend.find(t => t.key === pKey);
          if (tItem) {
            tItem.revenue += amt;
          }
        }
      }
    });

    // Calculations
    const revenueDiff = thisMonthRevenue - lastMonthRevenue;
    const revenueGrowthPercent = lastMonthRevenue > 0
      ? Number(((revenueDiff / lastMonthRevenue) * 100).toFixed(1))
      : (thisMonthRevenue > 0 ? 100 : 0);

    const bookingDiff = thisMonthBookingsCount - lastMonthBookingsCount;
    const bookingGrowthPercent = lastMonthBookingsCount > 0
      ? Number(((bookingDiff / lastMonthBookingsCount) * 100).toFixed(1))
      : (thisMonthBookingsCount > 0 ? 100 : 0);

    const averageBookingRate = thisMonthBookingsCount > 0
      ? Math.round(thisMonthRevenue / thisMonthBookingsCount)
      : (lastMonthBookingsCount > 0 ? Math.round(lastMonthRevenue / lastMonthBookingsCount) : 0);

    const averageDailyRate = thisMonthNights > 0
      ? Math.round(thisMonthRevenue / thisMonthNights)
      : 0;

    // Total capacity: 3 suites * daysInMonth
    const totalCapacityNights = daysInCurrentMonth * 3;
    const occupancyRate = totalCapacityNights > 0
      ? Math.min(100, Number(((thisMonthNights / totalCapacityNights) * 100).toFixed(1)))
      : 0;

    // Suite percentages
    const totalSuiteRevenue = Math.max(1, thisMonthRevenue);
    const suiteBreakdown = Object.values(suiteMetrics).map(s => ({
      ...s,
      sharePercent: Number(((s.revenue / totalSuiteRevenue) * 100).toFixed(1))
    }));

    // Payment channel distribution - 100% STK Push (Till 4364845) only
    const paymentChannels = {
      mpesa: { label: 'M-Pesa (Till & STK Push)', share: 100 }
    };

    // Format recent transactions
    const recentTransactions = confirmedBookings.slice(0, 50).map(b => ({
      id: b.id,
      guest_name: b.guest_name || 'Valued Guest',
      guest_email: b.guest_email || 'guest@example.com',
      unit_id: b.unit_id || 'skyview',
      check_in: formatToDateStr(b.check_in),
      check_out: formatToDateStr(b.check_out),
      nights: b.calculated_nights,
      amount: b.calculated_amount,
      status: b.status || 'PAID',
      booking_type: b.booking_type || 'entire',
      date: b.booking_date
    }));

    return res.status(200).json({
      success: true,
      data: {
        isDemonstrationData: false,
        period: {
          month: monthNames[currentMonth],
          year: currentYear,
          daysInMonth: daysInCurrentMonth,
          monthKey: currentMonthKey
        },
        kpis: {
          thisMonthRevenue,
          lastMonthRevenue,
          revenueGrowthPercent,
          thisMonthBookingsCount,
          lastMonthBookingsCount,
          bookingGrowthPercent,
          averageBookingRate,
          averageDailyRate,
          thisMonthNights,
          totalCapacityNights,
          occupancyRate
        },
        suiteBreakdown,
        monthlyTrend,
        paymentChannels,
        recentTransactions
      }
    });

  } catch (error) {
    next(error);
  }
};
