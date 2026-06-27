import React, { useState, useEffect } from 'react';
import { Key, RefreshCw, Save, CheckCircle, AlertCircle, Shield, Eye, EyeOff, Copy } from 'lucide-react';
import './SuitePasscodes.css';

export default function SuitePasscodes() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingUnit, setSavingUnit] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [passcodes, setPasscodes] = useState({ skyview: '', cocoa: '' });
  const [savedPasscodes, setSavedPasscodes] = useState({ skyview: '', cocoa: '' });
  const [showSaved, setShowSaved] = useState({ skyview: false, cocoa: false });

  // Fetch current passcode settings
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bookings/unit-settings', {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSettings(data.settings);
        const map = {};
        data.settings.forEach(s => {
          map[s.unit_id] = s.passcode;
        });
        setPasscodes(map);
        setSavedPasscodes(map);
      } else {
        setError(data.error || 'Failed to load suite settings.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch suite settings from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Generate a random 4-digit recommendation
  const handleGenerateRecommend = (unitId) => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    setPasscodes(prev => ({
      ...prev,
      [unitId]: randomPin
    }));
    triggerToast(`Recommended 4-digit PIN generated for ${unitId === 'cocoa' ? 'Cocoa Retreat' : 'Skyview Hideaway'}!`);
  };

  const handleInputChange = (unitId, val) => {
    // Only allow numeric and max 4 digits
    const cleaned = val.replace(/\D/g, '').substring(0, 4);
    setPasscodes(prev => ({
      ...prev,
      [unitId]: cleaned
    }));
  };

  const handleSave = async (unitId) => {
    const pin = passcodes[unitId];
    if (!pin || pin.length !== 4) {
      triggerToast('Error: PIN must be exactly 4 digits.');
      return;
    }

    setSavingUnit(unitId);
    try {
      const response = await fetch(`/api/bookings/unit-settings/${unitId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ passcode: pin })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSavedPasscodes(prev => ({
          ...prev,
          [unitId]: pin
        }));
        triggerToast(`Successfully saved key box PIN for ${unitId === 'cocoa' ? 'Cocoa Retreat' : 'Skyview Hideaway'}!`);
      } else {
        triggerToast(data.error || 'Failed to update passcode.');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Connection error. Failed to save passcode.');
    } finally {
      setSavingUnit(null);
    }
  };

  const handleCopy = (unitId) => {
    const pin = savedPasscodes[unitId];
    if (pin) {
      navigator.clipboard.writeText(pin);
      triggerToast(`Copied ${unitId === 'cocoa' ? 'Cocoa Retreat' : 'Skyview Hideaway'} PIN to clipboard!`);
    } else {
      triggerToast('No PIN saved to copy.');
    }
  };

  const getUnitName = (unitId) => {
    return unitId === 'cocoa' ? 'Cocoa Retreat' : 'Skyview Hideaway';
  };

  return (
    <div className="suite-passcodes-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="passcode-toast animate-fade-in">
          {toastMessage.startsWith('Error') ? (
            <AlertCircle className="toast-icon-error" size={18} />
          ) : (
            <CheckCircle className="toast-icon-success" size={18} />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="passcodes-header">
        <div className="header-title-row">
          <Key className="header-icon" size={28} />
          <div>
            <h1 className="portal-title">Suite Key Box PINs</h1>
            <p className="portal-subtitle">
              Manage the 4-digit security codes used by guests to access the room keys. Updated codes are instantly synchronized with guest dispatch payloads.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="passcode-loader">
          <div className="spinner"></div>
          <span>Loading secure suite settings...</span>
        </div>
      ) : error ? (
        <div className="passcode-error-box">
          <AlertCircle size={24} />
          <span>{error}</span>
          <button onClick={fetchSettings} className="btn-secondary">Retry</button>
        </div>
      ) : (
        <div className="units-passcodes-grid">
          {['skyview', 'cocoa'].map(unitId => {
            const currentVal = passcodes[unitId] || '';
            const isSaving = savingUnit === unitId;
            return (
              <div key={unitId} className="unit-passcode-card glass-panel">
                <div className="unit-card-header">
                  <div className="unit-icon-wrapper">
                    <Shield className="unit-shield-icon" size={24} />
                  </div>
                  <div>
                    <h3 className="unit-title">{getUnitName(unitId)}</h3>
                    <span className="unit-badge">Active Unit</span>
                  </div>
                </div>

                <div className="unit-card-body">
                  {/* Option to see the currently saved 4-digit key */}
                  <div className="saved-pin-container">
                    <span className="saved-pin-label">Currently Active PIN:</span>
                    <span className="saved-pin-value">
                      {showSaved[unitId] ? (savedPasscodes[unitId] || 'None') : '••••'}
                    </span>
                    <button
                      type="button"
                      className="btn-toggle-saved"
                      onClick={() => setShowSaved(prev => ({ ...prev, [unitId]: !prev[unitId] }))}
                      title={showSaved[unitId] ? "Hide PIN" : "Show PIN"}
                      style={{ marginRight: '0.25rem' }}
                    >
                      {showSaved[unitId] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      type="button"
                      className="btn-toggle-saved"
                      onClick={() => handleCopy(unitId)}
                      title="Copy PIN"
                    >
                      <Copy size={16} />
                    </button>
                  </div>

                  <div className="pin-input-group">
                    <label className="pin-input-label">Update Key Box PIN</label>
                    <div className="pin-input-row">
                      <input
                        type="text"
                        className="pin-input-field"
                        placeholder="----"
                        value={currentVal}
                        onChange={(e) => handleInputChange(unitId, e.target.value)}
                        maxLength={4}
                      />
                      <button
                        type="button"
                        className="btn-recommend"
                        onClick={() => handleGenerateRecommend(unitId)}
                        title="Recommend a random 4-digit PIN"
                      >
                        <RefreshCw size={16} />
                        <span>Recommend</span>
                      </button>
                    </div>
                  </div>

                  <div className="security-notice">
                    <p>
                      Guests will receive this PIN on confirmation to unlock the lock box housing their room key.
                    </p>
                  </div>
                </div>

                <div className="unit-card-footer">
                  <button
                    onClick={() => handleSave(unitId)}
                    disabled={isSaving || currentVal.length !== 4}
                    className="btn-primary btn-save-pin"
                  >
                    {isSaving ? (
                      <>
                        <div className="btn-spinner"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Save PIN Settings</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
