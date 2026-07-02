import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Calendar, Users, Clock, ChevronLeft, ShieldCheck, AlertTriangle } from 'lucide-react';
import './SuccessModal.css';

export default function SuccessModal({ bookingDetails, onClose, onPayLater }) {
  // Fallback: if no specific onPayLater, just close
  const handlePayLater = onPayLater || onClose;
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('1h 0m 0s');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  // Stable key per modal instance — prevents duplicate STK push on retry
  const idempotencyKey = useRef(null);

  // All hooks must be called before any conditional return
  useEffect(() => {
    if (!bookingDetails) return;
    // Pre-fill phone/email once bookingDetails is available
    setMpesaPhone(bookingDetails.phone || '');
    setPaypalEmail(bookingDetails.email || '');
    // Create idempotency key once
    idempotencyKey.current = `${bookingDetails.bookingId}-${Date.now()}`;
  }, [bookingDetails]);

  useEffect(() => {
    if (!bookingDetails) return;
    const expiryTime = new Date(Date.now() + 1 * 60 * 60 * 1000);
    const interval = setInterval(() => {
      const diff = expiryTime - new Date();
      if (diff <= 0) {
        setTimeRemaining('Expired');
        clearInterval(interval);
      } else {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [bookingDetails]);

  if (!bookingDetails) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // ── Normalize phone to 254XXXXXXXXX before sending ─────────────────────────
  const normalizePhone = (raw) => {
    let p = (raw || '').replace(/[^0-9]/g, '');
    if (p.startsWith('0')) p = '254' + p.slice(1);
    if (!p.startsWith('254')) p = '254' + p;
    return p;
  };

  const handlePayment = async () => {
    // Phone validation
    if (paymentMethod === 'mpesa') {
      const norm = normalizePhone(mpesaPhone);
      if (norm.length !== 12) {
        setPaymentError('Please enter a valid Safaricom number e.g. 0712 345 678');
        return;
      }
    }

    // Regenerate key only on first attempt; keep same key on retry (idempotency)
    if (!idempotencyKey.current) {
      idempotencyKey.current = `${bookingDetails.bookingId}-${Date.now()}`;
    }

    setProcessingPayment(true);
    setPaymentError(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || ''}/api/bookings/${bookingDetails.bookingId}/pay`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            phone:           paymentMethod === 'mpesa' ? normalizePhone(mpesaPhone) : undefined,
            email:           paymentMethod === 'paypal' ? paypalEmail : undefined,
            idempotency_key: idempotencyKey.current,
            secure_token:    bookingDetails.secureToken,
            method:          paymentMethod
          })
        }
      );

      // Guard against non-JSON responses (HTML error pages from proxy/server)
      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error('[Payment] Non-JSON response:', res.status, text.slice(0, 200));
        data = { success: false, error: `Server error (${res.status}). Please try again.` };
      }

      if (data.success) {
        setPaymentComplete(true);
        // Rotate key so next distinct attempt gets a fresh idempotency key
        idempotencyKey.current = `${bookingDetails.bookingId}-${Date.now()}`;
      } else {
        setPaymentError(
          data.error || 'Payment was declined. Please ensure you have sufficient M-Pesa balance and try again.'
        );
      }
    } catch (e) {
      console.error('[Payment] Fetch error:', e);
      setPaymentError('Connection failed. Please check your internet and try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  // ── STK Push sent ───────────────────────────────────────────────────────────
  if (paymentComplete) {
    return (
      <div className="sm-overlay animate-fade-in" role="dialog" aria-modal="true">
        <div className="sm-box sm-status animate-slide-up">
          <div className="sm-icon-ring success">
            <Check size={36} strokeWidth={2.5} />
          </div>
          <h2 className="sm-title">STK Push Sent!</h2>
          <p className="sm-subtitle">
            Check your phone and enter your <strong>M-Pesa PIN</strong> to complete payment
            for <strong>{bookingDetails.suiteName}</strong>.
            Your booking confirms automatically once payment is received.
          </p>
          <button onClick={onClose} className="sm-btn-primary" style={{ marginTop: '1.5rem' }}>
            Got It — I'll Check My Phone
          </button>
        </div>
      </div>
    );
  }

  // ── Payment error ───────────────────────────────────────────────────────────
  if (paymentError) {
    return (
      <div className="sm-overlay animate-fade-in" role="dialog" aria-modal="true">
        <div className="sm-box sm-status animate-slide-up">
          <div className="sm-icon-ring error">
            <X size={36} strokeWidth={2.5} />
          </div>
          <h2 className="sm-title sm-title-error">Payment Failed</h2>

          {/* Error message — high contrast, never blank */}
          <div className="sm-error-card">
            <AlertTriangle size={18} className="sm-error-icon" />
            <p className="sm-error-text">{paymentError}</p>
          </div>

          <div className="sm-action-row">
            <button
              onClick={() => {
                setPaymentError(null);
                idempotencyKey.current = `${bookingDetails.bookingId}-${Date.now()}`;
              }}
              className="sm-btn-error"
            >
              Try Again
            </button>
            <button onClick={handlePayLater} className="sm-btn-outline">
              Pay Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main payment screen ─────────────────────────────────────────────────────
  return (
    <div className="sm-overlay animate-fade-in" role="dialog" aria-modal="true">
      <div className="sm-box sm-payment animate-slide-up">

        {/* Nav header */}
        <div className="sm-nav">
          <button className="sm-back-btn" onClick={onClose} aria-label="Close">
            <ChevronLeft size={18} />
            <span>Back</span>
          </button>
          <div className="sm-steps">
            <span className="sm-step done" />
            <span className="sm-step active" />
            <span className="sm-step" />
          </div>
          <button className="sm-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        {/* Timer */}
        <div className="sm-timer">
          <Clock size={15} className="sm-timer-icon" />
          <span className="sm-timer-label">PAYMENT WINDOW CLOSES IN:</span>
          <strong className="sm-timer-value">{timeRemaining}</strong>
        </div>

        {/* Body — two-col on desktop, single col on mobile */}
        <div className="sm-body">

          {/* LEFT: Methods */}
          <div className="sm-methods">
            <div className="sm-methods-header">
              <h2 className="sm-title">Complete Booking</h2>
              <p className="sm-subtitle">
                <strong>{bookingDetails.suiteName}</strong> is held — pay now to confirm.
              </p>
            </div>

            <p className="sm-section-label">Select Payment Method</p>

            <div className="sm-options">
              {/* M-Pesa */}
              <label className={`sm-option mpesa ${paymentMethod === 'mpesa' ? 'active' : ''}`}>
                <input type="radio" name="gateway" value="mpesa"
                  checked={paymentMethod === 'mpesa'}
                  onChange={() => setPaymentMethod('mpesa')} />
                <div className="sm-option-icon">
                  <img src="/mpesa-logo.jpg" alt="M-Pesa" />
                </div>
                <div className="sm-option-info">
                  <strong>M-Pesa STK Push</strong>
                  <span>Pay instantly via your phone</span>
                </div>
              </label>

              {paymentMethod === 'mpesa' && (
                <div className="sm-input-block animate-fade-in">
                  <label className="sm-label">M-Pesa Phone Number</label>
                  <input
                    type="tel"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    placeholder="e.g. 0712 345 678"
                    className="sm-input"
                    inputMode="numeric"
                  />
                  <p className="sm-hint">Enter your Safaricom number — you'll receive a PIN prompt.</p>
                </div>
              )}

              {/* PayPal */}
              <label className={`sm-option paypal ${paymentMethod === 'paypal' ? 'active' : ''}`}>
                <input type="radio" name="gateway" value="paypal"
                  checked={paymentMethod === 'paypal'}
                  onChange={() => setPaymentMethod('paypal')} />
                <div className="sm-option-icon paypal-icon">
                  <img src="/paypal.svg" alt="PayPal" />
                </div>
                <div className="sm-option-info">
                  <strong>PayPal / Card</strong>
                  <span>Checkout via PayPal</span>
                </div>
              </label>

              {paymentMethod === 'paypal' && (
                <div className="sm-input-block animate-fade-in">
                  <label className="sm-label">PayPal Email Address</label>
                  <input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="yourname@example.com"
                    className="sm-input"
                  />
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="sm-cta">
              <button
                onClick={handlePayment}
                disabled={processingPayment || timeRemaining === 'Expired'}
                className="sm-pay-btn"
                style={{
                  background:   paymentMethod === 'paypal' ? '#002994' : '#1a9e35',
                  borderColor:  paymentMethod === 'paypal' ? '#002994' : '#1a9e35'
                }}
              >
                {processingPayment
                  ? '⏳ Sending STK Push...'
                  : paymentMethod === 'paypal'
                    ? 'PAY NOW VIA PAYPAL'
                    : `PAY KES ${(bookingDetails.totalCost || 0).toLocaleString('en-KE')} NOW`}
              </button>

              <div className="sm-secure-row">
                <ShieldCheck size={13} />
                <span>Secured &amp; encrypted payments</span>
              </div>

              <button className="sm-cancel-link" onClick={handlePayLater}>
                Pay Later — I'll do it from My Portal
              </button>
            </div>
          </div>

          {/* RIGHT: Summary */}
          <div className="sm-summary">
            <p className="sm-section-label">Stay Overview</p>

            <div className="sm-specs">
              <div className="sm-spec-row">
                <Calendar size={14} className="sm-spec-icon" />
                <div>
                  <span className="sm-spec-label">Dates</span>
                  <span className="sm-spec-val">
                    {formatDate(bookingDetails.checkIn)} – {formatDate(bookingDetails.checkOut)}
                  </span>
                </div>
              </div>
              <div className="sm-spec-row">
                <Users size={14} className="sm-spec-icon" />
                <div>
                  <span className="sm-spec-label">Guests</span>
                  <span className="sm-spec-val">
                    {bookingDetails.adults} Adult{bookingDetails.adults !== 1 ? 's' : ''},&nbsp;
                    {bookingDetails.children} Child{bookingDetails.children !== 1 ? 'ren' : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="sm-total">
              <span className="sm-total-label">Total Amount Due</span>
              <span className="sm-total-amount">
                KES {(bookingDetails.totalCost || 0).toLocaleString('en-KE')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
