import React, { useState, useEffect } from 'react';
import { Loader, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import './BookingStatusWidget.css';

export default function BookingStatusWidget({ user }) {
  const [loading, setLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchMyBookings = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bookings/my-bookings`, {
          credentials: 'include'
        });
        const data = await res.json();
        
        if (data.success && data.bookings && data.bookings.length > 0) {
          const now = new Date();
          // Filter bookings to those where check_out has not passed yet
          const activeOrUpcoming = data.bookings.filter(b => {
            const checkOutDate = new Date(b.check_out);
            checkOutDate.setHours(23, 59, 59, 999); // Include the whole checkout day
            return checkOutDate >= now;
          });

          if (activeOrUpcoming.length > 0) {
            const active = activeOrUpcoming.find(b => 
              ['PENDING', 'APPROVED', 'PAID'].includes(b.status)
            ) || activeOrUpcoming[0];
            
            setActiveBooking(active);
          } else {
            setActiveBooking(null);
          }
        }
      } catch (err) {
        console.error('Failed to fetch bookings for widget', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBookings();
  }, [user]);

  if (!user || loading || !activeBooking) {
    return null; // Don't show anything if not logged in, loading, or no bookings
  }

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
            <h2>Welcome Back, {user.name.split(' ')[0]}</h2>
            <p>Here is the status of your current reservation.</p>
          </div>

          <div className="status-result-card animate-slide-up" style={{ marginTop: 0 }}>
            <div className="status-result-header">
              {getStatusIcon(activeBooking.status)}
              <div className="status-text">
                <span className="label">Current Status</span>
                <strong className={`status-badge ${activeBooking.status.toLowerCase()}`}>{activeBooking.status}</strong>
              </div>
            </div>
            
            <div className="status-details-grid">
              <div className="detail-item">
                <span className="label">Suite</span>
                <span className="value" style={{ textTransform: 'capitalize' }}>{activeBooking.unit_id === 'skyview' ? 'Skyview Hideaway' : activeBooking.unit_id === 'cocoa' ? 'Cocoa Retreat' : activeBooking.unit_id}</span>
              </div>
              <div className="detail-item">
                <span className="label">Check In</span>
                <span className="value">{new Date(activeBooking.check_in).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <span className="label">Check Out</span>
                <span className="value">{new Date(activeBooking.check_out).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <span className="label">Actions</span>
                <a href="#/portal" className="value" style={{ color: '#cfa873', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                  Manage Booking <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
