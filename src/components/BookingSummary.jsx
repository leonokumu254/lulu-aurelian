import React, { useState } from 'react';
import { Calendar, Shield, Sparkles, Loader2 } from 'lucide-react';
import './BookingSummary.css';
import { OFFERS } from '../data/OffersData';
import { getSuitePrice } from '../utils/pricing';

const SUITES_METADATA = {
  skyview: {
    name: 'Skyview Hideaway',
    price: 5500,
    image: '/assets/skyview/skyview_1.jpg'
  },
  cocoa: {
    name: 'Cocoa Retreat',
    price: 5000,
    image: '/assets/cocoa/cocoa_1.jpg'
  }
};

export default function BookingSummary({ formData, onSubmit, guestUser }) {
  const [prices, setPrices] = useState({ skyview: getSuitePrice('skyview'), cocoa: getSuitePrice('cocoa') });
  const [cleaningDates, setCleaningDates] = useState([]);
  const [newCleaningDate, setNewCleaningDate] = useState('');

  React.useEffect(() => {
    const handlePricingUpdate = () => {
      setPrices({ skyview: getSuitePrice('skyview'), cocoa: getSuitePrice('cocoa') });
    };
    window.addEventListener('pricingUpdated', handlePricingUpdate);
    return () => window.removeEventListener('pricingUpdated', handlePricingUpdate);
  }, []);

  const suiteData = SUITES_METADATA[formData.suite] || SUITES_METADATA.skyview;
  const currentSuitePrice = prices[formData.suite] || prices.skyview;

  // Calculate nights
  let nights = 0;
  if (formData.checkIn && formData.checkOut) {
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    if (end > start) {
      const diffTime = Math.abs(end - start);
      nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  }

  // Financial Calculations
  const ratePerNight = currentSuitePrice;
  const roomCost = ratePerNight * nights;
  
  let lengthDiscountPercent = 0;
  if (nights >= 30) lengthDiscountPercent = 20;
  else if (nights >= 7) lengthDiscountPercent = 10;
  else if (nights >= 3) lengthDiscountPercent = 5;

  let lengthDiscountValue = roomCost * (lengthDiscountPercent / 100);

  let offerSavings = 0;
  const selectedOffer = formData.offerId ? OFFERS.find(o => o.id === formData.offerId) : null;

  if (selectedOffer) {
    if (selectedOffer.discountType === 'percentage' && nights >= selectedOffer.minNights) {
      offerSavings = roomCost * (selectedOffer.discountValue / 100);
    } else if (selectedOffer.discountType === 'free_nights' && nights >= selectedOffer.minNights) {
      offerSavings = ratePerNight * selectedOffer.freeNights;
    }
  }

  const savings = lengthDiscountValue + offerSavings;
  const cleaningCost = cleaningDates.length * 500;
  
  let totalCost = Math.max(0, roomCost - savings) + cleaningCost;

  const digitsOnly = formData.phone ? formData.phone.replace(/\D/g, '') : '';
  const isPhoneValid = digitsOnly.length >= 7 && digitsOnly.length <= 15;

  // Validation checks to enable submit
  const isFormValid = 
    formData.firstName && formData.firstName.trim() !== '' &&
    formData.lastName && formData.lastName.trim() !== '' &&
    formData.email && formData.email.trim() !== '' &&
    formData.confirmEmail && formData.confirmEmail.trim() !== '' &&
    formData.email.trim().toLowerCase() === formData.confirmEmail.trim().toLowerCase() &&
    formData.phone && isPhoneValid &&
    nights > 0;

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmitClick = async () => {
    if (!isFormValid || submitting) return;
    setSubmitting(true);
    setSubmitError('');

    const payload = {
      guest_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      guest_email: formData.email.trim().toLowerCase(),
      guest_phone: `${formData.phoneCountryCode}${formData.phone.trim()}`,
      unit_id: formData.suite,
      check_in: formData.checkIn,
      check_out: formData.checkOut,
      cleaning_dates: cleaningDates
    };

    try {
      const headers = { 'Content-Type': 'application/json' };
      // Attach auth user_id if guest is logged in (cookies handle the actual auth)
      if (guestUser && guestUser.id) {
        payload.user_id = guestUser.id;
      }

      const response = await fetch('/api/bookings/request', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onSubmit({
            ...formData,
            phone: `${formData.phoneCountryCode} ${formData.phone.trim()}`,
            nights,
            roomCost,
            cleaningFee: cleaningCost,
            serviceFee: 0,
            tax: 0,
            totalCost,
            suiteName: suiteData.name,
            bookingId: data.booking.id,
            secureToken: data.booking.secure_token,
            serverStatus: data.booking.status
          });
        }, 1500);
      } else {
        setSubmitError(data.error || 'Failed to submit booking. Please try again.');
        setSubmitting(false);
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      setSubmitError('Connection error. Please ensure the server is running and try again.');
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const opt = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', opt);
  };

  return (
    <div className="booking-summary-card">
      <div className="summary-image-wrapper">
        <img src={suiteData.image} alt={suiteData.name} className="summary-image" />
        <div className="summary-image-overlay" />
        <div className="summary-suite-title">
          <h3>{suiteData.name}</h3>
          <span>Premium Residence</span>
        </div>
      </div>

      <div className="summary-content">
        <h4 className="summary-section-title">Reservation Summary</h4>
        
        {/* Stay details */}
        <div className="summary-stay-details">
          <div className="stay-detail-item">
            <Calendar size={15} className="detail-icon" />
            <div>
              <span className="stay-label">Check-in</span>
              <span className="stay-val">{formatDate(formData.checkIn)}</span>
            </div>
          </div>
          <div className="stay-detail-item">
            <Calendar size={15} className="detail-icon" />
            <div>
              <span className="stay-label">Check-out</span>
              <span className="stay-val">{formatDate(formData.checkOut)}</span>
            </div>
          </div>
        </div>

        <div className="summary-divider" />

        {/* Guest composition */}
        <div className="summary-guests-list">
          <span className="summary-label">Selected occupancy</span>
          <span className="summary-val">
            {formData.adults} {formData.adults === 1 ? 'Adult' : 'Adults'}
            {formData.children > 0 && ` • ${formData.children} ${formData.children === 1 ? 'Child' : 'Children'}`}
          </span>
        </div>

        <div className="summary-divider" />

        {/* Cleaning service opt-in */}
        {nights >= 7 && (
          <div className="summary-cleaning-optin" style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-gold-muted)' }}>
            <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--color-text)' }}>Optional Cleaning Service</h5>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: 'var(--color-text)' }}>You qualify for our cleaning service (KES 500/session). Add preferred dates:</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input 
                type="date" 
                value={newCleaningDate}
                onChange={e => setNewCleaningDate(e.target.value)}
                min={formData.checkIn || undefined}
                max={formData.checkOut || undefined}
                style={{ flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.85rem' }}
              />
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                onClick={() => {
                  if (newCleaningDate && !cleaningDates.includes(newCleaningDate)) {
                    setCleaningDates([...cleaningDates, newCleaningDate].sort());
                    setNewCleaningDate('');
                  }
                }}
              >
                Add
              </button>
            </div>
            {cleaningDates.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {cleaningDates.map(d => (
                  <span key={d} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {formatDate(d)}
                    <span style={{ cursor: 'pointer', color: '#e63946', fontWeight: 'bold' }} onClick={() => setCleaningDates(cleaningDates.filter(date => date !== d))}>×</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pricing calculations */}
        <div className="pricing-rows-container">
          {selectedOffer && (
            <div className="summary-offer-details" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-gold-muted)', borderRadius: '4px' }}>
              <h5 style={{ margin: '0 0 0.25rem 0', color: 'var(--color-gold-deep)', fontSize: '0.85rem' }}>Applied Offer: {selectedOffer.title}</h5>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted)' }}>{selectedOffer.shortDesc}</p>
            </div>
          )}

          <div className="pricing-row">
            <span>KES {ratePerNight.toLocaleString('en-KE')} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
            <span>KES {roomCost.toLocaleString('en-KE')}</span>
          </div>
          
          {lengthDiscountPercent > 0 && (
            <div className="pricing-row" style={{ color: '#10B981', fontWeight: 500, marginTop: '0.5rem' }}>
              <span>{lengthDiscountPercent}% Long Stay Discount</span>
              <span>- KES {lengthDiscountValue.toLocaleString('en-KE')}</span>
            </div>
          )}

          {offerSavings > 0 && (
            <div className="pricing-row" style={{ color: '#10B981', fontWeight: 500, marginTop: '0.5rem' }}>
              <span>Offer Savings</span>
              <span>- KES {offerSavings.toLocaleString('en-KE')}</span>
            </div>
          )}

          {cleaningDates.length > 0 && (
            <div className="pricing-row" style={{ marginTop: '0.5rem' }}>
              <span>Cleaning Service ({cleaningDates.length} sessions)</span>
              <span>KES {cleaningCost.toLocaleString('en-KE')}</span>
            </div>
          )}
        </div>

        <div className="summary-divider-heavy" />

        {/* Total */}
        <div className="pricing-row-total">
          <span>Estimated Total</span>
          <span className="total-price">KES {totalCost.toLocaleString('en-KE')}</span>
        </div>

        {/* Error message */}
        {submitError && (
          <p style={{ color: '#ff6b6b', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center' }}>
            {submitError}
          </p>
        )}

        <button 
          type="button" 
          className="btn-primary summary-submit-btn"
          disabled={!isFormValid || submitting || isSuccess}
          onClick={handleSubmitClick}
          style={{ backgroundColor: isSuccess ? '#10B981' : undefined }}
        >
          {isSuccess ? (
            <>
              <Shield size={16} style={{ marginRight: '0.5rem' }} />
              Booking Successful!
            </>
          ) : submitting ? (
            <>
              <Loader2 size={16} className="spinner" style={{ marginRight: '0.5rem' }} />
              Processing Order... Please Wait
            </>
          ) : nights === 0 ? 'Select Dates to Book' : 'Reserve Now!'}
        </button>

        <div className="external-booking-channels-summary">
          <span className="channels-label">Or book on your favorite platform:</span>
          <div className="channels-buttons">
            <a 
              href={formData.suite === 'skyview' ? 'https://www.airbnb.com/h/pearlapartmentsnyeri' : 'https://www.airbnb.com/h/cocoapearlapartment'} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="channel-btn airbnb-btn"
              title="Book via Airbnb"
            >
              <img src="/Airbnb--Streamline-Svg-Logos.svg" alt="Airbnb" className="channel-icon" />
            </a>
            
            <a 
              href={formData.suite === 'skyview' ?  'https://www.booking.com/Share-F7S7E5V' : 'https://www.booking.com/Share-KWW4dvn'} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="channel-btn booking-btn"
              title="Book via Booking.com"
            >
              <img src="/bookingcom-logo-svgrepo-com.svg" alt="Booking.com" className="channel-icon" />
            </a>
          </div>
        </div>

            </div>
    </div>
  );
}
