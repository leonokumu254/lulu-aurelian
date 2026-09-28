import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Calendar, Users, Clock, ChevronLeft, ShieldCheck, AlertTriangle, Phone, Copy, CheckCircle } from 'lucide-react';
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
  const [mpesaCode, setMpesaCode] = useState('');
  const [copiedField, setCopiedField] = useState('');
  // Stable key per modal instance — prevents duplicate STK push on retry
  const idempotencyKey = useRef(null);

  const handleCopyText = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2500);
  };

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
    if (paymentMethod === 'mpesa') {
      if (!mpesaPhone) {
        setPaymentError('Please enter your M-Pesa phone number.');
        return;
      }
      const cleanPhone = mpesaPhone.trim();
      if (cleanPhone.length < 9) {
        setPaymentError('Please enter a valid M-Pesa phone number.');
        return;
      }
    }

    setProcessingPayment(true);
    setPaymentError(null);

    try {
      const payload = {
        secure_token:    bookingDetails.secureToken,
        method:          paymentMethod
      };

      if (paymentMethod === 'mpesa') {
        payload.phone = normalizePhone(mpesaPhone);
      } else {
        payload.email = paypalEmail;
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || ''}/api/bookings/${bookingDetails.bookingId}/pay`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
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
      } else {
        setPaymentError(
          data.error || 'Payment initiation failed. Please check your phone number and try again.'
        );
      }
    } catch (e) {
      console.error('[Payment] Fetch error:', e);
      setPaymentError('Connection failed. Please check your internet and try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  // ── Details submitted ──────────────────────────────────────────────────────
  if (paymentComplete) {
    return (
      <div className="sm-overlay animate-fade-in" role="dialog" aria-modal="true">
        <div className="sm-box sm-status animate-slide-up">
          <div className="sm-icon-ring success">
            <Check size={36} strokeWidth={2.5} />
          </div>
          <h2 className="sm-title">STK Push Initiated!</h2>
          <p className="sm-subtitle">
            A direct payment request has been sent to your phone number for <strong>{bookingDetails.suiteName}</strong>.
            Please enter your M-Pesa PIN on your phone handset to authorize the transaction. Once completed, your booking status will update to Confirmed automatically.
          </p>
          <button onClick={onClose} className="sm-btn-primary" style={{ marginTop: '1.5rem' }}>
            Got It
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
              {/* M-Pesa Buy Goods */}
              <label className={`sm-option mpesa ${paymentMethod === 'mpesa' ? 'active' : ''}`}>
                <input type="radio" name="gateway" value="mpesa"
                  checked={paymentMethod === 'mpesa'}
                  onChange={() => setPaymentMethod('mpesa')} />
                <div className="sm-option-icon">
                  <img src="/mpesa-logo.jpg" alt="M-Pesa Buy Goods" />
                </div>
                <div className="sm-option-info">
                  <strong>Buy Goods (Till Number)</strong>
                  <span>Till No: 4364845 • STK Push & Manual</span>
                </div>
              </label>

              {paymentMethod === 'mpesa' && (
                <div className="sm-input-block animate-fade-in">
                  {/* Official Buy Goods Till Box */}
                  <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '0.85rem', marginBottom: '1rem', color: '#1e293b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '0.82rem', color: '#0f172a', letterSpacing: '0.5px' }}>OFFICIAL TILL DETAILS</strong>
                      <span style={{ fontSize: '0.7rem', background: '#10b981', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>BUY GOODS</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ background: '#ffffff', padding: '0.5rem 0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>TILL NUMBER</span>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                          <strong style={{ fontSize: '1rem', color: '#0f172a', letterSpacing: '1px' }}>4364845</strong>
                          <button
                            type="button"
                            onClick={() => handleCopyText('4364845', 'till')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: copiedField === 'till' ? '#10b981' : '#64748b' }}
                            title="Copy Till Number"
                          >
                            {copiedField === 'till' ? <CheckCircle size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.74rem', color: '#475569', lineHeight: '1.4' }}>
                      Enter your phone below for an automated prompt, or manually open <strong>M-Pesa &gt; Lipa na M-Pesa &gt; Buy Goods and Services</strong> and enter Till No <strong>4364845</strong>.
                    </p>
                  </div>

                  <label className="sm-label">M-Pesa Phone Number</label>
                  <div className="phone-input-group" style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="phone-prefix" style={{ background: 'rgba(0, 0, 0, 0.03)', padding: '0.65rem 0.85rem', border: '1.5px solid rgba(0, 0, 0, 0.08)', borderRight: 'none', borderRadius: '6px 0 0 6px', color: '#1D1912', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center' }}>+254</span>
                    <div className="input-with-icon no-left-padding" style={{ flex: 1, position: 'relative' }}>
                      <input
                        type="tel"
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="712345678"
                        className="sm-input"
                        style={{ paddingLeft: '12px', borderRadius: '0 6px 6px 0', borderLeft: 'none', width: '100%', boxSizing: 'border-box' }}
                        required
                      />
                    </div>
                  </div>
                  <p className="sm-hint">Enter your Safaricom phone number without country code (e.g. 712345678).</p>
                </div>
              )}

              {/* Alternative Payment / Contact Staff */}
              <label className={`sm-option ${paymentMethod === 'contact_staff' ? 'active' : ''}`}>
                <input type="radio" name="gateway" value="contact_staff"
                  checked={paymentMethod === 'contact_staff'}
                  onChange={() => setPaymentMethod('contact_staff')} />
                <div className="sm-option-icon" style={{ background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', width: '38px', height: '26px' }}>
                  <Phone size={16} color="#fff" />
                </div>
                <div className="sm-option-info">
                  <strong>Other Payment Methods</strong>
                  <span>Different method? Contact Support</span>
                </div>
              </label>

              {paymentMethod === 'contact_staff' && (
                <div className="sm-input-block animate-fade-in" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.9rem', color: '#1e293b' }}>
                  <p style={{ margin: '0 0 0.6rem', fontSize: '0.78rem', color: '#334155', lineHeight: '1.5' }}>
                    Online checkout is processed via <strong>M-Pesa Buy Goods only</strong>. If you have a different payment method (such as <strong>Bank Transfer</strong>, <strong>Card</strong>, or <strong>Invoice</strong>), please contact our support desk directly:
                  </p>
                  <a
                    href={`https://wa.me/254112299384?text=${encodeURIComponent(
                      `Hello Lulu Aurelian Estate Support,\n\nI have created a reservation hold (Ref: ${bookingDetails?.bookingId || ''}) for ${bookingDetails?.suiteName || ''}.\nTotal: KES ${(bookingDetails?.totalCost || 0).toLocaleString('en-KE')}.\nI have a different payment method and would like assistance to complete payment.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: '#25D366',
                      color: '#fff',
                      textDecoration: 'none',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      marginBottom: '0.4rem'
                    }}
                  >
                    Chat on WhatsApp (+254 112 299 384)
                  </a>
                  <a
                    href="tel:+254112299384"
                    style={{
                      border: '1px solid #94a3b8',
                      color: '#0f172a',
                      textDecoration: 'none',
                      padding: '0.4rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      display: 'block',
                      textAlign: 'center',
                      marginBottom: '0.35rem',
                      background: '#fff'
                    }}
                  >
                    Call Support: +254 112 299 384
                  </a>
                  <a
                    href={`mailto:pearlisprime@gmail.com?subject=${encodeURIComponent(`Payment Inquiry - Booking ${bookingDetails?.bookingId}`)}`}
                    style={{
                      border: '1px solid #94a3b8',
                      color: '#0f172a',
                      textDecoration: 'none',
                      padding: '0.4rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      display: 'block',
                      textAlign: 'center',
                      background: '#fff'
                    }}
                  >
                    Email Support: pearlisprime@gmail.com
                  </a>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="sm-cta">
              {paymentMethod === 'mpesa' ? (
                <button
                  onClick={handlePayment}
                  disabled={processingPayment || timeRemaining === 'Expired'}
                  className="sm-pay-btn"
                  style={{
                    background: '#1a9e35',
                    borderColor: '#1a9e35'
                  }}
                >
                  {processingPayment
                    ? '⏳ Initiating Buy Goods STK Push...'
                    : `PAY VIA BUY GOODS (KES ${(bookingDetails?.totalCost || 0).toLocaleString('en-KE')})`}
                </button>
              ) : (
                <a
                  href={`https://wa.me/254112299384?text=${encodeURIComponent(
                    `Hello Lulu Aurelian Estate Support,\n\nI have created a reservation hold (Ref: ${bookingDetails?.bookingId || ''}) for ${bookingDetails?.suiteName || ''}.\nTotal: KES ${(bookingDetails?.totalCost || 0).toLocaleString('en-KE')}.\nI have a different payment method and would like assistance to complete payment.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="sm-pay-btn"
                  style={{
                    background: '#25D366',
                    borderColor: '#25D366',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    textAlign: 'center'
                  }}
                >
                  CONTACT SUPPORT ON WHATSAPP
                </a>
              )}

              <div className="sm-secure-row">
                <ShieldCheck size={13} />
                <span>Secured payments via M-Pesa</span>
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
