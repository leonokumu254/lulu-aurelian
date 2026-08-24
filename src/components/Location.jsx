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
            src="https://maps.google.com/maps?q=-0.433276973199735,36.96868842933756&z=17&output=embed" 
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
