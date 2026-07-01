import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Calendar, Users, Clock, ChevronLeft, ShieldCheck } from 'lucide-react';
import './SuccessModal.css';

export default function SuccessModal({ bookingDetails, onClose }) {
  if (!bookingDetails) return null;

  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  // 1-hour hold to match server PAYMENT_TTL_MS
  const [timeRemaining, setTimeRemaining] = useState('1h 0m 0s');
  const [mpesaPhone, setMpesaPhone] = useState(bookingDetails.phone || '');
  const [paypalEmail, setPaypalEmail] = useState(bookingDetails.email || '');
  const idempotencyKey = useRef(`${bookingDetails.bookingId}-${Date.now()}`);

  useEffect(() => {
    // 1-hour hold to match server PAYMENT_TTL_MS
    const expiryTime = new Date(Date.now() + 1 * 60 * 60 * 1000);
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
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          phone: paymentMethod === 'mpesa' ? mpesaPhone : undefined,
          email: paymentMethod === 'paypal' ? paypalEmail : undefined,
          idempotency_key: idempotencyKey.current,
          secure_token: bookingDetails.secureToken,
          method: paymentMethod
        })
      });
      const data = await res.json();
      if (data.success) {
        setPaymentComplete(true);
      } else {
        setPaymentError(data.error || 'Payment was declined. Please ensure you have sufficient M-Pesa balance and try again.');
      }
    } catch (e) {
      setPaymentError('Connection failed. Please check your internet connection and try again.');
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
          <div className="status-icon-wrap success">
            <div className="status-icon-circle success">
              <Check size={40} strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="modal-title">STK Push Sent!</h2>
          <p className="modal-subtitle">
            Check your phone and enter your M-Pesa PIN to complete payment for <strong>{bookingDetails.suiteName}</strong>.
            Your booking will be confirmed automatically once payment is received.
          </p>
          <button onClick={onClose} className="btn-primary sm-full" style={{ marginTop: '2rem' }}>
            Got It — I'll Check My Phone
          </button>
        </div>
      </div>
    );
  }

  if (paymentError) {
    return (
      <div className="success-modal-overlay animate-fade-in">
        <div className="success-modal-box status-modal-box animate-slide-up">
          <div className="status-icon-wrap error">
            <div className="status-icon-circle error">
              <X size={40} strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="modal-title error-title">Payment Failed</h2>
          <div className="error-message-box">
            <p className="error-message-text">
              {paymentError}
            </p>
          </div>
          <div className="status-action-row">
            <button onClick={() => setPaymentError(null)} className="btn-primary btn-error">
              Try Again
            </button>
            <button onClick={onClose} className="btn-outline">
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

        {/* ── Mobile-first navigation header ── */}
        <div className="payment-nav-header">
          <button className="modal-back-btn" onClick={onClose} aria-label="Go back">
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>
          <div className="payment-step-indicator">
            <span className="step-dot done" />
            <span className="step-dot active" />
            <span className="step-dot" />
          </div>
          <button className="modal-close-btn-inline" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* ── Timer banner ── */}
        <div className="payment-timer-banner">
          <Clock size={16} className="timer-icon" />
          <div className="timer-text">
            <span>PAYMENT WINDOW CLOSES IN:</span>
            <strong>{timeRemaining}</strong>
          </div>
        </div>

        {/* ── Two-column grid (stacks on mobile: methods first, summary below) ── */}
        <div className="payment-grid">

          {/* Methods column — comes first on mobile */}
          <div className="payment-methods-col">
            <div className="payment-methods-header">
              <h2 className="modal-title">Complete Booking</h2>
              <p className="modal-subtitle">
                <strong>{bookingDetails.suiteName}</strong> is held — pay now to confirm.
              </p>
            </div>

            <h3 className="box-title" style={{ marginTop: '1.25rem' }}>Select Payment Method</h3>
            <div className="payment-options-list">
              <label className={`payment-method-card mpesa ${paymentMethod === 'mpesa' ? 'selected' : ''}`}>
                <input type="radio" name="gateway" value="mpesa" checked={paymentMethod === 'mpesa'} onChange={() => setPaymentMethod('mpesa')} />
                <div className="method-icon mpesa">
                  <img src="/mpesa-logo.jpg" alt="M-Pesa" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }} />
                </div>
                <div className="method-details">
                  <strong>M-Pesa STK Push</strong>
                  <span>Pay instantly via your phone</span>
                </div>
              </label>

              {paymentMethod === 'mpesa' && (
                <div className="payment-input-block animate-fade-in">
                  <label className="input-field-label">M-Pesa Phone Number</label>
                  <input
                    type="tel"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    placeholder="e.g. 254712345678"
                    className="payment-phone-input"
                    inputMode="numeric"
                  />
                  <p className="input-hint">Enter your Safaricom number — you'll receive a PIN prompt.</p>
                </div>
              )}

              <label className={`payment-method-card paypal ${paymentMethod === 'paypal' ? 'selected' : ''}`}>
                <input type="radio" name="gateway" value="paypal" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} />
                <div className="method-icon paypal">
                  <img src="/paypal.svg" alt="PayPal" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div className="method-details">
                  <strong>PayPal / Card</strong>
                  <span>Checkout via PayPal</span>
                </div>
              </label>

              {paymentMethod === 'paypal' && (
                <div className="payment-input-block animate-fade-in">
                  <label className="input-field-label">PayPal Email Address</label>
                  <input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="yourname@example.com"
                    className="payment-phone-input"
                  />
                </div>
              )}
            </div>

            {/* ── Sticky CTA area ── */}
            <div className="payment-cta-area">
              <button
                onClick={handlePayment}
                className="btn-pay-action"
                disabled={processingPayment || timeRemaining === 'Expired'}
                style={{
                  background: paymentMethod === 'paypal' ? '#002994' : '#3aa335',
                  borderColor: paymentMethod === 'paypal' ? '#002994' : '#3aa335'
                }}
              >
                {processingPayment
                  ? 'Sending STK Push...'
                  : paymentMethod === 'paypal'
                    ? 'PAY NOW VIA PAYPAL'
                    : `PAY KES ${bookingDetails.totalCost.toLocaleString('en-KE')} NOW`}
              </button>

              <div className="secure-row">
                <ShieldCheck size={14} />
                <span>Payments are secured &amp; encrypted</span>
              </div>

              <button
                onClick={async () => {
                  if (!window.confirm('Are you sure you want to cancel this booking?')) return;
                  try {
                    await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bookings/${bookingDetails.bookingId}/cancel`, {
                      method: 'PUT',
                      credentials: 'include'
                    });
                  } catch (e) {}
                  onClose();
                }}
                className="btn-cancel-link"
              >
                Cancel Booking
              </button>
            </div>
          </div>

          {/* Summary column — second on mobile */}
          <div className="payment-summary-col">
            <h3 className="box-title">Stay Overview</h3>
            <div className="modal-spec-grid mini">
              <div className="spec-item">
                <Calendar size={15} className="spec-icon" />
                <div>
                  <span className="spec-label">Dates</span>
                  <span className="spec-val">{formatDate(bookingDetails.checkIn)} – {formatDate(bookingDetails.checkOut)}</span>
                </div>
              </div>
              <div className="spec-item">
                <Users size={15} className="spec-icon" />
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

        </div>
      </div>
    </div>
  );
}
