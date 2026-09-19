import React, { useState, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import PortalDashboard from './components/PortalDashboard';
import AuthPage from './components/AuthPage';
import Preloader from './components/Preloader';
import './StaffApp.css';

export default function StaffApp() {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // ── Preloader: show on initial load and on browser refresh
  const [showPreloader, setShowPreloader] = useState(() => {
    try {
      const navEntries = performance.getEntriesByType('navigation');
      const isReload = (navEntries && navEntries[0] && navEntries[0].type === 'reload') ||
                       (window.performance && window.performance.navigation && window.performance.navigation.type === 1);
      if (isReload) return true;

      return sessionStorage.getItem('lulu_staff_preloader_seen') !== 'true';
    } catch {
      return true;
    }
  });
  const [errorMsg, setErrorMsg] = useState('');

  const [portalTab, setPortalTab] = useState('dashboard');
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
            const role = data.user.role.toLowerCase();
            if (role === 'manager' || role === 'agent') {
              setAuthUser({
                ...data.user,   
                role: role,
                avatar: data.user.avatar || (role === 'manager' ? '/avatar.svg' : '/user-icon.svg')
              });
            } else {
              // Not a staff member — log them out from this context
              await handleExplicitLogout();
              setErrorMsg('Access denied. This portal is restricted to Lulu Aurelian staff members only.');
            }
          }
        }
      } catch (err) {
        setAuthUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleExplicitLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error(err);
    }
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setAuthUser(null);
  };

  const handleLoginSuccess = async (profile) => {
    const role = profile.role.toLowerCase();
    if (role === 'manager' || role === 'agent') {
      setAuthUser({
        ...profile,
        role: role
      });
      setErrorMsg('');
    } else {
      // Reject guest login to Staff portal
      await handleExplicitLogout();
      setErrorMsg('Access denied. Guest accounts are not permitted on the Staff Console.');
    }
  };

  const handleNavigatePage = (targetPage) => {
    if (targetPage === 'home' || !targetPage) {
      window.location.href = 'https://www.luluaurelian.co.ke';
    } else {
      window.location.href = `https://www.luluaurelian.co.ke/#/${targetPage}`;
    }
  };

  return (
    <div className="staff-app-root">
      {/* Unified Luxury Preloader for staff.luluaurelian.co.ke */}
      {showPreloader && (
        <Preloader onComplete={() => {
          try {
            sessionStorage.setItem('lulu_staff_preloader_seen', 'true');
          } catch {}
          setShowPreloader(false);
        }} />
      )}

      <Helmet>
        <title>Staff Console | Lulu Aurelian Estate</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {loading && !showPreloader ? (
        <div className="staff-loading-screen">
          <div className="staff-spinner"></div>
          <p>Connecting to secure workspace...</p>
        </div>
      ) : authUser ? (
        <PortalDashboard 
          user={authUser}
          setUser={setAuthUser}
          formData={formData}
          setFormData={setFormData}
          onBookingSubmit={() => {}}
          portalTab={portalTab}
          setPortalTab={setPortalTab}
          onLogout={handleExplicitLogout}
          setPage={handleNavigatePage}
        />
      ) : (
        <div className="staff-app-auth-wrapper">
          <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {errorMsg && (
              <div className="staff-error-banner">
                <p>{errorMsg}</p>
              </div>
            )}
            <AuthPage onLoginSuccess={handleLoginSuccess} isStaffPortal={true} />
            <div className="staff-login-footer">
              <a href="https://www.luluaurelian.co.ke" className="back-to-site">← Return to Lulu Aurelian Main Estate</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
