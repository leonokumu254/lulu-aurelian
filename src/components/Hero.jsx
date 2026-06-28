import React, { useState, useEffect } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import CustomCalendarModal from './CustomCalendarModal';
import './Hero.css';

const IMAGES = [
  '/assets/skyview/skyview_13.jpg',
  '/assets/skyview/skyview_1.jpg',
  '/assets/cocoa/cocoa_1.jpg',
  '/assets/skyview/skyview_15.jpg',
  '/assets/cocoa/cocoa_3.jpg',
  '/assets/skyview/skyview_5.jpg'
  
];

export default function Hero({ onSearch }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [error, setError] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev +1) % IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Today's date in YYYY-MM-DD format to set min attribute
  const today = new Date().toISOString().split('T')[0];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      setError('Please select both Check-in and Check-out dates');
      return;
    }
    if (new Date(checkIn) >= new Date(checkOut)) {
      setError('Check-out date must be after Check-in date');
      return;
    }
    setError('');
    onSearch(checkIn, checkOut);
  };

  const handleCalendarSelect = (start, end) => {
    setCheckIn(start);
    setCheckOut(end);
  };

  return (
    <div className="hero-section" id="home-hero">
      {/* Background Carousel */}
      <div className="hero-carousel-container">
        {IMAGES.map((img, idx) => (
          <div
            key={idx}
            className={`hero-slide ${idx === currentIdx ? 'active' : ''}`}
            style={{ 
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.5)), url(${img})` 
            }}
          />
        ))}
         
      </div>

      {/* Hero Content */}
      <div className="hero-content container no-reveal hero-text-reveal">
        {/* <span className="hero-tagline">Exquisite Stays • Timeless Living</span>  */}
        <h1 className="hero-title">
          Experience Refined Luxury <br />
          <span>at Lulu Aurelian Estate</span>
        </h1>
        <p className="hero-description">
          Discover a curated collection of premium suites tailored to offer you a sanctuary of modern elegance, comfort, and personalized hospitality.
        </p>
      </div>


      {/* Glassmorphic Search Bar */}
<div className="hero-filter-container container no-reveal hero-text-reveal-delayed">
  <form className="hero-filter-bar " onSubmit={handleSearch}>
    {/* Added 'floating-glass' class here */}
    <div className="filter-input-group floating-glass" onClick={() => setIsCalendarOpen(true)} style={{ cursor: 'pointer' }}>
      <label className="filter-label">
        <Calendar size={20} className="filter-icon" />
        <span>Check-in Date</span>
      </label>
      <input
        type="text"
        className="filter-input"
        readOnly
        placeholder="Add date"
        value={checkIn}
      />
    </div>

    <div className="filter-divider" />

    <div className="filter-input-group floating-glass" onClick={() => setIsCalendarOpen(true)} style={{ cursor: 'pointer' }}>
      <label className="filter-label">
        <Calendar size={20} className="filter-icon" />
        <span>Check-out Date</span>
      </label>
      <input
        type="text"
        className="filter-input"
        readOnly
        placeholder="Add date"
        value={checkOut}
      />
    </div>

    <button type="submit" className="hero-reserve-btn">
      <span>Reserve</span>
      <ArrowRight size={16} />
    </button>
  </form>
  {error && <p className="filter-error-msg">{error}</p>}
</div>

      <CustomCalendarModal 
        isOpen={isCalendarOpen}
        initialCheckIn={checkIn}
        initialCheckOut={checkOut}
        onSelect={handleCalendarSelect}
        onClose={() => setIsCalendarOpen(false)}
      />
    </div>
  );
}
