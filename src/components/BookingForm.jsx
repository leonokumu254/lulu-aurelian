import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Users, Info, Shield, ChevronDown, AlertCircle } from 'lucide-react';
import CustomCalendarModal from './CustomCalendarModal';
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
  const hasStoredDetails = !!(user && formData.firstName && formData.lastName && formData.email && formData.phone && isPhoneValid && !phoneError);

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
              <span className="suite-select-price">KES 5,500 / night</span>
            </div>
            <p className="suite-select-desc">Penthouse, Panoramic Mt Kenya views</p>
          </div>

          <div
            className={`suite-select-card ${formData.suite === 'cocoa' ? 'active' : ''}`}
            onClick={() => handleSuiteSelect('cocoa')}
          >
            <div className="suite-select-header">
              <span className="suite-select-title">Cocoa Suite</span>
              <span className="suite-select-price">KES 5,000 / night</span>
            </div>
            <p className="suite-select-desc">Luxury living with rich cocoa tones.</p>
          </div>
        </div>
      </div>

      {/* Dates & Guests (Airbnb Box) */}
      <div className="form-group">
        <label className="form-label">Dates & Guests</label>
        <div className="airbnb-booking-box">
          {/* Top Row: Dates */}
          <div className="booking-box-dates" onClick={() => setIsCalendarOpen(true)}>
            <div className="booking-box-col check-in">
              <span className="booking-box-label">CHECK-IN</span>
              <span className={`booking-box-value ${!formData.checkIn ? 'placeholder' : ''}`}>
                {formatDateForDisplay(formData.checkIn)}
              </span>
            </div>

            <div className="booking-box-col-divider" />

            <div className="booking-box-col check-out">
              <span className="booking-box-label">CHECKOUT</span>
              <span className={`booking-box-value ${!formData.checkOut ? 'placeholder' : ''}`}>
                {formatDateForDisplay(formData.checkOut)}
              </span>
            </div>
          </div>

          <div className="booking-box-row-divider" />

          {/* Bottom Row: Guests Trigger */}
          <div
            className="booking-box-guests-trigger"
            onClick={() => setIsGuestDropdownOpen(!isGuestDropdownOpen)}
          >
            <div className="booking-box-guests-content">
              <span className="booking-box-label">GUESTS</span>
              <span className="booking-box-value">
                {formData.adults + (formData.hasChildren ? formData.children : 0)} guest
                {(formData.adults + (formData.hasChildren ? formData.children : 0)) > 1 ? 's' : ''}
                {formData.hasChildren && formData.children > 0 ? `, ${formData.children} child${formData.children > 1 ? 'ren' : ''}` : ''}
              </span>
            </div>
            <ChevronDown size={18} className={`dropdown-arrow ${isGuestDropdownOpen ? 'open' : ''}`} />
          </div>

          {/* Guests Dropdown Panel */}
          {isGuestDropdownOpen && (
            <div className="booking-box-guests-dropdown" ref={dropdownRef}>
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

              {/* Peak surcharge notice */}
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

      {/* Contact Information */}
      <div className="form-group-divider" />
      <h2 className="form-section-title">Personal Information</h2>
      <p style={{ fontSize: '1rem', fontStyle: 'italic', color: 'var(--color-gold-deep)', marginBottom: '1.5rem', fontWeight: 500 }}>"We hate paperwork too"</p>

      {hasStoredDetails && !isEditingProfile ? (
        <div className="confirmed-details-container glass">
          <div className="confirmed-details-header">
            <Shield size={16} className="verified-icon" />
            <span>Profile Details</span>
          </div>
          <div className="confirmed-details-grid">
            <div className="detail-item">
              <span className="detail-label">Name</span>
              <span className="detail-value">{formData.firstName} {formData.lastName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email Address</span>
              <span className="detail-value">{formData.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Phone Number</span>
              <span className="detail-value">{formData.phoneCountryCode} {formData.phone}</span>
            </div>
          </div>
          <button
            type="button"
            className="btn-edit-details"
            onClick={() => setIsEditingProfile(true)}
          >
            Modify Details
          </button>
        </div>
      ) : (
        <>
          <div className="form-group-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                placeholder="e.g. Alexander"
                className="form-input text-input"
                value={formData.firstName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                placeholder="e.g. Mercer"
                className="form-input text-input"
                value={formData.lastName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                placeholder="alexander@domain.com"
                className="form-input text-input"
                value={formData.email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Email Address</label>
              <input
                type="email"
                placeholder="alexander@domain.com"
                className={`form-input text-input ${formData.email && formData.confirmEmail && formData.email.toLowerCase() !== formData.confirmEmail.toLowerCase() ? 'input-error' : ''}`}
                value={formData.confirmEmail || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmEmail: e.target.value }))}
                required
              />
              {formData.email && formData.confirmEmail && formData.email.toLowerCase() !== formData.confirmEmail.toLowerCase() && (
                <span className="field-error-msg">Email addresses do not match</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div
              className={`phone-input-wrapper ${phoneError ? 'input-error' : ''}`}
              ref={phoneDropdownRef}
            >
              <div
                className="phone-country-trigger"
                onClick={togglePhoneDropdown}
              >
                <img
                  src={`https://flagcdn.com/w20/${selectedCountry.flag}.png`}
                  alt={selectedCountry.name}
                  className="phone-country-flag"
                />
                <span className="phone-country-arrow">▼</span>
              </div>

              <div className="phone-divider" />

              <span className="phone-prefix-display">{selectedCountry.code}</span>

              <input
                type="tel"
                placeholder="712 123456"
                className="phone-main-input"
                value={formData.phone || ''}
                onChange={handlePhoneChange}
                required
              />

              {phoneError && (
                <div className="phone-error-icon-container">
                  <AlertCircle size={18} className="phone-error-icon" />
                </div>
              )}

              {isPhoneDropdownOpen && (
                <div className="phone-country-dropdown">
                  <div className="phone-search-wrapper">
                    <input
                      type="text"
                      placeholder="Search country or code..."
                      className="phone-search-input"
                      value={phoneSearchQuery}
                      onChange={(e) => setPhoneSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()} // Prevent closing dropdown on search box click
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
                    {filteredCountries.length === 0 && (
                      <div className="phone-no-results">No countries found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {phoneError && (
              <span className="field-error-msg">{phoneError}</span>
            )}
          </div>

          {user && (
            <button
              type="button"
              className="btn-edit-details"
              style={{ marginTop: '0.5rem', display: 'block' }}
              onClick={() => setIsEditingProfile(false)}
            >
              Lock Details
            </button>
          )}
        </>
      )}

      <div className="form-group">
        <label className="form-label">Special Requests (Optional)</label>
        <textarea
          rows="4"
          placeholder="Early check-in requests, special pillow selection, etc."
          className="form-input text-textarea"
          value={formData.specialRequests}
          onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
        />
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
