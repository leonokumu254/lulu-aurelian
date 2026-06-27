import React, { useState } from 'react';
import { Star, Send, CheckCircle } from 'lucide-react';
import './RateUs.css';

export default function RateUs({ user }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating before submitting.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          rating,
          comment
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to submit review.');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rate-us-container glass animate-fade-in">
        <div className="rate-us-success-modal">
          <CheckCircle size={48} className="success-icon animate-pop" />
          <h2>Thank You!</h2>
          <p>We truly appreciate your feedback. Your review has been submitted successfully.</p>
          <button className="btn-close-modal" onClick={() => setSubmitted(false)}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="rate-us-container glass animate-fade-in">
      <div className="rate-us-header">
        <h2>Rate Your Experience</h2>
        <p>Your feedback helps us maintain the highest standards of luxury and comfort at Lulu Aurelian Estate.</p>
      </div>

      {error && <div className="rate-us-error">{error}</div>}

      <form onSubmit={handleSubmit} className="rate-us-form">
        <div className="star-rating-container">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={36}
              className={`star-icon ${star <= (hoverRating || rating) ? 'filled' : ''}`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            />
          ))}
        </div>

        <div className="form-group">
          <label>Share Your Thoughts</label>
          <textarea
            rows={5}
            placeholder="Tell us about your stay..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-submit-review" disabled={loading}>
          {loading ? 'Submitting...' : (
            <>
              <Send size={16} />
              <span>Submit Review</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
