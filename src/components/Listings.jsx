import React, { useState } from 'react';
import { Wifi, Users, Maximize, Map, Coffee, Tv, Grid, ChevronLeft, ChevronRight, Utensils, Bed, Car } from 'lucide-react';
import SuiteGalleryModal from './SuiteGalleryModal';
import './Listings.css';
import { getSuitePrice } from '../utils/pricing';

const LISTINGS = [
  {
    id: 'skyview',
    name: 'Skyview Hideaway',
    price: 5500,
    image: './assets/skyview/skyview_1.jpg',
    previewImages: [
      './assets/skyview/skyview_12.avif',
      './assets/skyview/skyview_2.jpg',
      './assets/skyview/skyview_5.jpg',
      './assets/skyview/skyview_15.jpg',
      './assets/skyview/skyview_28.jpeg',
        './assets/skyview/skyview_25.jpg'
    
    ],
    size: '140 m²',
    guests: 'Up to 4 Guests',
    beds: '2 King Bedrooms',
    desc: 'Located on the top floor, this elegant 2-bedroom apartment offers a quiet, private retreat for professionals and travelers, complete with a balcony featuring stunning Mt. Kenya views. Designed for both short and extended stays, the space includes a dedicated workspace, fast Wi-Fi, a fully equipped modern kitchen, secure self-check-in, and free parking.',
    amenities: [
      { icon: <Map size={16} />, text: 'Mt Kenya View' },
      { icon: <Wifi size={16} />, text: '40mbps Wifi' },
      { icon: <Utensils size={16} />, text: 'Fully Equipped Kitchen' },
      { icon: <Bed size={16} />, text: 'Quality Linen' },
      { icon: <Car size={16} />, text: 'Secure Parking' }
    ]
  }, 
  {
    id: 'cocoa',
    name: 'Cocoa Retreat',
    tagline: 'Rich cocoa vibes',
    price: 5000,
    image: './assets/cocoa/cocoa_1.jpg',
    previewImages: [
      './assets/cocoa/cocoa_1.jpg',
      './assets/cocoa/cocoa_18.jpeg',
      './assets/cocoa/cocoa_21.jpeg',
      './assets/cocoa/cocoa_26.jpeg',
      './assets/cocoa/cocoa_13.avif'
    ],
    size: '85 m²',
    guests: 'Up to 4 Guests',
    beds: '2 Queen Bedrooms',
    desc: 'Experience the warm, sophisticated ambiance of Cocoa Retreat. Styled in rich earthy tones, this fully-equipped luxury sanctuary offers premium linens, a modern kitchen, and high-speed Wi-Fi. It is the perfect serene escape for families, couples, and executives seeking refined comfort and secure privacy.',
    amenities: [
      { icon: <Wifi size={16} />, text: '40mbps Wifi' },
      { icon: <Utensils size={16} />, text: 'Fully Equipped Kitchen' },
      { icon: <Bed size={16} />, text: 'Quality Linen' },
      { icon: <Car size={16} />, text: 'Secure Parking' }
    ]
  }
];

function ListingImageCarousel({ listing, onClick }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = React.useRef(null);
  
  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.clientWidth;
    if (width > 0) {
      const newIndex = Math.round(scrollLeft / width);
      setActiveIndex(newIndex);
    }
  };

  const scrollToIndex = (index) => {
    if (scrollRef.current) {
      const width = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    const nextIndex = (activeIndex + 1) % listing.previewImages.length;
    scrollToIndex(nextIndex);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    const prevIndex = (activeIndex - 1 + listing.previewImages.length) % listing.previewImages.length;
    scrollToIndex(prevIndex);
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current && scrollRef.current.clientWidth > 0) {
        const nextIndex = (activeIndex + 1) % listing.previewImages.length;
        scrollToIndex(nextIndex);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [activeIndex, listing.previewImages.length]);

  return (
    <div 
      className="listing-image-container new-collage" 
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Desktop Mosaic */}
      <div className="images-mosaic">
        {listing.previewImages.slice(0, 5).map((img, i) => (
          <div key={i} className={`mosaic-item item-${i}`}>
            <img src={img} alt={`${listing.name} view ${i + 1}`} className="listing-image" />
          </div>
        ))}
        <button className="floating-view-btn">
          <Grid size={16} />
          <span>View all photos</span>
        </button>
      </div>
      
      {/* Mobile Carousel */}
      <div className="mobile-carousel">
        <div className="carousel-scroll" onScroll={handleScroll} ref={scrollRef}>
          {listing.previewImages.map((img, i) => (
            <div key={i} className="carousel-item">
              <img src={img} alt={`${listing.name} mobile view ${i + 1}`} className="listing-image" />
            </div>
          ))}
        </div>
        
        <button className="carousel-arrow prev" onClick={handlePrev} aria-label="Previous image">
          <ChevronLeft size={24} />
        </button>
        <button className="carousel-arrow next" onClick={handleNext} aria-label="Next image">
          <ChevronRight size={24} />
        </button>
        
        <div className="mobile-indicators">
          <div className="mobile-dots">
            {listing.previewImages.map((_, i) => (
              <span key={i} className={`dot ${i === activeIndex ? 'active' : ''}`}></span>
            ))}
          </div>
          <div className="mobile-photo-count">
            {activeIndex + 1} / {listing.previewImages.length}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Listings({ onBookSelect }) {
  const [activeGallerySuite, setActiveGallerySuite] = useState(null);
  const [prices, setPrices] = useState({ skyview: getSuitePrice('skyview'), cocoa: getSuitePrice('cocoa') });

  React.useEffect(() => {
    const handlePricingUpdate = () => {
      setPrices({ skyview: getSuitePrice('skyview'), cocoa: getSuitePrice('cocoa') });
    };
    window.addEventListener('pricingUpdated', handlePricingUpdate);
    return () => window.removeEventListener('pricingUpdated', handlePricingUpdate);
  }, []);

  return (
    <section className="listings-section" id="suites">
      <div className="container">
        <div className="section-title-wrapper">
          <span className="section-tagline">Curated Living Spaces</span>
          <h2 className="section-title">Our Premium Suites</h2>
          <p className="section-subtitle">
            Explore our meticulously styled residences. Each suite is designed to serve as an immersive, luxury lodging experience. Click any image to view details and photo tour.
          </p>
        </div>

        <div className="grid-2">
          {LISTINGS.map((listing, idx) => (
            <div key={listing.id} className="listing-card animate-slide-up" style={{ animationDelay: `${idx * 0.15}s` }}>
              <ListingImageCarousel 
                listing={listing} 
                onClick={() => setActiveGallerySuite(listing.id)} 
              />

              <div className="listing-info">
                <h3 className="listing-name">{listing.name}</h3>
                <p className="listing-desc">{listing.desc}</p>
                
                <div className="listing-specs">
                  <span>{listing.guests}</span>
                  <span className="bullet">•</span>
                  <span>{listing.beds}</span>
                </div>

                <hr className="listing-separator" />

                <div className="amenities-grid">
                  {listing.amenities.map((item, key) => (
                    <div key={key} className="amenity-item">
                      <span className="amenity-icon">{item.icon}</span>
                      <span className="amenity-text">{item.text}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => onBookSelect(listing.id)} 
                  className="btn-primary listing-book-btn"
                >
                  Book Direct
                </button>

                <div className="external-booking-channels">
                  <span className="channels-label">Or book via:</span>
                  <div className="channels-buttons">
                    <a 
                      href={listing.id === 'skyview' ? 'https://www.airbnb.com/h/pearlapartmentsnyeri' : 'https://www.airbnb.com/h/cocoapearlapartment'} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="channel-btn airbnb-btn"
                      title="Book via Airbnb"
                    >
                      <img src="/Airbnb--Streamline-Svg-Logos.svg" alt="Airbnb" className="channel-icon" />
                    </a>
                    
                    <a 
                      href={listing.id === 'skyview' ? 'https://www.booking.com/Share-F7S7E5V' : 'https://www.booking.com/Share-KWW4dvn'} 
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
          ))}
        </div>
      </div>

      {activeGallerySuite && (
        <SuiteGalleryModal 
          suiteId={activeGallerySuite} 
          onClose={() => setActiveGallerySuite(null)} 
          onBookSelect={onBookSelect}
        />
      )}
    </section>
  );
}

