import React, { useState, useEffect } from 'react';
import { Key, RefreshCw, Save, CheckCircle, AlertCircle, Shield, Eye, EyeOff, Copy, Building2, Filter } from 'lucide-react';
import './SuitePasscodes.css';

export default function SuitePasscodes() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingUnit, setSavingUnit] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [passcodes, setPasscodes] = useState({ skyview: '', cocoa: '', neema: '' });
  const [houseNumbers, setHouseNumbers] = useState({ skyview: '', cocoa: '', neema: '' });
  const [wifiSSIDs, setWifiSSIDs] = useState({ skyview: '', cocoa: '', neema: '' });
  const [wifiPasswords, setWifiPasswords] = useState({ skyview: '', cocoa: '', neema: '' });

  const [savedPasscodes, setSavedPasscodes] = useState({ skyview: '', cocoa: '', neema: '' });
  const [savedHouseNumbers, setSavedHouseNumbers] = useState({ skyview: '', cocoa: '', neema: '' });
  const [savedWifiSSIDs, setSavedWifiSSIDs] = useState({ skyview: '', cocoa: '', neema: '' });
  const [savedWifiPasswords, setSavedWifiPasswords] = useState({ skyview: '', cocoa: '', neema: '' });

  const [showSaved, setShowSaved] = useState({ skyview: false, cocoa: false, neema: false });

  // Fetch current passcode settings
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bookings/unit-settings`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSettings(data.settings);
        const pMap = {};
        const hMap = {};
        const ssidMap = {};
        const passMap = {};
        data.settings.forEach(s => {
          pMap[s.unit_id] = s.passcode || '';
          hMap[s.unit_id] = s.house_number || '';
          ssidMap[s.unit_id] = s.wifi_ssid || '';
          passMap[s.unit_id] = s.wifi_password || '';
        });
        setPasscodes(pMap);
        setSavedPasscodes(pMap);
        setHouseNumbers(hMap);
        setSavedHouseNumbers(hMap);
        setWifiSSIDs(ssidMap);
        setSavedWifiSSIDs(ssidMap);
        setWifiPasswords(passMap);
        setSavedWifiPasswords(passMap);
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
    triggerToast(`Recommended 4-digit PIN generated for ${getUnitName(unitId)}!`);
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
    if (pin && (pin.length !== 4 || isNaN(pin))) {
      triggerToast('Error: PIN must be exactly 4 digits.');
      return;
    }

    setSavingUnit(unitId);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bookings/unit-settings/${unitId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          passcode: pin,
          house_number: houseNumbers[unitId],
          wifi_ssid: wifiSSIDs[unitId],
          wifi_password: wifiPasswords[unitId]
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSavedPasscodes(prev => ({
          ...prev,
          [unitId]: pin
        }));
        setSavedHouseNumbers(prev => ({
          ...prev,
          [unitId]: houseNumbers[unitId]
        }));
        setSavedWifiSSIDs(prev => ({
          ...prev,
          [unitId]: wifiSSIDs[unitId]
        }));
        setSavedWifiPasswords(prev => ({
          ...prev,
          [unitId]: wifiPasswords[unitId]
        }));
        triggerToast(`Successfully saved settings for ${getUnitName(unitId)}!`);
      } else {
        triggerToast(data.error || 'Failed to update settings.');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Connection error. Failed to save settings.');
    } finally {
      setSavingUnit(null);
    }
  };

  const handleCopy = (unitId) => {
    const pin = savedPasscodes[unitId];
    if (pin) {
      navigator.clipboard.writeText(pin);
      triggerToast(`Copied ${getUnitName(unitId)} PIN to clipboard!`);
    } else {
      triggerToast('No PIN saved to copy.');
    }
  };

  const getUnitName = (unitId) => {
    if (unitId === 'cocoa') return 'Cocoa Retreat';
    if (unitId === 'neema') return 'Neema';
    return 'Skyview Hideaway';
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
            <h1 className="portal-title">Key Suites Access & PIN Vault</h1>
            <p className="portal-subtitle">
              Manage and access the 4-digit security codes used by guests to access the room keys. Select a unit from the dropdown below to view or update its key code.
            </p>
          </div>
        </div>
      </div>

      {/* Unit Selector Dropdown */}
      <div className="suite-unit-filter-wrapper glass-panel">
        <div className="filter-label-group">
          <div className="filter-icon-box">
            <Building2 className="filter-icon" size={20} />
          </div>
          <div>
            <span className="filter-heading">Unit to Access Code:</span>
            <p className="filter-subtext">Select which suite unit's key box PIN and credentials to display</p>
          </div>
        </div>
        <div className="filter-select-container">
          <select
            id="unit-access-select"
            className="unit-dropdown-select"
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            aria-label="Select suite unit to access code"
          >
            <option value="all">All Suites (Skyview, Cocoa, Neema)</option>
            <option value="skyview">Skyview Hideaway — Key & Access Code</option>
            <option value="cocoa">Cocoa Retreat — Key & Access Code</option>
            <option value="neema">Neema — Key & Access Code</option>
          </select>
        </div>
      </div>

      {selectedUnit !== 'all' && (
        <div className="single-unit-indicator animate-fade-in">
          <div className="indicator-left">
            <Key size={16} />
            <span>Currently Viewing Key Code For: <strong>{getUnitName(selectedUnit)}</strong></span>
          </div>
          <button 
            type="button" 
            className="btn-show-all-units" 
            onClick={() => setSelectedUnit('all')}
          >
            View All Units
          </button>
        </div>
      )}

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
          {['skyview', 'cocoa', 'neema']
            .filter(unitId => selectedUnit === 'all' || unitId === selectedUnit)
            .map(unitId => {
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
                        className="pin-code-input"
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
                        <RefreshCw size={14} />
                        <span>Recommend</span>
                      </button>
                    </div>
                  </div>

                  <div className="pin-input-group">
                    <label className="pin-input-label">House / Room Number</label>
                    <input
                      type="text"
                      className="suite-text-input"
                      placeholder="e.g. Penthouse 601"
                      value={houseNumbers[unitId] || ''}
                      onChange={(e) => setHouseNumbers(prev => ({ ...prev, [unitId]: e.target.value }))}
                    />
                  </div>

                  <div className="pin-input-group">
                    <label className="pin-input-label">Wi-Fi Name (SSID)</label>
                    <input
                      type="text"
                      className="suite-text-input"
                      placeholder="e.g. LuluAurelian_Skyview"
                      value={wifiSSIDs[unitId] || ''}
                      onChange={(e) => setWifiSSIDs(prev => ({ ...prev, [unitId]: e.target.value }))}
                    />
                  </div>

                  <div className="pin-input-group">
                    <label className="pin-input-label">Wi-Fi Password</label>
                    <input
                      type="text"
                      className="suite-text-input"
                      placeholder="Wi-Fi Password"
                      value={wifiPasswords[unitId] || ''}
                      onChange={(e) => setWifiPasswords(prev => ({ ...prev, [unitId]: e.target.value }))}
                    />
                  </div>

                  <div className="security-notice" style={{ marginTop: '1.2rem' }}>
                    <p>
                      Guests will receive these credentials dynamically in their email and WhatsApp check-in instructions.
                    </p>
                  </div>
                </div>

                <div className="unit-card-footer">
                  <button
                    onClick={() => handleSave(unitId)}
                    disabled={isSaving || (currentVal && (currentVal.length !== 4 || isNaN(currentVal)))}
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
                        <span>Save Suite Settings</span>
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
