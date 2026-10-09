import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, Clock, CheckCircle, MapPin, Edit3, Bed, Award, Star, 
  History, Lock, Unlock, X, Copy, ShieldCheck, Wifi, Key, 
  PhoneCall, Loader2, MessageSquare, Check, AlertCircle 
} from 'lucide-react';
import GuestHouseRules from './GuestHouseRules';
import './GuestPortal.css';

const UNIT_NAMES = { skyview: 'Skyview Hideaway', cocoa: 'Cocoa Retreat', neema: 'Neema Haven' };
const UNIT_THUMBNAILS = { skyview: '/assets/skyview/skyview_1.jpg', cocoa: '/assets/cocoa/cocoa_1.jpg', neema: '/assets/Neema/neema_1.jpeg' };
const getUnitName = (id) => UNIT_NAMES[id] || id;
const getUnitThumb = (id) => UNIT_THUMBNAILS[id] || UNIT_THUMBNAILS.skyview;

// Helper to format dates cleanly in East Africa Time (EAT)
const formatEATDate = (dateStr, options = {}) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    timeZone: 'Africa/Nairobi',
    ...options
  });
};

export default function GuestPortal({ user, onBookNew }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [copiedField, setCopiedField] = useState('');
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Live Payment & Polling State
  const [stkPushSent, setStkPushSent] = useState(false);
  const [activeCheckoutRequestId, setActiveCheckoutRequestId] = useState(null);
  const [manualMpesaCode, setManualMpesaCode] = useState('');
  const [verifyingManual, setVerifyingManual] = useState(false);
  const [manualError, setManualError] = useState(null);

  const handleCopyText = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2500);
  };

  // Reusable fetchBookings with silent background update support
  const fetchBookings = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bookings/my-bookings`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.bookings)) {
        setBookings(prevBookings => {
          // If a booking transitioned from PENDING/APPROVED/AUTHORIZING to PAID, trigger success
          const hadUnpaid = prevBookings.some(b => 
            ['APPROVED', 'AUTHORIZING', 'PENDING'].includes(b.status)
          );
          const hasNewPaid = data.bookings.some(b => 
            b.status === 'PAID' && 
            prevBookings.find(prev => prev.id === b.id && prev.status !== 'PAID')
          );

          if (hadUnpaid && hasNewPaid) {
            setStkPushSent(false);
            setPaymentSuccess(true);
          }
          return data.bookings;
        });
      } else if (!isSilent) {
        setError(data.error);
      }
    } catch (err) {
      if (!isSilent) setError('Failed to fetch your bookings.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchBookings(false);
  }, [fetchBookings]);

  // Find active and past bookings (include PENDING and AUTHORIZING so users always track them)
  const activeBookings = bookings.filter(b =>
    ['APPROVED', 'PAID', 'PENDING', 'AUTHORIZING'].includes(b.status) &&
    new Date(b.check_out) >= new Date(new Date().setHours(0, 0, 0, 0))
  );

  const pastBookings = bookings.filter(b =>
    !activeBookings.find(ab => ab.id === b.id)
  );

  // Determine which booking to show in the main stream
  const activeBooking = selectedBookingId
    ? bookings.find(b => b.id === selectedBookingId)
    : (activeBookings[0] || bookings[0]);

  // Calculate Loyalty Program Nights
  let accumulatedNights = 0;
  bookings.forEach(b => {
    if (b.status === 'PAID' || b.status === 'COMPLETED') {
      const start = new Date(b.check_in);
      const end = new Date(b.check_out);
      const nights = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
      if (!isNaN(nights) && nights > 0) {
        accumulatedNights += nights;
      }
    }
  });

  const nightsLeft = 10 - (accumulatedNights % 10);
  const totalFreeNightsEarned = Math.floor(accumulatedNights / 10);
  const progressPercentage = ((accumulatedNights % 10) / 10) * 100;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  // Real-time Polling while waiting for STK Push / AUTHORIZING status
  useEffect(() => {
    if (!stkPushSent && (!activeBooking || activeBooking.status !== 'AUTHORIZING')) return;

    console.log('[PORTAL POLL]: Active polling engaged for booking confirmation...');
    const pollInterval = setInterval(async () => {
      try {
        if (activeCheckoutRequestId || activeBooking?.id) {
          const queryUrl = activeCheckoutRequestId
            ? `${import.meta.env.VITE_API_URL || ''}/api/payments/payhero/query?checkoutRequestId=${activeCheckoutRequestId}&booking_id=${activeBooking?.id}`
            : `${import.meta.env.VITE_API_URL || ''}/api/payments/payhero/query?booking_id=${activeBooking?.id}`;

          const qRes = await fetch(queryUrl, { credentials: 'include' });
          const qData = await qRes.json();
          if (qData.status === 'COMPLETED' || (qData.success && qData.status === 'COMPLETED')) {
            console.log('[PORTAL POLL]: Payment detected as COMPLETED via PayHero status query!');
            setStkPushSent(false);
            setPaymentSuccess(true);
            fetchBookings(true);
            return;
          }
        }
        // Poll booking records directly
        fetchBookings(true);
      } catch (e) {
        console.warn('[PORTAL POLL ERROR]:', e.message);
      }
    }, 3200);

    return () => clearInterval(pollInterval);
  }, [stkPushSent, activeCheckoutRequestId, activeBooking?.id, activeBooking?.status, fetchBookings]);

  // General background polling (every 6s) when any reservation is PENDING or APPROVED
  useEffect(() => {
    const hasUnconfirmed = bookings.some(b => ['PENDING', 'APPROVED', 'AUTHORIZING'].includes(b.status));
    if (!hasUnconfirmed) return;

    const interval = setInterval(() => {
      fetchBookings(true);
    }, 6000);

    return () => clearInterval(interval);
  }, [bookings, fetchBookings]);

  const getStepIndex = (status) => {
    if (status === 'PENDING' || status === 'AUTHORIZING' || status === 'APPROVED') return 1; // Awaiting Payment
    if (status === 'PAID') return 2; // Confirmed
    if (status === 'COMPLETED') return 4;
    return 1;
  };

  if (loading) return <div className="guest-portal-loader">Initializing Dashboard...</div>;

  return (
    <div className="guest-portal-container">
      <div className="guest-portal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="guest-portal-title">Welcome <span id="title">back, {user.name.split(' ')[0]}</span></h1>
          <p className="guest-portal-subtitle">Is my booking confirmed? Track your status instantly below.</p>
        </div>
        <button onClick={onBookNew} className="btn-primary">Book New Stay</button>
      </div>

      <div className="guest-portal-grid">
        {/* MAIN STREAM (LEFT) */}
        <div className="guest-portal-main">
          {error && <div className="portal-error">{error}</div>}

          {!activeBooking ? (
            <div className="no-bookings-hero glass">
              <Bed size={48} className="empty-icon" />
              <h3>No Active Bookings</h3>
              <p>Ready for your next luxury escape?</p>
              <button onClick={onBookNew} className="btn-primary">Book a Stay</button>
            </div>
          ) : (
            <>
              {/* STATUS BANNER CARD */}
              <div className="status-banner-card glass">
                <div className="status-banner-header">
                  <span className="tracker-label">Booking Tracker</span>
                  <div className={`status-badge-pastel ${activeBooking.status.toLowerCase()}`}>
                    <span className="dot">●</span> {activeBooking.status === 'APPROVED' ? 'Awaiting Payment' : activeBooking.status}
                  </div>
                </div>

                <div className="stepper-track">
                  {['Awaiting Payment', 'Confirmed', 'Active', 'Completed'].map((step, idx) => {
                    const currentStepIndex = getStepIndex(activeBooking.status);
                    const isCompleted = idx + 1 <= currentStepIndex;
                    const isActive = idx + 1 === currentStepIndex;

                    return (
                      <div key={step} className={`stepper-node ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                        <div className="node-circle">
                          {isCompleted ? <CheckCircle size={14} /> : idx + 1}
                        </div>
                        <span className="node-label">{step}</span>
                        {idx < 3 && <div className="node-line" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* GLASSMORPHIC ACTION CARD */}
              <div className="action-card glass">
                <div className="action-card-content">
                  <div className="action-card-dates">
                    <span className="arrival-label">Upcoming Arrival</span>
                    <h2 className="arrival-date">
                      {formatEATDate(activeBooking.check_in, { weekday: 'short', day: 'numeric', month: 'short' })}
                      <span className="arrival-year">, {formatEATDate(activeBooking.check_in, { year: 'numeric' })}</span>
                    </h2>
                    <p className="arrival-unit">
                      <MapPin size={14} /> {getUnitName(activeBooking.unit_id)}
                    </p>
                  </div>

                  <div className="action-card-map">
                    <div className="map-placeholder">
                      <img src={getUnitThumb(activeBooking.unit_id)} alt={getUnitName(activeBooking.unit_id)} className="thumbnail-img" />
                    </div>
                  </div>
                </div>

                <div className="action-card-footer" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1.25rem' }}>

                  {/* 1. CONFIRMED & PAID RESERVATION: KEYLESS ACCESS & CHECK-IN CREDENTIALS */}
                  {['PAID', 'COMPLETED'].includes(activeBooking.status) ? (
                    <div className="payment-confirmed-credentials-card animate-fade-in" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid rgba(212, 175, 55, 0.25)', paddingBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle size={20} />
                          </div>
                          <div>
                            <strong style={{ fontSize: '1rem', color: '#1D1912', display: 'block' }}>Payment Confirmed & Secured</strong>
                            <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>Access Credentials Active</span>
                          </div>
                        </div>
                        <div className="booking-ref-block" style={{ margin: 0 }}>
                          <span className="ref-label">Reference</span>
                          <span className="ref-value">{activeBooking.id.split('-')[0].toUpperCase()}</span>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
                        {/* Lockbox Passcode */}
                        <div style={{ background: 'rgba(255, 255, 255, 0.9)', padding: '0.9rem 1rem', borderRadius: '10px', border: '1px solid rgba(207, 168, 115, 0.35)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '0.72rem', color: '#8c7a6b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                              <Key size={13} style={{ marginRight: '4px', verticalAlign: '-1px' }} /> Keyless Lockbox Passcode
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(activeBooking.passcode || '9823', 'passcode')}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: copiedField === 'passcode' ? '#10B981' : '#64748b' }}
                              title="Copy Passcode"
                            >
                              {copiedField === 'passcode' ? <CheckCircle size={14} /> : <Copy size={14} />}
                            </button>
                          </div>
                          <strong style={{ fontSize: '1.35rem', color: '#1a1714', letterSpacing: '2px', fontFamily: 'monospace' }}>
                            {activeBooking.passcode || '9823'}
                          </strong>
                          <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>
                            {activeBooking.house_number ? `Unit Location: ${activeBooking.house_number}` : 'Self check-in keypad code'}
                          </span>
                        </div>

                        {/* High-Speed Wi-Fi */}
                        <div style={{ background: 'rgba(255, 255, 255, 0.9)', padding: '0.9rem 1rem', borderRadius: '10px', border: '1px solid rgba(207, 168, 115, 0.35)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '0.72rem', color: '#8c7a6b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                              <Wifi size={13} style={{ marginRight: '4px', verticalAlign: '-1px' }} /> High-Speed Wi-Fi
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(activeBooking.wifi_password || 'LuluWiFi2026', 'wifi')}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: copiedField === 'wifi' ? '#10B981' : '#64748b' }}
                              title="Copy Wi-Fi Password"
                            >
                              {copiedField === 'wifi' ? <CheckCircle size={14} /> : <Copy size={14} />}
                            </button>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1a1714' }}>
                              SSID: {activeBooking.wifi_ssid || 'LuluAurelian-Guest'}
                            </span>
                            <span style={{ fontSize: '0.82rem', color: '#524b42' }}>
                              Pass: <strong>{activeBooking.wifi_password || 'LuluWiFi2026'}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Check-In Guidelines in East Africa Time (EAT) */}
                      <div style={{ background: 'rgba(212, 175, 55, 0.08)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                        <Clock size={18} color="#9a7629" style={{ flexShrink: 0 }} />
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#524424', lineHeight: 1.45 }}>
                          <strong>Check-in from 2:00 PM EAT (Early access from 1:00 PM EAT)</strong> • Check-out by 10:00 AM EAT. Full credentials have also been dispatched to your email & WhatsApp.
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <a 
                          href={`https://wa.me/254112299384?text=${encodeURIComponent(
                            `Hello Lulu Aurelian Concierge,\n\nI am contacting you regarding my confirmed stay.\nReference: ${activeBooking.id.split('-')[0].toUpperCase()}\nSuite: ${getUnitName(activeBooking.unit_id)}\nDates: ${formatEATDate(activeBooking.check_in)} to ${formatEATDate(activeBooking.check_out)}`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            flex: 1,
                            minWidth: '220px',
                            background: '#25D366',
                            color: '#fff',
                            textDecoration: 'none',
                            padding: '0.75rem 1.25rem',
                            borderRadius: '8px',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            textAlign: 'center',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <MessageSquare size={16} /> Contact Concierge on WhatsApp
                        </a>
                        <button 
                          className="btn-modify"
                          style={{ flex: '0 0 auto', padding: '0.75rem 1.25rem' }}
                          onClick={() => {
                            const checkIn = formatEATDate(activeBooking.check_in, { day: 'numeric', month: 'short', year: 'numeric' });
                            const checkOut = formatEATDate(activeBooking.check_out, { day: 'numeric', month: 'short', year: 'numeric' });
                            const ref = activeBooking.id.split('-')[0].toUpperCase();
                            const unit = getUnitName(activeBooking.unit_id);
                            const text = encodeURIComponent(`Hello, I would like to request an adjustment for my confirmed booking.\n\n*Reference:* ${ref}\n*Unit:* ${unit}\n*Dates:* ${checkIn} to ${checkOut}`);
                            window.open(`https://wa.me/254112299384?text=${text}`, '_blank');
                          }}
                        >
                          <Edit3 size={16} /> Request Changes
                        </button>
                      </div>
                    </div>
                  ) : (stkPushSent || activeBooking.status === 'AUTHORIZING') ? (
                    /* 2. REAL-TIME AUTHORIZING / STK PUSH SENT STATE */
                    <div className="payment-authorizing-card animate-fade-in" style={{ padding: '1.25rem 1.5rem', background: 'rgba(212, 175, 55, 0.05)', border: '1.5px solid rgba(212, 175, 55, 0.35)', borderRadius: '12px', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(26, 158, 53, 0.15)', color: '#1a9e35', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <PhoneCall size={22} />
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1rem', color: '#1D1912' }}>M-Pesa Prompt Sent to Phone!</h4>
                          <span style={{ fontSize: '0.82rem', color: '#1a9e35', fontWeight: 600 }}>
                            Awaiting PIN on +254 {mpesaPhone || (activeBooking.guest_phone || '').replace(/^\+?254/, '')}
                          </span>
                        </div>
                      </div>

                      <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1rem' }}>
                        Please enter your 4-digit M-Pesa PIN on your phone handset to authorize <strong>KES {(activeBooking.total_price || 0).toLocaleString('en-KE')}</strong>. Your portal dashboard will update itself the instant confirmation is received!
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: '#166534', background: 'rgba(22, 163, 74, 0.1)', padding: '0.6rem 0.9rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid rgba(22, 163, 74, 0.2)' }}>
                        <Loader2 size={16} className="animate-spin" color="#16a34a" />
                        <span><strong>Live Auto-Detection Active:</strong> Listening for Safaricom confirmation...</span>
                      </div>

                      {/* Manual SMS Verification Fallback */}
                      <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '1rem' }}>
                        <span style={{ display: 'block', fontSize: '0.78rem', color: '#475569', fontWeight: 600, marginBottom: '0.4rem' }}>
                          Didn't receive prompt or entered PIN already? Enter M-Pesa SMS Code:
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="text"
                            placeholder="e.g. SJR48Z9X2"
                            value={manualMpesaCode}
                            onChange={(e) => setManualMpesaCode(e.target.value.toUpperCase())}
                            style={{ flex: 1, padding: '0.6rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.15)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '1px', outline: 'none' }}
                          />
                          <button
                            type="button"
                            onClick={handleVerifyManualCode}
                            disabled={verifyingManual}
                            className="btn-primary"
                            style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                          >
                            {verifyingManual ? 'Verifying...' : 'Verify Code'}
                          </button>
                        </div>
                        {manualError && (
                          <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: '0.4rem 0 0' }}>{manualError}</p>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        <button
                          type="button"
                          onClick={() => setStkPushSent(false)}
                          style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          &larr; Back to payment options
                        </button>
                        <button
                          type="button"
                          onClick={handlePayment}
                          disabled={processingPayment}
                          style={{ background: 'none', border: 'none', color: '#1a9e35', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Resend STK Prompt &rarr;
                        </button>
                      </div>
                    </div>
                  ) : ['APPROVED', 'PENDING'].includes(activeBooking.status) && timeRemaining !== 'Expired' ? (
                    /* 3. AWAITING PAYMENT (STK PUSH / BUY GOODS GATEWAY) */
                    <div className="payment-gateway-block" style={{ width: '100%' }}>
                      <div className="payment-timer-alert">
                        <span>Payment Window Closes In:</span>
                        <strong>{timeRemaining || 'Calculating...'}</strong>
                      </div>
                      <div className="payment-options">
                        <label className={`pay-option ${paymentMethod === 'mpesa' ? 'selected' : ''}`}>
                          <input type="radio" name="payment" value="mpesa" checked={paymentMethod === 'mpesa'} onChange={() => setPaymentMethod('mpesa')} />
                          <div className="pay-option-content">
                            <strong>Buy Goods (Till Number)</strong>
                            <span>Till No: 4364845 • STK Push & Manual</span>
                          </div>
                        </label>
                        <label className={`pay-option ${paymentMethod === 'contact_staff' ? 'selected' : ''}`}>
                          <input type="radio" name="payment" value="contact_staff" checked={paymentMethod === 'contact_staff'} onChange={() => setPaymentMethod('contact_staff')} />
                          <div className="pay-option-content">
                            <strong>Other Payment Methods</strong>
                            <span>Different method? Contact Support</span>
                          </div>
                        </label>
                      </div>
                      {paymentMethod === 'mpesa' && (
                        <div style={{ background: 'rgba(0, 0, 0, 0.02)', border: '1.5px solid rgba(0, 0, 0, 0.08)', borderRadius: '10px', padding: '1rem', color: '#1D1912', marginTop: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', borderBottom: '1px solid rgba(0, 0, 0, 0.08)', paddingBottom: '0.35rem' }}>
                            <strong style={{ fontSize: '0.85rem', color: '#1a9e35', letterSpacing: '0.5px' }}>OFFICIAL TILL DETAILS</strong>
                            <span style={{ fontSize: '0.7rem', background: '#10b981', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>BUY GOODS</span>
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <div style={{ background: 'rgba(255, 255, 255, 0.7)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                              <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>TILL NUMBER</span>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                                <strong style={{ fontSize: '1.05rem', color: '#1D1912', letterSpacing: '1px' }}>4364845</strong>
                                <button
                                  type="button"
                                  onClick={() => handleCopyText('4364845', 'till')}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: copiedField === 'till' ? '#1a9e35' : '#64748b' }}
                                  title="Copy Till Number"
                                >
                                  {copiedField === 'till' ? <CheckCircle size={14} /> : <Copy size={14} />}
                                </button>
                              </div>
                            </div>
                          </div>

                          <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0 0 0.75rem', lineHeight: '1.5' }}>
                            Enter your phone number below for an instant prompt, or pay manually via your M-Pesa menu using Till Number <strong>4364845</strong>.
                          </p>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1D1912', marginBottom: '0.4rem' }}>M-Pesa Phone Number</label>
                          <div className="phone-input-group" style={{ display: 'flex', alignItems: 'center' }}>
                            <span className="phone-prefix" style={{ background: 'rgba(0, 0, 0, 0.03)', padding: '0.55rem 0.75rem', border: '1px solid rgba(0, 0, 0, 0.1)', borderRight: 'none', borderRadius: '6px 0 0 6px', color: '#1D1912', fontSize: '0.9rem' }}>+254</span>
                            <input
                              type="tel"
                              value={mpesaPhone}
                              onChange={(e) => setMpesaPhone(e.target.value.replace(/[^0-9]/g, ''))}
                              placeholder="712345678"
                              style={{ flex: 1, padding: '0.55rem 0.75rem', borderRadius: '0 6px 6px 0', border: '1.5px solid rgba(0, 0, 0, 0.1)', borderLeft: 'none', background: '#fff', color: '#1D1912', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none' }}
                            />
                          </div>
                          <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '0.3rem 0 0' }}>Enter your Safaricom phone number without country code.</p>
                        </div>
                      )}
                      {paymentMethod === 'contact_staff' && (
                        <div style={{ background: 'rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: '8px', padding: '1rem', color: '#1D1912', marginTop: '1rem' }}>
                          <strong style={{ display: 'block', fontSize: '0.85rem', color: '#1D1912', marginBottom: '0.5rem' }}>SUPPORT & ALTERNATIVE PAYMENTS</strong>
                          <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 0.75rem', lineHeight: '1.5' }}>
                            Online checkout is processed via <strong>M-Pesa Buy Goods only</strong>. If you have a different payment method (such as <strong>Bank Transfer</strong>, <strong>Card</strong>, or <strong>Corporate Invoice</strong>), please contact our support desk directly with Booking Ref: <strong>{activeBooking.id}</strong>:
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <a 
                              href={`https://wa.me/254112299384?text=${encodeURIComponent(
                                `Hello Lulu Aurelian Estate Support,\n\nI am contacting you regarding payment for Booking Ref: ${activeBooking.id} (${activeBooking.unit_id?.toUpperCase()}).\nTotal Amount: KES ${(activeBooking.total_price || 0).toLocaleString('en-KE')}.\nI have an alternative payment method and would like assistance.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                background: '#25D366',
                                color: '#fff',
                                textDecoration: 'none',
                                padding: '0.6rem 1rem',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                textAlign: 'center',
                                display: 'block'
                              }}
                            >
                              Chat with Support on WhatsApp (+254 112 299 384)
                            </a>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                              <a 
                                href="tel:+254112299384"
                                style={{
                                  border: '1px solid rgba(0, 0, 0, 0.1)',
                                  color: '#1D1912',
                                  textDecoration: 'none',
                                  padding: '0.5rem',
                                  borderRadius: '6px',
                                  fontSize: '0.78rem',
                                  textAlign: 'center'
                                }}
                              >
                                Call Support
                              </a>
                              <a 
                                href={`mailto:pearlisprime@gmail.com?subject=${encodeURIComponent(`Payment Inquiry - Booking ${activeBooking.id}`)}`}
                                style={{
                                  border: '1px solid rgba(0, 0, 0, 0.1)',
                                  color: '#1D1912',
                                  textDecoration: 'none',
                                  padding: '0.5rem',
                                  borderRadius: '6px',
                                  fontSize: '0.78rem',
                                  textAlign: 'center'
                                }}
                              >
                                Email Support
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                      {paymentError && (
                        <div style={{ color: '#ef4444', fontSize: '0.85rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)', marginTop: '1rem' }}>
                          {paymentError}
                        </div>
                      )}
                      {paymentMethod === 'mpesa' && (
                        <button className="btn-pay-now" onClick={handlePayment} disabled={processingPayment} style={{ background: '#1a9e35', marginTop: '1rem' }}>
                          {processingPayment 
                            ? '⏳ Initiating Buy Goods STK Push...' 
                            : `PAY VIA BUY GOODS (KES ${(activeBooking.total_price || 0).toLocaleString('en-KE')})`}
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          const confirmCancel = window.confirm('Are you sure you want to cancel this booking?');
                          if (!confirmCancel) return;

                          try {
                            const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bookings/${activeBooking.id}/cancel`, {
                              method: 'PUT',
                              credentials: 'include'
                            });
                            const data = await res.json();
                            if (data.success) {
                              setBookings(prev => prev.map(b => b.id === activeBooking.id ? { ...b, status: 'CANCELLED' } : b));
                            } else {
                              alert(data.error || 'Failed to cancel booking.');
                            }
                          } catch (err) {
                            alert('Connection error. Could not cancel booking.');
                          }
                        }}
                        className="btn-cancel-booking"
                        style={{
                          width: '100%',
                          padding: '1rem',
                          marginTop: '0.5rem',
                          background: 'transparent',
                          border: 'none',
                          color: '#6B7280',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          textAlign: 'center'
                        }}
                      >
                        Cancel Booking
                      </button>
                    </div>
                  ) : activeBooking.status === 'EXPIRED' || (activeBooking.status === 'APPROVED' && timeRemaining === 'Expired') ? (
                    /* 4. EXPIRED STATE */
                    <div className="payment-timer-alert expired" style={{ width: '100%' }}>
                      <span>Payment Window Expired</span>
                      <strong>Please create a new booking to reserve dates.</strong>
                    </div>
                  ) : (
                    /* 5. DEFAULT STATUS */
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
                      <div className="booking-ref-block">
                        <span className="ref-label">Reference</span>
                        <span className="ref-value">{activeBooking.id.split('-')[0].toUpperCase()}</span>
                      </div>
                      <button className="btn-modify" onClick={() => {
                        const checkIn = formatEATDate(activeBooking.check_in, { day: 'numeric', month: 'short', year: 'numeric' });
                        const checkOut = formatEATDate(activeBooking.check_out, { day: 'numeric', month: 'short', year: 'numeric' });
                        const ref = activeBooking.id.split('-')[0].toUpperCase();
                        const unit = getUnitName(activeBooking.unit_id);
                        const text = encodeURIComponent(`Hello, I would like to request a modification for my booking.\n\n*Current Details:*\nReference: ${ref}\nDates: ${checkIn} to ${checkOut}\nUnit: ${unit}\n\n*My Preferred Changes:*\n[Please type your changes here...]`);
                        window.open(`https://wa.me/254112299384?text=${text}`, '_blank');
                      }}>
                        <Edit3 size={16} /> Modify Booking
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* HOUSE RULES QUICK ACCESS CARD */}
              <div className="rules-quick-card glass" style={{ marginTop: '1.25rem', padding: '1.25rem 1.5rem', borderRadius: '14px', border: '1px solid rgba(207, 168, 115, 0.35)', background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(250,248,243,0.9))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={20} color="#b58434" />
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1a1714' }}>House Rules & Stay Guidelines</h3>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowRulesModal(true)}
                    style={{ background: '#1a1714', color: '#fff', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    View Full Guidelines &rarr;
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <span style={{ background: 'rgba(0,0,0,0.05)', padding: '0.3rem 0.65rem', borderRadius: '15px', fontSize: '0.78rem', color: '#443f38' }}>🕒 In: After 2:00 PM • Out: 10:00 AM</span>
                  <span style={{ background: 'rgba(0,0,0,0.05)', padding: '0.3rem 0.65rem', borderRadius: '15px', fontSize: '0.78rem', color: '#443f38' }}>🚭 Strictly No Indoor Smoking</span>
                  <span style={{ background: 'rgba(0,0,0,0.05)', padding: '0.3rem 0.65rem', borderRadius: '15px', fontSize: '0.78rem', color: '#443f38' }}>🔇 Quiet Hours: 10 PM - 7 AM</span>
                  <span style={{ background: 'rgba(0,0,0,0.05)', padding: '0.3rem 0.65rem', borderRadius: '15px', fontSize: '0.78rem', color: '#443f38' }}>🧼 Towels for Personal Use Only</span>
                </div>
              </div>
            </>
          )}

        </div>

        {/* SIDEBAR (RIGHT) */}
        <div className="guest-portal-sidebar">

          {/* LOYALTY REWARD TRACKER */}
          <div className="loyalty-widget glass">
            <div className="loyalty-widget-header">
              <h3>Rewards</h3>
              <Star size={18} className="loyalty-star" />
            </div>

            <div className="loyalty-ring-container">
              <div className="progress-ring-wrapper">
                <svg className="progress-ring" width="120" height="120">
                  <circle className="progress-ring-bg" strokeWidth="8" cx="60" cy="60" r={radius} />
                  <circle
                    className="progress-ring-fill"
                    strokeWidth="8"
                    cx="60"
                    cy="60"
                    r={radius}
                    style={{ strokeDasharray: circumference, strokeDashoffset }}
                  />
                </svg>
                <div className="progress-ring-content">
                  <span className="ring-number">{nightsLeft}</span>
                  <span className="ring-label">Days Left</span>
                </div>
              </div>
              <div className="loyalty-ring-meta">
                <p>Book <strong>10 nights</strong> to earn a free stay!</p>
                <div className="earned-badge">
                  <Award size={14} /> {totalFreeNightsEarned} Free Nights Earned
                </div>
              </div>
            </div>

            <div className="milestone-timeline">
              <div className="milestone-track">
                <div className="milestone-fill" style={{ width: `${progressPercentage}%` }} />

                <div className={`milestone-notch ${accumulatedNights % 10 >= 5 ? 'unlocked' : ''}`} style={{ left: '50%' }}>
                  <div className="notch-icon">
                    {accumulatedNights % 10 >= 5 ? <CheckCircle size={10} /> : <Lock size={10} />}
                  </div>
                  <span className="notch-label">Bronze Perk</span>
                </div>

                <div className={`milestone-notch ${accumulatedNights % 10 === 0 && accumulatedNights > 0 ? 'unlocked' : ''}`} style={{ left: '100%' }}>
                  <div className="notch-icon">
                    {accumulatedNights % 10 === 0 && accumulatedNights > 0 ? <CheckCircle size={10} /> : <Lock size={10} />}
                  </div>
                  <span className="notch-label">Free Stay</span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE BOOKINGS */}
          {activeBookings.length > 0 && (
            <div className="history-widget glass" style={{ marginBottom: '2rem' }}>
              <div className="history-header">
                <h3><Calendar size={16} /> Active Bookings</h3>
              </div>
              <div className="history-list">
                {activeBookings.map(booking => (
                  <div key={booking.id} className={`history-item ${activeBooking?.id === booking.id ? 'selected' : ''}`} onClick={() => setSelectedBookingId(booking.id)} style={{ cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', background: activeBooking?.id === booking.id ? 'rgba(187,133,37,0.1)' : 'transparent' }}>
                    <div className="history-item-icon">
                      <Bed size={16} />
                    </div>
                    <div className="history-item-details">
                      <h4>{getUnitName(booking.unit_id)}</h4>
                      <span>{formatEATDate(booking.check_in, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="history-item-status">
                      <span className={`micro-badge ${booking.status.toLowerCase()}`}>{booking.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TRANSACTION HISTORY */}
          {pastBookings.length > 0 && (
            <div className="history-widget glass">
              <div className="history-header">
                <h3><History size={16} /> Past Stays</h3>
              </div>
              <div className="history-list">
                {pastBookings.slice(0, 3).map(booking => (
                  <div key={booking.id} className={`history-item ${activeBooking?.id === booking.id ? 'selected' : ''}`} onClick={() => setSelectedBookingId(booking.id)} style={{ cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', background: activeBooking?.id === booking.id ? 'rgba(187,133,37,0.1)' : 'transparent' }}>
                    <div className="history-item-icon">
                      <Bed size={16} />
                    </div>
                    <div className="history-item-details">
                      <h4>{getUnitName(booking.unit_id)}</h4>
                      <span>{formatEATDate(booking.check_in, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="history-item-status">
                      <span className={`micro-badge ${booking.status.toLowerCase()}`}>{booking.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Payment Success Modal */}
      {paymentSuccess && (
        <div className="modal-overlay glass-modal">
          <div className="dispatch-modal glass status-modal-box animate-slide-up">
            <div className="success-badge-container" style={{ margin: '0 auto 1.5rem', width: 80, height: 80, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="success-checkmark-circle" style={{ width: 60, height: 60, borderRadius: '50%', background: '#10B981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={36} />
              </div>
            </div>
            <h2>Payment Successful!</h2>
            <p style={{ marginBottom: '2rem' }}>Your booking for {getUnitName(activeBooking?.unit_id)} has been fully paid and confirmed.</p>
            <button onClick={() => { setPaymentSuccess(false); fetchBookings(true); }} className="btn-primary">
              View Reservation & Keyless Access
            </button>
          </div>
        </div>
      )}

      {/* Payment Failed Modal */}
      {paymentError && (
        <div className="modal-overlay glass-modal">
          <div className="dispatch-modal glass status-modal-box animate-slide-up">
            <div className="success-badge-container" style={{ margin: '0 auto 1.5rem', width: 80, height: 80, borderRadius: '50%', background: 'rgba(220, 38, 38, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="success-checkmark-circle" style={{ width: 60, height: 60, borderRadius: '50%', background: '#DC2626', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={36} />
              </div>
            </div>
            <h2>Payment Unsuccessful</h2>
            <p style={{ color: '#DC2626', marginBottom: '2rem', maxWidth: 400, margin: '0 auto 2rem' }}>
              {paymentError}
            </p>
            <button onClick={() => setPaymentError(null)} className="btn-primary" style={{ background: '#DC2626', borderColor: '#DC2626' }}>
              Dismiss and Try Again
            </button>
          </div>
        </div>
      )}

      {/* Full House Rules Modal */}
      {showRulesModal && (
        <div className="modal-overlay glass-modal" onClick={() => setShowRulesModal(false)} style={{ zIndex: 1100, overflowY: 'auto', padding: '2rem 1rem' }}>
          <div 
            className="dispatch-modal glass animate-slide-up" 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '850px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', position: 'relative' }}
          >
            <button 
              type="button"
              onClick={() => setShowRulesModal(false)}
              style={{ position: 'sticky', top: 0, float: 'right', background: '#1a1714', color: '#fff', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
            <GuestHouseRules unitId={activeBooking?.unit_id || 'skyview'} />
          </div>
        </div>
      )}

    </div>
  );
}
