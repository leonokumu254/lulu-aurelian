import React, { useState } from 'react';
import { Wifi, Users, Maximize, Map, Coffee, Tv, Grid } from 'lucide-react';
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
      './assets/skyview/skyview_1.jpg',
      './assets/skyview/skyview_2.jpg',
      './assets/skyview/skyview_5.jpg'
    ],
    size: '140 m²',
    guests: 'Up to 4 Guests',
    beds: '2 King Bedrooms',
    desc: 'Located on the top floor, this elegant 2-bedroom apartment offers a quiet, private retreat for professionals and travelers, complete with a balcony featuring stunning Mt. Kenya views. Designed for both short and extended stays, the space includes a dedicated workspace, fast Wi-Fi, a fully equipped modern kitchen, secure self-check-in, and free parking.',
    amenities: [
      { icon: <Wifi size={16} />, text: '40 MBPS Wi-Fi' },
      { icon: <Users size={16} />, text: ' Up to 4 Guests' },
      { icon: <Maximize size={16} />, text: '140 m²' },
      { icon: <Coffee size={16} />, text: 'Coffee Maker'},
      { icon: <Tv size={16} />, text: 'Smart TV' },
      { icon: <Map size={16} />, text: 'Mt Kenya View' }
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
      './assets/cocoa/cocoa_2.jpg',
      './assets/cocoa/cocoa_15.avif'
    ],
    size: '85 m²',
    guests: 'Up to 4 Guests',
    beds: '2 Queen Bedrooms',
    desc: ' Cocoa Retreat is a cozy, stylish, and fully equipped apartment featuring rich brown tones, fast Wi-Fi, and free parking, perfect for a comfortable stay for families, couples, and business travelers alike.',
    amenities: [
      { icon: <Wifi size={16} />, text: '40mbps Wifi' },
      { icon: <Users size={16} />, text: '4 Guests' },
      { icon: <Maximize size={16} />, text: '85 m²' },
      { icon: <Tv size={16} />, text: 'Smart TV' }
    ]
  }
];

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
              <div 
                className="listing-image-container collage-preview" 
                onClick={() => setActiveGallerySuite(listing.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="listing-images-collage">
                  <div className="collage-main">
                    <img src={listing.previewImages[0]} alt={`${listing.name} - Stunning luxury suite interior showing the main living area or bedroom`} title={`${listing.name} Main Interior`} className="listing-image" />
                  </div>
                  <div className="collage-side">
                    <div className="collage-sub">
                      <img src={listing.previewImages[1]} alt={`${listing.name} - Detailed view of the luxury amenities and premium furniture`} title={`${listing.name} Detail View 1`} className="listing-image" />
                    </div>
                    <div className="collage-sub more-photos">
                      <img src={listing.previewImages[2]} alt={`${listing.name} - Another beautiful angle of the luxurious suite interior`} title={`${listing.name} Detail View 2`} className="listing-image" />
                      <div className="collage-overlay">
                        <Grid size={18} />
                        <span>Show Photos</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="listing-price-tag">
                  <span className="price-num">KES {(prices[listing.id] || listing.price).toLocaleString('en-KE')}</span>
                  <span className="price-unit">/ night</span>
                </div>
              </div>

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

