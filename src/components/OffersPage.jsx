import React from 'react';
import { Phone, ArrowLeft } from 'lucide-react';
import { OFFERS } from '../data/OffersData';
import './OffersPage.css';

export default function OffersPage({ setPage }) {
  return (
    <div className="offers-page container">
      <div className="offers-page-header">
        <button onClick={() => setPage('home')} className="back-link-btn">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>
        <div className="offers-page-title-wrapper">
          <h1 className="offers-page-title">Offers &amp; Packages</h1>
          <p className="offers-page-subtitle">
            Indulge In Comfort & Luxury With<br/>
            Different Offers & Impeccable Rates
          </p>
        </div>
      </div>

      <div className="offers-grid">
        {OFFERS.map(offer => (
          <div className="offer-item" key={offer.id}>
            <div className="offer-image-wrapper">
              <img src={offer.image} alt={offer.title} className="offer-image" />
            </div>
            <div className="offer-content">
              <h3 className="offer-title">{offer.title}</h3>
              <p className="offer-desc">{offer.fullDesc}</p>
              <div className="offer-actions">
                <button className="offer-btn-book" onClick={() => setPage('booking', { offerId: offer.id })}>
                  Book Now
                </button>
                <a href="https://wa.me/254111284609" target="_blank" rel="noreferrer" className="offer-whatsapp-btn">
                  <Phone size={18} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
