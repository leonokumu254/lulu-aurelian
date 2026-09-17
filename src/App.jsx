import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from './components/Header';
import './App.css';
import Hero from './components/Hero';
import About from './components/About';
import WhyChooseUs from './components/WhyChooseUs';
import OffersSection from './components/OffersSection';
import OffersPage from './components/OffersPage';
import Reviews from './components/Reviews';
import Listings from './components/Listings';
import Newsletter from './components/Newsletter';
import ContactSection from './components/ContactSection';
import Location from './components/Location';
import Footer from './components/Footer';
import WhatsAppIcon from './components/WhatsAppIcon';
import BookingForm from './components/BookingForm';
import BookingSummary from './components/BookingSummary';
import SuccessModal from './components/SuccessModal';
import PortalDashboard from './components/PortalDashboard';
import AuthPage from './components/AuthPage';
import GuestAuthModal from './components/GuestAuthModal';
import BookingStatusWidget from './components/BookingStatusWidget';
import CheckoutPage from './components/CheckoutPage';
import { fetchLivePricing } from './utils/pricing';

import AOS from 'aos';
import 'aos/dist/aos.css';

export default function App() {
  const [page, setPage] = useState('home');
  const [formData, setFormData] = useState({
    suite: 'skyview',
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    hasChildren: false,
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    phoneCountryCode: '+254',
    phone: '',
    specialRequests: '',
    offerId: null
  });
  const [successDetails, setSuccessDetails] = useState(null);

  // Authentication state
  const [authUser, setAuthUser] = useState(null);
  const [showGuestAuth, setShowGuestAuth] = useState(false);
  const [guestAuthDismissed, setGuestAuthDismissed] = useState(false);
  
  // Portal Tab State
  const [portalTab, setPortalTab] = useState('dashboard');

  // Fetch live pricing on app mount so clients always see the latest admin rates
  useEffect(() => {
    fetchLivePricing();
  }, []);

  // Check for existing session on mount using HttpOnly cookies
  useEffect(() => {
    const checkSession = async () => {
      try {
        let res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/me`, { credentials: 'include' });
        
        // If access token expired, try to refresh
        if (res.status === 401) {
          const refreshRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/refresh`, { method: 'POST', credentials: 'include' });
          if (refreshRes.ok) {
            // Retry fetching profile
            res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/me`, { credentials: 'include' });
          } else {
            throw new Error('Refresh failed');
          }
        }

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setAuthUser({
              ...data.user,   
              role: data.user.role.toLowerCase(),
              avatar: data.user.avatar || '/avatar.svg'
            });
          }
        }
      } catch (err) {
        setAuthUser(null);
      }
    };

    checkSession();
  }, []);

  // Handle redirect to checkout after login success if query params dictate it
  useEffect(() => {
    if (authUser) {
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get('redirect');
      if (redirectTo === 'checkout') {
        const suite = searchParams.get('suite') || 'skyview';
        const checkIn = searchParams.get('checkIn') || '';
        const checkOut = searchParams.get('checkOut') || '';
        const adults = parseInt(searchParams.get('adults'), 10) || 1;
        const children = parseInt(searchParams.get('children'), 10) || 0;
        const bookingType = searchParams.get('bookingType') || searchParams.get('booking_type') || 'entire';

        // Clear query parameters visually so they don't clutter the url
        window.history.replaceState({}, document.title, window.location.pathname);

        // Redirect to checkout
        window.location.hash = `#/checkout?suite=${suite}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}&bookingType=${bookingType}`;
      }
    }
  }, [authUser]);

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error(err);
    }
    
    // Clear legacy tokens if any
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('guestToken');
    
    setAuthUser(null);
    setGuestAuthDismissed(false);
    if (page === 'portal') {
      setPage('home');
    }
  };

  // Sync state with URL hash
  useEffect(() => {
    const handleRoute = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/booking')) {
        // Parse query params if available
        const queryIdx = hash.indexOf('?');
        let checkInParam = '';
        let checkOutParam = '';
        if (queryIdx !== -1) {
          const queryStr = hash.substring(queryIdx + 1);
          const params = new URLSearchParams(queryStr);
          checkInParam = params.get('checkIn');
          checkOutParam = params.get('checkOut');
          
          setFormData(prev => ({
            ...prev,
            checkIn: checkInParam || prev.checkIn,
            checkOut: checkOutParam || prev.checkOut
          }));
        }

        // Set search params on the home page so listings can read them
        const searchParams = new URLSearchParams(window.location.search);
        if (checkInParam) searchParams.set('checkIn', checkInParam);
        if (checkOutParam) searchParams.set('checkOut', checkOutParam);
        const newUrl = `${window.location.pathname}?${searchParams.toString()}#/`;
        window.history.pushState({}, '', newUrl);

        setPage('home');
        setTimeout(() => {
          const el = document.getElementById('suites');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else if (hash.startsWith('#/checkout')) {
        setPage('checkout');
      } else if (hash.startsWith('#/portal') || hash.startsWith('#/dashboard')) {
        setPage('portal');

      } else if (hash.startsWith('#/offers')) {
        setPage('offers');
      } else {
        // If query string has reset_token, auto-route to portal
        if (window.location.search.includes('reset_token=')) {
          setPage('portal');
          window.location.hash = '#/portal';
        } else {
          setPage('home');
        }
      }
    };

    window.addEventListener('hashchange', handleRoute);
    handleRoute(); // Initial call on load

    return () => window.removeEventListener('hashchange', handleRoute);
  }, []);

  // Initialize AOS globally for uniform text animation
  useEffect(() => {
    const applyAos = () => {
      let changed = false;
      const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, .section-tagline, .about-label, .offer-title, .offer-desc, .unit-card-title, .unit-card-desc');
      elements.forEach(el => {
        if (
          !el.hasAttribute('data-aos') && 
          !el.closest('header') &&
          !el.closest('nav') &&
          !el.closest('.guest-session-bar') &&
          !el.closest('.guest-prompt-bar') &&
          !el.closest('.no-reveal') &&
          !el.closest('.reviews-section') &&
          !el.closest('.wa-chat-window') &&
          !el.closest('.gallery-modal-overlay') &&
          !el.closest('.booking-view-container') &&
          !el.closest('.lightbox-overlay') &&
          !el.closest('.sm-overlay') &&
          !el.closest('footer')
        ) {
          el.setAttribute('data-aos', 'fade-up');
          changed = true;
        }
      });
      return changed;
    };

    applyAos();
    
    AOS.init({
      duration: 1000,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
    });

    const mutationObserver = new MutationObserver(() => {
      if (applyAos()) {
        AOS.refresh();
      }
    });
    
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
    };
  }, [page]);

  // Update URL hash when transitioning pages
  const navigateToPage = (newPage, params = {}) => {
    if (newPage === 'home') {
      window.location.hash = '#/';
      window.scrollTo(0, 0);
    } else if (newPage === 'booking') {
      const suite = params.suite || formData.suite;
      const checkIn = params.checkIn || formData.checkIn;
      const checkOut = params.checkOut || formData.checkOut;
      const offerId = params.offerId || formData.offerId;
      
      let queryStr = `?suite=${suite}`;
      if (checkIn) queryStr += `&checkIn=${checkIn}`;
      if (checkOut) queryStr += `&checkOut=${checkOut}`;
      if (offerId) queryStr += `&offerId=${offerId}`;
      
      window.location.hash = `#/booking${queryStr}`;
      window.scrollTo(0, 0);
    } else if (newPage === 'checkout') {
      const suite = params.suite || formData.suite;
      const checkIn = params.checkIn || formData.checkIn;
      const checkOut = params.checkOut || formData.checkOut;
      const adults = params.adults || formData.adults;
      const children = params.children || formData.children;
      
      let queryStr = `?suite=${suite}`;
      if (checkIn) queryStr += `&checkIn=${checkIn}`;
      if (checkOut) queryStr += `&checkOut=${checkOut}`;
      if (adults) queryStr += `&adults=${adults}`;
      if (children) queryStr += `&children=${children}`;
      
      window.location.hash = `#/checkout${queryStr}`;
      window.scrollTo(0, 0);
    } else if (newPage === 'portal') {
      window.location.hash = '#/portal';
      window.scrollTo(0, 0);
    } else if (newPage === 'offers') {
      window.location.hash = '#/offers';
      window.scrollTo(0, 0);
    }
  };

  // Callback from Hero search
  const handleHeroSearch = (checkIn, checkOut) => {
    setFormData(prev => ({ ...prev, checkIn, checkOut }));
    
    // Set query params in the browser history
    const searchParams = new URLSearchParams(window.location.search);
    if (checkIn) searchParams.set('checkIn', checkIn);
    if (checkOut) searchParams.set('checkOut', checkOut);
    const newUrl = `${window.location.pathname}?${searchParams.toString()}${window.location.hash || '#/'}`;
    window.history.pushState({}, '', newUrl);

    const el = document.getElementById('suites');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Callback from Listings cards
  const handleBookSelect = (suiteId) => {
    setFormData(prev => ({ ...prev, suite: suiteId }));
    
    // Scroll smoothly to suites listing section
    const el = document.getElementById('suites');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Callback on final booking request
  const handleBookingSubmit = (completedDetails) => {
    setSuccessDetails(completedDetails);
  };

  const handleCloseModal = () => {
    setSuccessDetails(null);
    // Always navigate to the portal so the user can track/pay their pending booking
    if (authUser) {
      navigateToPage('portal');
      setPortalTab('dashboard');
    } else {
      navigateToPage('home');
    }
  };

  // Explicit "Pay Later" — same as close but always goes to portal/dashboard
  const handlePayLater = () => {
    setSuccessDetails(null);
    navigateToPage('portal');
    setPortalTab('dashboard');
  };

  return (
    <div className="app-root">
      <Helmet>
        <title>{page === 'home' ? 'Lulu Aurelian Estate | Luxury Escapes' : page === 'booking' ? 'Book Your Stay | Lulu Aurelian' : page === 'portal' ? 'Guest Portal | Lulu Aurelian' : 'Lulu Aurelian Estate'}</title>
        <meta name="description" content="Lulu Aurelian Estate is the epitome of luxury penthouse living and refined hospitality in East Africa. Our estate offers an unparalleled blend of modern elegance and bespoke services, featuring meticulously designed suites like the Cocoa Suite and Skyview Suite, both offering breathtaking panoramic views. Guests experience a world-class stay with dedicated concierge assistance, gourmet dining options, premium amenities, and immaculate housekeeping services. Whether you are seeking a peaceful retreat, a romantic getaway, or an executive stay, our property ensures an unforgettable experience tailored to your exact desires. From seamless direct bookings and integrated payment gateways to secure user portals for both guests and management, Lulu Aurelian Estate is committed to providing seamless convenience and sophisticated comfort. Discover opulence, tranquility, and exclusivity at Lulu Aurelian Estate, where every detail is crafted to exceed your highest expectations in modern hospitality." />
      </Helmet>

      {/* Global Header Navigation - Hidden on Portal & Checkout for full dashboard / transactional layout */}
      {page !== 'portal' && page !== 'checkout' && (
        <Header page={page} setPage={(p, params) => navigateToPage(p, params)} authUser={authUser} onLogout={handleLogout} />
      )}

      {page === 'portal' ? (
        <div className="no-reveal">
          <PortalDashboard 
            formData={formData}
            setFormData={setFormData}
            onBookingSubmit={handleBookingSubmit}
            portalTab={portalTab}
            setPortalTab={setPortalTab}
            user={authUser}
            setUser={setAuthUser}
            onLogout={handleLogout}
            setPage={setPage}
          />
        </div>
      ) : page === 'home' ? (
        <main className="home-view">
          <Hero onSearch={handleHeroSearch} />
          <About />
          <Listings onBookSelect={handleBookSelect} />
          <WhyChooseUs />
          <OffersSection setPage={(p, params) => navigateToPage(p, params)} />
          <BookingStatusWidget user={authUser} />
          {!authUser && (
            <AuthPage 
              onLoginSuccess={(profile) => {
                setAuthUser(profile);
                setPage('portal');
                navigateToPage('portal');
              }} 
            />
          )}
          <Reviews />
          <ContactSection />
          <Newsletter />
        </main>
      ) : page === 'offers' ? (
        <OffersPage setPage={(p, params) => navigateToPage(p, params)} />
      ) : page === 'checkout' ? (
        <CheckoutPage user={authUser} setUser={setAuthUser} onLogout={handleLogout} />
      ) : (
        <main className="booking-view-container container">
          <div className="booking-header-offset" />
          
          <button onClick={() => navigateToPage('home')} className="back-link-btn">
            ← Back to Suites
          </button>

          {/* Guest session bar */}
          {authUser && (
            <div className="guest-session-bar">
              <span>Signed in as <strong>{authUser.name}</strong></span>
              <button onClick={handleLogout}>Sign Out</button>
            </div>
          )}

          {!authUser && !guestAuthDismissed && (
            <div className="guest-prompt-bar">
              <span>Have an account? <button onClick={() => setShowGuestAuth(true)}>Sign in</button> for faster booking</span>
            </div>
          )}

          <h1 className="booking-page-title">Secure Your Stay</h1>
          
          <div className="booking-grid grid-layout">
            <div className="booking-main-col">
              <BookingForm 
                formData={formData} 
                setFormData={setFormData} 
                onSubmit={handleBookingSubmit}
                user={authUser}
              />
            </div>
            
            <div className="booking-sidebar-col">
              <BookingSummary 
                formData={formData} 
                onSubmit={handleBookingSubmit}
                guestUser={authUser}
              />
            </div>
          </div>
        </main>
      )}

      {/* Shared Persistent Footer & Location */}
      {page !== 'portal' && page !== 'checkout' && (
        <>
          <Location />
          <Footer setPage={(p, params) => navigateToPage(p, params)} />
        </>
      )}

      {/* Shared WhatsApp floating bubble */}
      {page !== 'portal' && page !== 'checkout' && <WhatsAppIcon />}

      {/* Success Modal */}
      {successDetails && (
        <SuccessModal
          bookingDetails={successDetails}
          onClose={handleCloseModal}
          onPayLater={handlePayLater}
        />
      )}

      {/* Guest Auth Modal */}
      <GuestAuthModal
        isOpen={showGuestAuth}
        onClose={() => setShowGuestAuth(false)}
        onAuthSuccess={(user) => {
          setAuthUser({
            ...user,
            role: user.role.toLowerCase(),
            avatar: user.avatar || '/avatar.svg'
          });
          setShowGuestAuth(false);
          // Auto-fill booking form from profile
          const nameParts = user.name.split(' ');
          
          // Handle phone prefix if applicable
          let rawPhone = user.phone || '';
          let countryCode = '+254';
          if (rawPhone.startsWith('+254')) {
            rawPhone = rawPhone.substring(4);
          }
          
          setFormData(prev => ({
            ...prev,
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: user.email,
            confirmEmail: user.email,
            phone: rawPhone,
            phoneCountryCode: countryCode
          }));
        }}
        onContinueAsGuest={() => {
          setShowGuestAuth(false);
          setGuestAuthDismissed(true);
        }}
      />
    </div>
  );
}
