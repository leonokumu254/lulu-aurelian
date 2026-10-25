import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, LogIn, UserPlus, ArrowRight, Phone, CheckCircle, Sparkles } from 'lucide-react';
import './GuestAuthModal.css';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function GuestAuthModal({ isOpen, onClose, onAuthSuccess, onContinueAsGuest }) {
  const [mode, setMode] = useState('choice'); // choice, login, register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError('');
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
          credentials: 'include'
        });
        const data = await response.json();
        if (response.ok && data.success && data.user) {
          if (data.token) localStorage.setItem('guestToken', data.token);
          setSuccessMessage('Signed in with Google! Preparing your booking...');
          setTimeout(() => {
            onAuthSuccess({
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              role: data.user.role,
              phone: data.user.phone || '',
              token: data.token,
              avatar: data.user.avatar || null
            });
          }, 1200);
        } else {
          setError(data.error || 'Google authentication failed.');
        }
      } catch (err) {
        setError('Connection error during Google sign-in.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => setError('Google sign-in was cancelled or failed.')
  });

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setConfirmPassword('');
    setError('');
    setSuccessMessage('');
    setShowPassword(false);
  };

  const switchMode = (newMode) => {
    resetForm();
    setMode(newMode);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('guestToken', data.token);
        onAuthSuccess({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          phone: data.user.phone,
          token: data.token
        });
      } else {
        setError(data.error || 'Invalid credentials.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim()
        })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('guestToken', data.token);
        setSuccessMessage('Account created successfully! Welcome to Lulu Aurelian Estate.');
        
        setTimeout(() => {
          onAuthSuccess({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            phone: data.user.phone,
            token: data.token
          });
        }, 2500);
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="guest-auth-overlay" onClick={onClose}>
      <div className="guest-auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="guest-auth-close" onClick={onClose}>
          <X size={20} />
        </button>

        {/* SUCCESS MESSAGE */}
        {successMessage ? (
          <div className="guest-auth-success animate-fade-in" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <CheckCircle size={32} />
            </div>
            <h2 style={{ color: 'var(--color-gold-deep)', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>Success!</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: '1.5' }}>{successMessage}</p>
            <Loader2 size={24} className="spinner" style={{ margin: '2rem auto 0 auto', color: 'rgba(255,255,255,0.3)' }} />
          </div>
        ) : (
          <>
            {/* CHOICE MODE */}
        {mode === 'choice' && (
          <div className="guest-auth-choice animate-fade-in">
            <div className="guest-auth-header">
              <h2>Before You Book</h2>
              <p>Sign in with Google for 1-click booking, create an account, or continue as guest.</p>
            </div>

            <div className="guest-auth-options">
              {/* Google 1-Click Fast Button */}
              <button 
                type="button" 
                className="auth-option-btn google" 
                onClick={() => googleLogin()}
                disabled={googleLoading || loading}
              >
                <GoogleIcon />
                <div className="option-text">
                  <span className="option-title">{googleLoading ? 'Connecting...' : 'Sign in with Google'}</span>
                  <span className="option-desc">Fast 1-click booking & instant autofill</span>
                </div>
                <ArrowRight size={16} className="option-arrow" />
              </button>

              <div className="auth-divider">
                <span>or continue with</span>
              </div>

              <button className="auth-option-btn primary" onClick={() => switchMode('login')}>
                <LogIn size={20} />
                <div className="option-text">
                  <span className="option-title">Sign In with Email</span>
                  <span className="option-desc">Already have an account</span>
                </div>
                <ArrowRight size={16} className="option-arrow" />
              </button>

              <button className="auth-option-btn secondary" onClick={() => switchMode('register')}>
                <UserPlus size={20} />
                <div className="option-text">
                  <span className="option-title">Create Account</span>
                  <span className="option-desc">Track bookings & get exclusive offers</span>
                </div>
                <ArrowRight size={16} className="option-arrow" />
              </button>

              <div className="auth-divider">
                <span>or</span>
              </div>

              <button className="auth-option-btn ghost" onClick={onContinueAsGuest}>
                <ArrowRight size={20} />
                <div className="option-text">
                  <span className="option-title">Continue as Guest</span>
                  <span className="option-desc">Book without creating an account</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* LOGIN MODE */}
        {mode === 'login' && (
          <div className="guest-auth-form-view animate-fade-in">
            <div className="guest-auth-header">
              <h2>Welcome Back</h2>
              <p>Sign in to your account to continue.</p>
            </div>

            {error && (
              <div className="guest-auth-error">
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              className="guest-google-full-btn"
              onClick={() => googleLogin()}
              disabled={googleLoading || loading}
            >
              <GoogleIcon />
              <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>

            <div className="auth-divider" style={{ margin: '1rem 0' }}>
              <span>or sign in with email</span>
            </div>

            <form onSubmit={handleLogin} className="guest-auth-form">
              <div className="guest-input-group">
                <Mail size={16} className="guest-input-icon" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="guest-input-group">
                <Lock size={16} className="guest-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="guest-toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button type="submit" className="guest-submit-btn" disabled={loading}>
                {loading ? (
                  <><Loader2 size={16} className="spinner" /> Signing in...</>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="guest-auth-footer">
              <p>Don't have an account? <button onClick={() => switchMode('register')}>Sign up</button></p>
              <p><button onClick={() => switchMode('choice')}>← Back to options</button></p>
            </div>
          </div>
        )}

        {/* REGISTER MODE */}
        {mode === 'register' && (
          <div className="guest-auth-form-view animate-fade-in">
            <div className="guest-auth-header">
              <h2>Create Your Account</h2>
              <p>Join to track bookings and receive exclusive offers.</p>
            </div>

            {error && (
              <div className="guest-auth-error">
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              className="guest-google-full-btn"
              onClick={() => googleLogin()}
              disabled={googleLoading || loading}
            >
              <GoogleIcon />
              <span>{googleLoading ? 'Connecting...' : 'Sign up with Google'}</span>
            </button>

            <div className="auth-divider" style={{ margin: '1rem 0' }}>
              <span>or create with email</span>
            </div>

            <form onSubmit={handleRegister} className="guest-auth-form">
              <div className="guest-input-group">
                <User size={16} className="guest-input-icon" />
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="name"
                />
              </div>

              <div className="guest-input-group">
                <Phone size={16} className="guest-input-icon" />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  autoComplete="tel"
                />
              </div>

              <div className="guest-input-group">
                <Mail size={16} className="guest-input-icon" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="guest-input-group">
                <Lock size={16} className="guest-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="guest-toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="guest-input-group">
                <Lock size={16} className="guest-input-icon" />
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>

              <button type="submit" className="guest-submit-btn" disabled={loading}>
                {loading ? (
                  <><Loader2 size={16} className="spinner" /> Creating account...</>
                ) : (
                  'Create Account & Continue'
                )}
              </button>
            </form>

            <div className="guest-auth-footer">
              <p>Already have an account? <button onClick={() => switchMode('login')}>Sign in</button></p>
              <p><button onClick={() => switchMode('choice')}>← Back to options</button></p>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
