import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Sparkles, Clock, Phone, MapPin, AlertCircle, 
  CheckCircle, Home, Heart, Wind, ChevronDown, ChevronUp, Info, Building2,
  CigaretteOff, VolumeX, Users, FileText, Leaf, Sun, MessageSquare
} from 'lucide-react';
import { DEFAULT_HOUSE_RULES } from '../data/houseRulesData';
import './GuestHouseRules.css';

const UNIT_TITLES = {
  skyview: 'Skyview Hideaway (Top Floor)',
  cocoa: 'Cocoa Retreat (First Floor)',
  neema: 'Neema Haven (First Floor)'
};

/**
 * Returns a sleek, brand-aligned Lucide icon for any house rule section.
 */
const renderSectionIcon = (section) => {
  const iconKey = (section?.id || section?.icon || '').toLowerCase();
  if (iconKey.includes('care') || iconKey.includes('sparkle')) return <Sparkles size={18} />;
  if (iconKey.includes('clean') || iconKey.includes('wash') || iconKey.includes('towel')) return <CheckCircle size={18} />;
  if (iconKey.includes('noise') || iconKey.includes('quiet') || iconKey.includes('volume')) return <VolumeX size={18} />;
  if (iconKey.includes('smok') || iconKey.includes('vape')) return <CigaretteOff size={18} />;
  if (iconKey.includes('guest') || iconKey.includes('visitor') || iconKey.includes('people') || iconKey.includes('party')) return <Users size={18} />;
  if (iconKey.includes('pet') || iconKey.includes('animal')) return <Heart size={18} />;
  if (iconKey.includes('safe') || iconKey.includes('secur') || iconKey.includes('lock') || iconKey.includes('wind')) return <ShieldCheck size={18} />;
  if (iconKey.includes('check') || iconKey.includes('time') || iconKey.includes('clock') || iconKey.includes('out') || iconKey.includes('bed')) return <Clock size={18} />;
  if (iconKey.includes('plant') || iconKey.includes('leaf') || iconKey.includes('garden')) return <Leaf size={18} />;
  if (iconKey.includes('balcon') || iconKey.includes('sun') || iconKey.includes('terrace')) return <Sun size={18} />;
  return <FileText size={18} />;
};

/**
 * Returns a sleek Lucide icon for quick summary highlight cards.
 */
const renderHighlightIcon = (iconType) => {
  const key = (iconType || '').toLowerCase();
  if (key.includes('clock') || key.includes('time')) return <Clock size={20} />;
  if (key.includes('smok') || key.includes('vape')) return <CigaretteOff size={20} />;
  if (key.includes('noise') || key.includes('quiet')) return <VolumeX size={20} />;
  if (key.includes('safe') || key.includes('wind') || key.includes('secur')) return <ShieldCheck size={20} />;
  return <Sparkles size={20} />;
};

export default function GuestHouseRules({ unitId = 'skyview', onUnitChange, inModal = false }) {
  const normalizedInitial = (unitId || 'skyview').toLowerCase();
  const [selectedUnit, setSelectedUnit] = useState(normalizedInitial);
  
  // Initialize immediately with curated default data for instant, reliable display
  const initialData = DEFAULT_HOUSE_RULES[normalizedInitial] || DEFAULT_HOUSE_RULES.skyview;
  const [rulesData, setRulesData] = useState(initialData);
  const [openSections, setOpenSections] = useState(() => {
    const initOpen = {};
    initialData.sections?.forEach((sec, idx) => {
      const key = sec.id ? String(sec.id) : String(idx);
      initOpen[key] = idx < 2; // Open first 2 sections by default
    });
    return initOpen;
  });

  // Sync state if unitId prop changes from parent
  useEffect(() => {
    if (unitId) {
      const normalized = unitId.toLowerCase();
      setSelectedUnit(normalized);
    }
  }, [unitId]);

  // When selectedUnit changes, update rulesData immediately and check for custom overrides
  useEffect(() => {
    const curDefault = DEFAULT_HOUSE_RULES[selectedUnit] || DEFAULT_HOUSE_RULES.skyview;
    setRulesData(curDefault);

    // Reset accordion to first 2 open for the selected suite
    const initialOpen = {};
    curDefault.sections?.forEach((sec, idx) => {
      const key = sec.id ? String(sec.id) : String(idx);
      initialOpen[key] = idx < 2;
    });
    setOpenSections(initialOpen);

    if (onUnitChange) {
      onUnitChange(selectedUnit);
    }

    let isMounted = true;
    const fetchCustomRules = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
        const res = await fetch(`${apiBase}/api/bookings/house-rules/${selectedUnit}`);
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.success && data.rules && Array.isArray(data.rules.sections) && data.rules.sections.length > 0) {
          setRulesData(prev => ({
            ...prev,
            ...data.rules,
            // Fallback highlights if server didn't customize them
            highlights: data.rules.highlights || prev.highlights || curDefault.highlights
          }));
        }
      } catch (err) {
        // Safe silent fallback: curated DEFAULT_HOUSE_RULES is already seamlessly rendered
      }
    };

    fetchCustomRules();
    return () => { isMounted = false; };
  }, [selectedUnit]);

  const handleUnitSelect = (id) => {
    setSelectedUnit(id);
  };

  const toggleSection = (secKey) => {
    setOpenSections(prev => ({
      ...prev,
      [secKey]: !prev[secKey]
    }));
  };

  const handleExpandAll = (expand) => {
    const sections = rulesData?.sections || [];
    const updated = {};
    sections.forEach((sec, idx) => {
      const key = sec.id ? String(sec.id) : String(idx);
      updated[key] = expand;
    });
    setOpenSections(updated);
  };

  // Determine active highlights list
  const activeHighlights = rulesData?.highlights && rulesData.highlights.length > 0
    ? rulesData.highlights
    : [
        { icon: 'clock', title: 'Check-In & Out', text: 'Check-in is from 2:00 PM • Check-out is at 10:00 AM so we can get the space sparkling clean for our next guests. (Need extra time? Just ask!)' },
        { icon: 'smoking', title: 'Fresh & Smoke-Free Indoors', text: 'We keep indoor air clean and inviting. You are welcome to smoke on the balcony with the provided ashtrays.' },
        { icon: 'noise', title: 'Peaceful Nights', text: 'Mountain evenings here are so serene! We kindly observe restful hours from 10:00 PM to 7:00 AM.' },
        { icon: 'cleanliness', title: 'Comfort & Towel Care', text: 'Fresh, fluffy towels are ready for you. A quick rinse of your dishes before you check out makes our cleaning team smile!' }
      ];

  const totalSections = rulesData?.sections?.length || 0;

  return (
    <div className={`guest-rules-wrapper ${inModal ? 'in-modal' : ''}`}>
      {/* Header Banner */}
      {!inModal ? (
        <div className="guest-rules-header glass">
          <h1 className="rules-main-title">House Rules & Stay Guidelines</h1>
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
              onClick={() => handleUnitSelect('skyview')}
            >
              <Building2 size={14} /> SkyView Hideaway
            </button>
            <button 
              type="button"
              className={`unit-pill ${selectedUnit === 'cocoa' ? 'active' : ''}`}
              onClick={() => handleUnitSelect('cocoa')}
            >
              <Building2 size={14} /> Cocoa Retreat
            </button>
            <button 
              type="button"
              className={`unit-pill ${selectedUnit === 'neema' ? 'active' : ''}`}
              onClick={() => handleUnitSelect('neema')}
            >
              <Building2 size={14} /> Neema Haven
            </button>
          </div>
        </div>
      ) : (
        <div className="modal-rules-topbar">
          <div className="rules-unit-selector modal-selector">
            <button 
              type="button"
              className={`unit-pill ${selectedUnit === 'skyview' ? 'active' : ''}`}
              onClick={() => handleUnitSelect('skyview')}
            >
              <Building2 size={13} /> SkyView
            </button>
            <button 
              type="button"
              className={`unit-pill ${selectedUnit === 'cocoa' ? 'active' : ''}`}
              onClick={() => handleUnitSelect('cocoa')}
            >
              <Building2 size={13} /> Cocoa
            </button>
            <button 
              type="button"
              className={`unit-pill ${selectedUnit === 'neema' ? 'active' : ''}`}
              onClick={() => handleUnitSelect('neema')}
            >
              <Building2 size={13} /> Neema
            </button>
          </div>
        </div>
      )}

      {/* Special Top Floor Gateway Notice (Skyview only) */}
      {selectedUnit === 'skyview' && (
        <div className="gateway-welcome-card glass animate-fade-in">
          <div className="gateway-card-header">
            <div className="gateway-icon-badge">
              <Building2 size={20} />
            </div>
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

      {/* Dynamic Summary Highlights Grid tailored to current unit */}
      <div className="rules-highlight-grid">
        {activeHighlights.map((hl, hIdx) => (
          <div key={hIdx} className="highlight-card glass">
            <div className="highlight-icon">
              {renderHighlightIcon(hl.icon)}
            </div>
            <div className="highlight-info">
              <h4>{hl.title}</h4>
              <p>{hl.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Rules Sections Header & Controls */}
      <div className="rules-section-controls-row">
        <span className="rules-section-title">
          Detailed Policies ({totalSections})
        </span>
        <div className="rules-toggle-buttons-group">
          <button 
            type="button" 
            className="rules-toggle-btn expand"
            onClick={() => handleExpandAll(true)}
            aria-label="Expand all policy sections"
          >
            <ChevronDown size={14} />
            <span>Expand All</span>
          </button>
          <button 
            type="button" 
            className="rules-toggle-btn collapse"
            onClick={() => handleExpandAll(false)}
            aria-label="Collapse all policy sections"
          >
            <ChevronUp size={14} />
            <span>Collapse All</span>
          </button>
        </div>
      </div>

      {/* Detailed Rules Sections Accordion */}
      <div className="rules-sections-container">
        {rulesData?.sections?.map((section, idx) => {
          const secKey = section.id ? String(section.id) : String(idx);
          const isExpanded = !!openSections[secKey];
          return (
            <div key={secKey} className="rule-accordion-card glass">
              <div 
                className="accordion-header" 
                onClick={() => toggleSection(secKey)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleSection(secKey);
                  }
                }}
              >
                <div className="header-left">
                  <span className="section-icon">{renderSectionIcon(section)}</span>
                  <h3 className="rules-accordion-title">{section.title}</h3>
                </div>
                <span className="toggle-btn" aria-hidden="true">
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
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
        })}
      </div>

      {/* Thank You & Host Support Assistance */}
      <div className="rules-closing-card glass">
        <div className="closing-content">
          <div className="closing-heart">
            <Heart size={28} className="heart-icon" />
          </div>
          <h3>Thank You for Being a Considerate Guest</h3>
          <p className="closing-text">
            {rulesData?.closingMessage || "Thank you for respecting the space and being a considerate guest. Your cooperation helps us maintain a wonderful experience for everyone. We hope your time in this space is peaceful, memorable, and filled with beautiful moments!"}
          </p>

          <div className="support-action-box">
            <div className="support-title-row">
              <MessageSquare size={16} className="support-title-icon" />
              <h4>Questions or Need Assistance?</h4>
            </div>
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
