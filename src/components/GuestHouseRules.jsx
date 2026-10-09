import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Sparkles, Clock, Phone, MapPin, AlertCircle, 
  CheckCircle, Home, Heart, Wind, ChevronDown, ChevronUp, Info, Building2
} from 'lucide-react';
import './GuestHouseRules.css';

const UNIT_TITLES = {
  skyview: 'Skyview Hideaway (Top Floor)',
  cocoa: 'Cocoa Retreat (First Floor)',
  neema: 'Neema Haven (First Floor)'
};

export default function GuestHouseRules({ unitId = 'skyview' }) {
  const [selectedUnit, setSelectedUnit] = useState(unitId);
  const [rulesData, setRulesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState({});

  useEffect(() => {
    setSelectedUnit(unitId);
  }, [unitId]);

  useEffect(() => {
    let isMounted = true;
    const fetchRules = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bookings/house-rules/${selectedUnit}`);
        const data = await res.json();
        if (isMounted && data.success && data.rules) {
          setRulesData(data.rules);
          const initial = {};
          data.rules.sections?.forEach((sec, idx) => {
            initial[sec.id || idx] = idx < 2; // Open first 2 by default
          });
          setOpenSections(initial);
        }
      } catch (err) {
        console.error('Failed to load house rules:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchRules();
    return () => { isMounted = false; };
  }, [selectedUnit]);

  const toggleSection = (id) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExpandAll = (expand) => {
    if (!rulesData?.sections) return;
    const updated = {};
    rulesData.sections.forEach((sec, idx) => {
      updated[sec.id || idx] = expand;
    });
    setOpenSections(updated);
  };

  return (
    <div className="guest-rules-wrapper">
      {/* Header Banner */}
      <div className="guest-rules-header glass">
        <div className="rules-header-badge">
          <ShieldCheck size={16} />
          <span>Guest Guidelines & Policies</span>
        </div>
        <h1 className="rules-main-title">🏡 House Rules & Stay Guidelines</h1>
        <p className="rules-sub-title">
          {rulesData?.subtitle || `Welcome to Lulu Aurelian Apartment ${UNIT_TITLES[selectedUnit] || 'Luxury Suites'}!`}
        </p>
        <p className="rules-intro-text">
          {rulesData?.welcomeNote || "To ensure a comfortable, safe, and enjoyable stay for everyone, please take a moment to review the guidelines below. These help us maintain the quality of the space and provide a positive experience for all guests!"}
        </p>

        {/* Unit Selector Pills */}
        <div className="rules-unit-selector">
          <button 
            type="button"
            className={`unit-pill ${selectedUnit === 'skyview' ? 'active' : ''}`}
            onClick={() => setSelectedUnit('skyview')}
          >
            <Building2 size={14} /> SkyView Hideaway
          </button>
          <button 
            type="button"
            className={`unit-pill ${selectedUnit === 'cocoa' ? 'active' : ''}`}
            onClick={() => setSelectedUnit('cocoa')}
          >
            <Building2 size={14} /> Cocoa Retreat
          </button>
          <button 
            type="button"
            className={`unit-pill ${selectedUnit === 'neema' ? 'active' : ''}`}
            onClick={() => setSelectedUnit('neema')}
          >
            <Building2 size={14} /> Neema Haven
          </button>
        </div>
      </div>

      {/* Special Top Floor Gateway Notice (Skyview) */}
      {selectedUnit === 'skyview' && (
        <div className="gateway-welcome-card glass animate-fade-in">
          <div className="gateway-card-header">
            <span className="gateway-leaf">🌿</span>
            <div>
              <h3>Welcome to Lulu Aurelian Apartments - Skyview Gateway</h3>
              <p>Special Top-Floor Suite Welcome</p>
            </div>
          </div>
          <div className="gateway-body">
            <p>
              We’re honored to share our top-floor apartment with you. This space has been prepared with care, thoughtfulness, and a love for comfort. To help us maintain its beauty for all who stay, we kindly ask that you take a moment to read our guidelines below.
            </p>
          </div>
        </div>
      )}

      {/* Quick Summary Highlights */}
      <div className="rules-highlight-grid">
        <div className="highlight-card glass">
          <div className="highlight-icon">🕒</div>
          <div className="highlight-info">
            <h4>Check-In & Out</h4>
            <p>Check-in: After <strong>2:00 PM</strong><br />Check-out: Strictly before <strong>10:00 AM</strong></p>
          </div>
        </div>
        <div className="highlight-card glass">
          <div className="highlight-icon">🚭</div>
          <div className="highlight-info">
            <h4>Strictly No Smoking</h4>
            <p>Non-smoking indoor policy. Outdoor ashtrays provided where permitted.</p>
          </div>
        </div>
        <div className="highlight-card glass">
          <div className="highlight-icon">🔇</div>
          <div className="highlight-info">
            <h4>Quiet Hours</h4>
            <p>Respectful noise levels at all times, especially <strong>10:00 PM – 7:00 AM</strong>.</p>
          </div>
        </div>
        <div className="highlight-card glass">
          <div className="highlight-icon">🧼</div>
          <div className="highlight-info">
            <h4>Towel & Cleanliness</h4>
            <p>Towels for personal drying only. Wash dishes before checkout.</p>
          </div>
        </div>
      </div>

      {/* Detailed Rules Sections Header & Controls */}
      <div className="rules-section-controls-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1a1714', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Detailed Policies ({rulesData?.sections?.length || 0})
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            type="button" 
            onClick={() => handleExpandAll(true)}
            style={{ background: 'none', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '6px', padding: '0.3rem 0.6rem', fontSize: '0.76rem', fontWeight: 600, color: '#8c6014', cursor: 'pointer' }}
          >
            Expand All
          </button>
          <button 
            type="button" 
            onClick={() => handleExpandAll(false)}
            style={{ background: 'none', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '6px', padding: '0.3rem 0.6rem', fontSize: '0.76rem', fontWeight: 600, color: '#666', cursor: 'pointer' }}
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Detailed Rules Sections */}
      <div className="rules-sections-container">
        {loading ? (
          <div className="rules-loader">Loading suite guidelines...</div>
        ) : (
          rulesData?.sections?.map((section, idx) => {
            const secKey = section.id || idx;
            const isExpanded = !!openSections[secKey];
            return (
              <div key={secKey} className="rule-accordion-card glass">
                <div 
                  className="accordion-header" 
                  onClick={() => toggleSection(secKey)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="header-left">
                    <span className="section-icon">{section.icon || '📌'}</span>
                    <h3 className="section-title">{section.title}</h3>
                  </div>
                  <button className="toggle-btn" aria-label="Toggle section">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
                {isExpanded && (
                  <div className="accordion-content">
                    <ul className="rules-items-list">
                      {section.items?.map((item, itemIdx) => (
                        <li key={itemIdx} className="rule-item">
                          <CheckCircle size={15} className="item-bullet-icon" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Thank You & Host Support Assistance */}
      <div className="rules-closing-card glass">
        <div className="closing-content">
          <div className="closing-heart">
            <Heart size={28} className="heart-icon" />
          </div>
          <h3>Thank You for Being a Considerate Guest</h3>
          <p className="closing-text">
            {rulesData?.closingMessage || "Thank you for respecting the space and being a considerate guest. Your cooperation helps us maintain a wonderful experience for everyone. We hope your time in this space is peaceful, memorable, and filled with beautiful moments! 💛"}
          </p>

          <div className="support-action-box">
            <h4>💬 Questions or Need Assistance?</h4>
            <p>Our management team is on standby to assist you at any time during your stay:</p>
            <div className="contact-buttons-row">
              <a href="tel:0112299384" className="btn-contact-call">
                <Phone size={14} /> Call Safaricom: 0112299384
              </a>
              <a href="tel:0756958531" className="btn-contact-call">
                <Phone size={14} /> Call Airtel: 0756958531
              </a>
              <a 
                href="https://wa.me/254112299384?text=Hello%20Lulu%20Aurelian%20Support,%20I%20have%20an%20inquiry%20regarding%20my%20stay." 
                target="_blank" 
                rel="noreferrer" 
                className="btn-contact-whatsapp"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
