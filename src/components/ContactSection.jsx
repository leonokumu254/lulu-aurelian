import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import './ContactSection.css';

export default function ContactSection() {
  return (
    <section className="contact-section" id="contact">
      <div className="contact-container">
        
        {/* Full-width Atmosphere & Details */}
        <div className="contact-atmosphere" data-aos="fade-up">
          <div className="contact-overlay">
            <h2 className="contact-details-title">
              <span className="contact-title-lulu">Lulu</span> <span className="contact-title-aurelian">Aurelian</span>
            </h2>
            
            <div className="contact-detail-items">
              <div className="contact-item">
                <span className="contact-icon-wrapper">
                  <MapPin className="contact-icon" size={20} />
                </span>
                <p className="contact-text">Skyline Apartments, Nyeri, Kenya</p>
              </div>
              <div className="contact-item">
                <span className="contact-icon-wrapper">
                  <Phone className="contact-icon" size={20} />
                </span>
                <a href="tel:+254112299384" className="contact-link">+254 112 299 384</a>
              </div>
              <div className="contact-item">
                <span className="contact-icon-wrapper">
                  <Mail className="contact-icon" size={20} />
                </span>
                <a href="mailto:pearlisprime@gmail.com" className="contact-link">pearlisprime@gmail.com</a>
              </div>
            </div>

            {/* Social Media Handle & Icons */}
            <div className="contact-social-row">
              <a 
                href="https://www.instagram.com/luluaurelian?igsh=MWE3cnk5bmdieXc0ag==" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="contact-social-handle"
                title="Follow @luluaurelian"
              >
                @luluaurelian
              </a>
              <div className="contact-social-divider" />
              <div className="contact-social-icons">
                <a 
                  href="https://www.tiktok.com/@luluaurelian?_r=1&_t=ZS-97lvlocMx1d" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="contact-social-btn" 
                  aria-label="TikTok"
                  title="TikTok: @luluaurelian"
                >
                  <svg viewBox="0 0 32 32" width="18" height="18" fill="currentColor">
                    <path d="M16.656 1.029c1.637-0.025 3.262-0.012 4.886-0.025 0.054 2.031 0.878 3.859 2.189 5.213l-0.002-0.002c1.411 1.271 3.247 2.095 5.271 2.235l0.028 0.002v5.036c-1.912-0.048-3.71-0.489-5.331-1.247l0.082 0.034c-0.784-0.377-1.447-0.764-2.077-1.196l0.052 0.034c-0.012 3.649 0.012 7.298-0.025 10.934-0.103 1.853-0.719 3.543-1.707 4.954l0.020-0.031c-1.652 2.366-4.328 3.919-7.371 4.011l-0.014 0c-0.123 0.006-0.268 0.009-0.414 0.009-1.73 0-3.347-0.482-4.725-1.319l0.040 0.023c-2.508-1.509-4.238-4.091-4.558-7.094l-0.004-0.041c-0.025-0.625-0.037-1.25-0.012-1.862 0.49-4.779 4.494-8.476 9.361-8.476 0.547 0 1.083 0.047 1.604 0.136l-0.056-0.008c0.025 1.849-0.050 3.699-0.050 5.548-0.423-0.153-0.911-0.242-1.42-0.242-1.868 0-3.457 1.194-4.045 2.861l-0.009 0.030c-0.133 0.427-0.21 0.918-0.21 1.426 0 0.206 0.013 0.41 0.037 0.61l-0.002-0.024c0.332 2.046 2.086 3.59 4.201 3.59 0.061 0 0.121-0.001 0.181-0.004l-0.009 0c1.463-0.044 2.733-0.831 3.451-1.994l0.010-0.018c0.267-0.372 0.45-0.822 0.511-1.311l0.001-0.014c0.125-2.237 0.075-4.461 0.087-6.698 0.012-5.036-0.012-10.060 0.025-15.083z" />
                  </svg>
                </a>
                <a 
                  href="https://www.facebook.com/share/1EY74Cxf23/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="contact-social-btn" 
                  aria-label="Facebook"
                  title="Facebook: @luluaurelian"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a 
                  href="https://www.instagram.com/luluaurelian?igsh=MWE3cnk5bmdieXc0ag==" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="contact-social-btn" 
                  aria-label="Instagram"
                  title="Instagram: @luluaurelian"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="contact-actions">
              <a 
                href="https://wa.me/254112299384" 
                target="_blank" 
                rel="noreferrer" 
                className="btn-whatsapp-direct"
              >
                Chat on WhatsApp
              </a>
              <a 
                href="tel:+254112299384" 
                className="btn-call-direct"
              >
                Call Us
              </a>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}
