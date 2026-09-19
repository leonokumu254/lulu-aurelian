import React, { useState, useEffect } from 'react';
import { Key, RefreshCw, Save, CheckCircle, AlertCircle, Shield, Eye, EyeOff, Copy, Building2, Wifi } from 'lucide-react';
import './SuitePasscodes.css';

export default function SuitePasscodes({ section = 'keys' }) {
  const isWifi = section === 'wifi';
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

  // Fetch current passcode & wifi settings
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
    if (!isWifi && pin && (pin.length !== 4 || isNaN(pin))) {
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
        triggerToast(`Successfully saved ${isWifi ? 'Wi-Fi credentials' : 'key settings'} for ${getUnitName(unitId)}!`);
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

  const handleCopyPin = (unitId) => {
    const pin = savedPasscodes[unitId];
    if (pin) {
      navigator.clipboard.writeText(pin);
      triggerToast(`Copied ${getUnitName(unitId)} PIN to clipboard!`);
    } else {
      triggerToast('No PIN saved to copy.');
    }
  };

  const handleCopyWifiPassword = (unitId) => {
    const pw = savedWifiPasswords[unitId];
    if (pw) {
      navigator.clipboard.writeText(pw);
      triggerToast(`Copied ${getUnitName(unitId)} Wi-Fi password!`);
    } else {
      triggerToast('No Wi-Fi password saved to copy.');
    }
  };

  const handleCopySSID = (unitId) => {
    const ssid = savedWifiSSIDs[unitId];
    if (ssid) {
      navigator.clipboard.writeText(ssid);
      triggerToast(`Copied ${getUnitName(unitId)} Wi-Fi network name!`);
    } else {
      triggerToast('No Wi-Fi network name saved to copy.');
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
          {isWifi ? (
            <Wifi className="header-icon" size={28} />
          ) : (
            <Key className="header-icon" size={28} />
          )}
          <div>
            <h1 className="portal-title">
              {isWifi ? 'Suite Wi-Fi & Network Credentials' : 'Key Suites Access & PIN Vault'}
            </h1>
            <p className="portal-subtitle">
              {isWifi
                ? 'Manage Wi-Fi network names (SSID) and guest access passwords for all suites. Guests receive these details dynamically upon check-in.'
                : 'Manage and access the 4-digit security codes used by guests to access the room keys. Select a unit from the dropdown below to view or update its key code.'}
            </p>
          </div>
        </div>
      </div>

      {/* Unit Selector Dropdown */}
      <div className="suite-unit-filter-wrapper glass-panel">
        <div className="filter-label-group">
          <div className="filter-icon-box">
            {isWifi ? <Wifi className="filter-icon" size={20} /> : <Building2 className="filter-icon" size={20} />}
          </div>
          <div>
            <span className="filter-heading">
              {isWifi ? 'Unit Wi-Fi Network:' : 'Unit to Access Code:'}
            </span>
            <p className="filter-subtext">
              {isWifi 
                ? "Select which suite unit's Wi-Fi network and password to display"
                : "Select which suite unit's key box PIN and credentials to display"}
            </p>
          </div>
        </div>
        <div className="filter-select-container">
          <select
            id="unit-access-select"
            className="unit-dropdown-select"
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            aria-label={isWifi ? "Select suite unit Wi-Fi" : "Select suite unit to access code"}
          >
            <option value="all">All Suites (Skyview, Cocoa, Neema)</option>
            <option value="skyview">
              {isWifi ? 'Skyview Hideaway — Wi-Fi Network' : 'Skyview Hideaway — Key & Access Code'}
            </option>
            <option value="cocoa">
              {isWifi ? 'Cocoa Retreat — Wi-Fi Network' : 'Cocoa Retreat — Key & Access Code'}
            </option>
            <option value="neema">
              {isWifi ? 'Neema — Wi-Fi Network' : 'Neema — Key & Access Code'}
            </option>
          </select>
        </div>
      </div>

      {selectedUnit !== 'all' && (
        <div className="single-unit-indicator animate-fade-in">
          <div className="indicator-left">
            {isWifi ? <Wifi size={16} /> : <Key size={16} />}
            <span>
              Currently Viewing {isWifi ? 'Wi-Fi For:' : 'Key Code For:'}{' '}
              <strong>{getUnitName(selectedUnit)}</strong>
            </span>
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
            const currentPinVal = passcodes[unitId] || '';
            const isSaving = savingUnit === unitId;
            return (
              <div key={unitId} className="unit-passcode-card glass-panel">
                <div className="unit-card-header">
                  <div className="unit-icon-wrapper">
                    {isWifi ? <Wifi className="unit-shield-icon" size={24} /> : <Shield className="unit-shield-icon" size={24} />}
                  </div>
                  <div>
                    <h3 className="unit-title">{getUnitName(unitId)}</h3>
                    <span className="unit-badge">Active Unit</span>
                  </div>
                </div>

                <div className="unit-card-body">
                  {isWifi ? (
                    <>
                      {/* Wi-Fi Active Saved Overview */}
                      <div className="saved-pin-container" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.65rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <span className="saved-pin-label">Network (SSID):</span>
                          <span className="saved-pin-value" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.92rem', letterSpacing: 'normal', color: '#1D1912' }}>
                            {savedWifiSSIDs[unitId] || 'Not set'}
                          </span>
                          {savedWifiSSIDs[unitId] && (
                            <button
                              type="button"
                              className="btn-toggle-saved"
                              onClick={() => handleCopySSID(unitId)}
                              title="Copy Wi-Fi Network Name"
                            >
                              <Copy size={16} />
                            </button>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', borderTop: '1px dashed rgba(187, 133, 37, 0.2)', paddingTop: '0.5rem' }}>
                          <span className="saved-pin-label">Password:</span>
                          <span className="saved-pin-value" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.92rem', letterSpacing: showSaved[unitId] ? 'normal' : '2px', color: '#8c6014', fontWeight: '600' }}>
                            {showSaved[unitId] ? (savedWifiPasswords[unitId] || 'None') : '••••••••'}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}>
                            <button
                              type="button"
                              className="btn-toggle-saved"
                              onClick={() => setShowSaved(prev => ({ ...prev, [unitId]: !prev[unitId] }))}
                              title={showSaved[unitId] ? "Hide Password" : "Show Password"}
                            >
                              {showSaved[unitId] ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <button
                              type="button"
                              className="btn-toggle-saved"
                              onClick={() => handleCopyWifiPassword(unitId)}
                              title="Copy Wi-Fi Password"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                        </div>
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
                          placeholder="Enter Wi-Fi Password"
                          value={wifiPasswords[unitId] || ''}
                          onChange={(e) => setWifiPasswords(prev => ({ ...prev, [unitId]: e.target.value }))}
                        />
                      </div>

                      <div className="security-notice" style={{ marginTop: '1.2rem' }}>
                        <p>
                          Guests receive these Wi-Fi credentials in their automated booking confirmation & check-in portal.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
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
                          onClick={() => handleCopyPin(unitId)}
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
                            value={currentPinVal}
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

                      <div className="security-notice" style={{ marginTop: '1.2rem' }}>
                        <p>
                          Guests will receive these credentials dynamically in their email and WhatsApp check-in instructions.
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="unit-card-footer">
                  <button
                    onClick={() => handleSave(unitId)}
                    disabled={isSaving || (!isWifi && currentPinVal && (currentPinVal.length !== 4 || isNaN(currentPinVal)))}
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
                        <span>{isWifi ? 'Save Wi-Fi Settings' : 'Save Key Settings'}</span>
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

