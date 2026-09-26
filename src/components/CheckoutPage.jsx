import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Users, ShieldCheck, Clock, Check, AlertTriangle, ChevronLeft, CreditCard, Lock, User, Mail, Phone, Home, Copy, CheckCircle } from 'lucide-react';
import { getSuitePrice } from '../utils/pricing';
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
    children: 0,
    bookingType: 'entire'
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
        children: parseInt(searchParams.get('children'), 10) || 0,
        bookingType: searchParams.get('bookingType') || searchParams.get('booking_type') || 'entire'
      });
    }
  }, []);

  const suiteId = params.suite;
  const bookingType = params.bookingType || 'entire';
  const isOneBed = bookingType === 'one_bedroom';
  const suite = SUITES_METADATA[suiteId] || SUITES_METADATA.skyview;
  const [suitePrice, setSuitePrice] = useState(() => getSuitePrice(suiteId, bookingType));

  useEffect(() => {
    setSuitePrice(getSuitePrice(suiteId, bookingType));
    const handlePricingUpdate = () => {
      setSuitePrice(getSuitePrice(suiteId, bookingType));
    };
    window.addEventListener('pricingUpdated', handlePricingUpdate);
    return () => window.removeEventListener('pricingUpdated', handlePricingUpdate);
  }, [suiteId, bookingType]);

  const handleBookingTypeChange = (newType) => {
    setParams(prev => ({
      ...prev,
      bookingType: newType,
      adults: (newType === 'one_bedroom' && prev.adults > 3) ? 3 : prev.adults
    }));
  };

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
  const baseCost = suitePrice * nights;
  let discountPercent = 0;
  if (nights >= 30) discountPercent = 20;
  else if (nights >= 7) discountPercent = 10;
  else if (nights >= 3) discountPercent = 5;
  const lengthDiscountValue = baseCost * (discountPercent / 100);

  const maxAdults = isOneBed ? 3 : 5;
  const isPeakSurcharge = !isOneBed && params.adults === 5;
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
  const [stkPushSent, setStkPushSent] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  const [copiedField, setCopiedField] = useState('');
  
  const idempotencyKey = useRef(null);

  const handleCopyText = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2500);
  };

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

  // ── STK Push status polling ────────────────────────────────────────────────
  useEffect(() => {
    if (!stkPushSent || !checkoutRequestId) return;

    let pollCount = 0;
    const maxPolls = 24; // 24 × 5s = 2 minutes

    const interval = setInterval(async () => {
      pollCount++;

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/payments/payhero/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ checkoutRequestId })
        });

        const data = await res.json();

        if (data.status === 'COMPLETED') {
          setStkPushSent(false);
          setPaymentComplete(true);
          clearInterval(interval);
          return;
        }

        if (data.status === 'CANCELLED' || data.status === 'TIMEOUT' || data.status === 'FAILED') {
          setStkPushSent(false);
          setPaymentError(data.message || 'Payment was not completed. Please try again.');
          clearInterval(interval);
          return;
        }
      } catch (err) {
        console.error('[POLL ERROR]:', err);
      }

      if (pollCount >= maxPolls) {
        setStkPushSent(false);
        setPaymentError('Payment verification timed out. If you completed the payment, your booking will update shortly.');
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [stkPushSent, checkoutRequestId]);

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
        booking_type: bookingType,
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
          bookingType: bookingType,
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
        // STK Push sent — start polling for confirmation
        if (data.checkoutRequestId) {
          setStkPushSent(true);
          setCheckoutRequestId(data.checkoutRequestId);
        } else {
          setPaymentComplete(true);
        }
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
                  {/* ACCOMMODATION SELECTION (ENTIRE VS 1 BEDROOM) */}
                  <div className="checkout-accommodation-box">
                    <label className="checkout-label">Select Accommodation Option</label>
                    <div className="accommodation-toggle-row">
                      <button
                        type="button"
                        className={`btn-accom-option ${bookingType === 'entire' ? 'selected' : ''}`}
                        onClick={() => handleBookingTypeChange('entire')}
                      >
                        <div className="accom-header">
                          <span className="accom-title">Entire Apartment</span>
                          <span className="accom-price">KES {getSuitePrice(suiteId, 'entire').toLocaleString('en-KE')} / night</span>
                        </div>
                        <span className="accom-sub">Full 2-bedroom luxury suite · Up to 5 guests</span>
                      </button>

                      <button
                        type="button"
                        className={`btn-accom-option ${bookingType === 'one_bedroom' ? 'selected' : ''}`}
                        onClick={() => handleBookingTypeChange('one_bedroom')}
                      >
                        <div className="accom-header">
                          <span className="accom-title">1 Bedroom Option</span>
                          <span className="accom-price">KES {getSuitePrice(suiteId, 'one_bedroom').toLocaleString('en-KE')} / night</span>
                        </div>
                        <span className="accom-sub">1 Bedroom master suite · Up to 3 guests</span>
                      </button>
                    </div>
                  </div>

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
                      <h3 className="payment-status-title">Payment Confirmed!</h3>
                      <p className="payment-status-desc">
                        Your M-Pesa payment has been successfully received and verified.
                        Your booking is now confirmed — check-in credentials have been sent to your email.
                      </p>
                      <button onClick={handleGoToPortal} className="btn-primary checkout-action-btn">
                        Go to Guest Portal Dashboard
                      </button>
                    </div>
                  ) : stkPushSent ? (
                    <div className="payment-success-card animate-slide-down">
                      <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
                        padding: '2rem 1rem', textAlign: 'center'
                      }}>
                        {/* Pulsing phone animation */}
                        <div style={{
                          width: '80px', height: '80px', borderRadius: '50%',
                          background: 'rgba(26, 158, 53, 0.1)', border: '2px solid rgba(26, 158, 53, 0.4)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          animation: 'pulse 2s ease-in-out infinite'
                        }}>
                          <Phone size={36} style={{ color: '#1a9e35' }} />
                        </div>
                        <h3 className="payment-status-title" style={{ color: '#1a9e35' }}>Check Your Phone</h3>
                        <p className="payment-status-desc">
                          An M-Pesa payment prompt for <strong>KES {totalCost.toLocaleString('en-KE')}</strong> has been sent to your phone.
                          Enter your M-Pesa PIN to complete the transaction.
                        </p>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '0.5rem',
                          color: 'rgba(232, 213, 181, 0.6)', fontSize: '0.85rem'
                        }}>
                          <div style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: '#1a9e35', animation: 'pulse 1.5s ease-in-out infinite'
                          }} />
                          Verifying payment status...
                        </div>
                      </div>
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
                            <img src="/mpesa-logo.jpg" alt="M-Pesa Buy Goods" />
                          </div>
                          <div className="method-text">
                            <strong>Buy Goods (Till Number)</strong>
                            <span>Till No: 4364845 • STK Push & Manual</span>
                          </div>
                        </label>

                        <label className={`payment-option-label ${paymentMethod === 'contact_staff' ? 'active' : ''}`}>
                          <input 
                            type="radio" 
                            name="method"
                            value="contact_staff"
                            checked={paymentMethod === 'contact_staff'}
                            onChange={() => setPaymentMethod('contact_staff')}
                          />
                          <div className="method-logo staff-contact-logo" style={{ background: '#25D366' }}>
                            <Phone size={20} color="#fff" />
                          </div>
                          <div className="method-text">
                            <strong>Other Payment Methods</strong>
                            <span>Different method? Contact Support</span>
                          </div>
                        </label>
                      </div>

                      {/* Payment inputs */}
                      {paymentMethod === 'mpesa' && (
                        <div className="payment-input-group animate-slide-down">
                          {/* Official Buy Goods Details Card */}
                          <div style={{ background: 'rgba(163, 114, 29, 0.04)', border: '1.5px solid rgba(163, 114, 29, 0.3)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid rgba(163, 114, 29, 0.15)', paddingBottom: '0.4rem' }}>
                              <h4 style={{ margin: 0, color: '#1a9e35', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                OFFICIAL TILL DETAILS
                              </h4>
                              <span style={{ fontSize: '0.72rem', background: '#1a9e35', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>BUY GOODS</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                              <div style={{ background: 'rgba(0, 0, 0, 0.03)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                                <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>TILL NUMBER</span>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                                  <strong style={{ fontSize: '1.15rem', color: '#1D1912', letterSpacing: '1px' }}>4364845</strong>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyText('4364845', 'till')}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: copiedField === 'till' ? '#1a9e35' : '#64748b' }}
                                    title="Copy Till Number"
                                  >
                                    {copiedField === 'till' ? <CheckCircle size={15} /> : <Copy size={15} />}
                                  </button>
                                </div>
                              </div>
                            </div>

                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: '1.5' }}>
                              Enter your Safaricom phone below to receive an automated Buy Goods STK prompt for <strong>KES {totalCost.toLocaleString('en-KE')}</strong>, or pay manually via your M-Pesa menu using Till No <strong>4364845</strong>.
                            </p>
                          </div>

                          <label className="checkout-label">M-Pesa Phone Number</label>
                          <div className="phone-input-group" style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span className="phone-prefix" style={{ background: 'rgba(0, 0, 0, 0.03)', padding: '0.75rem 1rem', border: '1px solid var(--color-border)', borderRight: 'none', borderRadius: '8px 0 0 8px', color: '#1D1912', fontSize: '1.05rem', display: 'inline-flex', alignItems: 'center' }}>+254</span>
                            <div className="input-with-icon no-left-padding" style={{ flex: 1, position: 'relative' }}>
                              <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
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

                      {paymentMethod === 'contact_staff' && (
                        <div className="payment-input-group animate-slide-down">
                          <div style={{
                            background: 'rgba(232, 213, 181, 0.06)',
                            border: '1px solid rgba(232, 213, 181, 0.2)',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            marginBottom: '1rem'
                          }}>
                            <h4 style={{ margin: '0 0 0.5rem', color: '#E8D5B5', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', letterSpacing: '1px' }}>
                              ALTERNATIVE PAYMENT METHODS — CONTACT SUPPORT
                            </h4>
                            <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: 'rgba(232, 213, 181, 0.85)', lineHeight: '1.6' }}>
                              Direct checkout is processed via <strong>M-Pesa Buy Goods only</strong>. If you have a different payment method (such as <strong>Direct Bank Transfer (EFT/RTGS)</strong>, <strong>Credit/Debit Card</strong>, <strong>Corporate Cheque</strong>, or <strong>Invoice</strong>), our support concierge is ready to assist:
                            </p>
                            <ul style={{ margin: '0 0 1rem 1.25rem', padding: 0, fontSize: '0.82rem', color: 'rgba(232, 213, 181, 0.75)', lineHeight: '1.6' }}>
                              <li>Your 60-minute reservation hold remains active while you contact support.</li>
                              <li>Have your Booking Reference ready: <strong style={{ color: '#E8D5B5' }}>{createdBooking?.bookingId || 'PENDING'}</strong></li>
                              <li>Suite credentials will be issued immediately once payment is verified.</li>
                            </ul>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                              <a 
                                href={`https://wa.me/254112299384?text=${encodeURIComponent(
                                  `Hello Lulu Aurelian Estate Support,\n\nI have created a reservation hold and would like to arrange an alternative payment method.\n\nBooking Ref: ${createdBooking?.bookingId || 'PENDING'}\nSuite: ${suite.name}\nCheck-in: ${formatDate(params.checkIn)}\nCheck-out: ${formatDate(params.checkOut)}\nTotal: KES ${totalCost.toLocaleString('en-KE')}\nGuest: ${guestDetails.firstName} ${guestDetails.lastName}\nPhone: +254 ${guestDetails.phone}`
                                )}`}
                                target="_blank" 
                                rel="noreferrer" 
                                className="btn-primary"
                                style={{
                                  backgroundColor: '#25D366',
                                  borderColor: '#25D366',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px',
                                  textDecoration: 'none',
                                  padding: '0.75rem 1rem',
                                  borderRadius: '8px',
                                  color: '#fff',
                                  fontWeight: 600,
                                  fontSize: '0.9rem'
                                }}
                              >
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/>
                                </svg>
                                Chat with Support on WhatsApp
                              </a>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                <a 
                                  href="tel:+254112299384"
                                  className="btn-secondary"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    textDecoration: 'none',
                                    padding: '0.65rem',
                                    border: '1px solid rgba(232, 213, 181, 0.25)',
                                    borderRadius: '8px',
                                    color: '#E8D5B5',
                                    fontSize: '0.8rem'
                                  }}
                                >
                                  <Phone size={14} /> Call: +254 112 299 384
                                </a>
                                <a 
                                  href={`mailto:pearlisprime@gmail.com?subject=${encodeURIComponent(`Alternative Payment Request - Booking ${createdBooking?.bookingId || ''}`)}&body=${encodeURIComponent(`Hello Support,\n\nI have reserved ${suite.name} (Ref: ${createdBooking?.bookingId || 'PENDING'}) for KES ${totalCost.toLocaleString('en-KE')} and have an alternative payment method.`)}`}
                                  className="btn-secondary"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    textDecoration: 'none',
                                    padding: '0.65rem',
                                    border: '1px solid rgba(232, 213, 181, 0.25)',
                                    borderRadius: '8px',
                                    color: '#E8D5B5',
                                    fontSize: '0.8rem'
                                  }}
                                >
                                  <Mail size={14} /> Email Support
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {paymentError && (
                        <div className="checkout-payment-error">
                          <AlertTriangle size={16} />
                          <span>{paymentError}</span>
                        </div>
                      )}

                      {paymentMethod === 'mpesa' ? (
                        <button 
                          onClick={handlePayment}
                          disabled={processingPayment || timeRemaining === 'Expired'}
                          className="btn-primary checkout-action-btn"
                          style={{
                            backgroundColor: '#1a9e35',
                            borderColor: '#1a9e35'
                          }}
                        >
                          {processingPayment 
                            ? '⏳ Initiating Buy Goods STK Push...' 
                            : `PAY VIA BUY GOODS (KES ${totalCost.toLocaleString('en-KE')})`}
                        </button>
                      ) : (
                        <a 
                          href={`https://wa.me/254112299384?text=${encodeURIComponent(
                            `Hello Lulu Aurelian Estate Support,\n\nI have created a reservation hold and would like to arrange an alternative payment method.\n\nBooking Ref: ${createdBooking?.bookingId || 'PENDING'}\nSuite: ${suite.name}\nCheck-in: ${formatDate(params.checkIn)}\nCheck-out: ${formatDate(params.checkOut)}\nTotal: KES ${totalCost.toLocaleString('en-KE')}\nGuest: ${guestDetails.firstName} ${guestDetails.lastName}\nPhone: +254 ${guestDetails.phone}`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-primary checkout-action-btn"
                          style={{
                            backgroundColor: '#25D366',
                            borderColor: '#25D366',
                            textAlign: 'center',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          CONTACT SUPPORT ON WHATSAPP
                        </a>
                      )}

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

                <div className="overview-spec">
                  <Home size={16} />
                  <div>
                    <span className="spec-label">Accommodation</span>
                    <span className="spec-val">
                      {isOneBed ? '1 Bedroom Option' : 'Entire Apartment'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="summary-separator" />

              <h4 className="summary-section-title">Price Breakdown</h4>

              <div className="summary-pricing-rows">
                <div className="pricing-row">
                  <span>KES {suitePrice.toLocaleString('en-KE')} x {nights} night{nights !== 1 ? 's' : ''} ({isOneBed ? '1 Bed' : 'Entire'})</span>
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
