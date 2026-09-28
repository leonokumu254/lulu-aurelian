import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Save, RefreshCw, Plus, Trash2, CheckCircle, 
  AlertCircle, Eye, EyeOff, Building2, Sparkles, Phone, FileText
} from 'lucide-react';
import './HouseRulesManager.css';
import GuestHouseRules from './GuestHouseRules';

export default function HouseRulesManager({ user }) {
  const [selectedUnit, setSelectedUnit] = useState('skyview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [rulesData, setRulesData] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const fetchRules = async (unitId) => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bookings/house-rules/${unitId}`);
      const data = await res.json();
      if (data.success && data.rules) {
        setRulesData(data.rules);
      } else {
        triggerToast('Failed to load rules.');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules(selectedUnit);
  }, [selectedUnit]);

  const handleFieldChange = (field, val) => {
    setRulesData(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleSectionTitleChange = (sIdx, val) => {
    setRulesData(prev => {
      const newSections = [...(prev.sections || [])];
      newSections[sIdx] = { ...newSections[sIdx], title: val };
      return { ...prev, sections: newSections };
    });
  };

  const handleItemChange = (sIdx, itemIdx, val) => {
    setRulesData(prev => {
      const newSections = [...(prev.sections || [])];
      const newItems = [...(newSections[sIdx].items || [])];
      newItems[itemIdx] = val;
      newSections[sIdx] = { ...newSections[sIdx], items: newItems };
      return { ...prev, sections: newSections };
    });
  };

  const handleAddItem = (sIdx) => {
    setRulesData(prev => {
      const newSections = [...(prev.sections || [])];
      const newItems = [...(newSections[sIdx].items || []), ''];
      newSections[sIdx] = { ...newSections[sIdx], items: newItems };
      return { ...prev, sections: newSections };
    });
  };

  const handleDeleteItem = (sIdx, itemIdx) => {
    setRulesData(prev => {
      const newSections = [...(prev.sections || [])];
      const newItems = newSections[sIdx].items.filter((_, i) => i !== itemIdx);
      newSections[sIdx] = { ...newSections[sIdx], items: newItems };
      return { ...prev, sections: newSections };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bookings/unit-settings/${selectedUnit}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          house_rules: rulesData
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(`House Rules for ${selectedUnit.toUpperCase()} saved successfully!`);
      } else {
        triggerToast(data.error || 'Failed to save rules.');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Network error while saving rules.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    const confirmReset = window.confirm(`Reset ${selectedUnit.toUpperCase()} rules back to the curated default standards?`);
    if (!confirmReset) return;

    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bookings/unit-settings/${selectedUnit}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          house_rules: null // clearing will revert to DEFAULT_HOUSE_RULES
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast('Reset to standard defaults successful!');
        fetchRules(selectedUnit);
      } else {
        triggerToast(data.error || 'Failed to reset rules.');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Error during reset.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rules-mgr-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="rules-toast glass animate-slide-up">
          <CheckCircle size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="rules-mgr-header glass">
        <div>
          <div className="rules-mgr-badge">
            <ShieldCheck size={16} />
            <span>Staff Administration</span>
          </div>
          <h2>House Rules & Stay Guidelines</h2>
          <p>
            Customize and update the live house rules, cleanliness standards, and stay policies sent in credentials emails and displayed on the guest portal.
          </p>
        </div>

        <div className="rules-mgr-actions">
          <button 
            type="button" 
            className="btn-preview-toggle" 
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{previewMode ? 'Edit Mode' : 'Guest Preview'}</span>
          </button>

          <button 
            type="button" 
            className="btn-save-rules" 
            onClick={handleSave} 
            disabled={saving || loading}
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Rules'}</span>
          </button>
        </div>
      </div>

      {/* Unit Selector Tabs */}
      <div className="rules-unit-tabs">
        <button 
          className={`mgr-unit-tab ${selectedUnit === 'skyview' ? 'active' : ''}`}
          onClick={() => setSelectedUnit('skyview')}
        >
          <Building2 size={16} />
          <span>Skyview Hideaway</span>
        </button>
        <button 
          className={`mgr-unit-tab ${selectedUnit === 'cocoa' ? 'active' : ''}`}
          onClick={() => setSelectedUnit('cocoa')}
        >
          <Building2 size={16} />
          <span>Cocoa Retreat</span>
        </button>
        <button 
          className={`mgr-unit-tab ${selectedUnit === 'neema' ? 'active' : ''}`}
          onClick={() => setSelectedUnit('neema')}
        >
          <Building2 size={16} />
          <span>Neema Haven</span>
        </button>
      </div>

      {/* Main Content: Preview or Edit */}
      {previewMode ? (
        <div className="mgr-preview-container animate-fade-in">
          <div className="preview-banner">
            <Sparkles size={16} />
            <span>Live Guest Portal Preview for {selectedUnit.toUpperCase()}</span>
          </div>
          <GuestHouseRules unitId={selectedUnit} />
        </div>
      ) : loading ? (
        <div className="mgr-loading-card glass">
          <RefreshCw size={24} className="spin-icon" />
          <p>Loading {selectedUnit} guidelines...</p>
        </div>
      ) : (
        <div className="rules-editor-container animate-fade-in">
          {/* Welcome Info Card */}
          <div className="editor-card glass">
            <h3>1. Welcome Heading & Intro Note</h3>
            <div className="form-group">
              <label>Welcome Subtitle</label>
              <input 
                type="text" 
                value={rulesData?.subtitle || ''} 
                onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                placeholder="e.g. Welcome to Lulu Aurelian Apartment Skyview Hideaway!"
              />
            </div>
            <div className="form-group">
              <label>Introductory Guidelines Note</label>
              <textarea 
                rows={3}
                value={rulesData?.welcomeNote || ''}
                onChange={(e) => handleFieldChange('welcomeNote', e.target.value)}
                placeholder="Introductory welcome text..."
              />
            </div>
          </div>

          {/* Guidelines Sections */}
          <div className="editor-card glass">
            <div className="editor-card-header">
              <h3>2. Guidelines & Policy Sections</h3>
              <p>Review and edit each guideline category and its rules below:</p>
            </div>

            <div className="sections-editor-list">
              {rulesData?.sections?.map((section, sIdx) => (
                <div key={section.id || sIdx} className="section-edit-block">
                  <div className="section-edit-header">
                    <span className="section-edit-icon">{section.icon || '📌'}</span>
                    <input 
                      type="text" 
                      className="section-title-input"
                      value={section.title || ''} 
                      onChange={(e) => handleSectionTitleChange(sIdx, e.target.value)}
                    />
                  </div>

                  <div className="section-items-editor">
                    {section.items?.map((item, itemIdx) => (
                      <div key={itemIdx} className="item-edit-row">
                        <textarea 
                          rows={2}
                          value={item}
                          onChange={(e) => handleItemChange(sIdx, itemIdx, e.target.value)}
                          placeholder="Rule instruction..."
                        />
                        <button 
                          type="button" 
                          className="btn-delete-item"
                          onClick={() => handleDeleteItem(sIdx, itemIdx)}
                          title="Remove this rule"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button 
                      type="button" 
                      className="btn-add-item" 
                      onClick={() => handleAddItem(sIdx)}
                    >
                      <Plus size={14} /> Add Rule Bullet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Closing & Contacts */}
          <div className="editor-card glass">
            <h3>3. Closing Message</h3>
            <div className="form-group">
              <textarea 
                rows={3}
                value={rulesData?.closingMessage || ''}
                onChange={(e) => handleFieldChange('closingMessage', e.target.value)}
                placeholder="Thank you message..."
              />
            </div>

            <div className="editor-card-footer">
              <button 
                type="button" 
                className="btn-reset-defaults" 
                onClick={handleResetDefaults}
                disabled={saving}
              >
                <RefreshCw size={14} /> Reset to Curated Defaults
              </button>

              <button 
                type="button" 
                className="btn-save-rules-bottom" 
                onClick={handleSave}
                disabled={saving}
              >
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
