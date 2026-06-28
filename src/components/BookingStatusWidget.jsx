import React, { useState } from 'react';
import { Search, Loader, CheckCircle, XCircle, Clock } from 'lucide-react';
import './BookingStatusWidget.css';

export default function BookingStatusWidget() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const checkStatus = async (e) => {
    e.preventDefault();
    if (!token.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bookings/status?token=${encodeURIComponent(token.trim())}`);
      const data = await res.json();

      if (data.success) {
        setResult(data.booking);
      } else {
        setError(data.error || 'Could not find a booking with that reference code.');
      }
    } catch (err) {
      setError('Connection error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'PAID':
        return <CheckCircle size={24} color="#10B981" />;
      case 'CANCELLED':
      case 'DECLINED':
        return <XCircle size={24} color="#DC2626" />;
      default:
        return <Clock size={24} color="#F59E0B" />;
    }
  };

  return (
    <section className="booking-status-section">
      <div className="container" data-aos="fade-up">
        <div className="status-widget-container">
          <div className="status-widget-header">
            <h2>Check Your Reservation Status</h2>
            <p>Enter the secure reference token you received in your email to view live updates on your booking without logging in.</p>
          </div>

          <form onSubmit={checkStatus} className="status-form">
            <div className="search-input-wrapper">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="e.g. sec_12345abcdef..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="status-input"
                required
              />
              <button type="submit" disabled={loading} className="btn-primary status-btn">
                {loading ? <Loader size={20} className="spinner" /> : 'Check Status'}
              </button>
            </div>
          </form>

          {error && (
            <div className="status-error animate-fade-in">
              {error}
            </div>
          )}

          {result && (
            <div className="status-result-card animate-slide-up">
              <div className="status-result-header">
                {getStatusIcon(result.status)}
                <div className="status-text">
                  <span className="label">Current Status</span>
                  <strong className={`status-badge ${result.status.toLowerCase()}`}>{result.status}</strong>
                </div>
              </div>
              
              <div className="status-details-grid">
                <div className="detail-item">
                  <span className="label">Guest Name</span>
                  <span className="value">{result.guest_name}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Suite</span>
                  <span className="value" style={{ textTransform: 'capitalize' }}>{result.unit_id}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Check In</span>
                  <span className="value">{new Date(result.check_in).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Check Out</span>
                  <span className="value">{new Date(result.check_out).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
