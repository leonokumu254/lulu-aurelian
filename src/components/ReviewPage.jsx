import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Star, CheckCircle, Send, Home, MessageCircle, AlertCircle } from 'lucide-react';
import './ReviewPage.css';

export default function ReviewPage({ setPage }) {
  const [token, setToken] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [npsScore, setNpsScore] = useState(null);
  const [comment, setComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Extract parameters from URL on component mount
  useEffect(() => {
    try {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      
      let queryStr = '';
      if (hash.includes('?')) {
        queryStr = hash.split('?')[1];
      } else if (search.startsWith('?')) {
        queryStr = search.substring(1);
      }

      if (queryStr) {
        const params = new URLSearchParams(queryStr);
        const urlToken = params.get('token');
        const urlRating = params.get('rating');
        const urlNps = params.get('nps');
        const urlName = params.get('guest') || params.get('name');

        if (urlToken) setToken(urlToken);
        if (urlName) setGuestName(urlName);

        if (urlNps) {
          const npsInt = parseInt(urlNps, 10);
          if (npsInt >= 1 && npsInt <= 10) {
            setNpsScore(npsInt);
            // Intelligently map NPS 1-10 to 1-5 stars if rating wasn't explicitly given
            if (!urlRating) {
              const mapped = Math.max(1, Math.min(5, Math.round(npsInt / 2)));
              setRating(mapped);
            }
          }
        }

        if (urlRating) {
          const ratingInt = parseInt(urlRating, 10);
          if (ratingInt >= 1 && ratingInt <= 5) {
            setRating(ratingInt);
          }
        }
      }
    } catch (err) {
      console.warn('Error reading review URL parameters:', err);
    }
  }, []);

  const getRatingLabel = (val) => {
    switch (val) {
      case 5: return 'Exceptional & Delightful (5/5)';
      case 4: return 'Very Good & Comfortable (4/5)';
      case 3: return 'Satisfactory (3/5)';
      case 2: return 'Needs Improvement (2/5)';
      case 1: return 'Unsatisfactory (1/5)';
      default: return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1) {
      setErrorMessage('Please select a star rating between 1 and 5.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      let endpoint = '';
      let options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      };

      if (token) {
        endpoint = `${import.meta.env.VITE_API_URL || ''}/api/reviews/submit?token=${encodeURIComponent(token)}`;
        options.body = JSON.stringify({
          rating,
          comment,
          nps: npsScore,
          guestName: guestName || undefined
        });
      } else {
        endpoint = `${import.meta.env.VITE_API_URL || ''}/api/reviews`;
        options.body = JSON.stringify({
          rating,
          comment,
          nps: npsScore
        });
      }

      const res = await fetch(endpoint, options);
      const data = await res.json();

      if (res.status === 409) {
        setAlreadyReviewed(true);
      } else if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(data.error || 'Unable to submit review. Please try again.');
      }
    } catch (err) {
      setErrorMessage('Network connection error. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    if (setPage) {
      setPage('home');
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="review-page">
      <Helmet>
        <title>Share Your Experience — Lulu Aurelian Estate</title>
        <meta name="description" content="Rate your stay and share your testimonial with the Lulu Aurelian Estate hospitality team." />
      </Helmet>

      <div className="review-page-container">
        <div className="review-card">
          
          {/* Brand Crest */}
          <div className="review-header-badge">
            <div className="review-badge-crest">LA</div>
            <span className="review-badge-text">LULU AURELIAN ESTATE &bull; GUEST EXPERIENCE</span>
          </div>

          {submitted ? (
            <div className="review-success-state">
              <div className="success-icon-wrap">
                <CheckCircle size={38} />
              </div>
              <h1 className="review-title">Thank You For Your Feedback!</h1>
              <p className="review-subtitle">
                We truly appreciate you taking the time to share your stay experience. 
                Your feedback has been received and shared with our hospitality management.
              </p>
              <div className="review-success-actions">
                <button type="button" className="btn-review-home" onClick={handleGoHome}>
                  Return to Home
                </button>
                <a 
                  href="https://wa.me/254112299384?text=Hello%20Lulu%20Aurelian%20Estate%2C%20I%20just%20submitted%20my%20stay%20review." 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-review-whatsapp"
                >
                  <MessageCircle size={16} />
                  <span>Chat With Concierge</span>
                </a>
              </div>
            </div>
          ) : alreadyReviewed ? (
            <div className="review-success-state">
              <div className="success-icon-wrap">
                <CheckCircle size={38} />
              </div>
              <h1 className="review-title">Review Already Received</h1>
              <p className="review-subtitle">
                You have already submitted a review for this reservation stay. Thank you for helping us maintain the highest standard of luxury hospitality.
              </p>
              <div className="review-success-actions">
                <button type="button" className="btn-review-home" onClick={handleGoHome}>
                  Return to Home
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="review-title">Rate Your Stay</h1>
              <p className="review-subtitle">
                Your feedback helps us continually elevate our service and ensure every moment at Lulu Aurelian Estate is extraordinary.
              </p>

              {npsScore && (
                <div className="nps-selected-chip">
                  <span>Recommendation score: <strong>{npsScore} / 10</strong></span>
                </div>
              )}

              {errorMessage && (
                <div className="review-alert-error">
                  <AlertCircle size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Star Rating Row */}
              <div className="star-rating-row" role="radiogroup" aria-label="Rating scale">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="star-rating-btn"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      size={40}
                      className={`star-icon-page ${star <= (hoverRating || rating) ? 'active' : ''}`}
                    />
                  </button>
                ))}
              </div>

              <div className="rating-descriptor">
                {getRatingLabel(hoverRating || rating)}
              </div>

              {/* Review Form */}
              <form onSubmit={handleSubmit} className="review-form">
                <div className="review-form-group">
                  <label htmlFor="review-comment">Share Your Thoughts & Comments</label>
                  <textarea
                    id="review-comment"
                    rows={4}
                    placeholder="Tell us about your comfort, hospitality, or favorite features of your stay..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </div>

                {!token && (
                  <div className="review-form-group">
                    <label htmlFor="review-name">Your Name (Optional)</label>
                    <input
                      id="review-name"
                      type="text"
                      placeholder="e.g. John Doe"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                    />
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn-submit-review-page"
                  disabled={loading}
                >
                  {loading ? (
                    <span>Submitting Your Feedback...</span>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Submit Review</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
