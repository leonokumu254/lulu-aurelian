import React, { useState, useEffect } from 'react';
import { Check, X, Calendar, Users, Coins, Clock, Smartphone, CreditCard } from 'lucide-react';
import './SuccessModal.css';

export default function SuccessModal({ bookingDetails, onClose }) {
  if (!bookingDetails) return null;

  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('3h 0m 0s');
  const [mpesaPhone, setMpesaPhone] = useState(bookingDetails.phone || '');
  const [paypalEmail, setPaypalEmail] = useState(bookingDetails.email || '');

  useEffect(() => {
    // 3 hours from now since booking was just created
    const expiryTime = new Date(Date.now() + 3 * 60 * 60 * 1000);
    const interval = setInterval(() => {
      const diff = expiryTime - new Date();
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
  }, []);

  const handlePayment = async () => {
    setProcessingPayment(true);
    setPaymentError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bookings/${bookingDetails.bookingId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ 
          method: paymentMethod, 
          phone: paymentMethod === 'mpesa' ? mpesaPhone : undefined,
          email: paymentMethod === 'paypal' ? paypalEmail : undefined 
        })
      });
      const data = await res.json();
      if (data.success) {
        setPaymentComplete(true);
      } else {
        setPaymentError(data.error || 'Payment was declined by the gateway provider. Please ensure you have sufficient funds and try again.');
      }
    } catch (e) {
      setPaymentError('Connection to payment gateway failed. Please check your internet connection and try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const opt = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', opt);
  };

  if (paymentComplete) {
    return (
      <div className="success-modal-overlay animate-fade-in">
        <div className="success-modal-box status-modal-box animate-slide-up">
          <div className="success-badge-container" style={{ margin: '0 auto 1.5rem', display: 'flex', justifyContent: 'center' }}>
            <div className="success-checkmark-circle" style={{ width: 80, height: 80 }}>
              <Check size={48} strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="modal-title" style={{ fontSize: '2rem' }}>Payment Successful!</h2>
          <p className="modal-subtitle" style={{ fontSize: '1.1rem', maxWidth: 400, margin: '0 auto' }}>
            Your booking for <strong>{bookingDetails.suiteName}</strong> is now fully confirmed. We look forward to hosting you!
          </p>
          <button onClick={onClose} className="btn-primary" style={{ marginTop: '2.5rem', padding: '1rem 3rem' }}>
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }
  if (paymentError) {
    return (
      <div className="success-modal-overlay animate-fade-in">
        <div className="success-modal-box status-modal-box animate-slide-up">
          <div className="success-badge-container failed" style={{ margin: '0 auto 1.5rem', display: 'flex', justifyContent: 'center' }}>
            <div className="success-checkmark-circle failed" style={{ width: 80, height: 80 }}>
              <X size={48} strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="modal-title" style={{ fontSize: '1.75rem', color: '#DC2626' }}>Payment Failed</h2>
          <div style={{ background: '#FEF2F2', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
            <p className="modal-subtitle" style={{ fontSize: '1rem', maxWidth: 450, margin: '0 auto', color: '#991B1B', fontWeight: 500 }}>
              {paymentError || 'An unexpected error occurred during processing.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2.5rem' }}>
            <button onClick={() => setPaymentError(null)} className="btn-primary" style={{ padding: '1rem 2rem', background: '#DC2626', borderColor: '#DC2626' }}>
              Try Again
            </button>
            <button onClick={onClose} className="btn-secondary" style={{ padding: '1rem 2rem' }}>
              Pay Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="success-modal-overlay animate-fade-in">
      <div className="success-modal-box payment-gateway-box animate-slide-up">
        <button className="modal-close-btn" onClick={onClose} aria-label="Close Modal">
          <X size={20} />
        </button>

        <div className="payment-header">
          <h2 className="modal-title">Complete Your Booking</h2>
          <p className="modal-subtitle">
            Your reservation for <strong>{bookingDetails.suiteName}</strong> is held. Please complete payment to instantly confirm your stay.
          </p>
        </div>

        <div className="payment-timer-banner">
          <Clock size={20} className="timer-icon" />
          <div className="timer-text">
            <span>Payment Window Closes In:</span>
            <strong>{timeRemaining}</strong>
          </div>
        </div>

        <div className="payment-grid">
          <div className="payment-summary-col">
            <h3 className="box-title">Stay Overview</h3>
            <div className="modal-spec-grid mini">
              <div className="spec-item">
                <Calendar size={16} className="spec-icon" />
                <div>
                  <span className="spec-label">Dates</span>
                  <span className="spec-val">{formatDate(bookingDetails.checkIn)} – {formatDate(bookingDetails.checkOut)}</span>
                </div>
              </div>
              <div className="spec-item">
                <Users size={16} className="spec-icon" />
                <div>
                  <span className="spec-label">Guests</span>
                  <span className="spec-val">{bookingDetails.adults} Adults, {bookingDetails.children} Children</span>
                </div>
              </div>
            </div>
            
            <div className="payment-total-block">
              <span className="total-label">Total Amount Due</span>
              <span className="total-amount">KES {bookingDetails.totalCost.toLocaleString('en-KE')}</span>
            </div>
          </div>

          <div className="payment-methods-col">
            <h3 className="box-title">Select Payment Method</h3>
            <div className="payment-options-list">
              <label className={`payment-method-card mpesa ${paymentMethod === 'mpesa' ? 'selected' : ''}`}>
                <input type="radio" name="gateway" value="mpesa" checked={paymentMethod === 'mpesa'} onChange={() => setPaymentMethod('mpesa')} />
                <div className="method-icon mpesa" style={{ background: 'transparent' }}>
                  <img src="/mpesa-logo.jpg" alt="M-Pesa" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
                </div>
                <div className="method-details">
                  <strong>M-Pesa STK Push</strong>
                  <span>Pay instantly via your phone</span>
                </div>
              </label>
              
              {paymentMethod === 'mpesa' && (
                <div className="payment-input-container animate-fade-in" style={{ marginBottom: '1rem', marginTop: '-0.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>M-Pesa Phone Number</label>
                  <input 
                    type="tel" 
                    value={mpesaPhone} 
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    placeholder="e.g. 254700000000"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '1rem', boxSizing: 'border-box' }}
                  />
                </div>
              )}

              <label className={`payment-method-card paypal ${paymentMethod === 'paypal' ? 'selected' : ''}`}>
                <input type="radio" name="gateway" value="paypal" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} />
                <div className="method-icon paypal" style={{ background: 'transparent' }}>
                  <img src="/paypal.svg" alt="PayPal" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div className="method-details">
                  <strong>PayPal / Card</strong>
                  <span>Checkout via PayPal</span>
                </div>
              </label>

              {paymentMethod === 'paypal' && (
                <div className="payment-input-container animate-fade-in" style={{ marginBottom: '1rem', marginTop: '-0.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>PayPal Email Address</label>
                  <input 
                    type="email" 
                    value={paypalEmail} 
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="yourname@example.com"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '1rem', boxSizing: 'border-box' }}
                  />
                </div>
              )}
            </div>

            <button 
              onClick={handlePayment} 
              className="btn-primary btn-pay-action"
              disabled={processingPayment || timeRemaining === 'Expired'}
              style={{
                backgroundColor: paymentMethod === 'paypal' ? '#002994' : '#3aa335',
                borderColor: paymentMethod === 'paypal' ? '#002994' : '#3aa335'
              }}
            >
              {processingPayment ? 'Processing Transaction...' : (paymentMethod === 'paypal' ? 'PAY NOW VIA PAYPAL' : `PAY KES ${bookingDetails.totalCost.toLocaleString('en-KE')} NOW`)}
            </button>
            <button 
              onClick={async () => {
                const confirmCancel = window.confirm('Are you sure you want to cancel this booking?');
                if (!confirmCancel) return;
                
                try {
                  const token = localStorage.getItem('guestToken');
                  await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bookings/${bookingDetails.bookingId}/cancel`, {
                    method: 'PUT',
                    headers: { Authorization: `Bearer ${token}` }
                  });
                } catch (e) {}
                
                onClose();
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
                textDecoration: 'underline'
              }}
            >
              Cancel Booking
            </button>
            <p className="secure-note" style={{ marginTop: '0.5rem' }}>Payments are secured and encrypted.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
