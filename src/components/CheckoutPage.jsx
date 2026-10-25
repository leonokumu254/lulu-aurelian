import React, { useState, useEffect, useRef } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Calendar, Users, ShieldCheck, Clock, Check, AlertTriangle, ChevronLeft, CreditCard, Lock, User, Mail, Phone, Home, Copy, CheckCircle, Sparkles, Star, AlertCircle, LogIn } from 'lucide-react';
import { getSuitePrice } from '../utils/pricing';
import { OFFERS } from '../data/OffersData';
import { triggerToast } from './Toast';
import './CheckoutPage.css';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

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
    bookingType: 'entire',
    offerId: null
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
        bookingType: searchParams.get('bookingType') || searchParams.get('booking_type') || 'entire',
        offerId: searchParams.get('offerId') ? parseInt(searchParams.get('offerId'), 10) : null
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

  // Offer savings if applicable
  let offerSavings = 0;
  const selectedOffer = params.offerId ? OFFERS.find(o => o.id === params.offerId) : null;
  if (selectedOffer && nights > 0) {
    if (selectedOffer.discountType === 'percentage' && nights >= (selectedOffer.minNights || 1)) {
      offerSavings = baseCost * ((selectedOffer.discountValue || 10) / 100);
    } else if (selectedOffer.discountType === 'free_nights' && nights >= (selectedOffer.minNights || 1)) {
      offerSavings = suitePrice * (selectedOffer.freeNights || 1);
    }
  }

  const maxAdults = isOneBed ? 3 : 5;
  const isPeakSurcharge = !isOneBed && params.adults === 5;
  const peakSurchargeAmount = isPeakSurcharge ? 1500 : 0;
  const totalSavings = lengthDiscountValue + offerSavings;
  const totalCost = Math.max(0, baseCost - totalSavings) + peakSurchargeAmount;

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

  // Non-blocking session check: if logged in, auto-populate; if guest, seamlessly stay on checkout!
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/session`, { credentials: 'include' });
        const data = await res.json();
        if (res.ok && data.success && data.user) {
          setUser({
            ...data.user,
            role: data.user.role.toLowerCase(),
            avatar: data.user.role === 'MANAGER' ? '/avatar.svg' : '/user-icon.svg'
          });
        }
      } catch (err) {
        // Guest checkout mode stays active without redirect
      }
    };

    if (!user) {
      checkSession();
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
  const [manualCodeSubmitting, setManualCodeSubmitting] = useState(false);
  const [manualCodeError, setManualCodeError] = useState('');
  
  const idempotencyKey = useRef(null);

  const handleCopyText = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2500);
  };

  const handleVerifyManualCode = async (e) => {
    if (e) e.preventDefault();
    if (!mpesaCode || mpesaCode.trim().length < 5) {
      setManualCodeError('Please enter a valid M-Pesa transaction code (e.g. SJR48Z9X2).');
      return;
    }
    setManualCodeSubmitting(true);
    setManualCodeError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/payments/mpesa/verify-manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          booking_id: createdBooking?.bookingId || createdBooking?.id,
          mpesa_code: mpesaCode.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStkPushSent(false);
        setPaymentError(null);
        setPaymentComplete(true);
      } else {
        setManualCodeError(data.error || 'Could not verify M-Pesa code. Please check and try again.');
      }
    } catch (err) {
      console.error('Manual code verification failed:', err);
      setManualCodeError('Network error while verifying code. Please try again.');
    } finally {
      setManualCodeSubmitting(false);
    }
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
    const maxPolls = 36; // 36 × 5s = 3 minutes (allows time for PIN entry + callback processing)

    const interval = setInterval(async () => {
      pollCount++;

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/payments/payhero/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            checkoutRequestId,
            bookingId: createdBooking?.bookingId || createdBooking?.id 
          })
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

  const [googleAuthLoading, setGoogleAuthLoading] = useState(false);

  const handleGoogleSuccess = async (tokenResponse) => {
    setGoogleAuthLoading(true);
    setFormError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: tokenResponse.access_token }),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        if (data.token) {
          localStorage.setItem('guestToken', data.token);
        }
        const loggedUser = {
          ...data.user,
          role: data.user.role.toLowerCase(),
          avatar: data.user.avatar || '/user-icon.svg'
        };
        setUser(loggedUser);

        // Pre-fill guest details immediately
        const nameParts = (data.user.name || '').trim().split(' ');
        let rawPhone = data.user.phone || '';
        if (rawPhone.startsWith('+254')) rawPhone = rawPhone.substring(4);
        setGuestDetails(prev => ({
          ...prev,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: data.user.email || '',
          phone: rawPhone
        }));

        triggerToast({
          type: 'success',
          title: 'Google Sign-In Successful',
          message: `Welcome, ${data.user.name || 'Valued Guest'}! Your reservation details have been autofilled.`
        });
      } else {
        setFormError(data.error || 'Google authentication failed.');
        triggerToast({ type: 'error', title: 'Sign-in Failed', message: data.error || 'Could not authenticate with Google.' });
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      setFormError('Connection error during Google authentication. Please try again.');
    } finally {
      setGoogleAuthLoading(false);
    }
  };

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => {
      setFormError('Google sign-in was cancelled or failed.');
    }
  });

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
    if (!guestDetails.firstName?.trim()) {
      const msg = 'Please enter your first name.';
      setFormError(msg);
      triggerToast({ type: 'warning', title: 'First Name Required', message: msg });
      document.querySelector('input[name="firstName"]')?.focus();
      return;
    }

    if (!guestDetails.lastName?.trim()) {
      const msg = 'Please enter your second name (last name) to continue.';
      setFormError(msg);
      triggerToast({ type: 'warning', title: 'Second Name Required', message: msg });
      document.querySelector('input[name="lastName"]')?.focus();
      return;
    }

    if (!guestDetails.email?.trim()) {
      const msg = 'Please enter your email address to receive check-in credentials.';
      setFormError(msg);
      triggerToast({ type: 'warning', title: 'Email Address Required', message: msg });
      document.querySelector('input[name="email"]')?.focus();
      return;
    }

    const digitsOnly = guestDetails.phone ? guestDetails.phone.replace(/\D/g, '') : '';
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      const msg = 'Please enter a valid Safaricom phone number (e.g. 712 345 678).';
      setFormError(msg);
      triggerToast({ type: 'warning', title: 'Valid Phone Required', message: msg });
      document.querySelector('input[name="phone"]')?.focus();
      return;
    }

    setIsSubmittingDetails(true);

    try {
      // If user opted to create a secure account
      if (!user && guestDetails.createAccount && guestDetails.password) {
        await registerGuestAccount();
      }

      // Normalize phone number to standard Safaricom / Kenyan format (+254XXXXXXXXX)
      let rawDigits = guestDetails.phone.trim().replace(/[^0-9]/g, '');
      if (rawDigits.startsWith('0')) rawDigits = rawDigits.slice(1);
      if (rawDigits.startsWith('254')) rawDigits = rawDigits.slice(3);
      const formattedPhone = `+254${rawDigits}`;

      // Create Booking Hold Request
      const payload = {
        guest_name: `${guestDetails.firstName.trim()} ${guestDetails.lastName.trim()}`,
        guest_email: guestDetails.email.trim().toLowerCase(),
        guest_phone: formattedPhone,
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
          phone: formattedPhone,
          email: guestDetails.email.trim().toLowerCase()
        });

        // Initialize payment variables with local Kenyan number format (07XXXXXXXX or 7XXXXXXXX)
        setMpesaPhone(rawDigits.startsWith('0') ? rawDigits : `0${rawDigits}`);
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
                      {/* Prominent Google 1-Click Fast Checkout Banner */}
                      <div className="checkout-google-banner">
                        <div className="checkout-google-banner-text">
                          <span className="checkout-google-tag">
                            <Sparkles size={13} /> 1-CLICK FAST BOOKING
                          </span>
                          <h4 className="checkout-google-title">Sign in with Google</h4>
                          <p className="checkout-google-sub">
                            Bypass manual typing. Autofill your guest profile and track your reservation in one click.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="btn-checkout-google"
                          onClick={() => triggerGoogleLogin()}
                          disabled={googleAuthLoading}
                          aria-label="Sign in with Google to autofill checkout"
                        >
                          <GoogleIcon />
                          <span>{googleAuthLoading ? 'Connecting...' : 'Continue with Google'}</span>
                        </button>
                      </div>

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
                          <div className="guest-autofill-hint">
                            <span>Prefer not to type?</span>
                            <button
                              type="button"
                              className="btn-link-google"
                              onClick={() => triggerGoogleLogin()}
                              disabled={googleAuthLoading}
                            >
                              <GoogleIcon />
                              <span>Autofill with Google</span>
                            </button>
                          </div>

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
                        <div className="login-tab-content">
                          <button
                            type="button"
                            className="btn-checkout-google tab-google-full"
                            onClick={() => triggerGoogleLogin()}
                            disabled={googleAuthLoading}
                          >
                            <GoogleIcon />
                            <span>{googleAuthLoading ? 'Connecting...' : 'Sign in with Google'}</span>
                          </button>

                          <div className="checkout-divider-row">
                            <span>or continue with email</span>
                          </div>

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
                        </div>
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
                      <span style={{ color: '#a3721d', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                        Reservation Confirmed
                      </span>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2.1rem', fontWeight: 600, margin: '0 0 0.5rem', color: '#1D1912', lineHeight: '1.2' }}>
                        Welcome to Lulu Aurelian
                      </h3>
                      <p style={{ maxWidth: '520px', margin: '0 auto 1.5rem', color: '#475569', lineHeight: '1.6', fontSize: '0.95rem', fontWeight: 400 }}>
                        Thank you, <strong style={{ color: '#1D1912', fontWeight: 600 }}>{createdBooking?.guestName || `${guestDetails?.firstName || ''} ${guestDetails?.lastName || ''}`.trim() || 'Valued Guest'}</strong>. Your reservation for <strong style={{ color: '#1D1912', fontWeight: 600 }}>{createdBooking?.suiteName || suite?.name || 'Your Suite'}</strong> is verified and locked in.
                      </p>

                      <div style={{ background: 'rgba(163, 114, 29, 0.05)', border: '1.5px solid rgba(163, 114, 29, 0.25)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid rgba(163, 114, 29, 0.15)', paddingBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Booking Reference</span>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', color: '#1D1912', background: 'rgba(255,255,255,0.7)', padding: '2px 8px', borderRadius: '4px' }}>
                            #{createdBooking?.bookingId ? String(createdBooking.bookingId).substring(0, 8).toUpperCase() : 'LULU-CONFIRMED'}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem', fontSize: '0.88rem' }}>
                          <div>
                            <span style={{ color: '#6b7280', display: 'block', fontSize: '0.78rem' }}>Check-In:</span>
                            <strong style={{ color: '#1D1912' }}>{formatDate(params.checkIn)} (from 2:00 PM)</strong>
                          </div>
                          <div>
                            <span style={{ color: '#6b7280', display: 'block', fontSize: '0.78rem' }}>Check-Out:</span>
                            <strong style={{ color: '#1D1912' }}>{formatDate(params.checkOut)} (by 10:00 AM)</strong>
                          </div>
                          <div>
                            <span style={{ color: '#6b7280', display: 'block', fontSize: '0.78rem' }}>Total Paid:</span>
                            <strong style={{ color: '#1a9e35' }}>KES {(totalCost || 0).toLocaleString('en-KE')}</strong>
                          </div>
                        </div>
                      </div>

                      <div style={{ background: '#FAF6ED', border: '1.5px dashed #C29B38', borderRadius: '12px', padding: '1.15rem 1.25rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.45rem' }}>
                          <Sparkles size={18} style={{ color: '#8C6014', flexShrink: 0 }} />
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#8C6014', letterSpacing: '0.02em' }}>
                            Keyless Smart-Lock Access
                          </h4>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155', lineHeight: '1.55', fontWeight: 400 }}>
                          Your unique digital door passcode, high-speed Wi-Fi credentials, and driving directions have been dispatched to <strong style={{ color: '#1D1912', fontWeight: 600 }}>{createdBooking?.email || guestDetails?.email || 'your email'}</strong>.
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '420px', margin: '0 auto' }}>
                        <a
                          href={`https://wa.me/254112299384?text=${encodeURIComponent(`Hello Lulu Aurelian Estate, I have completed payment for my reservation #${createdBooking?.bookingId ? String(createdBooking.bookingId).substring(0, 8).toUpperCase() : ''} for ${suite?.name || 'Your Suite'} (${formatDate(params.checkIn)} - ${formatDate(params.checkOut)}).`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            background: '#25D366', color: '#fff', padding: '0.85rem 1.25rem', borderRadius: '8px',
                            fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem', boxShadow: '0 2px 8px rgba(37, 211, 102, 0.25)'
                          }}
                        >
                          <Phone size={18} />
                          <span>Chat with Concierge on WhatsApp</span>
                        </a>

                        {user ? (
                          <button onClick={handleGoToPortal} className="btn-primary checkout-action-btn">
                            View Reservation in Guest Dashboard
                          </button>
                        ) : (
                          <a
                            href="/"
                            style={{
                              display: 'block', textAlign: 'center', padding: '0.8rem 1.25rem',
                              border: '1.5px solid var(--color-dark, #1D1912)', borderRadius: '8px',
                              color: 'var(--color-dark, #1D1912)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem'
                            }}
                          >
                            Return to Home
                          </a>
                        )}
                      </div>
                    </div>
                  ) : stkPushSent ? (
                    <div className="payment-success-card animate-slide-down">
                      <div className="stk-waiting-container">
                        {/* Pulsing phone animation */}
                        <div className="stk-pulsing-phone">
                          <Phone size={36} />
                        </div>
                        <div>
                          <h3 className="payment-status-title" style={{ color: '#1a9e35', margin: '0 0 0.5rem', fontWeight: 600 }}>
                            Please wait as we process your payment request...
                          </h3>
                          <p className="payment-status-desc" style={{ color: '#334155', margin: '0 0 0.85rem' }}>
                            An automated M-Pesa Buy Goods prompt for <strong style={{ color: '#1D1912' }}>KES {totalCost.toLocaleString('en-KE')}</strong> has been dispatched to <strong>+254 {mpesaPhone}</strong>.
                          </p>

                          {/* Quick 3-step guide */}
                          <div style={{ background: 'rgba(26, 158, 53, 0.06)', border: '1px solid rgba(26, 158, 53, 0.2)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', textAlign: 'left', fontSize: '0.82rem', color: '#14532d' }}>
                            <strong style={{ display: 'block', marginBottom: '4px' }}>On Your Phone:</strong>
                            <ol style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.5' }}>
                              <li>Unlock your phone screen.</li>
                              <li>Enter your 4-digit M-Pesa PIN.</li>
                              <li>Tap <strong>Send / OK</strong> to complete.</li>
                            </ol>
                          </div>
                        </div>
                        <div className="stk-status-pill">
                          <div className="stk-dot-pulse" />
                          <span>Listening for Safaricom confirmation...</span>
                        </div>

                        {/* Manual Transaction Code Verification Form */}
                        <form onSubmit={handleVerifyManualCode} className="manual-code-form">
                          <label>
                            Already entered your M-Pesa PIN?
                          </label>
                          <p className="form-subtext">
                            Paste the M-Pesa Transaction Code from your Safaricom SMS to verify instantly:
                          </p>
                          <div className="manual-code-input-row">
                            <input
                              type="text"
                              value={mpesaCode}
                              onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                              placeholder="e.g. SJR48Z9X2"
                              className="checkout-input"
                              maxLength={12}
                              autoCapitalize="characters"
                              autoCorrect="off"
                              spellCheck="false"
                            />
                            <button
                              type="submit"
                              disabled={manualCodeSubmitting}
                              className="btn-primary"
                            >
                              {manualCodeSubmitting ? 'Verifying...' : 'Verify Code'}
                            </button>
                          </div>
                          {manualCodeError && (
                            <p className="manual-code-error">
                              {manualCodeError}
                            </p>
                          )}
                        </form>

                        <div className="stk-till-section">
                          <p className="stk-till-prompt">
                            Didn't receive the prompt? You can pay manually using Buy Goods Till:
                          </p>
                          <div className="stk-till-box">
                            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>TILL NO:</span>
                            <strong style={{ fontSize: '0.95rem', color: '#1D1912' }}>4364845</strong>
                            <button
                              type="button"
                              onClick={() => handleCopyText('4364845', 'stk_till')}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: copiedField === 'stk_till' ? '#1a9e35' : '#64748b' }}
                              title="Copy Till"
                            >
                              {copiedField === 'stk_till' ? <CheckCircle size={14} /> : <Copy size={14} />}
                            </button>
                          </div>
                          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setStkPushSent(false)}
                              className="stk-cancel-btn"
                            >
                              ← Try another number or payment method
                            </button>
                            <a
                              href={`https://wa.me/254112299384?text=${encodeURIComponent(`Hello Lulu Aurelian Estate, I have initiated an M-Pesa payment for booking #${createdBooking?.bookingId ? String(createdBooking.bookingId).substring(0, 8).toUpperCase() : ''} and would like assistance.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#16a34a', fontSize: '0.8rem', textDecoration: 'underline', fontWeight: 600 }}
                            >
                              Need assistance? Chat with Concierge on WhatsApp
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="payment-methods-block">
                      {paymentError && (
                        <div style={{
                          background: 'rgba(239, 68, 68, 0.08)',
                          border: '1.5px solid rgba(239, 68, 68, 0.35)',
                          borderRadius: '10px',
                          padding: '0.85rem 1rem',
                          marginBottom: '1rem',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.65rem'
                        }}>
                          <AlertCircle size={18} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                          <div style={{ flex: 1 }}>
                            <strong style={{ display: 'block', color: '#b91c1c', fontSize: '0.88rem', marginBottom: '2px' }}>
                              Payment Status Notice
                            </strong>
                            <p style={{ margin: 0, color: '#7f1d1d', fontSize: '0.82rem', lineHeight: '1.4' }}>
                              {paymentError}
                            </p>
                          </div>
                        </div>
                      )}

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
                            background: 'rgba(0, 0, 0, 0.02)',
                            border: '1px solid rgba(0, 0, 0, 0.08)',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            marginBottom: '1rem'
                          }}>
                            <h4 style={{ margin: '0 0 0.5rem', color: '#1D1912', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', letterSpacing: '1px' }}>
                              ALTERNATIVE PAYMENT METHODS — CONTACT SUPPORT
                            </h4>
                            <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
                              Direct checkout is processed via <strong>M-Pesa Buy Goods only</strong>. If you have a different payment method (such as <strong>Direct Bank Transfer (EFT/RTGS)</strong>, <strong>Credit/Debit Card</strong>, <strong>Corporate Cheque</strong>, or <strong>Invoice</strong>), our support concierge is ready to assist:
                            </p>
                            <ul style={{ margin: '0 0 1rem 1.25rem', padding: 0, fontSize: '0.82rem', color: '#475569', lineHeight: '1.6' }}>
                              <li>Your 60-minute reservation hold remains active while you contact support.</li>
                              <li>Have your Booking Reference ready: <strong style={{ color: '#1D1912' }}>{createdBooking?.bookingId || 'PENDING'}</strong></li>
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
                                    border: '1px solid rgba(0, 0, 0, 0.1)',
                                    borderRadius: '8px',
                                    color: '#1D1912',
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
                                    border: '1px solid rgba(0, 0, 0, 0.1)',
                                    borderRadius: '8px',
                                    color: '#1D1912',
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
                        <div style={{ marginBottom: '1.25rem' }}>
                          <div className="checkout-payment-error" style={{ marginBottom: '0.75rem' }}>
                            <AlertTriangle size={16} />
                            <span>{paymentError}</span>
                          </div>

                          <form onSubmit={handleVerifyManualCode} className="manual-code-form">
                            <label>
                              Did you already enter your PIN or send payment?
                            </label>
                            <p className="form-subtext">
                              Enter your M-Pesa Transaction Code (from your Safaricom confirmation SMS) to confirm your booking immediately:
                            </p>
                            <div className="manual-code-input-row">
                              <input
                                type="text"
                                value={mpesaCode}
                                onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                                placeholder="e.g. SJR48Z9X2"
                                className="checkout-input"
                                maxLength={12}
                                autoCapitalize="characters"
                                autoCorrect="off"
                                spellCheck="false"
                              />
                              <button
                                type="submit"
                                disabled={manualCodeSubmitting}
                                className="btn-primary"
                              >
                                {manualCodeSubmitting ? 'Verifying...' : 'Verify Code'}
                              </button>
                            </div>
                            {manualCodeError && (
                              <p className="manual-code-error">
                                {manualCodeError}
                              </p>
                            )}
                          </form>
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

                {offerSavings > 0 && selectedOffer && (
                  <div className="pricing-row discount" style={{ color: '#8c6014', fontWeight: 600 }}>
                    <span>Special Offer: {selectedOffer.title}</span>
                    <span>- KES {offerSavings.toLocaleString('en-KE')}</span>
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
                <span>Direct Booking Guarantee · Best Rate</span>
              </div>

              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: '0.78rem', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span>✓ Zero Airbnb / OTA 15% guest booking fees</span>
                <span>✓ Instant keyless entry code on confirmation</span>
                <span>✓ Free cancellation up to 48h before check-in</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
