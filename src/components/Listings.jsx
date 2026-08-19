import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Listings.css';
import { getSuitePrice } from '../utils/pricing';

const LISTINGS = [
  {
    id: 'skyview',
    name: 'Skyview Hideaway',
    tagline: 'Exclusive Mt Kenya views',
    price: 5500,


    previewImages: [
      './assets/skyview/skyview_12.avif',
      './assets/skyview/skyview_2.jpg',
      './assets/skyview/skyview_5.jpg',
      './assets/skyview/skyview_15.jpg',
      './assets/skyview/skyview_28.jpeg',
      './assets/skyview/skyview_25.jpg'
    ],
    beds: '2 bedrooms',
    baths: '1 bath',
    href: '/skyview'
  },
  {
    id: 'cocoa',
    name: 'Cocoa Retreat',
    location: 'Apartment in Nyeri',
    tagline: 'Homely with rich brown tones',
    price: 5000,


    previewImages: [
      './assets/cocoa/cocoa_1.jpg',
      './assets/cocoa/cocoa_18.jpeg',
      './assets/cocoa/cocoa_21.jpeg',
      './assets/cocoa/cocoa_26.jpeg',
      './assets/cocoa/cocoa_13.avif'
    ],
    beds: '2 bedrooms',
    baths: '1 bath',
    href: '/cocoa'
  },
  {
    id: 'neema',
    name: 'Neema Haven',
    location: 'Apartment in Nyeri',
    tagline: 'Peaceful retreat for the sunset lovers',
    price: 5000,
    previewImages: [
      './assets/Neema/neema_1.jpeg',
      './assets/Neema/neema_kitchen.jpeg',
      './assets/Neema/neema_bathroom.jpeg',
      './assets/Neema/neema_2.jpeg',
      './assets/Neema/neema_3.jpeg',
      './assets/Neema/neema_4.jpeg'
    ],
    beds: '2 bedrooms',
    baths: '1 bath',
    href: '/neema'
  }
];

function ListingCard({ listing }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = React.useRef(null);
  const [prices, setPrices] = useState(getSuitePrice(listing.id));

  React.useEffect(() => {
    const handlePricingUpdate = () => {
      setPrices(getSuitePrice(listing.id));
    };
    window.addEventListener('pricingUpdated', handlePricingUpdate);
    return () => window.removeEventListener('pricingUpdated', handlePricingUpdate);
  }, [listing.id]);

  const scrollToIndex = (index) => {
    if (scrollRef.current) {
      const width = scrollRef.current.clientWidth;
      scrollRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
    }
  };

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.clientWidth;
    if (width > 0) {
      setActiveIndex(Math.round(scrollLeft / width));
    }
  };

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const prevIndex = (activeIndex - 1 + listing.previewImages.length) % listing.previewImages.length;
    scrollToIndex(prevIndex);
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextIndex = (activeIndex + 1) % listing.previewImages.length;
    scrollToIndex(nextIndex);
  };

  const searchParams = new URLSearchParams(window.location.search);
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';

  let cardHref = listing.href;
  const urlParams = [];
  if (checkIn) urlParams.push(`checkIn=${checkIn}`);
  if (checkOut) urlParams.push(`checkOut=${checkOut}`);
  if (urlParams.length > 0) {
    cardHref += `?${urlParams.join('&')}`;
  }

  return (
    <a href={cardHref} className="bnb-card" aria-label={`View ${listing.name}`}>
      {/* Image Carousel */}
      <div className="bnb-card-image-wrap">
        {/* Carousel */}
        <div className="bnb-carousel" ref={scrollRef} onScroll={handleScroll}>
          {listing.previewImages.map((img, i) => (
            <div key={i} className="bnb-carousel-slide">
              <img
                src={img}
                alt={`${listing.name} - Luxury Airbnb in Nyeri, Kenya - Photo ${i + 1}`}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>

        {/* Arrows */}
        {activeIndex > 0 && (
          <button className="bnb-arrow bnb-arrow-prev" onClick={handlePrev} aria-label="Previous photo">
            <ChevronLeft size={16} />
          </button>
        )}
        {activeIndex < listing.previewImages.length - 1 && (
          <button className="bnb-arrow bnb-arrow-next" onClick={handleNext} aria-label="Next photo">
            <ChevronRight size={16} />
          </button>
        )}

        {/* Dots */}
        <div className="bnb-dots">
          {listing.previewImages.map((_, i) => (
            <span key={i} className={`bnb-dot ${i === activeIndex ? 'active' : ''}`} />
          ))}
        </div>
      </div>

      {/* Card Info */}
      <div className="bnb-card-info">
        <h3 className="bnb-card-name">
          <span className="name-primary">{listing.name.split(' ')[0]}</span>{' '}
          <span className="name-secondary">{listing.name.split(' ').slice(1).join(' ')}</span>
        </h3>
        <p className="bnb-card-location">{listing.tagline}</p>
        <p className="bnb-card-specs">
          {listing.beds} · 2 beds · {listing.baths}
        </p>
      </div>
    </a>
  );
}

export default function Listings({ onBookSelect }) {
  return (
    <section className="listings-section" id="suites">
      <div className="container">
        <div className="section-title-wrapper">
          <span className="section-tagline">Curated Living Spaces</span>
          <h2 className="section-title">Our Premium Suites</h2>
          <p className="section-subtitle">
            Explore our meticulously styled residences. Each suite is designed to serve as an immersive, luxury lodging experience. Click any listing to view details.
          </p>
        </div>

        <div className="bnb-grid">
          {LISTINGS.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  );
}
