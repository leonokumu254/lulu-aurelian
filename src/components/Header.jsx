import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, ArrowLeft } from 'lucide-react';
import './Header.css';

export default function Header({ page, setPage, authUser, onLogout, unitName }) {
  const isUnitPage = page === 'unit';
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      const activeOverlays = document.querySelectorAll('.mobile-nav-overlay, .calendar-modal-overlay');
      if (activeOverlays.length === 0) {
        document.body.style.overflow = 'unset';
      }
    }
    return () => {
      const activeOverlays = document.querySelectorAll('.mobile-nav-overlay, .calendar-modal-overlay');
      if (activeOverlays.length === 0) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (page !== 'home') {
      setPage('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleUnitBookClick = () => {
    const el = document.getElementById('booking-card') || document.querySelector('.unit-booking-card-container');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <header className={`header-main ${isScrolled ? 'scrolled' : ''} ${isUnitPage ? 'header-unit-mode' : ''}`}>
      <div className="header-container container">
        {isUnitPage ? (
          /* ========= UNIT PAGE HEADER — Back arrow + unit name ========= */
          <>
            <button className="header-back-btn" onClick={() => setPage('home')} aria-label="Back to all suites">
              <ArrowLeft size={20} strokeWidth={1.8} />
            </button>
            <div className="header-unit-title" onClick={() => setPage('home')}>
              <span className="header-unit-name">{unitName || 'Back to Suites'}</span>
            </div>
            <div className="header-cta">
              <button onClick={handleUnitBookClick} className="btn-header">Book Now</button>
            </div>
            {/* Mobile: same simplified layout */}
            <div className="mobile-controls">
              <button onClick={handleUnitBookClick} className="btn-header" style={{ fontSize: '0.65rem', padding: '0.45rem 0.9rem' }}>Book</button>
            </div>
          </>
        ) : (
          /* ========= STANDARD HEADER — Logo + nav + CTA ========= */
          <>
            <div className="logo" onClick={() => { setPage('home'); setMobileMenuOpen(false); }}>
              <p className="logo-text">LuLu <span className='logo-text-span'>Aurelian</span></p>
            </div>

            {/* Desktop Nav */}
            <nav className="desktop-nav">
              <button onClick={() => handleNavClick('home-hero')} className="nav-link">Home</button>
              <button onClick={() => handleNavClick('suites')} className="nav-link">Our Suites</button>
              <button onClick={() => handleNavClick('why-us')} className="nav-link">Why Choose Us</button>
              <button onClick={() => handleNavClick('contact')} className="nav-link">Contact</button>
            </nav>

            <div className="header-cta">
              {page === 'home' ? (
                <button onClick={() => handleNavClick('suites')} className="btn-header">Book Now</button>
              ) : (
                <button onClick={() => setPage('home')} className="btn-header-secondary">Return Home</button>
              )}
              {authUser ? (
                <div className="user-capsule">
                  <div 
                    className="user-capsule-info"
                    onClick={() => setPage('portal')}
                    title="Go to Dashboard"
                  >
                    <img 
                      src={authUser.avatar || '/user-icon.svg'} 
                      alt={authUser.name || 'Profile'} 
                      onError={(e) => { e.target.onerror = null; e.target.src = '/user-icon.svg'; }}
                    />
                    <span>{authUser.name ? authUser.name.split(' ')[0] : 'User'}</span>
                  </div>
                  <button className="user-capsule-logout" onClick={onLogout} title="Logout">
                    <LogOut size={14} />
                  </button>
                </div>
              ) : (
                <button onClick={() => setPage('portal')} className="user-login-btn" aria-label="User Login">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.85"/>
                    <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.85"/>
                  </svg>
                </button>
              )}
            </div>

            <div className="mobile-controls">
              {authUser ? (
                <img 
                  src={authUser.avatar || '/user-icon.svg'} 
                  alt="Profile" 
                  onError={(e) => { e.target.onerror = null; e.target.src = '/user-icon.svg'; }}
                  onClick={() => { setPage('portal'); setMobileMenuOpen(false); }} 
                  className="mobile-login" 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', border: '1px solid var(--color-gold-muted)', backgroundColor: 'var(--color-bg)' }} 
                />
              ) : (
                <button onClick={() => { setPage('portal'); setMobileMenuOpen(false); }} className="user-login-btn mobile-login" aria-label="User Login">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.85"/>
                      <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.85"/>
                    </svg>
                  </button>
              )}
              {/* Mobile menu trigger */}
              <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={24} id='close-nav' /> : <Menu size={24} id='open-nav' />}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile Nav overlay */}
      <div className={`mobile-nav-overlay glass ${mobileMenuOpen ? 'open' : ''}`}>
        <nav className="mobile-nav-list">
          <button onClick={() => handleNavClick('home-hero')} className="mobile-nav-link">Home</button>
          <button onClick={() => handleNavClick('suites')} className="mobile-nav-link">Our Suites</button>
          <button onClick={() => handleNavClick('why-us')} className="mobile-nav-link">Why Choose Us</button>
          <button onClick={() => handleNavClick('contact')} className="mobile-nav-link">Contact</button>
          <div className="mobile-nav-cta">
            {page === 'home' ? (
              <button onClick={() => { handleNavClick('suites'); setMobileMenuOpen(false); }} className="btn-primary">Book Now</button>
            ) : (
              <button onClick={() => { setPage('home'); setMobileMenuOpen(false); }} className="btn-secondary">Return Home</button>
            )}
            {authUser && (
              <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="btn-secondary" style={{ marginTop: '1rem', width: '100%', borderColor: '#d63031', color: '#d63031' }}>Logout</button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
