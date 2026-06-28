import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, MapPin, Edit3, Bed, Award, Star, History, Lock, Unlock } from 'lucide-react';
import './GuestPortal.css';

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

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bookings/my-bookings`, {
          credentials: 'include'
        });
        const data = await res.json();
        if (data.success) {
          setBookings(data.bookings);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to fetch your bookings.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

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

  // Find active and past bookings
  const activeBookings = bookings.filter(b => 
    (b.status === 'APPROVED' || b.status === 'PAID') && 
    new Date(b.check_out) >= new Date()
  );

  const pastBookings = bookings.filter(b => 
    !activeBookings.find(ab => ab.id === b.id)
  );

  // Determine which booking to show in the main stream
  const activeBooking = selectedBookingId 
    ? bookings.find(b => b.id === selectedBookingId) 
    : (activeBookings[0] || bookings[0]);

  // Payment Timer Effect
  useEffect(() => {
    if (!activeBooking || activeBooking.status !== 'APPROVED') return;
    
    const interval = setInterval(() => {
      const createdTime = new Date(activeBooking.created_at);
      const expiryTime = new Date(createdTime.getTime() + 3 * 60 * 60 * 1000);
      const now = new Date();
      const diff = expiryTime - now;

      if (diff <= 0) {
        setTimeRemaining('Expired');
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeBooking]);

  const handlePayment = async () => {
    if (!paymentMethod) return setPaymentError('Please select a payment method.');
    setProcessingPayment(true);
    setPaymentError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bookings/${activeBooking.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ method: paymentMethod, phone: user.phone })
      });
      const data = await res.json();
      if (data.success) {
        setPaymentSuccess(true);
      } else {
        setPaymentError(data.error || 'Payment was declined by the gateway provider. Please ensure you have sufficient funds and try again.');
      }
    } catch (e) {
      setPaymentError('Connection to payment gateway failed. Please check your internet connection and try again.');
    } finally {
      setProcessingPayment(false);
    }
  };



  const getStepIndex = (status) => {
    if (status === 'APPROVED') return 1; // Awaiting Payment
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
                      {new Date(activeBooking.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      <span className="arrival-year">, {new Date(activeBooking.check_in).getFullYear()}</span>
                    </h2>
                    <p className="arrival-unit">
                      <MapPin size={14} /> {activeBooking.unit_id === 'skyview' ? 'Skyview Hideaway' : 'Cocoa Retreat'}
                    </p>
                  </div>
                  
                  <div className="action-card-map">
                    <div className="map-placeholder">
                      {activeBooking.unit_id === 'skyview' ? (
                        <img src="/assets/skyview/skyview_1.jpg" alt="Skyview" className="thumbnail-img" />
                      ) : (
                        <img src="/assets/cocoa/cocoa_1.jpg" alt="Cocoa" className="thumbnail-img" />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="action-card-footer" style={{ flexDirection: activeBooking.status === 'APPROVED' ? 'column' : 'row', alignItems: activeBooking.status === 'APPROVED' ? 'stretch' : 'center', gap: '1.5rem' }}>
                  
                  {activeBooking.status === 'APPROVED' && timeRemaining !== 'Expired' ? (
                    <div className="payment-gateway-block">
                      <div className="payment-timer-alert">
                        <span>Payment Window Closes In:</span>
                        <strong>{timeRemaining || 'Calculating...'}</strong>
                      </div>
                      <div className="payment-options">
                        <label className={`pay-option ${paymentMethod === 'mpesa' ? 'selected' : ''}`}>
                          <input type="radio" name="payment" value="mpesa" checked={paymentMethod === 'mpesa'} onChange={() => setPaymentMethod('mpesa')} />
                          <div className="pay-option-content">
                            <strong>M-Pesa STK Push</strong>
                            <span>Pay instantly via your phone</span>
                          </div>
                        </label>
                        <label className={`pay-option ${paymentMethod === 'paypal' ? 'selected' : ''}`}>
                          <input type="radio" name="payment" value="paypal" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} />
                          <div className="pay-option-content">
                            <strong>PayPal / Card</strong>
                            <span>Checkout via PayPal</span>
                          </div>
                        </label>
                      </div>
                      <button className="btn-pay-now" onClick={handlePayment} disabled={processingPayment}>
                        {processingPayment ? 'Processing...' : `Pay Now via ${paymentMethod.toUpperCase()}`}
                      </button>
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
                              // Immediately update local state to reflect cancellation
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
                  ) : activeBooking.status === 'APPROVED' && timeRemaining === 'Expired' ? (
                     <div className="payment-timer-alert expired">
                        <span>Payment Window Expired</span>
                        <strong>Please create a new booking.</strong>
                      </div>
                  ) : (
                    <> 
                      <div className="booking-ref-block">
                        <span className="ref-label">Reference</span>
                        <span className="ref-value">{activeBooking.id.split('-')[0].toUpperCase()}</span>
                      </div>
                      <button className="btn-modify" onClick={() => {
                        const checkIn = new Date(activeBooking.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        const checkOut = new Date(activeBooking.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        const ref = activeBooking.id.split('-')[0].toUpperCase();
                        const unit = activeBooking.unit_id === 'skyview' ? 'Skyview' : 'Cocoa';
                        const text = encodeURIComponent(`Hello, I would like to request a modification for my booking.\n\n*Current Details:*\nReference: ${ref}\nDates: ${checkIn} to ${checkOut}\nUnit: ${unit}\n\n*My Preferred Changes:*\n[Please type your changes here...]`);
                        window.open(`https://wa.me/254112299384?text=${text}`, '_blank');
                      }}>
                        <Edit3 size={16} /> Modify Booking
                      </button>
                    </>
                  )}
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
                      <h4>{booking.unit_id === 'skyview' ? 'Skyview' : 'Cocoa'}</h4>
                      <span>{new Date(booking.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
                      <h4>{booking.unit_id === 'skyview' ? 'Skyview' : 'Cocoa'}</h4>
                      <span>{new Date(booking.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
          <div className="dispatch-modal glass animate-slide-up" style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="success-badge-container" style={{ margin: '0 auto 1.5rem', width: 80, height: 80, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="success-checkmark-circle" style={{ width: 60, height: 60, borderRadius: '50%', background: '#10B981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={36} />
              </div>
            </div>
            <h2>Payment Successful!</h2>
            <p style={{ marginBottom: '2rem' }}>Your booking for {activeBooking?.unit_id === 'skyview' ? 'Skyview' : 'Cocoa'} has been fully paid and confirmed.</p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              View Updated Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Payment Failed Modal */}
      {paymentError && (
        <div className="modal-overlay glass-modal">
          <div className="dispatch-modal glass animate-slide-up" style={{ textAlign: 'center', padding: '3rem' }}>
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

    </div>
  );
}
