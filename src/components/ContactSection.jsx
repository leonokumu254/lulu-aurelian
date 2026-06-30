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
            <h3 className="contact-details-title">
              <span className="contact-title-lulu">Lulu</span> <span className="contact-title-aurelian">Aurelian</span>
            </h3>
            
            <div className="contact-detail-items">
              <div className="contact-item">
                <MapPin className="contact-icon" size={20} />
                <p>Skyline Apartments, Nyeri, Kenya</p>
              </div>
              <div className="contact-item">
                <Phone className="contact-icon" size={20} />
                <p>+254 112 299 384</p>
              </div>
              <div className="contact-item">
                <Mail className="contact-icon" size={20} />
                <p>pearlisprime@gmail.com</p>
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
