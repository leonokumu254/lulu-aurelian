import React, { useState, useEffect } from 'react';
import { Check, X, MessageSquare, Clock, ExternalLink, Copy, CheckCircle2, Search, Filter, RefreshCw, Loader2 } from 'lucide-react';
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
            guest: b.guest_name,
            email: b.guest_email,
            suite: b.unit_id,
            checkIn: b.check_in?.split('T')[0] || b.check_in,
            checkOut: b.check_out?.split('T')[0] || b.check_out,
            phone: b.guest_phone,
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
    if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  // Format date helper (e.g. Mon 6th Jun)
  const formatDateBeautifully = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const day = date.getDate();
    
    const getOrdinalSuffix = (d) => {
      if (d > 3 && d < 21) return 'th';
      switch (d % 10) {
        case 1:  return 'st';
        case 2:  return 'nd';
        case 3:  return 'rd';
        default: return 'th';
      }
    };
    
    return `${dayName} ${day}${getOrdinalSuffix(day)} ${monthName}`;
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
        await fetchBookings(); // Refresh list
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
    const map = { skyview: 'Skyview Hideaway', cocoa: 'Cocoa Retreat' };
    return map[unitId] || unitId;
  };

  // Trigger WhatsApp Modal dialog
  const openWhatsAppModal = (booking) => {
    let msg = '';
    
    if (booking.rawStatus === 'PENDING') {
      msg = `Dear ${booking.guest}, your reservation request for the luxury ${getSuiteName(booking.suite)} at Pearl Apartments (Lulu Aurelian Estate) has been RECEIVED. 

Details:
• Check-In: ${booking.checkIn}
• Check-Out: ${booking.checkOut}

To secure your dates, please proceed to paying the required deposit. We will process your booking immediately upon receipt.

Warm regards,
Pearl Concierge Team`;
    } else if (booking.rawStatus === 'PAID' || booking.rawStatus === 'COMPLETED') {
      const isCocoa = booking.suite === 'cocoa';
      const wifiNet = isCocoa ? 'LULU_COCOA' : 'LULU_SKYVIEW';
      const wifiPass = isCocoa ? 'Cocoa@2026' : 'Skyview@2026';
      const houseNo = isCocoa ? 'C-12' : 'S-45';
      const floor = isCocoa ? '1st Floor' : '4th Floor';

      msg = `Dear ${booking.guest}, your payment has been CONFIRMED! Welcome to ${getSuiteName(booking.suite)} at Pearl Apartments (Lulu Aurelian Estate).

Here are your arrival details:
• House Number: ${houseNo} (${floor})
• Wi-Fi Network: ${wifiNet}
• Wi-Fi Password: ${wifiPass}
• Door Key Code: [Insert 4-Digit PIN]

We look forward to hosting you. If you need anything during your stay, please reach out!

Warm regards,
Pearl Concierge Team`;
    } else {
      msg = `Dear ${booking.guest}, your booking for the luxury ${getSuiteName(booking.suite)} at Pearl Apartments (Lulu Aurelian Estate) is AWAITING PAYMENT. 

Details:
• Check-In: ${booking.checkIn}
• Check-Out: ${booking.checkOut}

Please complete your deposit payment within the next 3 hours to secure your dates.

Warm regards,
Pearl Concierge Team`;
    }

    setSelectedBooking(booking);
    setWhatsAppText(msg);
  };

  // Launch WhatsApp Web Link
  const handleLaunchWhatsApp = () => {
    if (!selectedBooking) return;
    const phoneNum = selectedBooking.phone.replace('+', '');
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

  // Filtering Logic
  const filteredBookings = bookings.filter(b => {
    let mappedFilter = filter;
    if (filter === 'Awaiting Payment') mappedFilter = 'Approved';
    const matchesFilter = filter === 'All' || b.status === mappedFilter;
    const matchesSearch = b.guest.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.suite.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="agent-portal-container">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="portal-toast animate-slide-up">
          <CheckCircle2 size={16} className="toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Agent Statistics */}
      <div className="dashboard-stats-row">
        <div className="stat-card">
          <div className="stat-icon"><CheckCircle2 size={24} /></div>
          <div className="stat-details">
            <h3>Awaiting Payment</h3>
            <p>{bookings.filter(b => b.rawStatus === 'APPROVED').length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><CheckCircle2 size={24} /></div>
          <div className="stat-details">
            <h3>Confirmed & Paid</h3>
            <p>{bookings.filter(b => b.rawStatus === 'PAID').length}</p>
          </div>
        </div>
      </div>

      {/* Toolbar Controls */}
      <div className="portal-toolbar glass">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search guest name, suite, or booking ref..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <Filter size={16} className="filter-icon" />
          {['All', 'Pending', 'Awaiting Payment', 'Paid', 'Completed', 'Cancelled', 'Declined'].map(cat => (
            <button
              key={cat}
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="empty-queue-card glass" style={{ textAlign: 'center', padding: '3rem' }}>
          <Loader2 size={36} className="spinner" style={{ margin: '0 auto 1rem' }} />
          <p>Loading reservations from database...</p>
        </div>
      ) : error ? (
        <div className="empty-queue-card glass" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#ff6b6b' }}>{error}</p>
          <button onClick={() => { setError(''); setLoading(true); fetchBookings(); }} className="filter-btn active" style={{ marginTop: '1rem' }}>
            Retry
          </button>
        </div>
      ) : (
        /* Triage Grid Queue */
        <div className="triage-grid">
          {filteredBookings.length > 0 ? (
            filteredBookings.map(b => {
              const ttl = getTTL(b);
              return (
                <div key={b.id} className={`triage-card glass ${b.status.toLowerCase()}-border`}>
                  <div className="card-top">
                    <span className="booking-ref">{b.id.substring(0, 8)}</span>
                    <span className="booking-time">{b.submitted}</span>
                  </div>

                  <div className="guest-info">
                    <h3>{b.guest}</h3>
                    <p className="guest-phone">{b.phone}</p>
                  </div>

                  <div className="booking-details">
                    <div className="detail-row">
                      <span className="detail-lbl">Suite:</span>
                      <span className="detail-val suite-name">{getSuiteName(b.suite)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-lbl">Period:</span>
                      <span className="detail-val">{formatDateBeautifully(b.checkIn)} to {formatDateBeautifully(b.checkOut)}</span>
                    </div>
                  </div>

                  <div className="card-actions-wrapper">
                    {/* Status Badges & TTL */}
                    <div className="badge-row">
                      <span className={`status-pill ${b.status.toLowerCase()}`}>
                        {b.rawStatus === 'APPROVED' ? 'Awaiting Payment' : b.status}
                      </span>
                      
                      {b.rawStatus === 'APPROVED' && ttl !== null && (
                        <span className={`ttl-badge ${ttl < 14400 ? 'critical' : ''}`}>
                          <Clock size={12} className="clock-icon" />
                          {formatTTL(ttl)}
                        </span>
                      )}
                    </div>

                    {/* Operations Buttons */}
                    <div className="action-buttons">
                      {b.rawStatus === 'APPROVED' && (
                        <button 
                          onClick={() => handleDecline(b.id)} 
                          className="btn-decline"
                          title="Decline Reservation"
                          disabled={actionLoading === b.id}
                        >
                          <X size={16} />
                          <span>{actionLoading === b.id ? 'Processing...' : 'Decline'}</span>
                        </button>
                      )}
                      
                      {(b.rawStatus === 'PENDING' || b.rawStatus === 'APPROVED' || b.rawStatus === 'PAID') && (
                        <button 
                          onClick={() => openWhatsAppModal(b)} 
                          className="btn-whatsapp"
                        >
                          <MessageSquare size={16} />
                          <span>Dispatch WhatsApp</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-queue-card glass">
              <RefreshCw size={36} className="empty-icon" />
              <p>No reservations matching the active criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* WhatsApp Dispatch Console Modal */}
      {selectedBooking && (
        <div className="modal-overlay glass-modal">
          <div className="dispatch-modal animate-slide-up">
            <div className="modal-header">
              <h3>WhatsApp Client Dispatch</h3>
              <button onClick={() => setSelectedBooking(null)} className="close-modal-btn">
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="dispatch-meta">
                <div>
                  <span className="meta-label">Recipient</span>
                  <p className="meta-val">{selectedBooking.guest} ({selectedBooking.phone})</p>
                </div>
                <div>
                  <span className="meta-label">Booking ID</span>
                  <p className="meta-val">{selectedBooking.id.substring(0, 8)}</p>
                </div>
              </div>

              <div className="template-textarea-wrapper">
                <label>Compose Dispatch Message</label>
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
                <span>{copiedId ? 'Copied' : 'Copy Message'}</span>
              </button>
              
              <button onClick={handleLaunchWhatsApp} className="btn-modal-primary">
                <ExternalLink size={16} />
                <span>Send via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
