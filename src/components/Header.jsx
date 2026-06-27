import React, { useState, useEffect } from 'react';
import { Menu, X, } from 'lucide-react';
import './Header.css';

export default function Header({ page, setPage, authUser, onLogout }) {
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

  return (
    <header className={`header-main ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container container">
        <div className="logo" onClick={() => { setPage('home'); setMobileMenuOpen(false); }}>
          <p className="logo-text">LuLu <span className='logo-text-span'>Aurelian</span></p>
           
        </div>

        {/* Desktop Nav */}
        {page === 'home' && (
          <nav className="desktop-nav">
            <button onClick={() => handleNavClick('home-hero')} className="nav-link">Home</button>
            <button onClick={() => handleNavClick('suites')} className="nav-link">Our Suites</button>
            <button onClick={() => handleNavClick('why-us')} className="nav-link">Why Choose Us</button>
            <button onClick={() => handleNavClick('newsletter')} className="nav-link">Contact</button>
          </nav>
        )}

        <div className="header-cta">
          {page === 'home' ? (
            <button onClick={() => setPage('booking')} className="btn-header">Book Now</button>
          ) : (
            <button onClick={() => setPage('home')} className="btn-header-secondary">Return Home</button>
          )}
          {authUser ? (
            <div className="header-user-profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '0.5rem' }}>
              <div 
                onClick={() => setPage('portal')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                title="Go to Dashboard"
              >
                <img 
                  src={authUser.avatar || '/user-icon.svg'} 
                  alt={authUser.name || 'Profile'} 
                  onError={(e) => { e.target.onerror = null; e.target.src = '/user-icon.svg'; }}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-gold-muted)', backgroundColor: 'var(--color-bg)' }} 
                />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>{authUser.name ? authUser.name.split(' ')[0] : 'User'}</span>
              </div>
              <button onClick={onLogout} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, padding: '0.5rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#d63031'} onMouseOut={e => e.target.style.color = '#666'}>
                Logout
              </button>
            </div>
          ) : (
            <button onClick={() => setPage('portal')} className="user-login-btn" aria-label="User Login">
              <img src="/user-icon.svg" alt="User Login" />
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
              <img src="/user-icon.svg" alt="User Login" />
            </button>
          )}
          {/* Mobile menu trigger */}
          <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} id='close-nav' /> : <Menu size={24} id='open-nav' />}
          </button>
        </div>
      </div>

      {/* Mobile Nav overlay */}
      {mobileMenuOpen && (
        <div className="mobile-nav-overlay glass animate-fade-in">
          <nav className="mobile-nav-list">
            {page === 'home' && (
              <>
                <button onClick={() => handleNavClick('home-hero')} className="mobile-nav-link">Home</button>
                <button onClick={() => handleNavClick('suites')} className="mobile-nav-link">Our Suites</button>
                <button onClick={() => handleNavClick('why-us')} className="mobile-nav-link">Why Choose Us</button>
                <button onClick={() => handleNavClick('newsletter')} className="mobile-nav-link">Contact</button>
              </>
            )}
            <div className="mobile-nav-cta">
              {page === 'home' ? (
                <button onClick={() => { setPage('booking'); setMobileMenuOpen(false); }} className="btn-primary">Book Now</button>
              ) : (
                <button onClick={() => { setPage('home'); setMobileMenuOpen(false); }} className="btn-secondary">Return Home</button>
              )}
              {authUser && (
                <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="btn-secondary" style={{ marginTop: '1rem', width: '100%', borderColor: '#d63031', color: '#d63031' }}>Logout</button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
