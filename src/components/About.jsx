import React from 'react';
import './About.css';

export default function About() {
  const handleScrollToSuites = () => {
    const el = document.getElementById('suites');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="about-section container" id="about">
      {/* Top Header Row */}
      <div className="about-top-row">
        <div className="about-title-col">
          <span className="about-label">WELCOME TO</span>
          <h2 className="about-main-title"><span className='about-title-span'>Lulu </span> Aurelian</h2>
        </div>
        <div className="about-desc-col">
          <p>
            We believe that travel should never mean leaving comfort behind. We provide a premium accommodation experience where guests enjoy the warmth of home alongside the luxury of a boutique stay. Located in the heart of Nyeri Town, we combine exceptional hospitality, pristine hygiene standards, personalized service, and seamless guest experiences to create memorable stays for  corporates, business travelers, tourists, couples, and families alike.
          </p>
        </div>
      </div>

      {/* Bottom Content Grid */}
      <div className="about-bottom-grid">
        {/* Text Column */}
        <div className="about-info-col">
          <h3 className="about-sub-title">ROOMS & SUITES</h3>

          <div className="about-book-stay-line">
            <span className="about-book-stay-text">BOOK YOUR STAY</span>
            <div className="gold-horizontal-line"></div>
          </div>

          <p className="about-info-desc">
            Every suite at Lulu Aurelian is thoughtfully curated to deliver the perfect balance of luxury, functionality, and relaxation. Featuring elegant interiors, premium furnishings, high-speed Wi-Fi, spotless living spaces, and modern amenities, our luxury Airbnb apartments in Nyeri are designed for guests who value comfort, cleanliness, and convenience. Whether you're visiting for business or leisure, our commitment to hygiene, attention to detail, and seamless check-in experience ensures you feel completely at home from the moment you arrive.
          </p>

          <button className="btn-explore-suites" onClick={handleScrollToSuites}>
            VIEW SUITES
          </button>
        </div>

        {/* Image Mosaic Column */}
        <div className="about-mosaic-col">
          <div className="about-gallery">
            <div className="about-gallery-left" data-aos="fade-up" data-aos-delay="100">
              <img
                src="/assets/cocoa/cocoa_14.avif"
                alt="Cocoa cozy living room"
                className="about-gallery-img"
                onClick={handleScrollToSuites}
              />
            </div>
            <div className="about-gallery-right-top" data-aos="fade-up" data-aos-delay="300">
              <img
                src="/assets/skyview/skyview_5.jpg"
                alt="skyview living room"
                className="about-gallery-img"
                onClick={handleScrollToSuites}
              />
            </div>
            <div className="about-gallery-right-bottom" data-aos="fade-up" data-aos-delay="500">
              <img
                src="/assets/skyview/skyview_13.jpg"
                alt="skyview bedroom 1 image."
                className="about-gallery-img"
                onClick={handleScrollToSuites}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}