import React, { useState, useRef, useEffect } from 'react';
import { X, Heart, Share, Grid, ArrowLeft, HeartIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import './SuiteGalleryModal.css';

const GALLERY_DATA = {
  skyview: {
    title: 'Skyview Hideaway',
    location: 'Nyeri, Kenya',
    images: {
      master: './assets/skyview/skyview_1.jpg',
      thumb1: './assets/skyview/skyview_2.jpg',
      thumb2: './assets/skyview/skyview_3.jpg',
      thumb3: './assets/skyview/skyview_4.jpg',
      thumb4: './assets/skyview/skyview_5.jpg'
    },
    sections: [
      {
        id: 'living',
        title: 'Living room',
        description: 'Panoramic views from every corner.',
        photos: ['./assets/skyview/skyview_1.jpg', './assets/skyview/skyview_6.jpg','./assets/skyview/skyview_5.jpg','./assets/skyview/skyview_7.jpg','./assets/skyview/skyview_12.avif','./assets/skyview/skyview_20.avif','./assets/skyview/skyview_16.avif']
      },
      {
        id: 'kitchen',
        title: 'Full kitchen',
        description: 'Italian custom cabinetry and premium appliances.',
        photos: ['./assets/skyview/skyview_4.jpg','./assets/skyview/skyview_8.jpg','./assets/skyview/skyview_9.jpg','./assets/skyview/skyview_14.jpg','./assets/skyview/skyview_16.avif','./assets/skyview/skyview_23.jpg' ,'./assets/skyview/skyview_24.jpg',]
      },
      {
        id: 'bathroom',
        title: 'Full bathroom',
        description: 'White marble tiles and premium fixtures.',
        photos: ['./assets/skyview/skyview_11.jpg','./assets/skyview/skyview_17.jpg','./assets/skyview/skyview_22.avif']
      },
      {
        id: 'bedroom1',
        title: 'Bedroom 1',
        description: 'Premium bedroom with king size bed',
        photos: ['./assets/skyview/skyview_13.jpg','./assets/skyview/skyview_10.jpg','./assets/skyview/skyview_27.jpg']
      },
      {
        id: 'bedroom2',
        title: 'Bedroom 2',
        description: 'Well equiped bedroom with queen size bed',
        photos: ['./assets/skyview/skyview_15.jpg','./assets/skyview/skyview_18.jpg','./assets/skyview/skyview_21.avif']
      },
      {
        id: 'balcony',
        title: 'Balcony',
        description: 'Private  lounge area with stunning views',
        photos: ['./assets/skyview/skyview_25.jpg','./assets/skyview/skyview_26.jpg','./assets/skyview/skyview_25.jpg']
      }
    ]
  },
  cocoa: {
    title: 'Cocoa Retreat',
    location: 'Nyeri, Kenya',
    rating: '5.0',
    reviewsCount: 9,
    images: {
      master: './assets/cocoa/cocoa_1.jpg',
      thumb1: './assets/cocoa/cocoa_2.jpg',
      thumb2: './assets/cocoa/cocoa_3.jpg',
      thumb3: './assets/cocoa/cocoa_4.jpg',
      thumb4: './assets/cocoa/cocoa_5.jpg'
    },
    sections: [
      {
        id: 'living',
        title: 'Living room',
        description: 'A cozy and impressive living area',
        photos: ['./assets/cocoa/cocoa_1.jpg', './assets/cocoa/cocoa_2.jpg','./assets/cocoa/cocoa_15.avif']
      },
      {
        id: 'bedroom1',
        title: 'Bedroom 1',
        description: 'Premium bedroom with king size bed',
        photos: ['./assets/cocoa/cocoa_3.jpg','./assets/cocoa/cocoa_13.avif','./assets/cocoa/cocoa_15.jpg']
      },
      {
        id: 'bedroom2',
        title: 'Bedroom 2',
        description: 'Premium bedroom with king size bed',
        photos: ['./assets/cocoa/cocoa_12.avif','./assets/cocoa/cocoa_16.avif','./assets/cocoa/cocoa_17.avif'] 
      },
      {
        id: 'bathroom',
        title: 'Full bathroom',
        description:'A clean and soothing bathroom',
        photos: ['./assets/cocoa/cocoa_11.avif','./assets/cocoa/cocoa_9.avif']
      },
      {
        id: 'balcony',
        title: 'Balcony',
        description: 'Private balcony overlooking the pine forest.',
        photos: ['./assets/cocoa_4.png']
      }
    ]
  }
};

export default function SuiteGalleryModal({ suiteId, onClose, onBookSelect }) {
  const data = GALLERY_DATA[suiteId];
  if (!data) return null;

  const [showTour, setShowTour] = useState(false);
  const [activeSection, setActiveSection] = useState('living');
  const [isSaved, setIsSaved] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  
  const tourContentRef = useRef(null);
  const thumbnailsRef = useRef(null);
  const sectionRefs = useRef({});

  // Collect all unique photos in ordered sequence
  const allPhotos = [];
  if (data.images.master) allPhotos.push(data.images.master);
  if (data.images.thumb1) allPhotos.push(data.images.thumb1);
  if (data.images.thumb2) allPhotos.push(data.images.thumb2);
  if (data.images.thumb3) allPhotos.push(data.images.thumb3);
  if (data.images.thumb4) allPhotos.push(data.images.thumb4);

  data.sections.forEach(sec => {
    sec.photos.forEach(photo => {
      if (!allPhotos.includes(photo)) {
        allPhotos.push(photo);
      }
    });
  });

  const handlePrevPhoto = (e) => {
    if (e) e.stopPropagation();
    setLightboxIndex(prev => (prev === 0 ? allPhotos.length - 1 : prev - 1));
  };

  const handleNextPhoto = (e) => {
    if (e) e.stopPropagation();
    setLightboxIndex(prev => (prev === allPhotos.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowLeft') {
        handlePrevPhoto(e);
      } else if (e.key === 'ArrowRight') {
        handleNextPhoto(e);
      } else if (e.key === 'Escape') {
        setLightboxIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex]);

  // Center active thumbnail in the tray
  useEffect(() => {
    if (lightboxIndex !== null && thumbnailsRef.current) {
      const activeThumb = thumbnailsRef.current.children[lightboxIndex];
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [lightboxIndex]);

  // Scroll to active section in Photo Tour
  const handleScrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const targetEl = sectionRefs.current[sectionId];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Detect which section is in view on scroll
  const handleScroll = () => {
    if (!tourContentRef.current) return;
    const scrollPos = tourContentRef.current.scrollTop + 150;
    
    data.sections.forEach((sec) => {
      const el = sectionRefs.current[sec.id];
      if (el) {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          setActiveSection(sec.id);
        }
      }
    });
  };

  // Disable main body scroll when modal is open and add Tedy scale-down effect
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const rootEl = document.getElementById('root') || document.querySelector('.app-root');
    if (rootEl) {
      rootEl.classList.add('tedy-scale-down');
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      if (rootEl) {
        rootEl.classList.remove('tedy-scale-down');
      }
    };
  }, []);

  return (
    <div className="gallery-modal-overlay">
      <div className="gallery-modal-container tedy-slide-up">
        
        {/* Modal Header */}
        <div className="gallery-modal-header">
          <button className="header-close-btn" onClick={showTour ? () => setShowTour(false) : onClose}>
            {showTour ? <ArrowLeft size={20} /> : <X size={20} />}
            <span>{showTour ? 'Back' : 'Close'}</span>
          </button>
 
        </div>

        {/* Modal Body */}
        <div className="gallery-modal-body">
          {!showTour ? (
            /* OVERVIEW GALLERY (Airbnb Grid) */
            <div className="overview-gallery-view animate-fade-in">
              <div className="overview-title-section">
                <h1>{data.title}</h1>
                <div className="overview-meta">
                   
                  <span className="location-text">{data.location}</span>
                </div>
              </div>

              <div className="airbnb-image-grid">
                <div className="grid-left-col" onClick={() => setLightboxIndex(0)}>
                  <img src={data.images.master} alt="Suite Main View" />
                </div>
                <div className="grid-right-col">
                  <div className="grid-thumb" onClick={() => setLightboxIndex(1)}>
                    <img src={data.images.thumb1} alt="Suite Interior 1" />
                  </div>
                  <div className="grid-thumb" onClick={() => setLightboxIndex(2)}>
                    <img src={data.images.thumb2} alt="Suite Interior 2" />
                  </div>
                  <div className="grid-thumb" onClick={() => setLightboxIndex(3)}>
                    <img src={data.images.thumb3} alt="Suite Interior 3" />
                  </div>
                  <div className="grid-thumb" onClick={() => setLightboxIndex(4)}>
                    <img src={data.images.thumb4} alt="Suite Interior 4" />
                  </div>
                </div>

                <button className="show-all-btn" onClick={() => setShowTour(true)}>
                  <Grid size={16} />
                  <span>Show all photos</span>
                </button>
              </div>
            </div>
          ) : (
            /* PHOTO TOUR VIEW (Airbnb Categories + Scroll linked view) */
            <div className="photo-tour-view">
              
              {/* Photo Tour Top Categories Navigation */}
              <div className="photo-tour-nav-bar">
                <h3 className="nav-title">Photo tour</h3>
                <div className="nav-categories-scroll">
                  {data.sections.map((sec) => (
                    <button
                      key={sec.id}
                      className={`nav-category-tab ${activeSection === sec.id ? 'active' : ''}`}
                      onClick={() => handleScrollToSection(sec.id)}
                    >
                      <div className="tab-thumb-wrapper">
                        <img src={sec.photos[0]} alt={sec.title} className="tab-thumb-img" />
                      </div>
                      <span className="tab-label">{sec.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Gallery Content */}
              <div className="photo-tour-content" ref={tourContentRef} onScroll={handleScroll}>
                {data.sections.map((sec) => (
                  <div 
                    key={sec.id} 
                    className="photo-tour-section" 
                    ref={(el) => { sectionRefs.current[sec.id] = el; }}
                  >
                    <div className="section-header-meta">
                      <h2 className="section-heading">{sec.title}</h2>
                      {sec.description && <p className="section-desc">{sec.description}</p>}
                    </div>

                    <div className="section-photos-grid">
                      {sec.photos.length === 1 ? (
                        /* Single wide image */
                        <div 
                          className="single-photo-layout"
                          onClick={() => {
                            const idx = allPhotos.indexOf(sec.photos[0]);
                            if (idx !== -1) setLightboxIndex(idx);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <img src={sec.photos[0]} alt={sec.title} />
                        </div>
                      ) : (
                        /* Main image with side-by-side images below */
                        <div className="tour-grid-layout">
                          <div 
                            className="tour-main-photo"
                            onClick={() => {
                              const idx = allPhotos.indexOf(sec.photos[0]);
                              if (idx !== -1) setLightboxIndex(idx);
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            <img src={sec.photos[0]} alt={`${sec.title} main`} />
                          </div>
                          <div className="tour-sub-photos">
                            {sec.photos.slice(1).map((photo, pIdx) => (
                              <div 
                                key={pIdx} 
                                className="tour-sub-photo-wrapper"
                                onClick={() => {
                                  const idx = allPhotos.indexOf(photo);
                                  if (idx !== -1) setLightboxIndex(idx);
                                }}
                                style={{ cursor: 'pointer' }}
                              >
                                <img src={photo} alt={`${sec.title} detail ${pIdx + 1}`} />
                              </div>
                            ))}
                            {/* Duplicate or placeholder to enforce the layout if only 2 photos, making them side-by-side */}
                            {sec.photos.length === 2 && (
                              <div className="tour-sub-photo-wrapper empty-placeholder">
                                <div className="placeholder-content">
                                  <span>Lulu Aurelian Sanctuary</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="photo-tour-footer">
                  <p>You have reached the end of the photo tour.</p>
                  <div className="tour-footer-actions">
                    <button className="btn-secondary" onClick={() => setShowTour(false)}>
                      Back to Overview
                    </button>
                    <button 
                      className="btn-primary" 
                      onClick={() => {
                        if (onBookSelect) onBookSelect(suiteId);
                        onClose();
                      }}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* FULL SCREEN LIGHTBOX / IMAGE VIEWER */}
      {lightboxIndex !== null && (
        <div className="lightbox-overlay" onClick={() => setLightboxIndex(null)}>
          
          <div className="lightbox-header">
            <button className="lightbox-close-btn" onClick={() => setLightboxIndex(null)}>
              <X size={24} />
            </button>
          </div>

          <div className="lightbox-content">
            <button className="lightbox-arrow prev" onClick={handlePrevPhoto} aria-label="Previous image">
              <ChevronLeft size={36} />
            </button>
            
            <div className="lightbox-image-container" onClick={(e) => e.stopPropagation()}>
              <img 
                src={allPhotos[lightboxIndex]} 
                alt={`Suite view ${lightboxIndex + 1}`} 
                className="lightbox-main-image" 
              />
            </div>

            <button className="lightbox-arrow next" onClick={handleNextPhoto} aria-label="Next image">
              <ChevronRight size={36} />
            </button>
          </div>

          <div className="lightbox-counter">
            {lightboxIndex + 1} / {allPhotos.length}
          </div>

          <div className="lightbox-thumbnails-container" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-thumbnails-scroll" ref={thumbnailsRef}>
              {allPhotos.map((photo, index) => (
                <button 
                  key={index} 
                  className={`lightbox-thumb-btn ${index === lightboxIndex ? 'active' : ''}`}
                  onClick={() => setLightboxIndex(index)}
                >
                  <img src={photo} alt={`Thumbnail ${index + 1}`} className="lightbox-thumb-img" />
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
