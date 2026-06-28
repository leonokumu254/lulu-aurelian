import React, { useState } from 'react';
import { Send, Trash, CheckCircle } from 'lucide-react';
import './ContentStudio.css';

export default function ContentStudio({ user }) {
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const [newsletters, setNewsletters] = useState([]);
  const [newNewsletter, setNewNewsletter] = useState({ subject: '', body: '', segment: 'All Contacts' });

  const handleSendNewsletter = async (e) => {
    e.preventDefault();
    if (!newNewsletter.subject || !newNewsletter.body) return;
    
    // Add to local state feed just for visual record
    const item = {
      id: `n-${Date.now()}`,
      subject: newNewsletter.subject,
      segment: newNewsletter.segment,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/cms/newsletters/dispatch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          subject: newNewsletter.subject,
          segment: newNewsletter.segment,
          body: newNewsletter.body
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewsletters([item, ...newsletters]);
        setNewNewsletter({ subject: '', body: '', segment: 'All Contacts' });
        triggerToast(`Newsletter dispatched to ${newNewsletter.segment}.`);
      } else {
        triggerToast('Failed to dispatch: ' + data.error);
      }
    } catch (err) {
      triggerToast('Network error dispatching newsletter.');
    }
  };

  const handleDeleteCmsItem = (type, id) => {
    setNewsletters(prev => prev.filter(n => n.id !== id));
    triggerToast('Item retracted successfully.');
  };

  return (
    <div className="cms-studio-view animate-fade-in">
      {toastMessage && (
        <div className="portal-toast animate-slide-up">
          <CheckCircle size={16} className="toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="dashboard-grid-2col cms-layout-grid">
        {/* CMS Form / Sidebar */}
        <div className="cms-form-col glass">
          <form onSubmit={handleSendNewsletter} className="cms-editor-form">
            <h3>Draft Newsletter Campaign</h3>
            <div className="form-group">
              <label>Subject Line</label>
              <input 
                type="text" 
                placeholder="e.g., An Exclusive Offer Just For You" 
                value={newNewsletter.subject}
                onChange={(e) => setNewNewsletter({...newNewsletter, subject: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Target Audience Segment</label>
              <select 
                value={newNewsletter.segment}
                onChange={(e) => setNewNewsletter({...newNewsletter, segment: e.target.value})}
              >
                <option value="All Contacts">All Contacts</option>
                <option value="Past Guests Only">Past Guests Only</option>
              </select>
            </div>
            <div className="form-group">
              <label>Email Body</label>
              <textarea 
                rows={6}
                placeholder="HTML markup or rich email body copy..."
                value={newNewsletter.body}
                onChange={(e) => setNewNewsletter({...newNewsletter, body: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="btn-editor-submit">
              <Send size={14} />
              <span>Dispatch Newsletter</span>
            </button>
          </form>
        </div>

        {/* CMS List Feed */}
        <div className="cms-feed-col glass">
          <h3>Active Publications</h3>
          
          <div className="cms-feed-items">
            {newsletters.map(n => (
              <div key={n.id} className="feed-item card-border">
                <div className="feed-item-meta">
                  <span className="feed-tag segment-tag">{n.segment}</span>
                  <span className="feed-date">{n.date}</span>
                </div>
                <h4>{n.subject}</h4>
                <button onClick={() => handleDeleteCmsItem('newsletter', n.id)} className="btn-feed-delete">
                  <Trash size={14} />
                  <span>Cancel campaign</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
