import React, { useState, useEffect } from 'react';
import { LogOut, LayoutGrid, Sliders, Home, User, Menu, Calendar, BookOpen, Key, FileText, Star, DollarSign, Users, X, Wifi } from 'lucide-react';
import AuthPage from './AuthPage';
import AgentPortal from './AgentPortal';
import ManagerPortal from './ManagerPortal';
import GuestPortal from './GuestPortal';
import BookingForm from './BookingForm';
import BookingSummary from './BookingSummary';
import SuitePasscodes from './SuitePasscodes';
import ContentStudio from './ContentStudio';
import RateUs from './RateUs';
import ChangePassword from './ChangePassword';
import './PortalDashboard.css';

export default function PortalDashboard({ user, setUser, formData, setFormData, onBookingSubmit, portalTab, setPortalTab, onLogout, setPage }) {
  const [viewMode, setViewMode] = useState('operational'); // operational (Agent), administrative (Manager), guest
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(!user);
  const [guestsCount, setGuestsCount] = useState(0);

  // Check for existing JWT on mount – auto-login if valid
  useEffect(() => {
    if (user) {
      setLoading(false);
      return;
    }

    const checkExistingSession = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/me`, {
          credentials: 'include'
        });
        const data = await response.json();

        if (response.ok && data.success) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role.toLowerCase(),
            avatar: data.user.role === 'MANAGER'
              ? '/avatar.svg'
              : '/user-icon.svg' 
          });
        } else {
          // Token invalid/expired — clear it
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Session check failed:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  // Auto-set view mode when user role changes
  useEffect(() => {
    if (user) {
      if (user.role === 'manager') {
        setViewMode('pricing');
      } else if (user.role === 'guest') {
        setViewMode('guest');
      } else {
        setViewMode('operational');
      }

      if (user.role === 'manager' || user.role === 'agent') {
        fetch(`${import.meta.env.VITE_API_URL || ''}/api/users`, { credentials: 'include' })
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              setGuestsCount(data.filter(u => u.role === 'GUEST').length);
            }
          })
          .catch(err => console.error('Failed to fetch guests count', err));
      }
    }
  }, [user]);

  const handleLoginSuccess = (profile) => {
    setUser(profile);
  };

  const handleLocalLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setUser(null);
    if (onLogout) onLogout();
  };

  // Show loading spinner while checking session
  if (loading) {
    return (
      <div className="login-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        {/* Mobile Menu Toggle Overlay */}
        {mobileMenuOpen && (
          <div 
            className="mobile-overlay" 
            style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 95}}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Left Sidebar */}
        <aside className={`dashboard-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-profile">
            <button
              className="sidebar-mobile-close"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            <div className="profile-avatar-container">
              <img src={user.avatar || '/user-icon.svg'} alt="Avatar" />
            </div>
            <span className="profile-name">{user.name || user.email.split('@')[0]}</span>
            <span className="profile-role">{user.role}</span>
          </div>

          <nav className="sidebar-nav">
          {user.role === 'manager' && (
            <>
              <button 
                className={`nav-item ${viewMode === 'pricing' ? 'active' : ''}`}
                onClick={() => { setViewMode('pricing'); setMobileMenuOpen(false); }}
              >
                <DollarSign size={20} />
                <span>Pricing</span>
              </button>
              <button 
                className={`nav-item ${viewMode === 'calendar' ? 'active' : ''}`}
                onClick={() => { setViewMode('calendar'); setMobileMenuOpen(false); }}
              >
                <Calendar size={20} />
                <span>Calendar & iCal</span>
              </button>
              <button 
                className={`nav-item ${viewMode === 'team' ? 'active' : ''}`}
                onClick={() => { setViewMode('team'); setMobileMenuOpen(false); }}
              >
                <Users size={20} />
                <span>Team Management</span>
              </button>
              <button 
                className={`nav-item ${viewMode === 'moderation' ? 'active' : ''}`}
                onClick={() => { setViewMode('moderation'); setMobileMenuOpen(false); }}
              >
                <Star size={20} />
                <span>Moderation</span>
              </button>
              <button 
                className={`nav-item ${viewMode === 'guests' ? 'active' : ''}`}
                onClick={() => { setViewMode('guests'); setMobileMenuOpen(false); }}
              >
                <User size={20} />
                <span>Guest Directory</span>
              </button>
              <button 
                className={`nav-item ${viewMode === 'operational' ? 'active' : ''}`}
                onClick={() => { setViewMode('operational'); setMobileMenuOpen(false); }}
              >
                <LayoutGrid size={20} />
                <span>Agent Desk</span>
              </button>
              <button 
                className={`nav-item ${viewMode === 'passcodes' ? 'active' : ''}`}
                onClick={() => { setViewMode('passcodes'); setMobileMenuOpen(false); }}
              >
                <Key size={20} />
                <span>Key Suites</span>
              </button>
              <button 
                className={`nav-item ${viewMode === 'wifi' ? 'active' : ''}`}
                onClick={() => { setViewMode('wifi'); setMobileMenuOpen(false); }}
              >
                <Wifi size={20} />
                <span>Wi-Fi Details</span>
              </button>
              <button 
                className={`nav-item ${viewMode === 'cms' ? 'active' : ''}`}
                onClick={() => { setViewMode('cms'); setMobileMenuOpen(false); }}
              >
                <FileText size={20} />
                <span>Content Studio</span>
              </button>
            </>
          )}

          {user.role === 'agent' && (
            <>
              <button 
                className={`nav-item ${viewMode === 'operational' ? 'active' : ''}`}
                onClick={() => { setViewMode('operational'); setMobileMenuOpen(false); }}
              >
                <LayoutGrid size={20} />
                <span>Agent Desk</span>
              </button>
              <button 
                className={`nav-item ${viewMode === 'passcodes' ? 'active' : ''}`}
                onClick={() => { setViewMode('passcodes'); setMobileMenuOpen(false); }}
              >
                <Key size={20} />
                <span>Key Suites</span>
              </button>
              <button 
                className={`nav-item ${viewMode === 'wifi' ? 'active' : ''}`}
                onClick={() => { setViewMode('wifi'); setMobileMenuOpen(false); }}
              >
                <Wifi size={20} />
                <span>Wi-Fi Details</span>
              </button>
              <button 
                className={`nav-item ${viewMode === 'cms' ? 'active' : ''}`}
                onClick={() => { setViewMode('cms'); setMobileMenuOpen(false); }}
              >
                <FileText size={20} />
                <span>Content Studio</span>
              </button>
            </>
          )}

          {user.role === 'guest' && (
            <>
              <button 
                className={`nav-item ${portalTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => { setPortalTab('dashboard'); setMobileMenuOpen(false); }}
              >
                <BookOpen size={20} />
                <span>My Bookings</span>
              </button>
              <button 
                className={`nav-item ${portalTab === 'booking' ? 'active' : ''}`}
                onClick={() => { setPortalTab('booking'); setMobileMenuOpen(false); }}
              >
                <Calendar size={20} />
                <span>Book New Stay</span>
              </button>
              <button 
                className={`nav-item ${portalTab === 'rate' ? 'active' : ''}`}
                onClick={() => { setPortalTab('rate'); setMobileMenuOpen(false); }}
              >
                <Star size={20} />
                <span>Rate Us</span>
              </button>
              <button 
                className={`nav-item ${portalTab === 'settings' ? 'active' : ''}`}
                onClick={() => { setPortalTab('settings'); setMobileMenuOpen(false); }}
              >
                <Sliders size={20} />
                <span>Settings</span>
              </button>
            </>
          )}
          </nav>
          
          <button className="logout-btn" onClick={handleLocalLogout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </aside>

        {mobileMenuOpen && (
          <div 
            className="sidebar-backdrop" 
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation overlay"
          />
        )}

        {/* Main Content Area */}
        <main className="dashboard-main-content">
          {/* Top Header */}
          <header className="dashboard-top-header">
            <div className="header-title-group">
              <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(true)}>
                <Menu size={22} />
              </button>
              <div>
                <h1>
                  {viewMode === 'pricing' ? 'Pricing Engine' : viewMode === 'team' ? 'Team Management' : viewMode === 'moderation' ? 'Guest Reviews' : viewMode === 'guests' ? 'Guest Directory' : viewMode === 'operational' ? 'Agent Desk' : viewMode === 'passcodes' ? 'Key Suites' : viewMode === 'wifi' ? 'Wi-Fi Details' : viewMode === 'cms' ? 'Content Studio' : 'Guest Portal'}
                </h1>
              </div>
            </div>

            <div className="header-right-actions">
              <button 
                className="btn-home" 
                onClick={() => { 
                  if (typeof setPage === 'function') {
                    setPage('home');
                  } else if (window.location.hostname.includes('staff.')) {
                    window.location.href = 'https://www.luluaurelian.co.ke';
                  } else {
                    window.location.hash = '#/';
                  }
                }}
              >
                <Home size={16} />
                <span>Website</span>
              </button>
            </div>
          </header>

          {/* Dynamic Content */}
          <div className="dashboard-content-area">
            {viewMode === 'guest' ? (
              portalTab === 'booking' ? (
                <div className="portal-booking-container">
                  <div className="booking-grid grid-layout">
                    <div className="booking-main-col">
                      <BookingForm 
                        formData={formData} 
                        setFormData={setFormData} 
                        onSubmit={onBookingSubmit}
                        user={user}
                      />
                    </div>
                    <div className="booking-sidebar-col">
                      <BookingSummary 
                        formData={formData} 
                        onSubmit={onBookingSubmit}
                        guestUser={user}
                      />
                    </div>
                  </div>
                </div>
              ) : portalTab === 'rate' ? (
                <RateUs user={user} />
              ) : portalTab === 'settings' ? (
                <ChangePassword
                  user={user}
                  onProfileUpdate={(updatedUser) => {
                    // Merge updated fields (name, phone) back into the global user state
                    setUser(prev => prev ? { ...prev, ...updatedUser } : prev);
                  }}
                />
              ) : (
                <GuestPortal user={user} onBookNew={() => setPortalTab('booking')} />
              )
            ) : viewMode === 'operational' ? (
              <AgentPortal user={user} />
            ) : viewMode === 'passcodes' ? (
              <SuitePasscodes section="keys" />
            ) : viewMode === 'wifi' ? (
              <SuitePasscodes section="wifi" />
            ) : viewMode === 'cms' ? (
              <ContentStudio user={user} />
            ) : (
              <ManagerPortal user={user} managerTab={viewMode === 'administrative' ? 'pricing' : viewMode} onTabChange={setViewMode} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
