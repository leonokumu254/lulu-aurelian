import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Users, Info, Shield, ChevronDown, AlertCircle, User, Mail, Phone } from 'lucide-react';
import CustomCalendarModal from './CustomCalendarModal';
import { getSuitePrice } from '../utils/pricing';
import './BookingForm.css';

// Helper to format YYYY-MM-DD into M/D/YYYY
const formatDateForDisplay = (dateStr) => {
  if (!dateStr) return 'Add date';
  const [y, m, d] = dateStr.split('-');
  return `${parseInt(m, 10)}/${parseInt(d, 10)}/${y}`;
};

const SUITE_PREVIEWS = {
  skyview: {
    name: 'Skyview Hideaway',
    price: 'KES 5,500',
    image: '/assets/skyview/skyview_1.jpg',
    tagline: 'Penthouse  Panoramic Mt Kenya views ' 
  },
  cocoa: {
    name: 'Cocoa Retreat',
    price: 'KES 5,000',
    image: '/assets/cocoa/cocoa_1.jpg',
    tagline: 'Chilled environment with luxury experience '
  },
  neema: {
    name: 'Neema',
    price: 'KES 5,000',
    image: '/assets/Neema/neema_1.jpeg',
    tagline: 'A peaceful and luxurious retreat'
  }
};

const COUNTRIES = [
  { code: '+254', name: 'Kenya', flag: 'ke' },
  { code: '+1', name: 'United States', flag: 'us' },
  { code: '+44', name: 'United Kingdom', flag: 'gb' },
  { code: '+256', name: 'Uganda', flag: 'ug' },
  { code: '+255', name: 'Tanzania', flag: 'tz' },
  { code: '+250', name: 'Rwanda', flag: 'rw' },
  { code: '+251', name: 'Ethiopia', flag: 'et' },
  { code: '+234', name: 'Nigeria', flag: 'ng' },
  { code: '+27', name: 'South Africa', flag: 'za' },
  { code: '+971', name: 'United Arab Emirates', flag: 'ae' },
  { code: '+1', name: 'Canada', flag: 'ca' },
  { code: '+61', name: 'Australia', flag: 'au' },
  { code: '+91', name: 'India', flag: 'in' },
  { code: '+49', name: 'Germany', flag: 'de' },
  { code: '+33', name: 'France', flag: 'fr' },
  { code: '+39', name: 'Italy', flag: 'it' },
  { code: '+34', name: 'Spain', flag: 'es' },
  { code: '+86', name: 'China', flag: 'cn' },
  { code: '+81', name: 'Japan', flag: 'jp' },
  { code: '+55', name: 'Brazil', flag: 'br' },
  { code: '+41', name: 'Switzerland', flag: 'ch' },
  { code: '+31', name: 'Netherlands', flag: 'nl' },
  { code: '+32', name: 'Belgium', flag: 'be' },
  { code: '+46', name: 'Sweden', flag: 'se' },
  { code: '+966', name: 'Saudi Arabia', flag: 'sa' },
  { code: '+974', name: 'Qatar', flag: 'qa' },
  { code: '+90', name: 'Turkey', flag: 'tr' },
  { code: '+65', name: 'Singapore', flag: 'sg' },
  { code: '+82', name: 'South Korea', flag: 'kr' },
  { code: '+64', name: 'New Zealand', flag: 'nz' }
];

const MAX_ADULTS = 5;
const PEAK_SURCHARGE = 1500;

export default function BookingForm({ formData, setFormData, onSubmit, user }) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);
  const [isPhoneDropdownOpen, setIsPhoneDropdownOpen] = useState(false);
  const [phoneSearchQuery, setPhoneSearchQuery] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [blockedDates, setBlockedDates] = useState([]);

  useEffect(() => {
    if (formData.suite) {
      fetch(`${import.meta.env.VITE_API_URL || ''}/api/bookings/blocked-dates/${formData.suite}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setBlockedDates(data.blockedDates);
        })
        .catch(err => console.error('Failed to fetch blocked dates:', err));
    }
  }, [formData.suite]);

  const dropdownRef = useRef(null);
  const phoneDropdownRef = useRef(null);

  // Today's date to lock date pickers from past booking
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user) {
      const nameParts = (user.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      let rawPhone = user.phone || '';
      let countryCode = '+254';
      if (rawPhone.startsWith('+254')) {
        rawPhone = rawPhone.substring(4);
      } else if (rawPhone.startsWith('+1')) {
        rawPhone = rawPhone.substring(2);
        countryCode = '+1';
      }

      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || firstName,
        lastName: prev.lastName || lastName,
        email: prev.email || user.email,
        confirmEmail: prev.confirmEmail || user.email,
        phone: prev.phone || rawPhone,
        phoneCountryCode: prev.phoneCountryCode || countryCode
      }));
    }
  }, [user, setFormData]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsGuestDropdownOpen(false);
      }
      if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(event.target)) {
        setIsPhoneDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSuiteSelect = (suiteId) => {
    setFormData(prev => ({ ...prev, suite: suiteId }));
  };

  const handleAdultsCount = (val) => {
    const newVal = Math.max(1, Math.min(MAX_ADULTS, formData.adults + val));
    setFormData(prev => ({ ...prev, adults: newVal }));
  };

  const handleChildrenCount = (val) => {
    const newVal = Math.max(0, formData.children + val);
    setFormData(prev => ({ ...prev, children: newVal }));
  };

  const handleChildrenToggle = (e) => {
    const isChecked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      hasChildren: isChecked,
      children: isChecked ? 1 : 0
    }));
  };

  const handleCountrySelect = (country) => {
    setFormData(prev => ({ ...prev, phoneCountryCode: country.code }));
    setIsPhoneDropdownOpen(false);
  };

  const togglePhoneDropdown = () => {
    setIsPhoneDropdownOpen(prev => {
      if (!prev) {
        setPhoneSearchQuery(''); // Reset search when opening
      }
      return !prev;
    });
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    if (/^[0-9\s\-()]*$/.test(val) || val === '') {
      setFormData(prev => ({ ...prev, phone: val }));

      if (val.trim() === '') {
        setPhoneError('Phone number is required');
      } else {
        const digitsOnly = val.replace(/\D/g, '');
        if (digitsOnly.length < 9) {
          setPhoneError('Phone number is too short');
        } else if (digitsOnly.length > 15) {
          setPhoneError('Phone number is too long');
        } else {
          setPhoneError('');
        }
      }
    }
  };

  const currentSuite = SUITE_PREVIEWS[formData.suite];
  const selectedCountry = COUNTRIES.find(c => c.code === formData.phoneCountryCode) || COUNTRIES[0];
  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(phoneSearchQuery.toLowerCase()) ||
    c.code.includes(phoneSearchQuery)
  );

  const digits = formData.phone ? formData.phone.replace(/\D/g, '') : '';
  const isPhoneValid = digits.length >= 9 && digits.length <= 15;
  const hasStoredDetails = !!(user && formData.firstName && formData.email);

  return (
    <div className="booking-form-container">
      {/* Selected Suite Preview Card */}
      <div className="selected-suite-preview-card">
        <div className="preview-image-wrapper">
          <img
            src={currentSuite.image}
            alt={currentSuite.name}
            className="preview-image"
          />
          <div className="preview-gradient-overlay" />
          <div className="preview-suite-info">
            <span className="preview-badge">Selected Residence</span>
            <h3 className="preview-name">{currentSuite.name}</h3>
            <span className="preview-price-tag">
              {currentSuite.price} <span className="preview-price-unit">/ night</span>
            </span>
          </div>
        </div>
      </div>

      <h2 className="form-section-title">Reservation Details</h2>
      <p className="form-section-subtitle">Complete the fields below to customize your luxury stay.</p>

      {/* Suite Selector */}
      <div className="form-group">
        <label className="form-label">Select Your Residence</label>
        <div className="suite-selector-grid">
          <div
            className={`suite-select-card ${formData.suite === 'skyview' ? 'active' : ''}`}
            onClick={() => handleSuiteSelect('skyview')}
          >
            <div className="suite-select-header">
              <span className="suite-select-title">Skyview Hideaway</span>
              <span className="suite-select-price">KES {getSuitePrice('skyview', 'entire').toLocaleString('en-KE')} / night</span>
            </div>
            <p className="suite-select-desc">Penthouse, Panoramic Mt Kenya views</p>
          </div>

          <div
            className={`suite-select-card ${formData.suite === 'cocoa' ? 'active' : ''}`}
            onClick={() => handleSuiteSelect('cocoa')}
          >
            <div className="suite-select-header">
              <span className="suite-select-title">Cocoa Suite</span>
              <span className="suite-select-price">KES {getSuitePrice('cocoa', 'entire').toLocaleString('en-KE')} / night</span>
            </div>
            <p className="suite-select-desc">Luxury living with rich cocoa tones.</p>
          </div>

          <div
            className={`suite-select-card ${formData.suite === 'neema' ? 'active' : ''}`}
            onClick={() => handleSuiteSelect('neema')}
          >
            <div className="suite-select-header">
              <span className="suite-select-title">Neema Haven</span>
              <span className="suite-select-price">KES {getSuitePrice('neema', 'entire').toLocaleString('en-KE')} / night</span>
            </div>
            <p className="suite-select-desc">Peaceful and luxurious retreat.</p>
          </div>
        </div>
      </div>

      {/* Accommodation Type: Entire Apartment vs 1 Bedroom Option */}
      <div className="form-group">
        <label className="form-label">Accommodation Type</label>
        <div className="suite-selector-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <div
            className={`suite-select-card ${(formData.bookingType || 'entire') === 'entire' ? 'active' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, bookingType: 'entire' }))}
          >
            <div className="suite-select-header">
              <span className="suite-select-title">Entire Apartment</span>
              <span className="suite-select-price">KES {getSuitePrice(formData.suite, 'entire').toLocaleString('en-KE')} / night</span>
            </div>
            <p className="suite-select-desc">Full suite access: all bedrooms, living lounge, dining & private kitchen.</p>
          </div>

          <div
            className={`suite-select-card ${formData.bookingType === 'one_bedroom' ? 'active' : ''}`}
            onClick={() => setFormData(prev => ({ 
              ...prev, 
              bookingType: 'one_bedroom',
              adults: Math.min(prev.adults || 1, 3) 
            }))}
          >
            <div className="suite-select-header">
              <span className="suite-select-title">1 Bedroom Option</span>
              <span className="suite-select-price" style={{ color: '#15803D' }}>KES {getSuitePrice(formData.suite, 'one_bedroom').toLocaleString('en-KE')} / night</span>
            </div>
            <p className="suite-select-desc">Master bedroom with luxury ensuite bathroom & exclusive amenities (up to 3 guests).</p>
          </div>
        </div>
      </div>

      {/* Check-In and Check-Out Dates (Homepage Format) */}
      <div className="form-group">
        <label className="form-label">Dates</label>
        <div className="form-group-row">
          <div className="homepage-style-input-group" onClick={() => setIsCalendarOpen(true)} style={{ cursor: 'pointer' }}>
            <label className="filter-label">
              <Calendar size={18} className="filter-icon" />
              <span>Check-in Date</span>
            </label>
            <input
              type="text"
              className="filter-input"
              readOnly
              placeholder="Add date"
              value={formData.checkIn ? formatDateForDisplay(formData.checkIn) : ''}
            />
          </div>

          <div className="homepage-style-input-group" onClick={() => setIsCalendarOpen(true)} style={{ cursor: 'pointer' }}>
            <label className="filter-label">
              <Calendar size={18} className="filter-icon" />
              <span>Check-out Date</span>
            </label>
            <input
              type="text"
              className="filter-input"
              readOnly
              placeholder="Add date"
              value={formData.checkOut ? formatDateForDisplay(formData.checkOut) : ''}
            />
          </div>
        </div>
      </div>

      {/* Guests (Homepage Style Box) */}
      <div className="form-group" style={{ position: 'relative' }}>
        <label className="form-label">Guests</label>
        <div 
          className="homepage-style-input-group guests-trigger-group" 
          onClick={() => setIsGuestDropdownOpen(!isGuestDropdownOpen)}
          style={{ cursor: 'pointer' }}
        >
          <label className="filter-label" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} className="filter-icon" />
              <span>Guests Count</span>
            </span>
            <ChevronDown size={18} className={`dropdown-arrow ${isGuestDropdownOpen ? 'open' : ''}`} />
          </label>
          <input
            type="text"
            className="filter-input"
            readOnly
            value={
              `${formData.adults + (formData.hasChildren ? formData.children : 0)} guest${(formData.adults + (formData.hasChildren ? formData.children : 0)) > 1 ? 's' : ''}` +
              (formData.hasChildren && formData.children > 0 ? `, ${formData.children} child${formData.children > 1 ? 'ren' : ''}` : '')
            }
          />
        </div>

        {/* Guests Dropdown Panel */}
        {isGuestDropdownOpen && (
          <div className="booking-box-guests-dropdown" ref={dropdownRef} style={{ width: '100%', boxSizing: 'border-box' }}>
            <div className="counter-row">
              <div className="counter-label-col">
                <span className="counter-name">Adults</span>
                <span className="counter-sub">Age 13 or above · Max {MAX_ADULTS}</span>
              </div>
              <div className="counter-control-col">
                <button
                  type="button"
                  className="counter-btn"
                  onClick={(e) => { e.stopPropagation(); handleAdultsCount(-1); }}
                  disabled={formData.adults <= 1}
                >
                  −
                </button>
                <span className="counter-value">{formData.adults}</span>
                <button
                  type="button"
                  className="counter-btn"
                  onClick={(e) => { e.stopPropagation(); handleAdultsCount(1); }}
                  disabled={formData.adults >= MAX_ADULTS}
                >
                  +
                </button>
              </div>
            </div>

            {formData.adults === MAX_ADULTS && (
              <div style={{ marginTop: '0.8rem', padding: '0.7rem 1rem', backgroundColor: 'rgba(238,205,92,0.08)', border: '1px solid var(--color-gold-muted)', borderRadius: '6px', fontSize: '0.82rem', color: 'var(--color-gold-light)', lineHeight: 1.5 }}>
                <strong>Peak capacity selected.</strong> A KES {PEAK_SURCHARGE.toLocaleString()} surcharge applies for {MAX_ADULTS} adult guests.
              </div>
            )}

            <div className="dropdown-footer" style={{ marginTop: '1rem' }}>
              <button
                type="button"
                className="dropdown-close-btn"
                onClick={(e) => { e.stopPropagation(); setIsGuestDropdownOpen(false); }}
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Traveling with Children Radio Button Selection */}
      <div className="form-group children-selection-group" style={{ marginBottom: '2rem' }}>
        <label className="checkbox-label-container" style={{ display: 'inline-flex', padding: '1rem', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', cursor: 'pointer', transition: 'var(--transition-fast)' }}>
          <input
            type="checkbox"
            checked={formData.hasChildren}
            onChange={handleChildrenToggle}
            className="checkbox-input"
          />
          <span className="checkbox-custom" style={{ marginRight: '0.8rem' }} />
          <div className="checkbox-text-col">
            <span className="checkbox-label-title" style={{ fontSize: '1rem' }}>Traveling with Children</span>
            <span className="checkbox-label-desc">Ages 2 to 12 years (Special bedding)</span>
          </div>
        </label>
        
        {formData.hasChildren && (
          <div className="counter-row child-counter-row" style={{ marginTop: '1rem', padding: '1.2rem', backgroundColor: 'rgba(238, 205, 92, 0.05)', border: '1px solid var(--color-gold-muted)', borderRadius: '8px' }}>
            <div className="counter-label-col">
              <span className="counter-name">Number of Children</span>
              <span className="counter-sub">How many children are traveling with you?</span>
            </div>
            <div className="counter-control-col">
              <button
                type="button"
                className="counter-btn"
                onClick={(e) => { e.stopPropagation(); handleChildrenCount(-1); }}
                disabled={formData.children <= 0}
              >
                -
              </button>
              <span className="counter-value" style={{ fontSize: '1.1rem' }}>{formData.children}</span>
              <button
                type="button"
                className="counter-btn"
                onClick={(e) => { e.stopPropagation(); handleChildrenCount(1); }}
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 1. Confirm Guest Details Section (Matching Image 1) */}
      <div className="confirm-guest-details-card">
        <div className="confirm-card-header">
          <h2 className="confirm-card-title">1. Confirm guest details</h2>
        </div>

        <div className="welcome-back-banner">
          <span className="welcome-back-tag">WELCOME BACK</span>
          <h3 className="welcome-back-name">
            Hello, {formData.firstName || (user && user.name ? user.name.split(' ')[0] : 'Valued Guest')}
          </h3>
          <p className="welcome-back-subtext">
            We've prepared your details for a seamless reservation. Please review and confirm your contact information below.
          </p>
        </div>

        <hr className="confirm-card-divider" />

        <div className="confirm-card-form">
          <div className="form-group-row">
            <div className="form-group">
              <label className="checkout-label">First Name</label>
              <div className="input-with-icon">
                <User size={16} />
                <input
                  type="text"
                  placeholder="First Name"
                  className="checkout-input"
                  value={formData.firstName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
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
                  placeholder="Last Name"
                  className="checkout-input"
                  value={formData.lastName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
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
                placeholder="email@example.com"
                className="checkout-input"
                value={formData.email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value, confirmEmail: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkout-label">Phone Number (M-Pesa Preferred)</label>
            <div className="phone-input-group" ref={phoneDropdownRef}>
              <div
                className="phone-country-trigger"
                onClick={togglePhoneDropdown}
                style={{ background: '#f3efe6', borderRight: '1px solid #dfd9ce', padding: '0 0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', height: '100%', userSelect: 'none' }}
              >
                <img
                  src={`https://flagcdn.com/w20/${selectedCountry.flag}.png`}
                  alt={selectedCountry.name}
                  className="phone-country-flag"
                />
                <span className="phone-prefix-display" style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: '#2d2b27' }}>{selectedCountry.code}</span>
                <span className="phone-country-arrow">▼</span>
              </div>

              <div className="input-with-icon no-left-padding" style={{ flex: 1, position: 'relative' }}>
                <Phone size={16} style={{ left: '12px' }} />
                <input
                  type="tel"
                  placeholder="712 345 678"
                  className="phone-main-input"
                  style={{ paddingLeft: '38px', height: '48px', border: 'none', background: 'transparent' }}
                  value={formData.phone || ''}
                  onChange={handlePhoneChange}
                  required
                />
              </div>

              {isPhoneDropdownOpen && (
                <div className="phone-country-dropdown" style={{ top: '100%', left: 0 }}>
                  <div className="phone-search-wrapper">
                    <input
                      type="text"
                      placeholder="Search country or code..."
                      className="phone-search-input"
                      value={phoneSearchQuery}
                      onChange={(e) => setPhoneSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  </div>
                  <div className="phone-country-options-list">
                    {filteredCountries.map((c) => (
                      <div
                        key={c.code + c.flag}
                        className={`phone-country-option ${formData.phoneCountryCode === c.code ? 'active' : ''}`}
                        onClick={() => handleCountrySelect(c)}
                      >
                        <img
                          src={`https://flagcdn.com/w20/${c.flag}.png`}
                          alt={c.name}
                          className="phone-option-flag"
                        />
                        <span className="phone-option-name">{c.name}</span>
                        <span className="phone-option-code">{c.code}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {phoneError && <span className="field-error-msg">{phoneError}</span>}
          </div>

          <div className="form-group">
            <label className="checkout-label">Special Requests (Optional)</label>
            <textarea
              rows="4"
              placeholder="Dietary preferences, arrival time, room temperature preferences..."
              className="checkout-textarea"
              value={formData.specialRequests || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
            />
          </div>

          <button
            type="button"
            className="btn-continue-payment"
            onClick={() => {
              const summarySubmitBtn = document.querySelector('.summary-submit-btn');
              if (summarySubmitBtn) {
                summarySubmitBtn.click();
              }
            }}
          >
            CONTINUE TO PAYMENT
          </button>
        </div>
      </div>

      <CustomCalendarModal
        isOpen={isCalendarOpen}
        initialCheckIn={formData.checkIn}
        initialCheckOut={formData.checkOut}
        blockedDates={blockedDates}
        onSelect={(start, end) => setFormData(prev => ({ ...prev, checkIn: start, checkOut: end }))}
        onClose={() => setIsCalendarOpen(false)}
      />
    </div>
  );
}
