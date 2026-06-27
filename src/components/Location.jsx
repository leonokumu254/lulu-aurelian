import React from 'react';
import { MapPin } from 'lucide-react';
import './Location.css';

export default function Location() {
  return (
    <section className="location-section" id="location">
      <div className="container">
        <div className="location-header">
          <h2 className="location-title">
            <MapPin size={28} className="location-icon" />
            Our Location
          </h2>
          <p className="location-subtitle">Find your way to the pinnacle of luxury living.</p>
        </div>
        
        <div className="location-map-wrapper">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1932.9804676571891!2d36.96724454986338!3d-0.4337598584716331!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182861001b95451f%3A0x13d296c5a51f2d92!2sSKYLINE%20LIFESTYLE%20APARTMENTS!5e0!3m2!1sen!2ske!4v1782334343184!5m2!1sen!2ske" 
            width="100%" 
            height="450" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Lulu Aurelian Estate "
            className="location-map-iframe"
          />
        </div>
      </div>
    </section>
  );
}
