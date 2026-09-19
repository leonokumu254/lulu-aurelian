import React, { useState, useEffect } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import CustomCalendarModal from './CustomCalendarModal';
import './Hero.css';

const IMAGES = [
  '/assets/skyview/skyview_1.jpg',
  '/assets/skyview/skyview_13.jpg',
  '/assets/cocoa/cocoa_1.jpg',
  '/assets/skyview/skyview_15.jpg',
  '/assets/cocoa/cocoa_3.jpg',
  '/assets/skyview/skyview_5.jpg'
];

const FULL_LINE1 = "Experience Refined Luxury";
const FULL_LINE2 = "at Lulu Aurelian Estate";
export default function Hero({ onSearch, isPreloaderDone = true }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [error, setError] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // If preloader is active (initial visit or refresh), wait to type.
  // If preloader was skipped (navigation), display full text immediately.
  const [typedLine1, setTypedLine1] = useState(() => isPreloaderDone ? FULL_LINE1 : '');
  const [typedLine2, setTypedLine2] = useState(() => isPreloaderDone ? FULL_LINE2 : '');
  const [typingPhase, setTypingPhase] = useState(() => isPreloaderDone ? 'done' : 'waiting');
  const [cursorVisible, setCursorVisible] = useState(() => !isPreloaderDone);

  // Background Carousel rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Accessibility: respect reduced motion preferences
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTypedLine1(FULL_LINE1);
      setTypedLine2(FULL_LINE2);
      setTypingPhase('done');
      setCursorVisible(false);
    }
  }, []);

  // Start typing when preloader completes
  useEffect(() => {
    if (!isPreloaderDone || typingPhase !== 'waiting') return;

    // Quick, clean pause after preloader finishes exit fade
    const startTimeout = setTimeout(() => {
      setTypingPhase('line1');
    }, 140);

    return () => clearTimeout(startTimeout);
  }, [isPreloaderDone, typingPhase]);

  // Typewriter effect for Line 1 ("Experience Refined Luxury")
  useEffect(() => {
    if (typingPhase !== 'line1') return;

    if (typedLine1.length < FULL_LINE1.length) {
      const charTimer = setTimeout(() => {
        setTypedLine1(FULL_LINE1.slice(0, typedLine1.length + 1));
      }, 26); // Fast, crisp typing cadence (~26ms per char)
      return () => clearTimeout(charTimer);
    } else {
      // Line 1 finished — brief pause before starting Line 2
      const pauseTimer = setTimeout(() => {
        setTypingPhase('line2');
      }, 120);
      return () => clearTimeout(pauseTimer);
    }
  }, [typingPhase, typedLine1]);

  // Typewriter effect for Line 2 ("at Lulu Aurelian Estate")
  useEffect(() => {
    if (typingPhase !== 'line2') return;

    if (typedLine2.length < FULL_LINE2.length) {
      const charTimer = setTimeout(() => {
        setTypedLine2(FULL_LINE2.slice(0, typedLine2.length + 1));
      }, 26); // Fast, crisp typing cadence (~26ms per char)
      return () => clearTimeout(charTimer);
    } else {
      // Typing completed!
      setTypingPhase('done');

      // Cursor blinks for 800ms then dissolves
      const cursorTimer = setTimeout(() => {
        setCursorVisible(false);
      }, 800);
      return () => clearTimeout(cursorTimer);
    }
  }, [typingPhase, typedLine2]);

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

      {/* Hero Content with Typewriter Headline */}
      <div className="hero-content container no-reveal">
        <h1 className="hero-title" aria-label="Experience Refined Luxury at Lulu Aurelian Estate">
          <span className="sr-only">Experience Refined Luxury at Lulu Aurelian Estate</span>
          <span className="hero-title-line1">
            {typedLine1}
            {typingPhase === 'line1' && (
              <span className="hero-typewriter-cursor" />
            )}
          </span>
          {(typedLine1.length === FULL_LINE1.length || typingPhase === 'line2' || typingPhase === 'done') && <br />}
          <span className="hero-title-accent">
            {typedLine2}
            {(typingPhase === 'line2' || (typingPhase === 'done' && cursorVisible)) && (
              <span className="hero-typewriter-cursor" />
            )}
          </span>
        </h1>
        <p className="hero-description">
          Discover a curated collection of premium suites tailored to offer you a sanctuary of modern elegance, comfort, and personalized hospitality.
        </p>
      </div>

      {/* Glassmorphic Search Bar */}
      <div className="hero-filter-container container no-reveal">
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
