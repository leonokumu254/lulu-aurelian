import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, UserPlus, Trash, Plus, Send,
  FileText, Users, CheckCircle, MessageSquare, ShieldCheck, Mail, Star
} from 'lucide-react';
import './ManagerPortal.css';

export default function ManagerPortal({ user, managerTab = 'pricing' }) {

  // TOAST NOTIFICATIONS
  const [toastMessage, setToastMessage] = useState('');
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // PRICING ENGINE STATE
  const [suites, setSuites] = useState(() => {
    try {
      const saved = localStorage.getItem('lulu_pricing');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return [
      { id: 'skyview', name: 'Skyview Hideaway', basePrice: 5500 },
      { id: 'cocoa', name: 'Cocoa Retreat', basePrice: 5000 }
    ];
  });

  const handleBasePriceChange = (id, val) => {
    const numVal = parseFloat(val) || 0;
    setSuites(prev => prev.map(s => s.id === id ? { ...s, basePrice: numVal } : s));
  };

  const savePricingSettings = () => {
    localStorage.setItem('lulu_pricing', JSON.stringify(suites));
    // Dispatch an event so other components know pricing updated
    window.dispatchEvent(new Event('pricingUpdated'));
    triggerToast('Room rates successfully published ');
  };



  // TEAM & MODERATION STATE - fetched from DB
  const [team, setTeam] = useState([]);
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/users`, {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setTeam(data);
      } catch (err) {
        console.error('Failed to fetch team:', err);
      }
    };
    fetchTeam();
  }, []);
  const [newAgent, setNewAgent] = useState({ name: '', email: '', role: 'Agent' });
  const [showAddAgent, setShowAddAgent] = useState(false);

  const [bookings, setBookings] = useState([]);
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bookings`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) setBookings(data);
        }
      } catch (err) {}
    };
    fetchBookings();
  }, []);

  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/reviews/all`, {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch reviews');
        const data = await response.json();
        if (data.success && data.reviews) {
          setReviews(data.reviews.map(r => ({
            id: r.id,
            guest: r.guest_name || 'Guest',
            rating: r.rating,
            comment: r.comment,
            status: r.is_published ? 'Approved' : 'Pending',
            is_published: r.is_published
          })));
        }
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      }
    };
    fetchReviews();
  }, []);

  const pendingReviewsCount = reviews.filter(r => r.status === 'Pending').length;

  const cohosts = team.filter(t => t.role !== 'GUEST');
  
  // Combine registered guests and guests from bookings
  const unifiedGuests = [];
  const seenEmails = new Set();

  team.filter(t => t.role === 'GUEST').forEach(g => {
    unifiedGuests.push({
      id: g.id,
      name: g.name,
      email: g.email,
      avatar: g.avatar || '/user-icon.svg',
      type: 'Registered'
    });
    seenEmails.add(g.email.toLowerCase());
  });

  bookings.forEach(b => {
    if (b.guest_email && !seenEmails.has(b.guest_email.toLowerCase())) {
      unifiedGuests.push({
        id: `booking-${b.id}`,
        name: b.guest_name || 'Unknown Guest',
        email: b.guest_email,
        avatar: '/user-icon.svg',
        type: 'Booking Guest'
      });
      seenEmails.add(b.guest_email.toLowerCase());
    }
  });

  const calculatedAvgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const handleAddAgent = async (e) => {
    e.preventDefault();
    if (!newAgent.name || !newAgent.email) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/users/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newAgent)
      });
      const data = await response.json();
      
      if (response.ok) {
        // Optimistically add to team
        const member = {
          id: `temp-${Date.now()}`,
          name: newAgent.name,
          email: newAgent.email,
          role: newAgent.role,
          status: 'Invited',
          avatar: '/avatar.svg'
        };
        setTeam([...team, member]);
        setNewAgent({ name: '', email: '', role: 'Agent' });
        setShowAddAgent(false);
        triggerToast('Invitation dispatched to ' + newAgent.email);
      } else {
        triggerToast(data.error || 'Failed to invite agent.');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Network error while inviting agent.');
    }
  };

  const handleRemoveAgent = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/users/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setTeam(prev => prev.filter(t => t.id !== id));
        triggerToast('Agent credentials revoked.');
      } else {
        const data = await response.json();
        triggerToast(data.error || 'Failed to revoke access.');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Network error while removing agent.');
    }
  };

  const handleReviewAction = async (id, action) => {
    try {
      if (action === 'approve') {
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/reviews/${id}/moderate`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ is_published: true })
        });
        if (response.ok) {
          setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
          triggerToast('Review approved for public directory.');
        }
      } else {
        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/reviews/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (response.ok) {
          setReviews(prev => prev.filter(r => r.id !== id));
          triggerToast('Review moderated and deleted.');
        }
      }
    } catch (err) {
      console.error('Review action failed:', err);
      triggerToast('Action failed. Please try again.');
    }
  };

  return (
    <div className="manager-portal-container">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="portal-toast animate-slide-up">
          <CheckCircle size={16} className="toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top 4-Column Stat Row */}
      <div className="dashboard-stats-row">

        <div className="stat-card">
          <div className="stat-icon"><TrendingUp size={24} /></div>
          <div className="stat-details">
            <h3>Bookings</h3>
            <p>{bookings.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Users size={24} /></div>
          <div className="stat-details">
            <h3>Total Guests</h3>
            <p>{unifiedGuests.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Star size={24} /></div>
          <div className="stat-details">
            <h3>Avg Rating</h3>
            <p>{calculatedAvgRating}</p>
          </div>
        </div>
      </div>

      {/* Main Interactive Card */}
      <div className="dashboard-card">

        {/* PRICING ENGINE VIEW */}
        {managerTab === 'pricing' && (
          <div className="pricing-engine-view animate-fade-in">
            <div className="section-header-box">
              <h2>Suite Pricing Management</h2>
              <p>Update the standard nightly rate for the suites.</p>
            </div>

            <div className="dashboard-grid-2col">
              {suites.map(s => {
                return (
                  <div key={s.id} className="suite-pricing-card glass" style={{ overflow: 'hidden', padding: 0 }}>
                    <img src={`/assets/${s.id}/${s.id}_1.jpg`} alt={s.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                    <div style={{ padding: '1.5rem' }}>
                      <div className="pricing-card-header">
                        <h4>{s.name}</h4>
                      </div>

                      <div className="pricing-inputs-grid" style={{ gridTemplateColumns: '1fr' }}>
                        <div className="price-input-group">
                          <label>Nightly Rate (KES)</label>
                          <div className="input-prefix-wrapper">
                            <span className="prefix" style={{ fontSize: '1.1rem', color: '#1D1912', fontWeight: 800 }}>KES</span>
                            <input
                              type="number"
                              value={s.basePrice}
                              onChange={(e) => handleBasePriceChange(s.id, e.target.value)}
                              style={{ fontSize: '1.4rem', fontWeight: 800, padding: '0.8rem 1rem 0.8rem 3.5rem', color: '#BB8525' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="publish-pricing-row">
              <button onClick={savePricingSettings} className="btn-engine-publish">
                Publish Pricing
              </button>
            </div>
          </div>
        )}



        {/* TEAM & MODERATION VIEW */}
        {managerTab === 'team' && (
          <div className="team-moderation-view animate-fade-in">
            {/* TEAM MANAGER SECTION */}
            <div className="team-col glass" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div className="column-header-row">
                <h3 className="cohost-title">Co-hosts</h3>
              </div>

              {showAddAgent && (
                <form onSubmit={handleAddAgent} className="add-agent-form card-border animate-slide-up">
                  <h4>Invite a co-host</h4>
                  <div className="form-group-row">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newAgent.name}
                      onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Staff Email"
                      value={newAgent.email}
                      onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                      required
                    />
                    <select
                      value={newAgent.role}
                      onChange={(e) => setNewAgent({ ...newAgent, role: e.target.value })}
                    >
                      <option value="Agent">Listing owner</option>
                      <option value="Manager">Primary Host</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowAddAgent(false)} className="btn-agent-cancel">Cancel</button>
                    <button type="submit" className="btn-agent-submit">Send Invitation</button>
                  </div>
                </form>
              )}

              <div className="cohost-grid">
                {cohosts.map(member => (
                  <div key={member.id} className="cohost-card">
                    <img src={member.avatar} alt={member.name} className="cohost-avatar" />
                    
                    <div className="cohost-info">
                      <span className="cohost-role-text" style={{ color: member.role === 'Manager' ? '#10B981' : '#717171' }}>
                        {member.role === 'Manager' ? 'Primary Host' : 'Guest'}
                      </span>
                      <h4 className="cohost-name">{member.name}</h4>
                      <span className="cohost-access-level">
                        {member.role === 'Manager' ? 'Full access • 100% per booking' : 'Limited access'}
                      </span>
                    </div>

                    {member.email !== 'manager@lulu.com' && (
                      <button onClick={() => handleRemoveAgent(member.id)} className="btn-cohost-remove" title="Remove co-host">
                        <Trash size={14} />
                      </button>
                    )}
                  </div>
                ))}
                
                <button className="cohost-invite-card" onClick={() => setShowAddAgent(!showAddAgent)}>
                  <div className="invite-icon-wrapper">
                    <Plus size={24} />
                  </div>
                  <span className="invite-text">Invite a co-host</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {managerTab === 'guests' && (
          <div className="team-moderation-view animate-fade-in">
            <div className="team-col glass" style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div className="column-header-row">
                <h3 className="cohost-title">Guest Directory <span style={{ color: '#BB8525', fontSize: '1rem', marginLeft: '8px', background: 'rgba(187, 133, 37, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>{unifiedGuests.length} Total</span></h3>
              </div>
              
              <div className="cohost-grid">
                {unifiedGuests.map(guest => (
                  <div key={guest.id} className="cohost-card">
                    <img src={guest.avatar} alt={guest.name} className="cohost-avatar" />
                    
                    <div className="cohost-info">
                      <span className="cohost-role-text" style={{ color: '#BB8525' }}>{guest.type}</span>
                      <h4 className="cohost-name">{guest.name}</h4>
                      <span className="cohost-access-level">{guest.email}</span>
                    </div>
                  </div>
                ))}
                {unifiedGuests.length === 0 && (
                   <p style={{ color: '#717171', padding: '20px' }}>No guests found.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {managerTab === 'moderation' && (
          <div className="moderation-view animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* REVIEW MODERATION FEED */}
            <div className="moderation-col glass">
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>Guest Feedback</h3>
                <p className="section-sub-desc" style={{ marginTop: 0 }}>Approve guest testimonials for display on public website or purge flagged feedback.</p>
              </div>

              <div className="reviews-feed">
                {reviews.map(r => (
                  <div key={r.id} className={`review-card card-border ${r.status.toLowerCase()}`}>
                    <div className="review-header">
                      <div>
                        <h4>{r.guest}</h4>
                        <div className="star-rating" style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < r.rating ? 'star filled' : 'star'}
                              />
                            ))}
                          </div>
                          <span className="rating-text" style={{ fontSize: '0.85rem', color: 'var(--color-dark)', fontWeight: '700' }}>
                            {r.rating}.0 / 5.0
                          </span>
                        </div>
                      </div>
                      <span className={`status-pill ${r.status.toLowerCase()}`}>{r.status}</span>
                    </div>

                    <p className="review-comment">"{r.comment}"</p>

                    <div className="review-actions">
                      <button onClick={() => handleReviewAction(r.id, 'delete')} className="btn-rev-delete">
                        Delete Testimonial
                      </button>
                      {r.status === 'Pending' && (
                        <button onClick={() => handleReviewAction(r.id, 'approve')} className="btn-rev-approve">
                          Approve Review
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
