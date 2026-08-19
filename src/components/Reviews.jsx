import React, { useState, useEffect } from 'react';
import { Star, Loader2 } from 'lucide-react';
import './Reviews.css';

export default function Reviews({ unitId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/reviews`);
        const data = await response.json();
        
        if (response.ok && data.success) {
          setReviews(data.reviews || []);
        } else {
          setError('Failed to fetch reviews.');
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Error connecting to the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter reviews by unit if unitId is provided
  const displayReviews = unitId 
    ? reviews.filter(r => r.unit_id === unitId)
    : reviews;

  const calculateAverageRating = () => {
    if (displayReviews.length === 0) return '0.0';
    const sum = displayReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / displayReviews.length).toFixed(1);
  };

  return (
    <section className="reviews-section" id="reviews">
      <div className="container">
        <div className="reviews-header">
          <h2 className="reviews-title">
            <Star className="reviews-title-star" fill="currentColor" size={28} />
            {loading ? '...' : calculateAverageRating()} · {displayReviews.length} Review{displayReviews.length !== 1 ? 's' : ''}
          </h2>
          <p className="reviews-subtitle">
            {unitId 
              ? 'What guests say about their stay in this suite'
              : 'What our guests are saying about Lulu Aurelian'}
          </p>
        </div>

        {loading ? (
          <div className="reviews-loading">
            <Loader2 size={32} className="spinner" />
            <p>Loading guest reviews...</p>
          </div>
        ) : error ? (
          <div className="reviews-error">
            <p>{error}</p>
          </div>
        ) : displayReviews.length === 0 ? (
          <div className="reviews-empty">
            <p>No reviews have been published for this suite yet.</p>
          </div>
        ) : (
          <div className="reviews-grid">
            {displayReviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-author-info">
                  <div className="review-avatar">
                    {review.guest_name ? review.guest_name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <h4 className="feedback-name">{review.guest_name || 'Anonymous Guest'}</h4>
                    <p className="feedback-date">{formatDate(review.created_at)}</p>
                  </div>
                </div>
                <div className="review-rating">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" className="review-star" />
                  ))}
                </div>
                <p className="feedback-content">"{review.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

