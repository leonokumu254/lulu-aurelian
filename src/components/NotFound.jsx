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
          <span className="badge-text">LULU AURELIAN ESTATE &bull; SANCTUARY ERROR</span>
        </div>

        <div className="not-found-code-wrapper">
          <h1 className="not-found-code">404</h1>
          <div className="not-found-shimmer" />
        </div>

        <h2 className="not-found-title">The Sanctuary You Seek Is Elusive</h2>
        <p className="not-found-description">
          It appears the corridor you followed leads beyond our recorded estate grounds. 
          The door may have been secluded, the route retired, or the address entered with a slight wander.
          Allow our concierge to guide you back to refined comfort.
        </p>

        {/* Action Buttons */}
        <div className="not-found-actions">
          <button 
            type="button" 
            className="btn-not-found-primary"
            onClick={() => handleNavigate('home')}
          >
            <Home size={18} />
            <span>Return to Grand Foyer</span>
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
            href="https://wa.me/254112299384?text=Hello%20Lulu%20Aurelian%20Estate%2C%20I%20got%20lost%20on%20the%20website%20and%20need%20assistance."
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-not-found-whatsapp"
          >
            <MessageCircle size={18} />
            <span>Contact Host Concierge</span>
          </a>
        </div>
      </div>

      {/* Suggested Luxury Residences */}
      <section className="not-found-suites-section container">
        <div className="suites-section-header">
          <div className="gold-accent-line" />
          <h3 className="suites-section-title">Explore Our Curated Luxury Residences</h3>
          <p className="suites-section-subtitle">
            Rather than wandering, step directly into one of our three bespoke furnished apartments in Nyeri:
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
