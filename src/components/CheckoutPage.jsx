import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Users, ShieldCheck, Clock, Check, AlertTriangle, ChevronLeft, CreditCard, Lock, User, Mail, Phone } from 'lucide-react';
import './CheckoutPage.css';

const SUITES_METADATA = {
  skyview: {
    name: 'Skyview Hideaway',
    tagline: 'Elevated luxury with Mt. Kenya panoramas',
    price: 5500,
    image: '/assets/skyview/skyview_1.jpg'
  },
  cocoa: {
    name: 'Cocoa Retreat',
    tagline: 'Warm earthy luxury in the heart of Nyeri',
    price: 5000,
    image: '/assets/cocoa/cocoa_1.jpg'
  },
  neema: {
    name: 'Neema',
    tagline: 'A peaceful and luxurious retreat',
    price: 5000,
    image: '/assets/Neema/neema_1.jpeg'
  }
};

export default function CheckoutPage({ user, setUser, onLogout }) {
  // ── URL Query Parser ──────────────────────────────────────────────────────
  const [params, setParams] = useState({
    suite: 'skyview',
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0
  });

  useEffect(() => {
    const hash = window.location.hash;
    const queryIdx = hash.indexOf('?');
    if (queryIdx !== -1) {
      const queryStr = hash.substring(queryIdx + 1);
      const searchParams = new URLSearchParams(queryStr);
      setParams({
        suite: searchParams.get('suite') || 'skyview',
        checkIn: searchParams.get('checkIn') || '',
        checkOut: searchParams.get('checkOut') || '',
        adults: parseInt(searchParams.get('adults'), 10) || 1,
        children: parseInt(searchParams.get('children'), 10) || 0
      });
    }
  }, []);

  const suiteId = params.suite;
  const suite = SUITES_METADATA[suiteId] || SUITES_METADATA.skyview;

  // ── Date Formatting ──────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calculate nights
  let nights = 0;
  if (params.checkIn && params.checkOut) {
    const start = new Date(params.checkIn);
    const end = new Date(params.checkOut);
    if (end > start) {
      nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }
  }

  // Cost calculations
  const baseCost = suite.price * nights;
  let discountPercent = 0;
  if (nights >= 30) discountPercent = 20;
  else if (nights >= 7) discountPercent = 10;
  else if (nights >= 3) discountPercent = 5;
  const lengthDiscountValue = baseCost * (discountPercent / 100);

  const maxAdults = 5;
  const isPeakSurcharge = params.adults === maxAdults;
  const peakSurchargeAmount = isPeakSurcharge ? 1500 : 0;
  const totalCost = Math.max(0, baseCost - lengthDiscountValue) + peakSurchargeAmount;

  // ── Step Navigation & Form State ──────────────────────────────────────────
  const [step, setStep] = useState(1); // 1 = Details, 2 = Payment
  const [activeTab, setActiveTab] = useState('guest'); // 'guest' or 'login'

  // Guest details form state
  const [guestDetails, setGuestDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
    createAccount: false,
    password: ''
  });

  // Login form state
  const [loginDetails, setLoginDetails] = useState({
    email: '',
    password: ''
  });

  const [formError, setFormError] = useState(null);
  const [isSubmittingDetails, setIsSubmittingDetails] = useState(false);

  // Sync logged in user profile details immediately
  useEffect(() => {
    if (user) {
      const nameParts = user.name ? user.name.split(' ') : [];
      let rawPhone = user.phone || '';
      if (rawPhone.startsWith('+254')) rawPhone = rawPhone.substring(4);
      setGuestDetails(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: rawPhone
      }));
    }
  }, [user]);

  // Redirect unauthenticated users to secure portal login/signup page
  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/session`, { credentials: 'include' });
        const data = await res.json();
        if (res.ok && data.success) {
          setUser({
            ...data.user,
            role: data.user.role.toLowerCase(),
            avatar: data.user.role === 'MANAGER' ? '/avatar.svg' : '/user-icon.svg'
          });
        } else {
          // Extract search query parameters from current hash url
          const hash = window.location.hash;
          const queryIdx = hash.indexOf('?');
          let queryStr = '';
          if (queryIdx !== -1) {
            queryStr = hash.substring(queryIdx + 1);
          }
          window.location.href = `/?redirect=checkout&${queryStr}#/portal`;
        }
      } catch (err) {
        console.error('Session fetch failed in CheckoutPage:', err);
        window.location.href = `/?redirect=checkout#/portal`;
      }
    };

    if (!user) {
      checkSessionAndRedirect();
    }
  }, [user, setUser]);

  // ── Booking creation & hold state ────────────────────────────────────────
  const [createdBooking, setCreatedBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('1h 0m 0s');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [mpesaCode, setMpesaCode] = useState('');
  
  const idempotencyKey = useRef(null);

  // Timer loop for booking hold window
  useEffect(() => {
    if (!createdBooking) return;
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
  }, [createdBooking]);

  // Normalize Safaricom phone numbers
  const normalizePhone = (raw) => {
    let p = (raw || '').replace(/[^0-9]/g, '');
    if (p.startsWith('0')) p = '254' + p.slice(1);
    if (!p.startsWith('254')) p = '254' + p;
    return p;
  };

  // ── Step 1: Handlers ─────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGuestDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Login handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmittingDetails(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginDetails.email.trim().toLowerCase(),
          password: loginDetails.password
        }),
        credentials: 'include'
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser({
          ...data.user,
          role: data.user.role.toLowerCase(),
          avatar: data.user.avatar || '/avatar.svg'
        });
      } else {
        setFormError(data.error || 'Invalid credentials.');
      }
    } catch (err) {
      console.error(err);
      setFormError('Connection error. Please try again.');
    } finally {
      setIsSubmittingDetails(false);
    }
  };

  // Create account option during guest checkout
  const registerGuestAccount = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${guestDetails.firstName.trim()} ${guestDetails.lastName.trim()}`,
          email: guestDetails.email.trim().toLowerCase(),
          password: guestDetails.password,
          phone: `+254${guestDetails.phone.trim()}`
        }),
        credentials: 'include'
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser({
          ...data.user,
          role: data.user.role.toLowerCase(),
          avatar: data.user.avatar || '/avatar.svg'
        });
      }
    } catch (err) {
      console.error('Optional registration failed:', err);
    }
  };

  // Submit/Confirm details to proceed to payment step
  const handleConfirmDetails = async (e) => {
    if (e) e.preventDefault();
    setFormError(null);

    // Validate details
    if (!guestDetails.firstName || !guestDetails.lastName || !guestDetails.email || !guestDetails.phone) {
      setFormError('Please fill in all guest contact details.');
      return;
    }

    const digitsOnly = guestDetails.phone.replace(/\D/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      setFormError('Please enter a valid phone number.');
      return;
    }

    setIsSubmittingDetails(true);

    try {
      // If user opted to create a secure account
      if (!user && guestDetails.createAccount && guestDetails.password) {
        await registerGuestAccount();
      }

      // Create Booking Hold Request
      const payload = {
        guest_name: `${guestDetails.firstName.trim()} ${guestDetails.lastName.trim()}`,
        guest_email: guestDetails.email.trim().toLowerCase(),
        guest_phone: `+254${guestDetails.phone.trim()}`,
        unit_id: suiteId,
        check_in: params.checkIn,
        check_out: params.checkOut,
        adults: params.adults,
        children: params.children,
        cleaning_dates: []
      };

      if (user && user.id) {
        payload.user_id = user.id;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bookings/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCreatedBooking({
          bookingId: data.booking.id,
          secureToken: data.booking.secure_token,
          suiteName: suite.name,
          checkIn: params.checkIn,
          checkOut: params.checkOut,
          adults: params.adults,
          children: params.children,
          totalCost: totalCost,
          phone: `+254${guestDetails.phone.trim()}`,
          email: guestDetails.email.trim().toLowerCase()
        });

        // Initialize payment variables
        setMpesaPhone(guestDetails.phone);
        setPaypalEmail(guestDetails.email);
        idempotencyKey.current = `${data.booking.id}-${Date.now()}`;

        // Proceed to Payment Step
        setStep(2);
      } else {
        setFormError(data.error || 'Failed to request reservation. The dates may have been booked.');
      }
    } catch (err) {
      console.error(err);
      setFormError('Network error. Please try again.');
    } finally {
      setIsSubmittingDetails(false);
    }
  };

  // ── Step 2: Payment Execution ─────────────────────────────────────────────
  const handlePayment = async () => {
    if (!createdBooking) return;

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
        secure_token: createdBooking.secureToken,
        method: paymentMethod
      };

      if (paymentMethod === 'mpesa') {
        payload.phone = normalizePhone(mpesaPhone);
      } else {
        payload.email = paypalEmail;
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || ''}/api/bookings/${createdBooking.bookingId}/pay`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        }
      );

      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { success: false, error: `Gateway Error (${res.status})` };
      }

      if (data.success) {
        setPaymentComplete(true);
      } else {
        setPaymentError(data.error || 'Payment failed. Ensure you have sufficient balance and try again.');
      }
    } catch (e) {
      console.error(e);
      setPaymentError('Connection lost. Please check your internet and try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleGoToPortal = () => {
    window.location.hash = '#/portal';
  };

  if (!user) {
    return (
      <div className="checkout-loading-screen animate-fade-in">
        <div className="luxury-spinner-container">
          <span className="logo-text">LULU AURELIAN</span>
          <p>Redirecting to secure login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page animate-fade-in">
      
      {/* MINIMAL TRANSACTIONAL HEADER */}
      <header className="checkout-minimal-header">
        <div className="header-container">
          <div className="checkout-logo">
            <span className="logo-text">LULU AURELIAN</span>
          </div>
          <div className="checkout-step-indicator">
            <span className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</span>
            <span className="step-line" />
            <span className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="checkout-main-content">
        <div className="checkout-grid-container">

          {/* LEFT: STEP SEQUENCE */}
          <div className="checkout-steps-column">
            
            {/* STEP 1: GUEST DETAILS */}
            <div className={`checkout-card glass ${step === 1 ? 'active' : 'completed'}`}>
              <div className="card-header-row">
                <h2>1. Confirm guest details</h2>
                {step > 1 && (
                  <button className="edit-step-btn" onClick={() => setStep(1)}>
                    Edit
                  </button>
                )}
              </div>

              {step === 1 && (
                <div className="card-body-content animate-slide-down">
                  {user ? (
                    /* Authenticated guest editable summary */
                    <div className="profile-verified-card">
                      <div className="welcome-guest-banner">
                        <span className="welcome-guest-tag">Welcome Back</span>
                        <h3>Hello, {user.name ? user.name.split(' ')[0] : 'Valued Guest'}</h3>
                        <p className="welcome-guest-text">
                          We've prepared your details for a seamless reservation. Please review and confirm your contact information below.
                        </p>
                      </div>

                      <form onSubmit={handleConfirmDetails} className="guest-form">
                        <div className="form-row">
                          <div className="form-group">
                            <label className="checkout-label">First Name</label>
                            <div className="input-with-icon">
                              <User size={16} />
                              <input 
                                type="text" 
                                name="firstName"
                                value={guestDetails.firstName}
                                onChange={handleInputChange}
                                placeholder="First Name"
                                required 
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label className="checkout-label">Last Name</label>
                            <div className="input-with-icon">
                              <User size={16} />
                              <input 
                                type="text" 
                                name="lastName"
                                value={guestDetails.lastName}
                                onChange={handleInputChange}
                                placeholder="Last Name"
                                required 
                              />
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="checkout-label">Email Address</label>
                          <div className="input-with-icon">
                            <Mail size={16} />
                            <input 
                              type="email" 
                              name="email"
                              value={guestDetails.email}
                              onChange={handleInputChange}
                              placeholder="email@example.com"
                              required 
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="checkout-label">Phone Number (M-Pesa Preferred)</label>
                          <div className="phone-input-group">
                            <span className="phone-prefix">+254</span>
                            <div className="input-with-icon no-left-padding">
                              <Phone size={16} style={{ left: '10px' }} />
                              <input 
                                type="tel" 
                                name="phone"
                                value={guestDetails.phone}
                                onChange={handleInputChange}
                                placeholder="712 345 678"
                                style={{ paddingLeft: '32px' }}
                                required 
                              />
                            </div>
                          </div>
                        </div>

                        <div className="special-requests-block">
                          <label className="checkout-label">Special Requests (Optional)</label>
                          <textarea
                            name="specialRequests"
                            value={guestDetails.specialRequests}
                            onChange={handleInputChange}
                            placeholder="Dietary preferences, arrival time, room temperature preferences..."
                            className="checkout-textarea"
                          />
                        </div>

                        {formError && <div className="checkout-form-error">{formError}</div>}

                        <button 
                          type="submit"
                          disabled={isSubmittingDetails}
                          className="btn-primary checkout-action-btn"
                        >
                          {isSubmittingDetails ? 'Creating hold...' : 'Continue to Payment'}
                        </button>
                      </form>
                    </div>
                  ) : (
                    /* Guest tabs: checkout as guest vs login */
                    <div className="guest-tabs-container">
                      <div className="guest-tabs-header">
                        <button 
                          className={`tab-btn ${activeTab === 'guest' ? 'active' : ''}`}
                          onClick={() => { setActiveTab('guest'); setFormError(null); }}
                        >
                          Continue as Guest
                        </button>
                        <button 
                          className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                          onClick={() => { setActiveTab('login'); setFormError(null); }}
                        >
                          Sign In for 1-Click
                        </button>
                      </div>

                      {activeTab === 'guest' ? (
                        <form onSubmit={handleConfirmDetails} className="guest-form">
                          <div className="form-row">
                            <div className="form-group">
                              <label className="checkout-label">First Name</label>
                              <div className="input-with-icon">
                                <User size={16} />
                                <input 
                                  type="text" 
                                  name="firstName"
                                  value={guestDetails.firstName}
                                  onChange={handleInputChange}
                                  placeholder="John"
                                  required 
                                />
                              </div>
                            </div>
                            <div className="form-group">
                              <label className="checkout-label">Last Name</label>
                              <div className="input-with-icon">
                                <User size={16} />
                                <input 
                                  type="text" 
                                  name="lastName"
                                  value={guestDetails.lastName}
                                  onChange={handleInputChange}
                                  placeholder="Doe"
                                  required 
                                />
                              </div>
                            </div>
                          </div>

                          <div className="form-group">
                            <label className="checkout-label">Email Address</label>
                            <div className="input-with-icon">
                              <Mail size={16} />
                              <input 
                                type="email" 
                                name="email"
                                value={guestDetails.email}
                                onChange={handleInputChange}
                                placeholder="john.doe@gmail.com"
                                required 
                              />
                            </div>
                          </div>

                          <div className="form-group">
                            <label className="checkout-label">Phone Number (M-Pesa Preferred)</label>
                            <div className="phone-input-group">
                              <span className="phone-prefix">+254</span>
                              <div className="input-with-icon no-left-padding">
                                <Phone size={16} style={{ left: '10px' }} />
                                <input 
                                  type="tel" 
                                  name="phone"
                                  value={guestDetails.phone}
                                  onChange={handleInputChange}
                                  placeholder="712 345 678"
                                  style={{ paddingLeft: '32px' }}
                                  required 
                                  />
                              </div>
                            </div>
                          </div>

                          <div className="form-group account-creation-toggle">
                            <label className="checkbox-container">
                              <input 
                                type="checkbox"
                                name="createAccount"
                                checked={guestDetails.createAccount}
                                onChange={handleInputChange}
                              />
                              <span className="checkbox-checkmark" />
                              <span className="checkbox-label">Create a secure profile for future bookings</span>
                            </label>
                          </div>

                          {guestDetails.createAccount && (
                            <div className="form-group animate-slide-down">
                              <label className="checkout-label">Set Account Password</label>
                              <div className="input-with-icon">
                                <Lock size={16} />
                                <input 
                                  type="password" 
                                  name="password"
                                  value={guestDetails.password}
                                  onChange={handleInputChange}
                                  placeholder="Create password"
                                  required={guestDetails.createAccount}
                                />
                              </div>
                            </div>
                          )}

                          {formError && <div className="checkout-form-error">{formError}</div>}

                          <button 
                            type="submit"
                            disabled={isSubmittingDetails}
                            className="btn-primary checkout-action-btn"
                          >
                            {isSubmittingDetails ? 'Creating hold...' : 'Continue to Payment'}
                          </button>
                        </form>
                      ) : (
                        <form onSubmit={handleLoginSubmit} className="login-form">
                          <div className="form-group">
                            <label className="checkout-label">Email Address</label>
                            <div className="input-with-icon">
                              <Mail size={16} />
                              <input 
                                type="email" 
                                name="email"
                                value={loginDetails.email}
                                onChange={handleLoginChange}
                                placeholder="name@domain.com"
                                required 
                              />
                            </div>
                          </div>

                          <div className="form-group">
                            <label className="checkout-label">Password</label>
                            <div className="input-with-icon">
                              <Lock size={16} />
                              <input 
                                type="password" 
                                name="password"
                                value={loginDetails.password}
                                onChange={handleLoginChange}
                                placeholder="Your password"
                                required 
                              />
                            </div>
                          </div>

                          {formError && <div className="checkout-form-error">{formError}</div>}

                          <button 
                            type="submit"
                            disabled={isSubmittingDetails}
                            className="btn-primary checkout-action-btn"
                          >
                            {isSubmittingDetails ? 'Signing in...' : 'Sign In & Autofill'}
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              )}

              {step > 1 && createdBooking && (
                <div className="card-summary-row">
                  <span className="summary-text">
                    Booking held for {createdBooking.guestName || `${guestDetails.firstName} ${guestDetails.lastName}`}
                  </span>
                </div>
              )}
            </div>

            {/* STEP 2: PAYMENT CARD */}
            <div className={`checkout-card glass ${step === 2 ? 'active' : 'disabled'}`}>
              <div className="card-header-row">
                <h2>2. Complete Payment</h2>
              </div>

              {step === 2 && createdBooking && (
                <div className="card-body-content animate-slide-down">
                  {paymentComplete ? (
                    <div className="payment-success-card animate-slide-down">
                      <div className="success-icon-ring" style={{ color: '#1a9e35', borderColor: '#1a9e35' }}>
                        <Check size={36} />
                      </div>
                      <h3 className="payment-status-title">STK Push Initiated!</h3>
                      <p className="payment-status-desc">
                        A direct payment request has been sent to your M-Pesa phone number. 
                        Please enter your M-Pesa PIN on your phone handset to authorize the transaction. 
                        Once completed, your booking status will update to Confirmed automatically.
                      </p>
                      <button onClick={handleGoToPortal} className="btn-primary checkout-action-btn">
                        Go to Guest Portal Dashboard
                      </button>
                    </div>
                  ) : (
                    <div className="payment-methods-block">
                      {/* Timer Alert */}
                      <div className="payment-timer-alert">
                        <Clock size={16} />
                        <span>PAYMENT WINDOW CLOSES IN: <strong>{timeRemaining}</strong></span>
                      </div>

                      <p className="payment-helper-text">
                        The suite is temporarily held for you. Complete payment now to guarantee confirmation.
                      </p>

                      <div className="payment-options-grid">
                        <label className={`payment-option-label ${paymentMethod === 'mpesa' ? 'active' : ''}`}>
                          <input 
                            type="radio" 
                            name="method"
                            value="mpesa"
                            checked={paymentMethod === 'mpesa'}
                            onChange={() => setPaymentMethod('mpesa')}
                          />
                          <div className="method-logo mpesa-logo">
                            <img src="/mpesa-logo.jpg" alt="M-Pesa" />
                          </div>
                          <div className="method-text">
                            <strong>M-Pesa STK Push</strong>
                            <span>Automated prompt on your phone</span>
                          </div>
                        </label>

                        <label className={`payment-option-label ${paymentMethod === 'paypal' ? 'active' : ''}`}>
                          <input 
                            type="radio" 
                            name="method"
                            value="paypal"
                            checked={paymentMethod === 'paypal'}
                            onChange={() => setPaymentMethod('paypal')}
                          />
                          <div className="method-logo paypal-logo">
                            <img src="/paypal.svg" alt="PayPal" />
                          </div>
                          <div className="method-text">
                            <strong>PayPal / Cards</strong>
                            <span>Checkout globally</span>
                          </div>
                        </label>
                      </div>

                      {/* Payment inputs */}
                      {paymentMethod === 'mpesa' && (
                        <div className="payment-input-group animate-slide-down">
                          <div style={{ background: 'rgba(26, 158, 53, 0.05)', border: '1px solid rgba(26, 158, 53, 0.2)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                            <h4 style={{ margin: '0 0 0.5rem', color: '#1a9e35', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', letterSpacing: '1px' }}>AUTOMATED PAYMENT PROMPT</h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(232, 213, 181, 0.85)', lineHeight: '1.6' }}>
                              We will send a direct payment prompt to the phone number below for <strong>KES {totalCost.toLocaleString('en-KE')}</strong>. Please ensure your handset is unlocked.
                            </p>
                          </div>

                          <label className="checkout-label">M-Pesa Phone Number</label>
                          <div className="phone-input-group" style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span className="phone-prefix" style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.75rem 1rem', border: '1px solid rgba(255, 255, 255, 0.1)', borderRight: 'none', borderRadius: '8px 0 0 8px', color: '#E8D5B5', fontSize: '1.05rem', display: 'inline-flex', alignItems: 'center' }}>+254</span>
                            <div className="input-with-icon no-left-padding" style={{ flex: 1, position: 'relative' }}>
                              <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(232, 213, 181, 0.4)' }} />
                              <input 
                                type="tel"
                                value={mpesaPhone}
                                onChange={(e) => setMpesaPhone(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="712345678"
                                className="checkout-input"
                                style={{ paddingLeft: '36px', borderRadius: '0 8px 8px 0', borderLeft: 'none' }}
                                required
                              />
                            </div>
                          </div>
                          <p className="input-hint">Enter your Safaricom number without country code (e.g. 712345678).</p>
                        </div>
                      )}

                      {paymentMethod === 'paypal' && (
                        <div className="payment-input-group animate-slide-down">
                          <label className="checkout-label">PayPal Email Address</label>
                          <input 
                            type="email"
                            value={paypalEmail}
                            onChange={(e) => setPaypalEmail(e.target.value)}
                            placeholder="name@domain.com"
                            className="checkout-input"
                          />
                        </div>
                      )}

                      {paymentError && (
                        <div className="checkout-payment-error">
                          <AlertTriangle size={16} />
                          <span>{paymentError}</span>
                        </div>
                      )}

                      <button 
                        onClick={handlePayment}
                        disabled={processingPayment || timeRemaining === 'Expired'}
                        className="btn-primary checkout-action-btn"
                        style={{
                          backgroundColor: paymentMethod === 'paypal' ? '#002994' : '#1a9e35',
                          borderColor: paymentMethod === 'paypal' ? '#002994' : '#1a9e35'
                        }}
                      >
                        {processingPayment 
                          ? 'Initiating STK Push request...' 
                          : paymentMethod === 'paypal' 
                            ? 'PAY VIA PAYPAL' 
                            : 'SEND STK PUSH'}
                      </button>

                      <button className="btn-outline-link" onClick={handleGoToPortal}>
                        I will pay later from my Guest Portal
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT: STAY SUMMARY */}
          <div className="checkout-summary-column">
            <div className="summary-sticky-card glass">
              <div className="summary-suite-preview">
                <img src={suite.image} alt={suite.name} className="summary-suite-thumb" />
                <div className="summary-suite-info">
                  <span className="summary-tagline">{suite.tagline}</span>
                  <h3>{suite.name}</h3>
                </div>
              </div>

              <div className="summary-separator" />

              <h4 className="summary-section-title">Stay Overview</h4>
              
              <div className="summary-overview-specs">
                <div className="overview-spec">
                  <Calendar size={16} />
                  <div>
                    <span className="spec-label">Dates</span>
                    <span className="spec-val">
                      {formatDate(params.checkIn)} – {formatDate(params.checkOut)}
                    </span>
                  </div>
                </div>

                <div className="overview-spec">
                  <Users size={16} />
                  <div>
                    <span className="spec-label">Guests</span>
                    <span className="spec-val">
                      {params.adults} Adult{params.adults !== 1 ? 's' : ''}
                      {params.children > 0 ? `, ${params.children} Child${params.children !== 1 ? 'ren' : ''}` : ''}
                    </span>
                  </div>
                </div>
              </div>

              <div className="summary-separator" />

              <h4 className="summary-section-title">Price Breakdown</h4>

              <div className="summary-pricing-rows">
                <div className="pricing-row">
                  <span>KES {suite.price.toLocaleString('en-KE')} x {nights} night{nights !== 1 ? 's' : ''}</span>
                  <span>KES {baseCost.toLocaleString('en-KE')}</span>
                </div>

                {lengthDiscountValue > 0 && (
                  <div className="pricing-row discount">
                    <span>{discountPercent}% Length discount</span>
                    <span>- KES {lengthDiscountValue.toLocaleString('en-KE')}</span>
                  </div>
                )}

                {isPeakSurcharge && (
                  <div className="pricing-row surcharge">
                    <span>5-guest peak surcharge</span>
                    <span>KES {peakSurchargeAmount.toLocaleString('en-KE')}</span>
                  </div>
                )}

                <div className="summary-pricing-divider" />

                <div className="pricing-row total">
                  <span>Total Due</span>
                  <span>KES {totalCost.toLocaleString('en-KE')}</span>
                </div>
              </div>

              <div className="summary-trust-badge">
                <ShieldCheck size={16} />
                <span>Secure payment via M-Pesa</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
