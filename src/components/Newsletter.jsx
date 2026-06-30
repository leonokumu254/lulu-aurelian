import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import './Newsletter.css';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide a valid email address.');
      return;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      setError('Please check the formatting of your email.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/newsletters/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setSubscribed(true);
        setEmail('');
      } else {
        setError(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      setError('Connection error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="newsletter-section" id="newsletter">
      <div className="container">
        <div className="newsletter-box glass-dark animate-slide-up">
          {!subscribed ? (
            <div className="newsletter-content">
              <span className="newsletter-tag">Inner Circle</span>
              <h2 className="newsletter-title">Aurelian Exclusives</h2>
              <p className="newsletter-desc">
                Receive priority access to seasonal retreats, member-only rates, and curated local itineraries directly to your inbox.
              </p>
              
              <form className="newsletter-form-minimal" onSubmit={handleSubscribe}>
                <div className="input-field-wrapper-minimal">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="newsletter-input-minimal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {error && <span className="newsletter-error">{error}</span>}
                </div>
                <button type="submit" className="newsletter-btn-minimal" aria-label="Subscribe">
                  <Send size={24} />
                </button>
              </form>
            </div>
          ) : (
            <div className="newsletter-success animate-fade-in">
              <CheckCircle2 size={48} className="success-icon" />
              <h2 className="newsletter-title">Invitation Confirmed</h2>
              <p className="newsletter-desc">
                Welcome to the Aurelian Club. You will receive  updates and early-access listing details directly in your inbox.
              </p>
              <button onClick={() => setSubscribed(false)} className="btn-secondary newsletter-back-btn">
                Subscribe another email
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
