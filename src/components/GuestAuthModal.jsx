import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, LogIn, UserPlus, ArrowRight, Phone, CheckCircle } from 'lucide-react';
import './GuestAuthModal.css';

export default function GuestAuthModal({ isOpen, onClose, onAuthSuccess, onContinueAsGuest }) {
  const [mode, setMode] = useState('choice'); // choice, login, register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
      const response = await fetch('/api/auth/login', {
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
      const response = await fetch('/api/auth/register', {
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
              <p>Create an account to track your bookings, or continue as a guest.</p>
            </div>

            <div className="guest-auth-options">
              <button className="auth-option-btn primary" onClick={() => switchMode('login')}>
                <LogIn size={20} />
                <div className="option-text">
                  <span className="option-title">Sign In</span>
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
              <p>Don't have an account? <button onClick={() => switchMode('register')}>Create one</button></p>
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
