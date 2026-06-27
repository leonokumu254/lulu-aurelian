import React from 'react';
import { Mail, Phone, MapPin, Compass } from 'lucide-react';
import './Footer.css';

export default function Footer({ setPage }) {
  const handleNavClick = (sectionId) => {
    setPage('home');
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <footer className="footer-main">
      <div className="footer-top container">
        <div className="footer-column brand-col">
          <div className="footer-logo">
            <span className="logo-text">LULU AURELIAN</span>
            <span className="logo-subtext">ESTATE</span>
          </div>
          <p className="footer-brand-desc">
            A boutique collection of ultra-luxury estates designed for travelers seeking refined architectural detail, privacy, and flawless service.
          </p>
          <div className="social-links">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
              <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="https://airbnb.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Airbnb">
              <img src="/Airbnb--Streamline-Svg-Logos.svg" alt="Airbnb" width="36" height="36" />
            </a>
            <a href="https://booking.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Booking.com">
              <img src="/bookingcom-logo-svgrepo-com.svg" alt="Booking.com" width="36" height="36" />
            </a>
          </div>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">QUICK LINKS</h4>
          <ul className="footer-links-list">
            <li><button onClick={() => handleNavClick('home-hero')} className="footer-link-btn">Home</button></li>
            <li><button onClick={() => handleNavClick('suites')} className="footer-link-btn">Our Suites</button></li>
            <li><button onClick={() => handleNavClick('why-us')} className="footer-link-btn">Why Choose Us</button></li>
            <li><button onClick={() => handleNavClick('newsletter')} className="footer-link-btn">Newsletter</button></li>
            <li><button onClick={() => setPage('booking')} className="footer-link-btn">Book Stay</button></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">Our Suites</h4>
          <ul className="footer-links-list">
            <li><button onClick={() => { setPage('booking'); }} className="footer-link-btn">Skyview Hideaway</button></li>
            <li><button onClick={() => { setPage('booking'); }} className="footer-link-btn">Cocoa Retreat</button></li>
             
          </ul>
        </div>

        <div className="footer-column contact-col">
          <h4 className="footer-heading">Contact us</h4>
          <ul className="footer-contact-list">
            <li>
              <MapPin size={16} className="contact-icon" />
              <span>Skyline  Apartments, Nyeri, Kenya</span>
            </li>
            <li>
              <Phone size={16} className="contact-icon" />
              <a href="tel:+254112299384">+254 112 299 384</a>
            </li>
            <li>
              <Mail size={16} className="contact-icon" />
              <a href="mailto:pearlisprime@gmail.com">pearlisprime@gmail.com</a>   
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container container">
          <p className="copyright">
            © {new Date().getFullYear()} Lulu Aurelian Estate. All Rights Reserved. Crafted for premium experiences.
          </p>
          <div className="footer-legal-links">
            <button onClick={() => setPage('portal')} className="footer-portal-link-btn">Staff Portal</button>
            <span className="separator">•</span>
            <a href="#privacy">Privacy Policy</a>
            <span className="separator">•</span>
            <a href="#terms">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
