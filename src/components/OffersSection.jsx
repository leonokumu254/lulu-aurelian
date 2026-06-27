import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './OffersSection.css';
import { OFFERS } from '../data/OffersData';

const WhatsAppIconSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="18" height="18" fill="currentColor">
    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3 18.7-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
  </svg>
);

export default function OffersSection({ setPage }) {
  const trackRef = useRef(null);
  const wrapperRef = useRef(null);
  const [popDir, setPopDir] = React.useState(null);

  const isInteractingRef = useRef(false);
  const interactionTimeoutRef = useRef(null);

  const pauseAutoScroll = () => {
    isInteractingRef.current = true;
    if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
    interactionTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 1200);
  };

  useEffect(() => {
    const track = trackRef.current;
    const wrapper = wrapperRef.current;
    let animationId;
    let isHovered = false;

    const scrollStep = () => {
      if (track && !isHovered && !isInteractingRef.current) {
        track.scrollLeft += 0.5; // slowed down from 1.5 to 0.5
        const groupWidth = track.firstElementChild ? track.firstElementChild.offsetWidth : 0;
        const gap = 32; // 2rem
        if (groupWidth > 0 && track.scrollLeft >= groupWidth + gap) {
          track.scrollLeft -= (groupWidth + gap);
        }
      }
      animationId = requestAnimationFrame(scrollStep);
    };

    animationId = requestAnimationFrame(scrollStep);

    const handleMouseEnter = () => { isHovered = true; };
    const handleMouseLeave = () => { isHovered = false; };
    
    const handleTouchStart = () => {
       isInteractingRef.current = true; 
       if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
    };
    
    const handleTouchEnd = () => {
       pauseAutoScroll();
    };

    if (wrapper) {
      wrapper.addEventListener('mouseenter', handleMouseEnter);
      wrapper.addEventListener('mouseleave', handleMouseLeave);
      wrapper.addEventListener('touchstart', handleTouchStart, { passive: true });
      wrapper.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      cancelAnimationFrame(animationId);
      if (wrapper) {
        wrapper.removeEventListener('mouseenter', handleMouseEnter);
        wrapper.removeEventListener('mouseleave', handleMouseLeave);
        wrapper.removeEventListener('touchstart', handleTouchStart);
        wrapper.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, []);

  const scroll = (dir) => {
    pauseAutoScroll();
    // Trigger popup animation
    setPopDir(dir);
    setTimeout(() => setPopDir(null), 300);

    const track = trackRef.current;
    if (!track) return;

    const trackRect = track.getBoundingClientRect();
    const trackCenter = trackRect.left + (trackRect.width / 2);

    const items = Array.from(track.querySelectorAll('.offer-item'));
    if (items.length === 0) return;

    let minDiff = Infinity;
    let closestIndex = 0;

    // Find the item currently closest to the center
    items.forEach((item, index) => {
      const itemRect = item.getBoundingClientRect();
      const itemCenter = itemRect.left + (itemRect.width / 2);
      const diff = Math.abs(trackCenter - itemCenter);
      
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = index;
      }
    });

    let targetIndex = dir === 'left' ? closestIndex - 1 : closestIndex + 1;
    
    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex >= items.length) targetIndex = items.length - 1;

    const targetItem = items[targetIndex];
    const targetItemRect = targetItem.getBoundingClientRect();
    const targetItemCenter = targetItemRect.left + (targetItemRect.width / 2);
    const offsetToCenter = targetItemCenter - trackCenter;
    
    track.scrollBy({ left: offsetToCenter, behavior: 'smooth' });
  };
  return (
    <section className="offers-section" id="offers">
      <div className="container">
        <div className="offers-header-row">
          <div className="offers-titles">
            <h2 className="section-title">Offers &amp; <br /> Packages</h2>
            <p className="offers-subtitle">
              Indulge in comfort & luxury with <br /> different offers & impeccable rates.
            </p>
          </div>
          <button className="view-offers-btn" onClick={() => setPage('offers')}>
            View Offers
          </button>
        </div>

        <div className="offers-carousel-wrapper" ref={wrapperRef}>
          <button 
            className={`offer-nav-arrow left-arrow ${popDir === 'left' ? 'pop-anim' : ''}`} 
            onClick={() => scroll('left')} 
            aria-label="Previous Offer"
          >
            <ChevronLeft size={28} />
          </button>
          
          <div className="offers-marquee-track" ref={trackRef}>
            {/* First Group */}
            <div className="offers-marquee-group">
              {OFFERS.map(offer => (
                <div className="offer-item" key={`group1-${offer.id}`}>
                  <div className="offer-image-wrapper">
                    <img src={offer.image} alt={offer.title} className="offer-image" />
                  </div>
                  <div className="offer-content">
                    <h3 className="offer-title">{offer.title}</h3>
                    <p className="offer-desc">{offer.shortDesc}</p>
                    <div className="offer-actions">
                      <button className="offer-btn-book" onClick={() => setPage('booking', { offerId: offer.id })}>
                        Book Now
                      </button>
                      <a 
                        href={`https://wa.me/254112299384?text=${encodeURIComponent(`Hello, I'm interested in the ${offer.title} offer.`)}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="offer-whatsapp-btn"
                        aria-label={`Inquire about ${offer.title} via WhatsApp`}
                      >
                        <WhatsAppIconSVG />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Second Group (Duplicate for Infinite Scroll) */}
            <div className="offers-marquee-group" aria-hidden="true">
              {OFFERS.map(offer => (
                <div className="offer-item" key={`group2-${offer.id}`}>
                  <div className="offer-image-wrapper">
                    <img src={offer.image} alt={offer.title} className="offer-image" />
                  </div>
                  <div className="offer-content">
                    <h3 className="offer-title">{offer.title}</h3>
                    <p className="offer-desc">{offer.shortDesc}</p>
                    <div className="offer-actions">
                      <button className="offer-btn-book" onClick={() => setPage('booking', { offerId: offer.id })}>
                        Book Now
                      </button>
                      <a 
                        href={`https://wa.me/254112299384?text=${encodeURIComponent(`Hello, I'm interested in the ${offer.title} offer.`)}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="offer-whatsapp-btn"
                        aria-label={`Inquire about ${offer.title} via WhatsApp`}
                      >
                        <WhatsAppIconSVG />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            className={`offer-nav-arrow right-arrow ${popDir === 'right' ? 'pop-anim' : ''}`} 
            onClick={() => scroll('right')} 
            aria-label="Next Offer"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      </div>
    </section>
  );
}
