import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Home, Compass, MessageCircle, ArrowRight, ShieldCheck, Calendar, Sparkles } from 'lucide-react';
import './NotFound.css';

export default function NotFound({ setPage }) {
  const handleNavigate = (target, params = {}) => {
    if (setPage) {
      setPage(target, params);
    } else {
      window.location.href = target === 'home' ? '/' : `/#/${target}`;
    }
  };

  const suites = [
    {
      id: 'skyview',
      name: 'Skyview Hideaway',
      floor: 'Penthouse (Top Floor)',
      view: '270° Panoramic Mt. Kenya Views',
      rate: 'From KES 5,500 / night',
      image: '/assets/skyview/skyview_1.jpg',
      href: '/skyview'
    },
    {
      id: 'cocoa',
      name: 'Cocoa Retreat',
      floor: 'First Floor Sanctuary',
      view: 'Rich Earthy Cocoa & Pine Forest Ambiance',
      rate: 'From KES 5,000 / night',
      image: '/assets/cocoa/cocoa_1.jpg',
      href: '/cocoa'
    },
    {
      id: 'neema',
      name: 'Neema Haven',
      floor: 'First Floor Suite',
      view: 'Sunlit Minimalist Luxury for Sunset Lovers',
      rate: 'From KES 5,000 / night',
      image: '/assets/Neema/neema_1.jpeg',
      href: '/neema'
    }
  ];

  return (
    <div className="not-found-page">
      <Helmet>
        <title>404 — Page Not Found | Lulu Aurelian Estate</title>
        <meta name="description" content="The page or suite you are searching for does not exist on Lulu Aurelian Estate. Explore our luxury residences or contact our concierge." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      {/* Hero Visual Container */}
      <div className="not-found-hero container">
        <div className="not-found-badge">
          <div className="badge-crest">LA</div>
          <span className="badge-text">LULU AURELIAN ESTATE &bull; PAGE NOT FOUND</span>
        </div>

        <div className="not-found-code-wrapper">
          <h1 className="not-found-code">404</h1>
          <div className="not-found-shimmer" />
        </div>

        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-description">
          We couldn't find the page you are looking for. The link may have changed, or the page is no longer available. 
          You can return home, browse our available apartments, or message our team for assistance.
        </p>

        {/* Action Buttons */}
        <div className="not-found-actions">
          <button 
            type="button" 
            className="btn-not-found-primary"
            onClick={() => handleNavigate('home')}
          >
            <Home size={18} />
            <span>Return to Home</span>
          </button>

          <button 
            type="button" 
            className="btn-not-found-secondary"
            onClick={() => handleNavigate('booking')}
          >
            <Calendar size={18} />
            <span>Check Availability</span>
          </button>

          <a 
            href="https://wa.me/254112299384?text=Hello%20Lulu%20Aurelian%20Estate%2C%20I%20need%20help%20finding%20a%20page%20or%20booking%20a%20stay."
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-not-found-whatsapp"
          >
            <MessageCircle size={18} />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Suggested Luxury Residences */}
      <section className="not-found-suites-section container">
        <div className="suites-section-header">
          <div className="gold-accent-line" />
          <h3 className="suites-section-title">Explore Our Suites</h3>
          <p className="suites-section-subtitle">
            Choose from our three fully furnished apartments in Nyeri:
          </p>
        </div>

        <div className="not-found-suites-grid">
          {suites.map((suite) => (
            <div key={suite.id} className="not-found-suite-card">
              <div className="suite-card-image-wrap">
                <img 
                  src={suite.image} 
                  alt={suite.name} 
                  className="suite-card-image"
                  loading="lazy"
                />
                <span className="suite-card-badge">{suite.floor}</span>
              </div>
              <div className="suite-card-content">
                <h4 className="suite-card-name">{suite.name}</h4>
                <p className="suite-card-view">{suite.view}</p>
                <div className="suite-card-footer">
                  <span className="suite-card-rate">{suite.rate}</span>
                  <a href={suite.href} className="suite-card-cta">
                    <span>View Suite</span>
                    <ArrowRight size={15} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Portal & Assistance Bar */}
        <div className="not-found-quickbar">
          <div className="quickbar-item">
            <Compass size={20} className="quickbar-icon" />
            <div>
              <strong>Already have a reservation?</strong>
              <p>Access your private stay itinerary, payment receipts & check-in keys.</p>
            </div>
            <button 
              type="button" 
              className="quickbar-btn"
              onClick={() => handleNavigate('portal')}
            >
              Open Guest Portal
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
