import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  MessageSquare, 
  Clock, 
  ExternalLink, 
  Copy, 
  CheckCircle2, 
  Search, 
  Filter, 
  RefreshCw, 
  Loader2, 
  Phone, 
  Calendar, 
  LayoutGrid, 
  List, 
  Home,
  User,
  AlertCircle
} from 'lucide-react';
import './AgentPortal.css';

export default function AgentPortal({ user }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null); // For WhatsApp template dispatch modal
  const [whatsAppText, setWhatsAppText] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // tracks which booking is being actioned
  
  // View layout: 'cards' or 'table'. Defaults to cards on mobile screens (<860px)
  const [viewLayout, setViewLayout] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 860) {
      return 'cards';
    }
    return 'table';
  });

  // Track window resizing for automatic responsive mode
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 860 && viewLayout === 'table') {
        setViewLayout('cards');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewLayout]);

  // Fetch bookings from backend
  const fetchBookings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bookings`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok && data.success) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        setBookings(data.bookings.map(b => {
          let derivedStatus = b.status.charAt(0) + b.status.slice(1).toLowerCase();
          const checkOutDate = new Date(b.check_out?.split('T')[0] || b.check_out);
          
          if (b.status === 'PAID' && checkOutDate < today) {
            derivedStatus = 'Completed';
          }

          return {
            id: b.id,
            guest: b.guest_name || 'Guest',
            email: b.guest_email || '',
            suite: b.unit_id,
            bookingType: b.booking_type || 'entire',
            checkIn: b.check_in?.split('T')[0] || b.check_in,
            checkOut: b.check_out?.split('T')[0] || b.check_out,
            phone: b.guest_phone || '',
            status: derivedStatus,
            approvedAt: b.approved_at,
            submitted: formatTimeAgo(b.created_at),
            rawStatus: b.status
          };
        }));
      } else {
        setError(data.error || 'Failed to load bookings.');
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('Connection error. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // Refresh bookings every 30 seconds
    const interval = setInterval(fetchBookings, 30000);
    return () => clearInterval(interval);
  }, []);

  // Format time ago helper
  function formatTimeAgo(dateStr) {
    if (!dateStr) return 'Unknown';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  // Format date safely without timezone offset shifts
  const formatDateBeautifully = (dateStr) => {
    if (!dateStr) return '';
    try {
      const parts = String(dateStr).split('T')[0].split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const dayName = days[date.getDay()];
        const monthName = months[date.getMonth()];
        const d = date.getDate();
        
        const getOrdinalSuffix = (num) => {
          if (num > 3 && num < 21) return 'th';
          switch (num % 10) {
            case 1:  return 'st';
            case 2:  return 'nd';
            case 3:  return 'rd';
            default: return 'th';
          }
        };
        
        return `${dayName} ${d}${getOrdinalSuffix(d)} ${monthName}`;
      }
    } catch (e) {
      console.warn('Date parsing error', e);
    }
    return dateStr;
  };

  // Calculate length of stay in nights
  const calculateNights = (checkInStr, checkOutStr) => {
    if (!checkInStr || !checkOutStr) return '1 night';
    try {
      const inD = new Date(checkInStr.split('T')[0]);
      const outD = new Date(checkOutStr.split('T')[0]);
      const diffTime = outD.getTime() - inD.getTime();
      const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
      return `${nights} night${nights > 1 ? 's' : ''}`;
    } catch (e) {
      return '1 night';
    }
  };

  // Calculate TTL for approved bookings (3h from approval)
  function getTTL(booking) {
    if (booking.rawStatus !== 'APPROVED' || !booking.approvedAt) return null;
    const approvedTime = new Date(booking.approvedAt).getTime();
    const expiresAt = approvedTime + 3 * 60 * 60 * 1000;
    const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
    return remaining;
  }

  // TTL Countdown Ticker (re-renders every second for live countdown)
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Show a temporary toast notification
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Copy booking ID to clipboard
  const copyBookingId = (id, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id);
      triggerToast(`Booking #${id.substring(0, 8)} copied!`);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Approve booking via API
  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bookings/${id}/approve`, {
        method: 'PUT',
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok && data.success) {
        triggerToast('Booking approved and guest notified!');
        await fetchBookings();
      } else {
        triggerToast(data.error || 'Failed to approve booking.');
      }
    } catch (err) {
      triggerToast('Connection error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Decline booking via API
  const handleDecline = async (id) => {
    setActionLoading(id);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bookings/${id}/decline`, {
        method: 'PUT',
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok && data.success) {
        triggerToast('Booking request declined.');
        await fetchBookings();
      } else {
        triggerToast(data.error || 'Failed to decline booking.');
      }
    } catch (err) {
      triggerToast('Connection error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Format countdown helper
  const formatTTL = (seconds) => {
    if (seconds === null || seconds <= 0) return 'Expired';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Suite name mapper
  const getSuiteName = (unitId) => {
    if (!unitId) return 'Luxury Suite';
    const clean = String(unitId).toLowerCase();
    if (clean.includes('skyview')) return 'Skyview Hideaway';
    if (clean.includes('cocoa')) return 'Cocoa Retreat';
    if (clean.includes('neema')) return 'Neema Haven';
    return unitId.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Suite CSS class identifier
  const getSuiteClass = (unitId) => {
    const clean = String(unitId || '').toLowerCase();
    if (clean.includes('cocoa')) return 'suite-cocoa';
    if (clean.includes('neema')) return 'suite-neema';
    return 'suite-skyview';
  };

  // Trigger WhatsApp Modal dialog
  const openWhatsAppModal = (booking) => {
    let msg = '';
    
    if (booking.rawStatus === 'PENDING') {
      msg = `Dear ${booking.guest}, your reservation request for the luxury ${getSuiteName(booking.suite)} at Pearl Apartments (Lulu Aurelian Estate) has been RECEIVED. 

Details:
• Check-In: ${formatDateBeautifully(booking.checkIn)}
• Check-Out: ${formatDateBeautifully(booking.checkOut)}

To secure your dates, please proceed to paying the required deposit. We will process your booking immediately upon receipt.

Warm regards,
Lulu Aurelian Concierge Team`;
    } else if (booking.rawStatus === 'PAID' || booking.rawStatus === 'COMPLETED' || booking.status === 'Completed') {
      const isCocoa = String(booking.suite).toLowerCase().includes('cocoa');
      const isNeema = String(booking.suite).toLowerCase().includes('neema');
      const wifiNet = isCocoa ? 'LULU_COCOA' : isNeema ? 'LULU_NEEMA' : 'PEARL_16';
      const wifiPass = isCocoa ? 'Cocoa@2026' : isNeema ? 'Neema@2026' : 'Skyview@2026';
      const houseNo = isCocoa ? 'S-19' : isNeema ? 'N-12' : 'S-16';
      const floor = isCocoa ? '1st Floor' : isNeema ? '2nd Floor' : '6th Floor';

      msg = `Dear ${booking.guest}, your payment has been CONFIRMED! Welcome to ${getSuiteName(booking.suite)} at Pearl Apartments (Lulu Aurelian Estate).

Here are your arrival details:
• House Number: ${houseNo} (${floor})
• Wi-Fi Network: ${wifiNet}
• Wi-Fi Password: ${wifiPass}
• Door Key Code: [Insert 4-Digit PIN]

We look forward to hosting you. If you need anything during your stay, please reach out!

Warm regards,
Lulu Aurelian Concierge Team`;
    } else {
      msg = `Dear ${booking.guest}, your booking for the luxury ${getSuiteName(booking.suite)} at Pearl Apartments (Lulu Aurelian Estate) is AWAITING PAYMENT. 

Details:
• Check-In: ${formatDateBeautifully(booking.checkIn)}
• Check-Out: ${formatDateBeautifully(booking.checkOut)}

Please complete your deposit payment to secure your dates.

Warm regards,
Lulu Aurelian Concierge Team`;
    }

    setSelectedBooking(booking);
    setWhatsAppText(msg);
  };

  // Launch WhatsApp Web Link
  const handleLaunchWhatsApp = () => {
    if (!selectedBooking) return;
    const phoneNum = selectedBooking.phone.replace(/[^0-9]/g, '');
    const encodedText = encodeURIComponent(whatsAppText);
    const url = `https://wa.me/${phoneNum}?text=${encodedText}`;
    window.open(url, '_blank');
    triggerToast('WhatsApp console launched.');
    setSelectedBooking(null);
  };

  // Copy Message to Clipboard
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(whatsAppText).then(() => {
      setCopiedId(selectedBooking.id);
      triggerToast('Message copied to clipboard.');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Normalize phone for wa.me direct link
  const cleanPhoneForWa = (phone) => {
    if (!phone) return '';
    let p = phone.replace(/[^0-9]/g, '');
    if (p.startsWith('0')) p = '254' + p.slice(1);
    return p;
  };

  // Filtering Logic
  const filteredBookings = bookings.filter(b => {
    let matchesFilter = true;
    if (filter === 'Pending') matchesFilter = b.rawStatus === 'PENDING';
    else if (filter === 'Awaiting Verification') matchesFilter = b.rawStatus === 'AUTHORIZING';
    else if (filter === 'Awaiting Payment') matchesFilter = b.rawStatus === 'APPROVED';
    else if (filter === 'Paid') matchesFilter = b.rawStatus === 'PAID' && b.status !== 'Completed';
    else if (filter === 'Completed') matchesFilter = b.status === 'Completed';
    else if (filter === 'Cancelled') matchesFilter = b.rawStatus === 'CANCELLED';
    else if (filter === 'Declined') matchesFilter = b.rawStatus === 'DECLINED';

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      b.guest.toLowerCase().includes(q) || 
      b.id.toLowerCase().includes(q) ||
      (b.phone && b.phone.includes(q)) ||
      getSuiteName(b.suite).toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  // Calculate counts for badges
  const counts = {
    All: bookings.length,
    Pending: bookings.filter(b => b.rawStatus === 'PENDING').length,
    'Awaiting Verification': bookings.filter(b => b.rawStatus === 'AUTHORIZING').length,
    'Awaiting Payment': bookings.filter(b => b.rawStatus === 'APPROVED').length,
    Paid: bookings.filter(b => b.rawStatus === 'PAID' && b.status !== 'Completed').length,
    Completed: bookings.filter(b => b.status === 'Completed').length,
    Cancelled: bookings.filter(b => b.rawStatus === 'CANCELLED').length,
    Declined: bookings.filter(b => b.rawStatus === 'DECLINED').length
  };

  return (
    <div className="agent-portal-container">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="portal-toast animate-slide-up">
          <CheckCircle2 size={18} className="toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header / Stats Row */}
      <div className="dashboard-stats-row">
        <div className="stat-card">
          <div className="stat-icon stat-icon-all"><Calendar size={20} /></div>
          <div className="stat-details">
            <span className="stat-label">Total Reservations</span>
            <p className="stat-num">{bookings.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-awaiting"><Clock size={20} /></div>
          <div className="stat-details">
            <span className="stat-label">Awaiting Payment</span>
            <p className="stat-num">{counts['Awaiting Payment']}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-paid"><CheckCircle2 size={20} /></div>
          <div className="stat-details">
            <span className="stat-label">Confirmed & Paid</span>
            <p className="stat-num">{counts['Paid'] + counts['Completed']}</p>
          </div>
        </div>
      </div>

      {/* Toolbar Controls */}
      <div className="portal-toolbar glass">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search guest, phone, suite or ref..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* View Layout Toggle (Table vs Cards) */}
        <div className="view-toggle-group">
          <button 
            className={`toggle-btn ${viewLayout === 'table' ? 'active' : ''}`}
            onClick={() => setViewLayout('table')}
            title="Desktop Table View"
          >
            <List size={16} />
            <span className="btn-label">Table</span>
          </button>
          <button 
            className={`toggle-btn ${viewLayout === 'cards' ? 'active' : ''}`}
            onClick={() => setViewLayout('cards')}
            title="Card View (Mobile Optimized)"
          >
            <LayoutGrid size={16} />
            <span className="btn-label">Cards</span>
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="filter-chips-scroll">
        {[
          'All', 
          'Pending', 
          'Awaiting Verification', 
          'Awaiting Payment', 
          'Paid', 
          'Completed', 
          'Cancelled', 
          'Declined'
        ].map(cat => (
          <button
            key={cat}
            className={`filter-chip ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            <span>{cat}</span>
            <span className="chip-count">{counts[cat] || 0}</span>
          </button>
        ))}
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="empty-queue-card glass">
          <Loader2 size={36} className="spinner" />
          <p>Loading reservations from database...</p>
        </div>
      ) : error ? (
        <div className="empty-queue-card glass">
          <AlertCircle size={36} style={{ color: '#EF4444', marginBottom: '1rem' }} />
          <p style={{ color: '#EF4444', fontWeight: 600 }}>{error}</p>
          <button onClick={() => { setError(''); setLoading(true); fetchBookings(); }} className="btn-retry">
            <RefreshCw size={14} /> Retry Connection
          </button>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-queue-card glass">
          <RefreshCw size={36} className="empty-icon" />
          <p>No reservations matching the selected filter criteria.</p>
        </div>
      ) : viewLayout === 'cards' ? (
        /* ============================================================ */
        /* MOBILE / CARD VIEW (Ultra Readable, High Contrast)           */
        /* ============================================================ */
        <div className="booking-cards-grid">
          {filteredBookings.map(b => {
            const ttl = getTTL(b);
            const suiteClass = getSuiteClass(b.suite);
            const waCleanPhone = cleanPhoneForWa(b.phone);

            return (
              <div key={b.id} className={`booking-card ${b.status.toLowerCase()}-card`}>
                {/* Card Top: Ref + Status + Relative Time */}
                <div className="card-top-header">
                  <div 
                    className="booking-ref-badge" 
                    onClick={(e) => copyBookingId(b.id, e)} 
                    title="Click to copy booking reference"
                  >
                    <span className="ref-hash">#</span>
                    <span className="booking-ref-text">{b.id.substring(0, 8)}</span>
                    <Copy size={12} className="copy-icon-hover" />
                  </div>

                  <div className="card-status-wrap">
                    <span className={`status-pill status-${b.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {b.rawStatus === 'APPROVED' ? 'Awaiting Payment' : 
                       b.rawStatus === 'AUTHORIZING' ? 'Awaiting Verification' : 
                       b.status}
                    </span>
                  </div>
                </div>

                {/* Relative timestamp */}
                <div className="card-time-row">
                  <Clock size={12} />
                  <span>Submitted {b.submitted}</span>
                  {b.rawStatus === 'APPROVED' && ttl !== null && (
                    <span className={`ttl-badge ${ttl < 14400 ? 'critical' : ''}`}>
                      • Expires in {formatTTL(ttl)}
                    </span>
                  )}
                </div>

                {/* Card Section: Guest Info */}
                <div className="card-section guest-section">
                  <div className="guest-identity">
                    <div className="guest-avatar-bubble">
                      {b.guest.charAt(0).toUpperCase()}
                    </div>
                    <div className="guest-names-wrap">
                      <span className="guest-full-name">{b.guest}</span>
                      {b.email && <span className="guest-email-tag">{b.email}</span>}
                    </div>
                  </div>

                  {b.phone && (
                    <div className="guest-quick-actions">
                      <a href={`tel:${b.phone}`} className="btn-call-guest" title="Call Guest">
                        <Phone size={13} />
                        <span>{b.phone}</span>
                      </a>
                      {waCleanPhone && (
                        <a 
                          href={`https://wa.me/${waCleanPhone}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn-quick-wa-bubble" 
                          title="Open WhatsApp Chat"
                        >
                          <MessageSquare size={14} />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Section: Suite & Stay Period */}
                <div className="card-section stay-section">
                  <div className="stay-suite-header">
                    <span className={`suite-badge ${suiteClass}`}>
                      <Home size={12} />
                      <span>{getSuiteName(b.suite)}</span>
                    </span>
                    <span className={`booking-type-badge ${b.bookingType === 'one_bedroom' ? 'badge-one-bed' : 'badge-entire'}`}>
                      {b.bookingType === 'one_bedroom' ? '1 Bed' : 'Entire Suite'}
                    </span>
                    <span className="nights-counter">
                      {calculateNights(b.checkIn, b.checkOut)}
                    </span>
                  </div>

                  <div className="stay-dates-row">
                    <Calendar size={14} className="calendar-icon" />
                    <span className="date-range">
                      {formatDateBeautifully(b.checkIn)} <span className="date-arrow">→</span> {formatDateBeautifully(b.checkOut)}
                    </span>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="card-actions-footer">
                  <button 
                    onClick={() => openWhatsAppModal(b)} 
                    className="btn-whatsapp-action"
                  >
                    <MessageSquare size={15} />
                    <span>Dispatch WhatsApp</span>
                  </button>

                  {b.rawStatus === 'AUTHORIZING' && (
                    <div className="decision-actions">
                      <button 
                        onClick={() => handleApprove(b.id)} 
                        className="btn-action-approve"
                        title="Approve Booking"
                        disabled={actionLoading === b.id}
                      >
                        <Check size={16} />
                        <span>Approve</span>
                      </button>
                      <button 
                        onClick={() => handleDecline(b.id)} 
                        className="btn-action-decline"
                        title="Decline Booking"
                        disabled={actionLoading === b.id}
                      >
                        <X size={16} />
                        <span>Decline</span>
                      </button>
                    </div>
                  )}

                  {b.rawStatus === 'APPROVED' && (
                    <button 
                      onClick={() => handleDecline(b.id)} 
                      className="btn-action-decline-compact"
                      title="Cancel/Decline Reservation"
                      disabled={actionLoading === b.id}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ============================================================ */
        /* DESKTOP TABLE VIEW (Clean, Well-Aligned, High Density)       */
        /* ============================================================ */
        <div className="bookings-table-wrapper glass">
          <table className="bookings-table">
            <thead>
              <tr>
                <th style={{ width: '18%' }}>Booking Ref</th>
                <th style={{ width: '25%' }}>Guest Details</th>
                <th style={{ width: '25%' }}>Suite & Stay Period</th>
                <th style={{ width: '17%' }}>Status</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(b => {
                const ttl = getTTL(b);
                const suiteClass = getSuiteClass(b.suite);
                const waCleanPhone = cleanPhoneForWa(b.phone);

                return (
                  <tr key={b.id} className={`${b.status.toLowerCase()}-row`}>
                    {/* 1. BOOKING REF */}
                    <td className="col-booking-ref">
                      <div className="cell-inner">
                        <div 
                          className="booking-ref-badge" 
                          onClick={(e) => copyBookingId(b.id, e)} 
                          title="Click to copy full booking ref"
                        >
                          <span className="ref-hash">#</span>
                          <span className="booking-ref-text">{b.id.substring(0, 8)}</span>
                          <Copy size={11} className="copy-icon-hover" />
                        </div>
                        <span className="booking-time-label">
                          <Clock size={11} /> {b.submitted}
                        </span>
                      </div>
                    </td>

                    {/* 2. GUEST DETAILS */}
                    <td className="col-guest-details">
                      <div className="cell-inner">
                        <div className="guest-name-row">
                          <span className="guest-avatar-bubble mini">
                            {b.guest.charAt(0).toUpperCase()}
                          </span>
                          <span className="guest-full-name">{b.guest}</span>
                        </div>
                        {b.phone && (
                          <div className="guest-phone-contact">
                            <a href={`tel:${b.phone}`} className="guest-phone-link">
                              <Phone size={11} /> {b.phone}
                            </a>
                            {waCleanPhone && (
                              <a 
                                href={`https://wa.me/${waCleanPhone}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="quick-wa-link"
                                title="Open WhatsApp chat"
                              >
                                <MessageSquare size={11} />
                              </a>
                            )}
                          </div>
                        )}
                        {b.email && <span className="guest-email-tag">{b.email}</span>}
                      </div>
                    </td>

                    {/* 3. SUITE & STAY PERIOD */}
                    <td className="col-suite-period">
                      <div className="cell-inner">
                        <div className="suite-tag-row">
                          <span className={`suite-badge ${suiteClass}`}>
                            {getSuiteName(b.suite)}
                          </span>
                          <span className={`booking-type-badge ${b.bookingType === 'one_bedroom' ? 'badge-one-bed' : 'badge-entire'}`}>
                            {b.bookingType === 'one_bedroom' ? '1 Bed' : 'Entire Suite'}
                          </span>
                          <span className="nights-counter">
                            {calculateNights(b.checkIn, b.checkOut)}
                          </span>
                        </div>
                        <span className="period-dates-text">
                          {formatDateBeautifully(b.checkIn)} <span className="date-arrow">→</span> {formatDateBeautifully(b.checkOut)}
                        </span>
                      </div>
                    </td>

                    {/* 4. STATUS */}
                    <td className="col-status">
                      <div className="cell-inner">
                        <span className={`status-pill status-${b.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {b.rawStatus === 'APPROVED' ? 'Awaiting Payment' : 
                           b.rawStatus === 'AUTHORIZING' ? 'Awaiting Verification' : 
                           b.status}
                        </span>
                        
                        {b.rawStatus === 'APPROVED' && ttl !== null && (
                          <span className={`ttl-badge ${ttl < 14400 ? 'critical' : ''}`}>
                            <Clock size={11} className="clock-icon" />
                            {formatTTL(ttl)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 5. ACTIONS */}
                    <td className="col-actions" style={{ textAlign: 'right' }}>
                      <div className="table-actions-container">
                        {b.rawStatus === 'AUTHORIZING' && (
                          <>
                            <button 
                              onClick={() => handleApprove(b.id)} 
                              className="btn-table-approve"
                              title="Approve Payment & Activate Reservation"
                              disabled={actionLoading === b.id}
                            >
                              <Check size={14} />
                            </button>
                            <button 
                              onClick={() => handleDecline(b.id)} 
                              className="btn-table-decline"
                              title="Decline Reservation"
                              disabled={actionLoading === b.id}
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}

                        {b.rawStatus === 'APPROVED' && (
                          <button 
                            onClick={() => handleDecline(b.id)} 
                            className="btn-table-decline"
                            title="Decline Reservation"
                            disabled={actionLoading === b.id}
                          >
                            <X size={14} />
                          </button>
                        )}
                        
                        <button 
                          onClick={() => openWhatsAppModal(b)} 
                          className="btn-whatsapp-table"
                          title="Dispatch WhatsApp Confirmation"
                        >
                          <MessageSquare size={14} />
                          <span>Dispatch WhatsApp</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* WhatsApp Dispatch Console Modal */}
      {selectedBooking && (
        <div className="modal-overlay glass-modal">
          <div className="dispatch-modal animate-slide-up">
            <div className="modal-header">
              <div className="modal-header-title">
                <MessageSquare size={20} className="modal-wa-icon" />
                <h3>WhatsApp Client Dispatch</h3>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="close-modal-btn">
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="dispatch-meta">
                <div>
                  <span className="meta-label">Guest</span>
                  <p className="meta-val">{selectedBooking.guest}</p>
                </div>
                <div>
                  <span className="meta-label">Phone</span>
                  <p className="meta-val">{selectedBooking.phone || 'None'}</p>
                </div>
                <div>
                  <span className="meta-label">Suite</span>
                  <p className="meta-val">{getSuiteName(selectedBooking.suite)}</p>
                </div>
                <div>
                  <span className="meta-label">Booking Ref</span>
                  <p className="meta-val">#{selectedBooking.id.substring(0, 8)}</p>
                </div>
              </div>

              <div className="template-textarea-wrapper">
                <label>Dispatch Message Preview (Edit as needed)</label>
                <textarea 
                  value={whatsAppText}
                  onChange={(e) => setWhatsAppText(e.target.value)}
                  rows={8}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={handleCopyMessage} className="btn-modal-secondary">
                <Copy size={16} />
                <span>{copiedId ? 'Copied!' : 'Copy Text'}</span>
              </button>
              
              <button onClick={handleLaunchWhatsApp} className="btn-modal-primary">
                <ExternalLink size={16} />
                <span>Open in WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
