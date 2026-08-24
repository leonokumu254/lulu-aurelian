import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Wifi, Utensils, Bed, Car, Map, ChevronLeft, ChevronRight, Grid, X, Star, Users, Maximize, ExternalLink, ChevronDown, Calendar } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import CustomCalendarModal from './CustomCalendarModal';
import Reviews from './Reviews';
import './UnitPage.css';

const UNIT_DATA = {
  skyview: {
    id: 'skyview',
    name: 'Skyview Hideaway',
    tagline: 'Elevated luxury with Mt. Kenya panoramas',
    price: 5500,
    guests: 'Up to 4 Guests',
    beds: '2 King Bedrooms',
    desc: 'Located on the top floor, this elegant 2-bedroom apartment offers a quiet, private retreat for professionals and travelers, complete with a balcony featuring stunning Mt. Kenya views. Designed for both short and extended stays, the space includes a dedicated workspace, fast Wi-Fi, a fully equipped modern kitchen, secure self-check-in, and free parking.',
    highlights: [
      'Top floor with panoramic Mt. Kenya views',
      'Private balcony with lounge seating',
      'Dedicated workspace for remote professionals',
      'Secure keyless self-check-in',
      'Free covered parking'
    ],
    amenities: [
      { icon: 'map', text: 'Mt Kenya View' },
      { icon: 'wifi', text: '40 Mbps Wi-Fi' },
      { icon: 'utensils', text: 'Fully Equipped Kitchen' },
      { icon: 'bed', text: 'Quality Linen' },
      { icon: 'car', text: 'Secure Parking' }
    ],
    images: [
      './assets/skyview/skyview_1.jpg',
      './assets/skyview/skyview_12.avif',
      './assets/skyview/skyview_2.jpg',
      './assets/skyview/skyview_5.jpg',
      './assets/skyview/skyview_15.jpg',
      './assets/skyview/skyview_28.jpeg',
      './assets/skyview/skyview_25.jpg',
      './assets/skyview/skyview_6.jpg',
      './assets/skyview/skyview_7.jpg',
      './assets/skyview/skyview_13.jpg',
      './assets/skyview/skyview_10.jpg'
    ],
    alts: [
      'Lulu Aurelian Estate Skyview Hideaway living room with panoramic windows and elegant sofa seating in Nyeri, Kenya.',
      'Lulu Aurelian Estate Skyview Hideaway bright living area with natural light and dedicated workspace in Nyeri, Kenya.',
      'Lulu Aurelian Estate Skyview Hideaway modern living space with smart TV and premium furnishings in Nyeri, Kenya.',
      'Lulu Aurelian Estate Skyview Hideaway cozy lounge corner with chic decor and mountain views in Nyeri, Kenya.',
      'Lulu Aurelian Estate Skyview Hideaway guest bedroom with premium queen bed and serene lighting in Nyeri, Kenya.',
      'Lulu Aurelian Estate Skyview Hideaway full exterior view showcasing modern architecture and secure parking in Nyeri, Kenya.',
      'Lulu Aurelian Estate Skyview Hideaway private balcony with comfortable lounge seating and skyline views in Nyeri, Kenya.',
      'Lulu Aurelian Estate Skyview Hideaway open-plan dining area with elegant dining set and tasteful art in Nyeri, Kenya.',
      'Lulu Aurelian Estate Skyview Hideaway interior hallway with spotless finishes and warm ambient lighting in Nyeri, Kenya.',
      'Lulu Aurelian Estate Skyview Hideaway primary bedroom with king size bed and scenic panoramic window views in Nyeri, Kenya.',
      'Lulu Aurelian Estate Skyview Hideaway primary bedroom angle showing spacious layout and modern wardrobe in Nyeri, Kenya.'
    ],
    airbnbUrl: 'https://www.airbnb.com/h/pearlapartmentsnyeri',
    bookingUrl: 'https://www.booking.com/Share-F7S7E5V'
  },
  cocoa: {
    id: 'cocoa',
    name: 'Cocoa Retreat',
    tagline: 'Warm earthy luxury in the heart of Nyeri',
    price: 5000,
    guests: 'Up to 4 Guests',
    beds: '2 Queen Bedrooms',
    desc: 'Experience the warm, sophisticated ambiance of Cocoa Retreat. Styled in rich earthy tones, this fully-equipped luxury sanctuary offers premium linens, a modern kitchen, and high-speed Wi-Fi. It is the perfect serene escape for families, couples, and executives seeking refined comfort and secure privacy.',
    highlights: [
      'Rich earthy cocoa-toned interiors',
      'Perfect for families and couples',
      'Premium queen-size beds with luxury linens',
      'Quiet neighborhood with pine forest views',
      'Free secure parking'
    ],
    amenities: [
      { icon: 'wifi', text: '40 Mbps Wi-Fi' },
      { icon: 'utensils', text: 'Fully Equipped Kitchen' },
      { icon: 'bed', text: 'Quality Linen' },
      { icon: 'car', text: 'Secure Parking' }
    ],
    images: [
      './assets/cocoa/cocoa_1.jpg',
      './assets/cocoa/cocoa_18.jpeg',
      './assets/cocoa/cocoa_21.jpeg',
      './assets/cocoa/cocoa_26.jpeg',
      './assets/cocoa/cocoa_13.avif',
      './assets/cocoa/cocoa_2.jpg',
      './assets/cocoa/cocoa_3.jpg',
      './assets/cocoa/cocoa_12.avif',
      './assets/cocoa/cocoa_15.avif'
    ],
    alts: [
      'Lulu Aurelian Estate Cocoa Retreat living area with cozy premium furnishings and warm ambient lighting in Nyeri, Kenya.',
      'Lulu Aurelian Estate Cocoa Retreat well-lit interior showing plush seating and earthy aesthetic decor in Nyeri, Kenya.',
      'Lulu Aurelian Estate Cocoa Retreat elegant dining space with sturdy wooden table and comfortable chairs in Nyeri, Kenya.',
      'Lulu Aurelian Estate Cocoa Retreat exterior facade highlighting secure entry and quiet neighborhood setting in Nyeri, Kenya.',
      'Lulu Aurelian Estate Cocoa Retreat primary bedroom with plush king size bed and crisp luxury linens in Nyeri, Kenya.',
      'Lulu Aurelian Estate Cocoa Retreat secondary living space angle with pristine floors and natural light in Nyeri, Kenya.',
      'Lulu Aurelian Estate Cocoa Retreat beautifully appointed bedroom with serene color palette and soft lighting in Nyeri, Kenya.',
      'Lulu Aurelian Estate Cocoa Retreat full bathroom with soothing modern design and spotless glass shower in Nyeri, Kenya.',
      'Lulu Aurelian Estate Cocoa Retreat guest bedroom with premium bedding and dedicated storage space in Nyeri, Kenya.'
    ],
    airbnbUrl: 'https://www.airbnb.com/h/cocoapearlapartment',
    bookingUrl: 'https://www.booking.com/Share-KWW4dvn'
  },
  neema: {
    id: 'neema',
    name: 'Neema',
    tagline: 'A peaceful and luxurious retreat',
    price: 5000,
    guests: 'Up to 4 Guests',
    beds: '2 Bedrooms',
    desc: 'Experience a peaceful and luxurious retreat at Neema. This fully-equipped luxury sanctuary offers premium linens, a modern kitchen, and high-speed Wi-Fi. It is the perfect serene escape for families, couples, and executives seeking refined comfort and secure privacy.',
    highlights: [
      'Peaceful and luxurious environment',
      'Perfect for families and couples',
      'Premium beds with luxury linens',
      'Modern fully-equipped kitchen',
      'Free secure parking'
    ],
    amenities: [
      { icon: 'wifi', text: '40 Mbps Wi-Fi' },
      { icon: 'utensils', text: 'Fully Equipped Kitchen' },
      { icon: 'bed', text: 'Quality Linen' },
      { icon: 'car', text: 'Secure Parking' }
    ],
    images: [
      './assets/Neema/neema_1.jpeg',
      './assets/Neema/neema_kitchen.jpeg',
      './assets/Neema/neema_bathroom.jpeg',
      './assets/Neema/neema_2.jpeg',
      './assets/Neema/neema_3.jpeg',
      './assets/Neema/neema_4.jpeg'
    ],
    alts: [
      'Lulu Aurelian Estate Neema Haven tranquil living room with modern seating and bright airy windows in Nyeri, Kenya.',
      'Lulu Aurelian Estate Neema Haven fully equipped kitchen with sleek countertops and premium appliances in Nyeri, Kenya.',
      'Lulu Aurelian Estate Neema Haven pristine bathroom with high-end fixtures and spotless tiling in Nyeri, Kenya.',
      'Lulu Aurelian Estate Neema Haven primary bedroom featuring a king-size bed and luxurious crisp linens in Nyeri, Kenya.',
      'Lulu Aurelian Estate Neema Haven guest bedroom with comfortable queen bed and serene atmosphere in Nyeri, Kenya.',
      'Lulu Aurelian Estate Neema Haven inviting dining area with contemporary table setting and tasteful decor in Nyeri, Kenya.'
    ],
    airbnbUrl: '/',
    bookingUrl: '/'
  }
};

const ICON_MAP = {
  map: Map,
  wifi: Wifi,
  utensils: Utensils,
  bed: Bed,
  car: Car,
};

export default function UnitPage({ unitId }) {
  const unit = UNIT_DATA[unitId];
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const scrollRef = useRef(null);
  const dropdownRef = useRef(null);

  // Booking states
  const getQueryParam = (name) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  };

  const [checkIn, setCheckIn] = useState(getQueryParam('checkIn'));
  const [checkOut, setCheckOut] = useState(getQueryParam('checkOut'));
  const [adults, setAdults] = useState(parseInt(getQueryParam('adults'), 10) || 1);
  const [children, setChildren] = useState(parseInt(getQueryParam('children'), 10) || 0);
  const [hasChildren, setHasChildren] = useState(getQueryParam('hasChildren') === '1');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);
  const [blockedDates, setBlockedDates] = useState([]);

  // Fetch blocked dates for current unit
  useEffect(() => {
    if (unit && unit.id) {
      setBlockedDates([]);
      fetch(`${import.meta.env.VITE_API_URL || ''}/api/bookings/blocked-dates/${unit.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setBlockedDates(data.blockedDates);
        })
        .catch(err => console.error('Failed to fetch blocked dates:', err));
    }
  }, [unitId]);

  // Click outside to close guest dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsGuestDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!unit) {
    return (
      <div className="unit-page-error">
        <h1>Unit not found</h1>
        <a href="/" className="btn-primary">Go Home</a>
      </div>
    );
  }

  // MPA routing adapter for Header/Footer
  const handleNavigation = (pageId) => {
    if (pageId === 'home') window.location.href = '/';
    else if (pageId === 'booking') window.location.href = '/#/booking';
    else if (pageId === 'portal') window.location.href = '/#/portal';
    else if (pageId === 'offers') window.location.href = '/#/offers';
  };

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % unit.images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [unit.images.length]);

  // Scroll carousel on index change
  useEffect(() => {
    if (scrollRef.current) {
      const width = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({ left: width * activeIndex, behavior: 'smooth' });
    }
  }, [activeIndex]);

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.clientWidth;
    if (width > 0) {
      setActiveIndex(Math.round(scrollLeft / width));
    }
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'unset';
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (!lightboxOpen) return;
      if (e.key === 'ArrowLeft') setLightboxIndex(prev => (prev === 0 ? unit.images.length - 1 : prev - 1));
      if (e.key === 'ArrowRight') setLightboxIndex(prev => (prev + 1) % unit.images.length);
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, unit.images.length]);

  // Calculations for booking widget
  const formatDisplayDate = (str) => {
    if (!str) return 'Add date';
    const [y, m, d] = str.split('-');
    return `${m}/${d}/${y.slice(-2)}`;
  };

  let nights = 0;
  if (checkIn && checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (end > start) {
      const diffTime = Math.abs(end - start);
      nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  }

  const baseCost = unit.price * nights;
  
  // Weekly/Monthly discount
  let discountPercent = 0;
  if (nights >= 30) discountPercent = 20;
  else if (nights >= 7) discountPercent = 10;
  else if (nights >= 3) discountPercent = 5;
  const lengthDiscountValue = baseCost * (discountPercent / 100);

  // Surcharges
  const maxAdults = 5;
  const isPeakSurcharge = adults === maxAdults;
  const peakSurchargeAmount = isPeakSurcharge ? 1500 : 0;

  const totalCost = Math.max(0, baseCost - lengthDiscountValue) + peakSurchargeAmount;

  const handleBookingCTA = () => {
    if (nights === 0) {
      setIsCalendarOpen(true);
    } else {
      window.location.href = `/#/checkout?suite=${unit.id}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}&hasChildren=${hasChildren ? 1 : 0}`;
    }
  };

  return (
    <div className="unit-page app-root">
      {/* GLOBAL HEADER — dynamically shows back arrow + unit name */}
      <Header 
        page="unit" 
        setPage={handleNavigation} 
        authUser={null} 
        onLogout={() => {}} 
        unitName={unit.name}
      />

      {/* HERO IMAGE GALLERY */}
      <section className="unit-hero-section">

        {/* Desktop Mosaic Grid */}
        <div className="unit-mosaic">
          <div className="mosaic-main" onClick={() => openLightbox(0)}>
            <img src={unit.images[0]} alt={unit.alts ? unit.alts[0] : `${unit.name} — main view of this luxury Airbnb in Nyeri`} />
          </div>
          <div className="mosaic-grid">
            {unit.images.slice(1, 5).map((img, i) => (
              <div key={i} className="mosaic-thumb" onClick={() => openLightbox(i + 1)}>
                <img src={img} alt={unit.alts ? unit.alts[i + 1] : `${unit.name} — interior view ${i + 2}`} />
              </div>
            ))}
            <button className="mosaic-show-all" onClick={() => openLightbox(0)}>
              <Grid size={16} />
              <span>Show all photos</span>
            </button>
          </div>
        </div>

        {/* Mobile Carousel */}
        <div className="unit-mobile-carousel">
          <div className="unit-carousel-scroll" ref={scrollRef} onScroll={handleScroll}>
            {unit.images.map((img, i) => (
              <div key={i} className="unit-carousel-slide" onClick={() => openLightbox(i)}>
                <img src={img} alt={unit.alts ? unit.alts[i] : `${unit.name} — view ${i + 1}`} />
              </div>
            ))}
          </div>
          <div className="unit-carousel-dots">
            {unit.images.map((_, i) => (
              <span key={i} className={`carousel-dot ${i === activeIndex ? 'active' : ''}`} />
            ))}
          </div>
          <div className="unit-carousel-counter">{activeIndex + 1} / {unit.images.length}</div>
        </div>
      </section>

      {/* CONTENT */}
      <main className="unit-main">
        <div className="unit-content-grid">

          {/* LEFT: Details */}
          <div className="unit-details">
            <div className="unit-title-block">
              <span className="unit-tagline">{unit.tagline}</span>
              <h1 className="unit-name">
                <span className="name-primary">{unit.name.split(' ')[0]}</span>{' '}
                <span className="name-secondary">{unit.name.split(' ').slice(1).join(' ')}</span>
              </h1>
              <div className="unit-specs">
                <span><Users size={16} /> {unit.guests}</span>
                <span className="spec-dot">•</span>
                <span><Bed size={16} /> {unit.beds}</span>
              </div>
            </div>

            <div className="unit-separator" />

            <div className="unit-description-block">
              <h2>About this space</h2>
              <p>{unit.desc}</p>
            </div>

            <div className="unit-separator" />

            <div className="unit-highlights-block">
              <h2>What makes this special</h2>
              <ul className="unit-highlights-list">
                {unit.highlights.map((h, i) => (
                  <li key={i}>
                    <Star size={14} className="highlight-star" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="unit-separator" />

            <div className="unit-amenities-block">
              <h2>Amenities</h2>
              <div className="unit-amenities-grid">
                {unit.amenities.map((a, i) => {
                  const IconComp = ICON_MAP[a.icon] || Wifi;
                  return (
                    <div key={i} className="unit-amenity-item">
                      <IconComp size={20} />
                      <span>{a.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Booking Card (sticky) */}
          <aside className="unit-booking-card glass" id="booking-card">
            <div className="booking-card-price">
              <span className="price-amount">KES {unit.price.toLocaleString('en-KE')}</span>
              <span className="price-per">/ night</span>
            </div>

            {/* Interactive Inputs */}
            <div className="booking-widget-inputs">
              {/* Dates grid */}
              <div className="widget-dates-grid" onClick={() => setIsCalendarOpen(true)}>
                <div className="widget-date-field checkin">
                  <span className="field-label">CHECK-IN</span>
                  <span className={`field-value ${checkIn ? 'has-val' : ''}`}>
                    {checkIn ? formatDisplayDate(checkIn) : 'Add date'}
                  </span>
                </div>
                <div className="widget-date-field checkout">
                  <span className="field-label">CHECKOUT</span>
                  <span className={`field-value ${checkOut ? 'has-val' : ''}`}>
                    {checkOut ? formatDisplayDate(checkOut) : 'Add date'}
                  </span>
                </div>
              </div>

              {/* Guest selector dropdown trigger */}
              <div className="widget-guests-container" ref={dropdownRef}>
                <div 
                  className="widget-guests-trigger" 
                  onClick={() => setIsGuestDropdownOpen(!isGuestDropdownOpen)}
                >
                  <div className="guests-trigger-text">
                    <span className="field-label">GUESTS</span>
                    <span className="field-value">
                      {adults} guest{adults !== 1 ? 's' : ''}
                      {children > 0 ? `, ${children} child${children !== 1 ? 'ren' : ''}` : ''}
                    </span>
                  </div>
                  <ChevronDown size={18} className={`guests-trigger-arrow ${isGuestDropdownOpen ? 'open' : ''}`} />
                </div>

                {isGuestDropdownOpen && (
                  <div className="widget-guests-dropdown glass animate-fade-in">
                    <div className="guest-row">
                      <div className="guest-row-info">
                        <span className="guest-label">Adults</span>
                        <span className="guest-sublabel">Age 13 or above</span>
                      </div>
                      <div className="guest-counter">
                        <button 
                          className="counter-btn" 
                          onClick={() => setAdults(prev => Math.max(1, prev - 1))}
                          disabled={adults <= 1}
                        >
                          -
                        </button>
                        <span className="counter-val">{adults}</span>
                        <button 
                          className="counter-btn" 
                          onClick={() => setAdults(prev => Math.min(5, prev + 1))}
                          disabled={adults >= 5}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="guest-row">
                      <div className="guest-row-info">
                        <span className="guest-label">Children</span>
                        <span className="guest-sublabel">Ages 2 – 12</span>
                      </div>
                      <div className="guest-counter">
                        <button 
                          className="counter-btn" 
                          onClick={() => setChildren(prev => Math.max(0, prev - 1))}
                          disabled={children <= 0}
                        >
                          -
                        </button>
                        <span className="counter-val">{children}</span>
                        <button 
                          className="counter-btn" 
                          onClick={() => setChildren(prev => Math.min(4, prev + 1))}
                          disabled={children >= 4}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="guest-dropdown-note">
                      Max 5 guests. Peak surcharge applies for 5 adults.
                    </div>

                    <button 
                      className="btn-primary guest-apply-btn"
                      onClick={() => setIsGuestDropdownOpen(false)}
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Surcharge Alert */}
            {isPeakSurcharge && (
              <div className="widget-surcharge-alert animate-fade-in">
                <strong>Peak capacity selected.</strong> A KES 1,500 surcharge applies for 5 adults.
              </div>
            )}

            {/* Call to Action Button */}
            <button 
              onClick={handleBookingCTA} 
              className="btn-primary booking-card-btn widget-cta-btn"
            >
              {nights > 0 ? 'Reserve' : 'Check Availability'}
            </button>

            {/* Price breakdown details */}
            {nights > 0 && (
              <div className="widget-price-breakdown animate-fade-in">
                <p className="breakdown-subtitle">You won't be charged yet</p>
                <div className="breakdown-row">
                  <span>KES {unit.price.toLocaleString('en-KE')} x {nights} night{nights !== 1 ? 's' : ''}</span>
                  <span>KES {baseCost.toLocaleString('en-KE')}</span>
                </div>
                {lengthDiscountValue > 0 && (
                  <div className="breakdown-row discount">
                    <span>{discountPercent}% Length discount</span>
                    <span>- KES {lengthDiscountValue.toLocaleString('en-KE')}</span>
                  </div>
                )}
                {isPeakSurcharge && (
                  <div className="breakdown-row surcharge">
                    <span>5-guest peak surcharge</span>
                    <span>KES {peakSurchargeAmount.toLocaleString('en-KE')}</span>
                  </div>
                )}
                <div className="breakdown-divider" />
                <div className="breakdown-row total">
                  <span>Total before taxes</span>
                  <span>KES {totalCost.toLocaleString('en-KE')}</span>
                </div>
              </div>
            )}

            {(unit.airbnbUrl !== '/' || unit.bookingUrl !== '/') && (
            <div className="booking-card-channels">
              <span className="channels-label">Or book via:</span>
              <div className="channels-links">
                {unit.airbnbUrl !== '/' && (
                  <a href={unit.airbnbUrl} target="_blank" rel="noopener noreferrer" className="channel-link channel-airbnb">
                    <img src="/Airbnb--Streamline-Svg-Logos.svg" alt="Airbnb" />
                  </a>
                )}
                {unit.bookingUrl !== '/' && (
                  <a href={unit.bookingUrl} target="_blank" rel="noopener noreferrer" className="channel-link channel-booking">
                    <img src="/bookingcom-logo-svgrepo-com.svg" alt="Booking.com" />
                  </a>
                )}
              </div>
            </div>
            )}

            <div className="booking-card-note">
              <p>✓ Free cancellation · ✓ Instant confirmation</p>
            </div>
          </aside>
        </div>

        {/* REVIEWS SECTION */}
        <div className="unit-separator" />
        <div className="unit-reviews-container">
          <Reviews unitId={unit.id} />
        </div>
      </main>

      {/* Mobile Sticky CTA Bar */}
      <div className="mobile-sticky-cta-bar glass">
        <div className="mobile-cta-price">
          <span className="price-val">KES {unit.price.toLocaleString('en-KE')}</span>
          <span className="price-unit">/ night</span>
          {nights > 0 && <span className="price-nights-label"> · {nights} {nights === 1 ? 'night' : 'nights'}</span>}
        </div>
        <button onClick={handleBookingCTA} className="btn-primary mobile-cta-button">
          {nights > 0 ? 'Reserve' : 'Select dates'}
        </button>
      </div>

      {/* Calendar Modal Trigger */}
      <CustomCalendarModal
        isOpen={isCalendarOpen}
        initialCheckIn={checkIn}
        initialCheckOut={checkOut}
        onSelect={(start, end) => {
          setCheckIn(start);
          setCheckOut(end);
        }}
        onClose={() => setIsCalendarOpen(false)}
        blockedDates={blockedDates}
      />

      {/* GLOBAL FOOTER */}
      <Footer setPage={handleNavigation} />

      {/* LIGHTBOX */}
      {lightboxOpen && (
        <div className="unit-lightbox-overlay" onClick={closeLightbox}>
          <button className="unit-lightbox-close" onClick={closeLightbox}>
            <X size={24} />
          </button>
          <div className="unit-lightbox-content">
            <button className="unit-lightbox-arrow prev" onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => (prev === 0 ? unit.images.length - 1 : prev - 1)); }}>
              <ChevronLeft size={36} />
            </button>
            <div className="unit-lightbox-img-wrap" onClick={(e) => e.stopPropagation()}>
              <img src={unit.images[lightboxIndex]} alt={unit.alts ? unit.alts[lightboxIndex] : `${unit.name} — photo ${lightboxIndex + 1}`} />
            </div>
            <button className="unit-lightbox-arrow next" onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => (prev + 1) % unit.images.length); }}>
              <ChevronRight size={36} />
            </button>
          </div>
          <div className="unit-lightbox-counter">{lightboxIndex + 1} / {unit.images.length}</div>
        </div>
      )}
    </div>

  );
}
