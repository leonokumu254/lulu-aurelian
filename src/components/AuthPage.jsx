import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import './AuthPage.css';

export default function AuthPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset'
  const [resetToken, setResetToken] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check URL for reset token on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset_token');
    if (token) {
      setResetToken(token);
      setMode('reset');
      
      // Optional: Clean up URL visually
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const saveToken = (token) => {
    // Legacy token saving removed; JWTs are now stored in HttpOnly cookies
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: tokenResponse.access_token })
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
          saveToken(data.token);
          onLoginSuccess({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role.toLowerCase(),
            // avatar: data.user.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
          });
        } else {
          setError(data.error || 'Google authentication failed.');
          setLoading(false);
        }
      } catch(err) {
        setError('Connection error.');
        setLoading(false);
      }
    },
    onError: () => setError('Google sign-in failed.')
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
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
        saveToken(data.token);
        onLoginSuccess({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role.toLowerCase(),
          avatar: data.user.role === 'MANAGER'
            ? 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'
            : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
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
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${firstName.trim()} ${lastName.trim()}`,
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim()
        })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        saveToken(data.token);
        onLoginSuccess({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role.toLowerCase(),
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
        });
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMessage(data.message);
      } else {
        setError(data.error || 'Failed to send reset link.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMessage(data.message);
        setTimeout(() => {
          setMode('login');
          setSuccessMessage('');
        }, 3000);
      } else {
        setError(data.error || 'Password reset failed.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-logo" style={{ letterSpacing: '2px', fontSize: '1.4rem' }}>LULU AURELIAN ESTATE</span>
        </div>

        {mode === 'login' ? (
          <div className="auth-view animate-fade-in">
            <h2>Welcome back, glad to see you</h2>
            
            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email Address *</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="Type your email address" 
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <div className="password-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    disabled={loading}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  <span>Remember me</span>
                </label>
                <button type="button" className="forgot-pw" onClick={() => setMode('forgot')}>Forgot your password?</button>
              </div>

              <button type="submit" className="btn-auth-primary" disabled={loading}>
                {loading ? <Loader2 size={18} className="spinner" /> : "Log In"}
              </button>
            </form>

            <div className="auth-divider"><span>Or</span></div>

            <button type="button" className="btn-auth-google" onClick={() => googleLogin()} disabled={loading}>
              <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <p className="auth-switch">
              Don't have an account? <button type="button" onClick={() => setMode('register')}>Register</button>
            </p>
          </div>
        ) : mode === 'forgot' ? (
          <div className="auth-view animate-fade-in">
            <h2>Reset Password</h2>
            <p style={{ color: 'var(--color-muted)', marginBottom: '20px', fontSize: '0.95rem' }}>
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </p>
            
            {error && <div className="auth-error">{error}</div>}
            {successMessage && <div className="auth-success" style={{ padding: '10px', background: '#d4edda', color: '#155724', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem' }}>{successMessage}</div>}

            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label>Email Address *</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="Type your email address" 
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn-auth-primary" disabled={loading} style={{ marginTop: '10px' }}>
                {loading ? <Loader2 size={18} className="spinner" /> : "Send Reset Link"}
              </button>
            </form>

            <p className="auth-switch">
              Remember your password? <button type="button" onClick={() => setMode('login')}>Sign In</button>
            </p>
          </div>
        ) : mode === 'reset' ? (
          <div className="auth-view animate-fade-in">
            <h2>Create New Password</h2>
            <p style={{ color: 'var(--color-muted)', marginBottom: '20px', fontSize: '0.95rem' }}>
              Please enter your new password below.
            </p>
            
            {error && <div className="auth-error">{error}</div>}
            {successMessage && <div className="auth-success" style={{ padding: '10px', background: '#d4edda', color: '#155724', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem' }}>{successMessage}</div>}

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>New Password *</label>
                <div className="password-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    disabled={loading}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm New Password *</label>
                <div className="password-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    placeholder="••••••••" 
                    disabled={loading}
                  />
                </div>
              </div>

              <button type="submit" className="btn-auth-primary" disabled={loading} style={{ marginTop: '10px' }}>
                {loading ? <Loader2 size={18} className="spinner" /> : "Save New Password"}
              </button>
            </form>

            <p className="auth-switch">
              <button type="button" onClick={() => setMode('login')}>Back to Sign In</button>
            </p>
          </div>
        ) : (
          <div className="auth-view animate-fade-in">
            <h2>Welcome, Create your new account</h2>
            
            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleRegister}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} disabled={loading} placeholder="John" />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} disabled={loading} placeholder="Doe" />
                </div>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} placeholder="john@example.com" />
              </div>

              <div className="form-group">
                <label>Phone *</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} disabled={loading} placeholder="+254 700 000000" />
              </div>

              <div className="form-group">
                <label>Password *</label>
                <div className="password-wrapper">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} disabled={loading} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm Password *</label>
                <div className="password-wrapper">
                  <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={loading} placeholder="••••••••" />
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  <span>Remember me</span>
                </label>
              </div>

              <button type="submit" className="btn-auth-primary" disabled={loading}>
                {loading ? <Loader2 size={18} className="spinner" /> : "Continue"}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <button type="button" onClick={() => setMode('login')}>Sign In</button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
