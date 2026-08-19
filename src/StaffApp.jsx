import React, { useState, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import PortalDashboard from './components/PortalDashboard';
import AuthPage from './components/AuthPage';
import './StaffApp.css';

export default function StaffApp() {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

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

  if (loading) {
    return (
      <div className="staff-loading-screen">
        <div className="staff-spinner"></div>
        <p>Loading Lulu Aurelian Staff Console...</p>
      </div>
    );
  }

  return (
    <div className="staff-app-root">
      <Helmet>
        <title>Staff Console | Lulu Aurelian Estate</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {authUser ? (
        <PortalDashboard 
          user={authUser}
          setUser={setAuthUser}
          formData={{}}
          setFormData={() => {}}
          onBookingSubmit={() => {}}
          portalTab="dashboard"
          setPortalTab={() => {}}
          onLogout={handleExplicitLogout}
          setPage={() => {}}
        />
      ) : (
        <div className="staff-login-container">
          <header className="staff-login-header">
            <img src="/lulu_aurelian_logo.svg" alt="Lulu Aurelian Logo" className="staff-logo" />
            <h1>LULU AURELIAN ESTATE</h1>
            <h2>Staff Operations Console</h2>
          </header>
          
          {errorMsg && (
            <div className="staff-error-banner">
              <p>{errorMsg}</p>
            </div>
          )}

          <div className="staff-auth-card">
            <AuthPage onLoginSuccess={handleLoginSuccess} />
          </div>
          
          <footer className="staff-login-footer">
            <p>© {new Date().getFullYear()} Lulu Aurelian Estate. All rights reserved.</p>
            <a href="https://www.luluaurelian.co.ke" className="back-to-site">Go to Guest Website</a>
          </footer>
        </div>
      )}
    </div>
  );
}
