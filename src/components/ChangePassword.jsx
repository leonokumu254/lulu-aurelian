import React, { useState, useEffect } from 'react';
import { Loader2, ShieldCheck, AlertCircle, CheckCircle, User, Phone, Mail, Lock, Save } from 'lucide-react';
import './GuestPortal.css';

export default function ChangePassword({ user, onProfileUpdate }) {
  // ── Profile section ──────────────────────────────────────────────────────
  const [profileName,  setProfileName]  = useState(user?.name  || '');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError,   setProfileError]   = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // ── Password section ─────────────────────────────────────────────────────
  const [currentPassword,  setCurrentPassword]  = useState('');
  const [newPassword,      setNewPassword]      = useState('');
  const [confirmPassword,  setConfirmPassword]  = useState('');
  const [pwLoading,  setPwLoading]  = useState(false);
  const [pwError,    setPwError]    = useState('');
  const [pwSuccess,  setPwSuccess]  = useState('');

  // Pre-fill phone from user profile (strip country code for display)
  useEffect(() => {
    if (user?.phone) {
      let ph = user.phone;
      if (ph.startsWith('+254')) ph = '0' + ph.slice(4);
      else if (ph.startsWith('254') && ph.length === 12) ph = '0' + ph.slice(3);
      setProfilePhone(ph);
    }
  }, [user]);

  // ── Save profile ─────────────────────────────────────────────────────────
  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setProfileError('Full name cannot be empty.');
      return;
    }

    // Normalize phone to international format for storage
    let phone = profilePhone.replace(/\s/g, '');
    if (phone.startsWith('0')) phone = '+254' + phone.slice(1);
    else if (phone.startsWith('254')) phone = '+' + phone;
    else if (phone && !phone.startsWith('+')) phone = '+254' + phone;

    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: profileName.trim(), phone: phone || null })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setProfileSuccess('Profile updated successfully!');
        if (onProfileUpdate) onProfileUpdate(data.user);
      } else {
        setProfileError(data.error || 'Failed to update profile.');
      }
    } catch {
      setProfileError('Network error — please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Change password ──────────────────────────────────────────────────────
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }

    setPwLoading(true);
    setPwError('');
    setPwSuccess('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setPwSuccess('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwError(data.error || 'Failed to update password.');
      }
    } catch {
      setPwError('Network error — please try again.');
    } finally {
      setPwLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.72rem 0.9rem',
    border: '1.5px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.95rem',
    color: '#1a1a1a',
    background: '#fff',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.15s',
    fontFamily: 'inherit'
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.82rem',
    fontWeight: 700,
    color: '#4a4a4a',
    marginBottom: '0.4rem'
  };

  const sectionStyle = {
    background: '#fff',
    borderRadius: '14px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
    padding: '1.75rem',
    marginBottom: '1.5rem'
  };

  const sectionTitle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1rem',
    fontWeight: 700,
    color: '#1a1a1a',
    marginBottom: '1.25rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid #f0f0f0'
  };

  const goldColor = 'var(--color-gold-deep, #BB8525)';

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: '0 0.5rem' }}>

      {/* ── PROFILE SECTION ─────────────────────────────────────── */}
      <div style={sectionStyle}>
        <h3 style={sectionTitle}>
          <User size={18} color={goldColor} />
          My Profile
        </h3>

        {profileError && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.7rem 0.9rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.87rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={15} /> {profileError}
          </div>
        )}
        {profileSuccess && (
          <div style={{ background: '#ecfdf5', color: '#059669', padding: '0.7rem 0.9rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.87rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={15} /> {profileSuccess}
          </div>
        )}

        <form onSubmit={handleProfileSave}>
          {/* Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>
              <User size={13} /> Full Name
            </label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Your full name"
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = goldColor}
              onBlur={(e)  => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          {/* Email (read-only) */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>
              <Mail size={13} /> Email Address
            </label>
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              style={{ ...inputStyle, background: '#f9fafb', color: '#9ca3af', cursor: 'not-allowed' }}
            />
            <p style={{ fontSize: '0.73rem', color: '#9ca3af', margin: '0.3rem 0 0' }}>
              Email address cannot be changed. Contact support if needed.
            </p>
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>
              <Phone size={13} /> Phone Number
            </label>
            <input
              type="tel"
              value={profilePhone}
              onChange={(e) => setProfilePhone(e.target.value)}
              placeholder="e.g. 0712 345 678"
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = goldColor}
              onBlur={(e)  => e.target.style.borderColor = '#e2e8f0'}
            />
            <p style={{ fontSize: '0.73rem', color: '#9ca3af', margin: '0.3rem 0 0' }}>
              Used to receive M-Pesa STK Push payments. Safaricom numbers only.
            </p>
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: goldColor,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.4rem',
              opacity: profileLoading ? 0.7 : 1
            }}
          >
            {profileLoading ? <Loader2 size={16} className="spinner" /> : <Save size={16} />}
            {profileLoading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* ── SECURITY SECTION ────────────────────────────────────── */}
      <div style={sectionStyle}>
        <h3 style={sectionTitle}>
          <ShieldCheck size={18} color={goldColor} />
          Change Password
        </h3>

        {pwError && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '0.7rem 0.9rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.87rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={15} /> {pwError}
          </div>
        )}
        {pwSuccess && (
          <div style={{ background: '#ecfdf5', color: '#059669', padding: '0.7rem 0.9rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.87rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={15} /> {pwSuccess}
          </div>
        )}

        <form onSubmit={handlePasswordChange}>
          {[
            { label: 'Current Password',   value: currentPassword,   setter: setCurrentPassword },
            { label: 'New Password',        value: newPassword,       setter: setNewPassword },
            { label: 'Confirm New Password',value: confirmPassword,   setter: setConfirmPassword }
          ].map(({ label, value, setter }) => (
            <div key={label} style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>
                <Lock size={13} /> {label}
              </label>
              <input
                type="password"
                value={value}
                onChange={(e) => setter(e.target.value)}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = goldColor}
                onBlur={(e)  => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={pwLoading}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: '#1e293b',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.4rem',
              marginTop: '0.5rem',
              opacity: pwLoading ? 0.7 : 1
            }}
          >
            {pwLoading ? <Loader2 size={16} className="spinner" /> : <ShieldCheck size={16} />}
            {pwLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
