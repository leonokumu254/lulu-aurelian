import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, Calendar, CreditCard,
  Building2, Percent, ArrowUpRight, ArrowDownRight, RefreshCw,
  Download, Search, Sparkles, CheckCircle2, ShieldCheck,
  ChevronRight, BarChart3, PieChart, Users, Layers, Smartphone
} from 'lucide-react';
import './ProductAnalytics.css';

const SUITE_PREVIEWS = {
  skyview: '/assets/skyview/skyview_1.jpg',
  cocoa: '/assets/cocoa/cocoa_1.jpg',
  neema: '/assets/Neema/neema_1.jpeg'
};

const SUITE_NAMES = {
  skyview: 'Skyview Hideaway',
  cocoa: 'Cocoa Retreat',
  neema: 'Neema Haven'
};

const formatStayDates = (checkIn, checkOut) => {
  if (!checkIn) return 'N/A';
  try {
    const parse = (d) => {
      if (!d) return null;
      const str = String(d).trim();
      const datePart = str.split('T')[0];
      const parts = datePart.split('-');
      if (parts.length === 3) {
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      }
      const parsed = new Date(str);
      return isNaN(parsed.getTime()) ? null : parsed;
    };

    const dIn = parse(checkIn);
    const dOut = checkOut ? parse(checkOut) : null;

    if (!dIn || isNaN(dIn.getTime())) {
      return String(checkIn).split('T')[0] + (checkOut ? ` ➔ ${String(checkOut).split('T')[0]}` : '');
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const inDay = String(dIn.getDate()).padStart(2, '0');
    const inMonth = monthNames[dIn.getMonth()];
    const inYear = dIn.getFullYear();

    if (!dOut || isNaN(dOut.getTime())) {
      return `${inDay} ${inMonth} ${inYear}`;
    }

    const outDay = String(dOut.getDate()).padStart(2, '0');
    const outMonth = monthNames[dOut.getMonth()];
    const outYear = dOut.getFullYear();

    if (inMonth === outMonth && inYear === outYear) {
      return `${inDay} – ${outDay} ${inMonth} ${inYear}`;
    }
    if (inYear === outYear) {
      return `${inDay} ${inMonth} – ${outDay} ${outMonth} ${inYear}`;
    }
    return `${inDay} ${inMonth} ${inYear} – ${outDay} ${outMonth} ${outYear}`;
  } catch {
    return `${String(checkIn).split('T')[0]} ➔ ${String(checkOut).split('T')[0]}`;
  }
};

export default function ProductAnalytics({ user }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('month'); // 'month' | 'lastMonth' | 'quarter' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [suiteFilter, setSuiteFilter] = useState('all'); // 'all' | 'skyview' | 'cocoa' | 'neema'
  const [activeBarHover, setActiveBarHover] = useState(null);

  const fetchAnalytics = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/analytics/metrics`, {
        credentials: 'include',
        headers
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      }
    } catch (err) {
      console.warn('[ANALYTICS FETCH WARNING]:', err.message);
    } finally {
      setLoading(false);
      if (isManualRefresh) {
        setTimeout(() => setRefreshing(false), 600);
      }
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Format currency in Kenyan Shillings
  const formatKES = (val) => {
    if (val === undefined || val === null || isNaN(val)) return 'KES 0';
    return `KES ${Number(val).toLocaleString('en-KE')}`;
  };

  // Export CSV report
  const handleExportCSV = () => {
    if (!data) return;
    const transactions = data.recentTransactions || [];
    const headers = ['Transaction ID', 'Guest Name', 'Email', 'Suite', 'Check-In', 'Check-Out', 'Nights', 'Amount (KES)', 'Status'];
    const rows = transactions.map(t => [
      `"${t.id || ''}"`,
      `"${t.guest_name || ''}"`,
      `"${t.guest_email || ''}"`,
      `"${SUITE_NAMES[t.unit_id] || t.unit_id || ''}"`,
      `"${t.check_in || ''}"`,
      `"${t.check_out || ''}"`,
      t.nights || 1,
      t.amount || 0,
      `"${t.status || 'PAID'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lulu_aurelian_financial_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered transactions for the ledger table
  const filteredTransactions = useMemo(() => {
    if (!data || !data.recentTransactions) return [];
    return data.recentTransactions.filter(item => {
      const matchSearch =
        (item.guest_name && item.guest_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.guest_email && item.guest_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.id && item.id.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchSuite = suiteFilter === 'all' || item.unit_id === suiteFilter;
      return matchSearch && matchSuite;
    });
  }, [data, searchQuery, suiteFilter]);

  // Derived KPI calculations based on selected period
  const currentKPIs = useMemo(() => {
    if (!data || !data.kpis) {
      return {
        revenue: 0,
        prevRevenue: 0,
        revenueGrowth: 0,
        bookings: 0,
        prevBookings: 0,
        bookingGrowth: 0,
        avgRate: 0,
        adr: 0,
        occupancy: 0,
        nights: 0,
        totalCapacity: 93
      };
    }

    const { kpis, monthlyTrend = [] } = data;

    if (period === 'lastMonth') {
      const prev2Month = monthlyTrend.length >= 2 ? monthlyTrend[monthlyTrend.length - 2] : null;
      const prev3Month = monthlyTrend.length >= 3 ? monthlyTrend[monthlyTrend.length - 3] : null;
      const prevRev = prev3Month ? prev3Month.revenue : 0;
      const revGrowth = prevRev > 0 ? Number((((kpis.lastMonthRevenue - prevRev) / prevRev) * 100).toFixed(1)) : 0;
      return {
        revenue: kpis.lastMonthRevenue,
        prevRevenue: prevRev,
        revenueGrowth: revGrowth,
        bookings: kpis.lastMonthBookingsCount,
        prevBookings: prev3Month ? prev3Month.bookings : 0,
        bookingGrowth: prev3Month && prev3Month.bookings > 0 ? Number((((kpis.lastMonthBookingsCount - prev3Month.bookings) / prev3Month.bookings) * 100).toFixed(1)) : 0,
        avgRate: kpis.lastMonthBookingsCount > 0 ? Math.round(kpis.lastMonthRevenue / kpis.lastMonthBookingsCount) : 0,
        adr: prev2Month && prev2Month.nights > 0 ? Math.round(kpis.lastMonthRevenue / prev2Month.nights) : 0,
        occupancy: kpis.totalCapacityNights > 0 ? Math.min(100, Number((((prev2Month ? prev2Month.nights : 0) / kpis.totalCapacityNights) * 100).toFixed(1))) : 0,
        nights: prev2Month ? prev2Month.nights : 0,
        totalCapacity: kpis.totalCapacityNights
      };
    }

    if (period === 'quarter') {
      const qMonths = monthlyTrend.slice(-3);
      const prevQMonths = monthlyTrend.slice(-6, -3);
      const totalRev = qMonths.reduce((acc, m) => acc + (m.revenue || 0), 0);
      const prevRev = prevQMonths.reduce((acc, m) => acc + (m.revenue || 0), 0);
      const totalBookings = qMonths.reduce((acc, m) => acc + (m.bookings || 0), 0);
      const prevBookings = prevQMonths.reduce((acc, m) => acc + (m.bookings || 0), 0);
      const totalNights = qMonths.reduce((acc, m) => acc + (m.nights || 0), 0);
      const cap = kpis.totalCapacityNights * 3;
      const revGrowth = prevRev > 0 ? Number((((totalRev - prevRev) / prevRev) * 100).toFixed(1)) : (totalRev > 0 ? 100 : 0);
      const bkgGrowth = prevBookings > 0 ? Number((((totalBookings - prevBookings) / prevBookings) * 100).toFixed(1)) : 0;

      return {
        revenue: totalRev,
        prevRevenue: prevRev,
        revenueGrowth: revGrowth,
        bookings: totalBookings,
        prevBookings: prevBookings,
        bookingGrowth: bkgGrowth,
        avgRate: totalBookings > 0 ? Math.round(totalRev / totalBookings) : 0,
        adr: totalNights > 0 ? Math.round(totalRev / totalNights) : 0,
        occupancy: cap > 0 ? Math.min(100, Number(((totalNights / cap) * 100).toFixed(1))) : 0,
        nights: totalNights,
        totalCapacity: cap
      };
    }

    if (period === 'all') {
      const totalRev = monthlyTrend.reduce((acc, m) => acc + (m.revenue || 0), 0);
      const totalBookings = monthlyTrend.reduce((acc, m) => acc + (m.bookings || 0), 0);
      const totalNights = monthlyTrend.reduce((acc, m) => acc + (m.nights || 0), 0);
      const cap = kpis.totalCapacityNights * Math.max(1, monthlyTrend.length);

      return {
        revenue: totalRev,
        prevRevenue: 0,
        revenueGrowth: 100,
        bookings: totalBookings,
        prevBookings: 0,
        bookingGrowth: 100,
        avgRate: totalBookings > 0 ? Math.round(totalRev / totalBookings) : 0,
        adr: totalNights > 0 ? Math.round(totalRev / totalNights) : 0,
        occupancy: cap > 0 ? Math.min(100, Number(((totalNights / cap) * 100).toFixed(1))) : 0,
        nights: totalNights,
        totalCapacity: cap
      };
    }

    // Default: thisMonth
    return {
      revenue: kpis.thisMonthRevenue,
      prevRevenue: kpis.lastMonthRevenue,
      revenueGrowth: kpis.revenueGrowthPercent,
      bookings: kpis.thisMonthBookingsCount,
      prevBookings: kpis.lastMonthBookingsCount,
      bookingGrowth: kpis.bookingGrowthPercent,
      avgRate: kpis.averageBookingRate,
      adr: kpis.averageDailyRate,
      occupancy: kpis.occupancyRate,
      nights: kpis.thisMonthNights,
      totalCapacity: kpis.totalCapacityNights
    };
  }, [data, period]);

  // Max revenue in trend for scaling bars
  const maxTrendRevenue = useMemo(() => {
    if (!data || !data.monthlyTrend || data.monthlyTrend.length === 0) return 50000;
    const maxVal = Math.max(...data.monthlyTrend.map(m => m.revenue || 0));
    return maxVal > 0 ? maxVal * 1.15 : 50000;
  }, [data]);

  return (
    <div className="analytics-dashboard-root animate-fade-in">
      {/* Top Banner Header */}
      <div className="analytics-hero-header">
        <div className="analytics-hero-title">
          <h2>Product & Revenue Analytics</h2>
          <p>
            Real-time yield telemetry, booking velocity, and suite performance benchmarks across the estate.
          </p>
        </div>

        <div className="analytics-hero-controls">
          {/* Period selector */}
          <div className="period-segment-control">
            <button
              className={`period-btn ${period === 'month' ? 'active' : ''}`}
              onClick={() => setPeriod('month')}
            >
              This Month
            </button>
            <button
              className={`period-btn ${period === 'lastMonth' ? 'active' : ''}`}
              onClick={() => setPeriod('lastMonth')}
            >
              Last Month
            </button>
            <button
              className={`period-btn ${period === 'quarter' ? 'active' : ''}`}
              onClick={() => setPeriod('quarter')}
            >
              Last 90 Days
            </button>
            <button
              className={`period-btn ${period === 'all' ? 'active' : ''}`}
              onClick={() => setPeriod('all')}
            >
              All Time
            </button>
          </div>

          <div className="action-buttons-group">
            <button
              className={`btn-action-glass ${refreshing ? 'spinning' : ''}`}
              onClick={() => fetchAnalytics(true)}
              title="Refresh telemetry"
            >
              <RefreshCw size={15} />
              <span>Refresh</span>
            </button>

            <button
              className="btn-action-gold"
              onClick={handleExportCSV}
              title="Download CSV financial summary"
            >
              <Download size={15} />
              <span>Export Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Capsule Cards */}
      <div className="analytics-kpi-grid">
        {/* KPI 1: Amount Collected This Month */}
        <div className="kpi-card glass-gold-card">
          <div className="kpi-card-top">
            <div className="kpi-icon-wrap gold-glow">
              <DollarSign size={22} />
            </div>
            <div className="kpi-badge-trend positive">
              <TrendingUp size={13} />
              <span>+{Math.abs(currentKPIs.revenueGrowth)}% vs prior</span>
            </div>
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Amount Collected ({period === 'month' ? 'This Month' : period === 'lastMonth' ? 'Last Month' : period === 'quarter' ? 'Last 90 Days' : 'Total'})</span>
            <div className="kpi-value-hero">{formatKES(currentKPIs.revenue)}</div>
            <div className="kpi-footer-sub">
              <span>Prior period: <strong>{formatKES(currentKPIs.prevRevenue)}</strong></span>
              <span className="kpi-dot-sep">•</span>
              <span className="settled-tag">Settled Funds</span>
            </div>
          </div>
          <div className="card-accent-line"></div>
        </div>

        {/* KPI 2: Average Booking Rate per Month */}
        <div className="kpi-card glass-neutral-card">
          <div className="kpi-card-top">
            <div className="kpi-icon-wrap bronze-glow">
              <BarChart3 size={22} />
            </div>
            <div className="kpi-sub-tag">Average Yield</div>
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Average Booking Rate per Month</span>
            <div className="kpi-value-hero">{formatKES(currentKPIs.avgRate)}</div>
            <div className="kpi-footer-sub">
              <span>ADR: <strong>{formatKES(currentKPIs.adr)}</strong> / occupied night</span>
            </div>
          </div>
          <div className="card-accent-line"></div>
        </div>

        {/* KPI 3: Confirmed Reservations */}
        <div className="kpi-card glass-neutral-card">
          <div className="kpi-card-top">
            <div className="kpi-icon-wrap dark-gold-glow">
              <Calendar size={22} />
            </div>
            <div className="kpi-badge-trend positive">
              <ArrowUpRight size={13} />
              <span>+{Math.abs(currentKPIs.bookingGrowth)}%</span>
            </div>
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Confirmed Reservations</span>
            <div className="kpi-value-hero">{currentKPIs.bookings} <span className="value-unit">Stays</span></div>
            <div className="kpi-footer-sub">
              <span><strong>{currentKPIs.nights}</strong> Total Room Nights Booked</span>
            </div>
          </div>
          <div className="card-accent-line"></div>
        </div>

        {/* KPI 4: Occupancy Rate */}
        <div className="kpi-card glass-neutral-card">
          <div className="kpi-card-top">
            <div className="kpi-icon-wrap gold-glow">
              <Percent size={20} />
            </div>
            <div className="kpi-sub-tag">Estate Utilization</div>
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Monthly Occupancy Rate</span>
            <div className="kpi-value-hero">{currentKPIs.occupancy}%</div>
            <div className="kpi-occupancy-bar-wrap">
              <div
                className="kpi-occupancy-bar-fill"
                style={{ width: `${Math.min(100, Math.max(12, currentKPIs.occupancy))}%` }}
              ></div>
            </div>
            <div className="kpi-footer-sub">
              <span>{currentKPIs.nights} of {currentKPIs.totalCapacity} Available Suite Nights</span>
            </div>
          </div>
          <div className="card-accent-line"></div>
        </div>
      </div>

      {/* Middle Section: 6-Month Revenue Trajectory & Suite Breakdown */}
      <div className="analytics-middle-grid">
        {/* Trajectory Chart */}
        <div className="dashboard-panel chart-panel">
          <div className="panel-header-row">
            <div>
              <h3 className="panel-title">
                <BarChart3 size={18} className="panel-icon-gold" />
                6-Month Revenue Trajectory & Booking Volume
              </h3>
              <p className="panel-subtitle">
                Historical monthly cash collections (KES) and total completed reservations
              </p>
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-swatch gold-swatch"></span>
                <span>Revenue (KES)</span>
              </div>
              <div className="legend-item">
                <span className="legend-swatch dark-swatch"></span>
                <span>Reservations</span>
              </div>
            </div>
          </div>

          <div className="chart-canvas-container">
            <div className="chart-bars-wrap">
              {(data?.monthlyTrend || []).map((m, idx) => {
                const heightPercent = maxTrendRevenue > 0 && m.revenue > 0
                  ? Math.min(100, Math.max(10, Math.round((m.revenue / maxTrendRevenue) * 100)))
                  : 4;
                const isCurrentMonth = idx === (data?.monthlyTrend?.length || 6) - 1;
                const isHovered = activeBarHover === idx;

                return (
                  <div
                    key={m.label || idx}
                    className={`bar-column-group ${isCurrentMonth ? 'current-active' : ''}`}
                    onMouseEnter={() => setActiveBarHover(idx)}
                    onMouseLeave={() => setActiveBarHover(null)}
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="bar-tooltip animate-slide-up">
                        <span className="tooltip-title">{m.label}</span>
                        <div className="tooltip-stat">
                          <span>Revenue:</span>
                          <strong>{formatKES(m.revenue)}</strong>
                        </div>
                        <div className="tooltip-stat">
                          <span>Bookings:</span>
                          <strong>{m.bookings} stays</strong>
                        </div>
                      </div>
                    )}

                    <div className="bar-visual-track">
                      <div
                        className="bar-fill"
                        style={{ height: `${heightPercent}%` }}
                      >
                        <div className="bar-glow-cap"></div>
                      </div>
                    </div>

                    <div className="bar-labels">
                      <span className="bar-month-text">{m.monthName}</span>
                      <span className="bar-booking-pill">{m.bookings} bkg</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Suite Performance Yield Matrix */}
      <div className="dashboard-panel suites-yield-panel">
        <div className="panel-header-row">
          <div>
            <h3 className="panel-title">
              <Building2 size={18} className="panel-icon-gold" />
              Suite-by-Suite Performance & Revenue Share
            </h3>
            <p className="panel-subtitle">
              Financial breakdown and booking volume for Skyview Hideaway, Cocoa Retreat, and Neema Haven
            </p>
          </div>
        </div>

        <div className="suites-yield-grid">
          {(data?.suiteBreakdown || []).map(s => {
            const suiteKey = s.id ? s.id.toLowerCase() : 'skyview';
            const imgUrl = SUITE_PREVIEWS[suiteKey] || SUITE_PREVIEWS.skyview;
            const avgSuiteRate = s.bookings > 0 ? Math.round(s.revenue / s.bookings) : 0;

            return (
              <div key={s.id} className="suite-yield-card">
                <div className="suite-card-image-wrap">
                  <img src={imgUrl} alt={s.name} className="suite-card-thumb" />
                  <div className="suite-share-badge">
                    <span>{s.sharePercent || 0}% share</span>
                  </div>
                </div>

                <div className="suite-card-body">
                  <h4 className="suite-name-title">{s.name}</h4>
                  
                  <div className="suite-stat-row primary-revenue">
                    <span className="stat-label">Collected Revenue</span>
                    <span className="stat-amount-gold">{formatKES(s.revenue)}</span>
                  </div>

                  <div className="suite-progress-track">
                    <div
                      className="suite-progress-fill"
                      style={{ width: `${Math.min(100, Math.max(10, s.sharePercent || 33))}%` }}
                    ></div>
                  </div>

                  <div className="suite-details-subgrid">
                    <div className="sub-metric">
                      <span className="sub-label">Avg. Booking</span>
                      <strong className="sub-val">{formatKES(avgSuiteRate)}</strong>
                    </div>
                    <div className="sub-metric">
                      <span className="sub-label">Confirmed Stays</span>
                      <strong className="sub-val">{s.bookings} bookings</strong>
                    </div>
                    <div className="sub-metric">
                      <span className="sub-label">Nights Sold</span>
                      <strong className="sub-val">{s.nights} nights</strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Settled Revenue Ledger Table */}
      <div className="dashboard-panel ledger-panel">
        <div className="panel-header-row table-controls-header">
          <div>
            <h3 className="panel-title">
              <Layers size={18} className="panel-icon-gold" />
              Settled Revenue Ledger
            </h3>
            <p className="panel-subtitle">Verified guest payments and completed bookings</p>
          </div>

          <div className="table-search-filter-row">
            <div className="search-input-wrap">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Search guest or booking ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="suite-select-dropdown"
              value={suiteFilter}
              onChange={(e) => setSuiteFilter(e.target.value)}
            >
              <option value="all">All Suites</option>
              <option value="skyview">Skyview Hideaway</option>
              <option value="cocoa">Cocoa Retreat</option>
              <option value="neema">Neema Haven</option>
            </select>
          </div>
        </div>

        <div className="ledger-table-wrap">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Guest & Details</th>
                <th>Suite</th>
                <th>Stay Dates</th>
                <th>Nights</th>
                <th>Settled Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-ledger-row">
                    No transactions match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx, idx) => (
                  <tr key={tx.id || idx}>
                    <td>
                      <div className="guest-info-cell">
                        <span className="guest-name-text">{tx.guest_name}</span>
                        <span className="guest-email-sub">{tx.guest_email}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`suite-badge-tag ${tx.unit_id}`}>
                        {SUITE_NAMES[tx.unit_id] || tx.unit_id}
                      </span>
                    </td>
                    <td>
                      <span className="dates-range-text" title={`${tx.check_in} to ${tx.check_out}`}>
                        <Calendar size={13} className="stay-calendar-icon" />
                        {formatStayDates(tx.check_in, tx.check_out)}
                      </span>
                    </td>
                    <td>
                      <span className="nights-badge">{tx.nights} {tx.nights === 1 ? 'night' : 'nights'}</span>
                    </td>
                    <td>
                      <span className="amount-cell-bold">{formatKES(tx.amount)}</span>
                    </td>
                    <td>
                      <span className="status-pill-paid">
                        <CheckCircle2 size={12} />
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
