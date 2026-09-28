import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import CustomCalendarModal from './CustomCalendarModal';
import BookingSummary from './BookingSummary';
import { getSuitePrice } from '../utils/pricing';

// Simple step components – can be extracted later
function StepDates({ onNext }) {
  const { state, dispatch } = useBooking();
  const [showCalendar, setShowCalendar] = useState(false);
  const [tempDates, setTempDates] = useState(state.dates);

  const handleConfirm = () => {
    dispatch({ type: 'SET_DATES', payload: tempDates });
    onNext();
  };

  return (
    <div className="wizard-step wizard-dates">
      <h2>Select Dates & Guests</h2>
      <button onClick={() => setShowCalendar(true)}>Pick Dates</button>
      {showCalendar && (
        <CustomCalendarModal
          isOpen={showCalendar}
          onClose={() => setShowCalendar(false)}
          onSelect={(checkIn, checkOut) => setTempDates({ checkIn, checkOut })}
        />
      )}
      <div className="date-display">
        {tempDates.checkIn && <span>Check‑in: {tempDates.checkIn}</span>}
        {tempDates.checkOut && <span>Check‑out: {tempDates.checkOut}</span>}
      </div>
      <button className="next-btn" onClick={handleConfirm}>Next</button>
    </div>
  );
}

function StepRate({ onNext, onPrev }) {
  const { state, dispatch } = useBooking();
  const [rateInfo, setRateInfo] = useState(null);

  useEffect(() => {
    if (state.dates.checkIn && state.dates.checkOut) {
      // For simplicity we reuse getSuitePrice – real implementation would request backend with dates
      const price = getSuitePrice(state.suiteId || 'skyview', state.bookingType);
      const nights = Math.max(0, (new Date(state.dates.checkOut) - new Date(state.dates.checkIn)) / (1000 * 60 * 60 * 24));
      const total = price * nights;
      setRateInfo({ price, nights, total });
    }
  }, [state.dates, state.suiteId, state.bookingType]);

  const handleProceed = () => {
    dispatch({ type: 'SET_PRICING', payload: rateInfo });
    onNext();
  };

  if (!rateInfo) return <div>Loading pricing...</div>;

  return (
    <div className="wizard-step wizard-rate">
      <h2>Rate & Availability</h2>
      <p>{rateInfo.nights} night(s) @ KES {rateInfo.price.toLocaleString('en-KE')} per night</p>
      <p>Total: KES {rateInfo.total.toLocaleString('en-KE')}</p>
      {/* Discount banner – placeholder */}
      {rateInfo.nights >= 7 && (
        <div className="discount-banner">🎉 Weekly Stay Discount applied: 10% off!</div>
      )}
      <button onClick={onPrev}>Back</button>
      <button className="next-btn" onClick={handleProceed}>Next</button>
    </div>
  );
}

function StepGuest({ onNext, onPrev }) {
  const { state, dispatch } = useBooking();
  const [guestInfo, setGuestInfo] = useState(state.guestInfo);

  const handleChange = e => {
    const { name, value } = e.target;
    setGuestInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleProceed = async () => {
    // Save guest info first
    dispatch({ type: 'SET_GUEST_INFO', payload: guestInfo });
    // Create booking hold via backend
    const payload = {
      guest_name: `${guestInfo.name}`,
      guest_email: guestInfo.email,
      guest_phone: `+254${guestInfo.phone}`,
      unit_id: state.suiteId,
      booking_type: state.bookingType,
      check_in: state.dates.checkIn,
      check_out: state.dates.checkOut,
      adults: state.guests.adults,
      children: state.guests.children,
      cleaning_dates: []
    };
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bookings/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        dispatch({ type: 'SET_BOOKING_HOLD', payload: { bookingId: data.booking.id, secureToken: data.booking.secure_token } });
        onNext();
      } else {
        setGuestInfo(prev => ({ ...prev, error: data.error || 'Failed to create booking hold.' }));
      }
    } catch (e) {
      console.error('Booking hold error:', e);
      setGuestInfo(prev => ({ ...prev, error: 'Network error while creating booking hold.' }));
    }
  };

  return (
    <div className="wizard-step wizard-guest">
      <h2>Guest Details</h2>
      <input name="name" placeholder="Full Name" value={guestInfo.name || ''} onChange={handleChange} />
      <input name="email" placeholder="Email" value={guestInfo.email || ''} onChange={handleChange} />
      <input name="phone" placeholder="Phone" value={guestInfo.phone || ''} onChange={handleChange} />
      <button onClick={onPrev}>Back</button>
      <button className="next-btn" onClick={handleProceed}>Next</button>
    </div>
  );
}

function StepPayment({ onPrev }) {
  const { state } = useBooking();
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const normalizePhone = (raw) => {
    let p = (raw || '').replace(/[^0-9]/g, '');
    if (p.startsWith('0')) p = '254' + p.slice(1);
    if (!p.startsWith('254')) p = '254' + p;
    return p;
  };
  const handlePay = async () => {
    if (!state.bookingId || !state.secureToken) {
      setPaymentError('Booking not ready for payment.');
      return;
    }
    const phone = state.guestInfo.phone || '';
    if (!phone) {
      setPaymentError('Phone number required for M-Pesa.');
      return;
    }
    setProcessingPayment(true);
    setPaymentError(null);
    try {
      const payload = {
        secure_token: state.secureToken,
        method: 'mpesa',
        phone: normalizePhone(phone)
      };
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bookings/${state.bookingId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const ct = res.headers.get('content-type') || '';
      let data;
      if (ct.includes('application/json')) {
        data = await res.json();
      } else {
        const txt = await res.text();
        console.error('[Payment] Non-JSON response:', res.status, txt.slice(0,200));
        data = { success: false, error: `Server error (${res.status}).` };
      }
      if (data.success) {
        setPaymentComplete(true);
      } else {
        setPaymentError(data.error || 'Payment failed.');
      }
    } catch (e) {
      console.error('[Payment] Fetch error:', e);
      setPaymentError('Connection error. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="wizard-step wizard-payment">
      <h2>Secure Checkout</h2>
      <BookingSummary formData={state} onSubmit={() => {}} guestUser={null} />
      <button onClick={onPrev}>Back</button>
      <button className="pay-btn" onClick={handlePay}>Pay Now</button>
    </div>
  );
}

export default function BookingWizard() {
  const { state, dispatch } = useBooking();
  // Use the step directly from context
  const currentStep = state.step;

  // Navigation helpers that update the context step
  const goNext = () => dispatch({ type: 'SET_STEP', payload: Math.min(state.step + 1, 4) });
  const goPrev = () => dispatch({ type: 'SET_STEP', payload: Math.max(state.step - 1, 1) });

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepDates onNext={goNext} />;
      case 2:
        return <StepRate onNext={goNext} onPrev={goPrev} />;
      case 3:
        return <StepGuest onNext={goNext} onPrev={goPrev} />;
      case 4:
        return <StepPayment onPrev={goPrev} />;
      default:
        return null;
    }
  };

  return (
    <div className="booking-wizard-container">
      <div className="wizard-progress">
        {[1, 2, 3, 4].map(num => (
          <div key={num} className={`step-dot ${currentStep === num ? 'active' : ''}`} />
        ))}
      </div>
      {renderStep()}
    </div>
  );
}
