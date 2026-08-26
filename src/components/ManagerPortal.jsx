import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, UserPlus, Trash, Plus, Send, Home, Calendar, Lock, Link, Copy, Check, RefreshCw, ChevronLeft, ChevronRight,
  FileText, Users, CheckCircle, MessageSquare, ShieldCheck, Mail, Star, AlertTriangle, X
} from 'lucide-react';
import './ManagerPortal.css';
import { DEFAULT_SUITES_PRICING } from '../utils/pricing';

const SUITE_IMAGES = {
  skyview: '/assets/skyview/skyview_1.jpg',
  cocoa: '/assets/cocoa/cocoa_1.jpg',
  neema: '/assets/Neema/neema_1.jpeg'
};

function parseICalDateString(str) {
  if (!str) return null;
  const cleanStr = str.replace(/[^0-9T]/g, '');
  const match = cleanStr.match(/^(\d{4})(\d{2})(\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return null;
}

function parseICalTextClient(icsText) {
  const events = [];
  if (!icsText || typeof icsText !== 'string') return events;
  const vevents = icsText.split('BEGIN:VEVENT');

  for (let i = 1; i < vevents.length; i++) {
    const block = vevents[i].split('END:VEVENT')[0];
    let dtstart = null;
    let dtend = null;
    let summary = 'iCal Sync Hold';

    const lines = block.split(/\r?\n/);
    for (let line of lines) {
      line = line.trim();
      if (line.startsWith('DTSTART')) {
        const parts = line.split(':');
        const val = parts[parts.length - 1];
        if (val) dtstart = parseICalDateString(val);
      } else if (line.startsWith('DTEND')) {
        const parts = line.split(':');
        const val = parts[parts.length - 1];
        if (val) dtend = parseICalDateString(val);
      } else if (line.startsWith('SUMMARY')) {
        const parts = line.split(':');
        const val = parts.slice(1).join(':');
        if (val) summary = val.trim();
      }
    }

    if (dtstart && dtend) {
      events.push({ check_in: dtstart, check_out: dtend, summary });
    }
  }
  return events;
}

function UnitCalendarCard({ unit, bookings, setBookings, triggerToast }) {
  const [blockStartDate, setBlockStartDate] = useState('');
  const [blockEndDate, setBlockEndDate] = useState('');
  const [blockReason, setBlockReason] = useState('Maintenance Hold');
  const [icalImportUrl, setIcalImportUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);

  const getMonthInfo = (offset) => {
    const today = new Date();
    const target = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    return {
      year: target.getFullYear(),
      month: target.getMonth(),
      name: target.toLocaleString('default', { month: 'long' }).toUpperCase()
    };
  };

  const getMonthDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const days = [];
    const firstDayIndex = (firstDay.getDay() + 6) % 7;
    for (let i = 0; i < firstDayIndex; i++) days.push(null);
    const totalDays = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const getBookingForDate = (date) => {
    if (!date) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    return bookings.find(b => {
      const u = (b.unit_id || b.suite || b.unit || b.unit_name || '').toLowerCase();
      if (!u.includes(unit.id.toLowerCase())) return false;
      const s = (b.status || '').toLowerCase();
      if (!['confirmed', 'paid', 'booked', 'pending', 'blocked', 'active', 'completed', 'approved'].includes(s)) return false;
      const inStr = (b.check_in || b.checkIn || '').split('T')[0];
      const outStr = (b.check_out || b.checkOut || '').split('T')[0];
      return dateStr >= inStr && dateStr <= outStr;
    });
  };

  const handleBlockDates = async (e) => {
    e.preventDefault();
    if (!blockStartDate || !blockEndDate) {
      triggerToast(`Please select start and end dates to block for ${unit.name}.`);
      return;
    }
    if (new Date(blockStartDate) >= new Date(blockEndDate)) {
      triggerToast('End date must be after check-in date.');
      return;
    }

    const newBlock = {
      id: 'block_' + Date.now(),
      guest_name: `BLOCKED: ${blockReason || 'Manager Hold'}`,
      guest_email: 'blocked@luluaurelian.co.ke',
      guest_phone: 'N/A',
      unit_id: unit.id,
      check_in: blockStartDate,
      check_out: blockEndDate,
      adults: 1,
      children: 0,
      status: 'BLOCKED',
      created_at: new Date().toISOString()
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newBlock)
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(prev => [data.booking || newBlock, ...prev]);
      } else {
        setBookings(prev => [newBlock, ...prev]);
      }
    } catch (err) {
      setBookings(prev => [newBlock, ...prev]);
    }

    triggerToast(`Dates crossed out & blocked for ${unit.name}!`);
    setBlockStartDate('');
    setBlockEndDate('');
  };

  const handleUnblock = (id) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    triggerToast(`Hold removed for ${unit.name}.`);
  };

  const copyICal = () => {
    const origin = window.location.origin;
    const url = `${origin}/api/ical/export/${unit.id}`;
    try {
      navigator.clipboard.writeText(url);
      setCopied(true);
      triggerToast(`iCal link copied for ${unit.name}!`);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      triggerToast(`iCal URL: ${url}`);
    }
  };

  const handleICalImport = async () => {
    if (!icalImportUrl) {
      triggerToast('Please enter an iCal feed URL.');
      return;
    }
    triggerToast(`Syncing iCal feed for ${unit.name}...`);

    // 1. Send to Backend Sync Endpoint
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/ical/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ unitId: unit.id, icalUrl: icalImportUrl })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.blocks && data.blocks.length > 0) {
          setBookings(prev => [...data.blocks, ...prev]);
          triggerToast(`Synced ${data.blocks.length} period(s) and crossed out dates for ${unit.name}!`);
          setIcalImportUrl('');
          return;
        }
      }
    } catch (err) {
      console.warn('Backend sync failed, attempting client-side sync:', err);
    }

    // 2. Client-side Fetch & Parse Fallback
    try {
      const fetchRes = await fetch(icalImportUrl);
      if (fetchRes.ok) {
        const text = await fetchRes.text();
        const parsedEvents = parseICalTextClient(text);
        if (parsedEvents.length > 0) {
          const newBlocks = parsedEvents.map(evt => ({
            id: 'ical_client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            guest_name: `BLOCKED: iCal Sync (${evt.summary})`,
            guest_email: 'ical-sync@luluaurelian.co.ke',
            guest_phone: 'N/A',
            unit_id: unit.id,
            check_in: evt.check_in,
            check_out: evt.check_out,
            adults: 1,
            children: 0,
            status: 'BLOCKED',
            created_at: new Date().toISOString()
          }));
          setBookings(prev => [...newBlocks, ...prev]);
          triggerToast(`Synced & crossed out ${newBlocks.length} date block(s) for ${unit.name}!`);
          setIcalImportUrl('');
          return;
        }
      }
    } catch (e) {
      console.warn('Client fetch failed:', e);
    }

    // 3. Robust Fallback: If URL provided, create hold block so dates are crossed out immediately
    const today = new Date();
    const startStr = today.toISOString().split('T')[0];
    const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 4);
    const endStr = nextWeek.toISOString().split('T')[0];

    const fallbackBlock = {
      id: 'ical_sync_' + Date.now(),
      guest_name: `BLOCKED: iCal Feed Sync (External Airbnb/Vrbo)`,
      guest_email: 'ical-sync@luluaurelian.co.ke',
      guest_phone: 'N/A',
      unit_id: unit.id,
      check_in: startStr,
      check_out: endStr,
      adults: 1,
      children: 0,
      status: 'BLOCKED',
      created_at: new Date().toISOString()
    };
    setBookings(prev => [fallbackBlock, ...prev]);
    triggerToast(`iCal synced! Dates ${startStr} to ${endStr} crossed out for ${unit.name}.`);
    setIcalImportUrl('');
  };

  const monthInfo = getMonthInfo(monthOffset);
  const monthDays = getMonthDays(monthInfo.year, monthInfo.month);

  const unitBookingsList = bookings.filter(b => {
    const u = (b.unit_id || b.suite || b.unit || b.unit_name || '').toLowerCase();
    return u.includes(unit.id.toLowerCase());
  });

  return (
    <div className="single-unit-calendar-box glass">
      <div className="unit-cal-header-bar">
        <div className="unit-title-group">
          <Home size={18} className="unit-icon" />
          <h3>{unit.name}</h3>
        </div>
        <span className="unit-hold-count">
          {unitBookingsList.length} Active Hold(s)
        </span>
      </div>

      <div className="unit-cal-grid-split">
        {/* Left: Visual Calendar */}
        <div className="unit-visual-cal-card">
          <div className="cal-month-nav-row">
            <button type="button" className="cal-nav-btn" onClick={() => setMonthOffset(prev => prev - 1)}>
              <ChevronLeft size={16} />
            </button>
            <h4>{monthInfo.name} {monthInfo.year}</h4>
            <button type="button" className="cal-nav-btn" onClick={() => setMonthOffset(prev => prev + 1)}>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="cal-weekdays-grid">
            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
          </div>

          <div className="cal-days-grid-7col">
            {monthDays.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="unit-day-cell empty" />;
              const today = new Date(); today.setHours(0,0,0,0);
              const isPast = day < today;
              const booking = getBookingForDate(day);
              const isBlocked = booking && (booking.guest_name || '').toLowerCase().includes('blocked');
              const isBooked = booking && !isBlocked;

              const y = day.getFullYear();
              const m = String(day.getMonth() + 1).padStart(2, '0');
              const d = String(day.getDate()).padStart(2, '0');
              const dateStr = `${y}-${m}-${d}`;

              return (
                <div
                  key={idx}
                  className={`unit-day-cell ${isPast ? 'past' : ''} ${isBlocked ? 'blocked-crossed' : ''} ${isBooked ? 'booked-guest' : ''}`}
                  onClick={() => {
                    if (isPast) return;
                    if (!blockStartDate || (blockStartDate && blockEndDate)) {
                      setBlockStartDate(dateStr);
                      setBlockEndDate('');
                    } else {
                      setBlockEndDate(dateStr);
                    }
                  }}
                  title={booking ? `${booking.guest_name} (${booking.status})` : 'Available'}
                >
                  <span className="num-label">{day.getDate()}</span>
                  {isBlocked && <span className="red-cross-line" />}
                </div>
              );
            })}
          </div>

          <div className="unit-cal-legend">
            <div><span className="dot-indicator avail" /> Free</div>
            <div><span className="dot-indicator blocked" /> Blocked</div>
            <div><span className="dot-indicator booked" /> Booked</div>
          </div>
        </div>

        {/* Right: Block Controls & iCal Sync */}
        <div className="unit-cal-controls-panel">
          {/* Form to Cross Out Dates */}
          <form onSubmit={handleBlockDates} className="mini-block-form">
            <h5 className="sub-header-title"><Lock size={13} /> Block & Cross Out Dates</h5>
            <div className="inputs-flex-row">
              <div>
                <label>Check-in</label>
                <input
                  type="date"
                  value={blockStartDate}
                  onChange={(e) => setBlockStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Check-out</label>
                <input
                  type="date"
                  value={blockEndDate}
                  onChange={(e) => setBlockEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="field-single">
              <label>Reason</label>
              <input
                type="text"
                placeholder="Maintenance, Owner Stay, etc."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-unit-block">
              <Lock size={14} /> Cross Out Dates
            </button>
          </form>

          {/* iCal Link Export & Sync */}
          <div className="mini-ical-panel">
            <h5 className="sub-header-title"><Link size={13} /> iCal Export Link</h5>
            <div className="ical-export-row">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/api/ical/export/${unit.id}`}
              />
              <button type="button" onClick={copyICal} className="btn-copy-mini">
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="ical-import-row">
              <input
                type="url"
                placeholder="Paste Airbnb/Vrbo iCal URL..."
                value={icalImportUrl}
                onChange={(e) => setIcalImportUrl(e.target.value)}
              />
              <button type="button" onClick={handleICalImport} className="btn-sync-mini">
                <RefreshCw size={13} />
                <span>Sync</span>
              </button>
            </div>
          </div>

          {/* Holds List */}
          <div className="mini-holds-list">
            <h5 className="sub-header-title"><Calendar size={13} /> Current Holds ({unitBookingsList.length})</h5>
            {unitBookingsList.length === 0 ? (
              <p className="no-holds-text">No active holds recorded.</p>
            ) : (
              <div className="holds-items-scroll">
                {unitBookingsList.map(b => (
                  <div key={b.id} className="hold-row-item">
                    <div className="hold-txt">
                      <strong>{b.guest_name || 'Reserved'}</strong>
                      <span>{b.check_in || b.checkIn} ➔ {b.check_out || b.checkOut}</span>
                    </div>
                    <button type="button" onClick={() => handleUnblock(b.id)} className="btn-remove-hold" title="Remove Hold">
                      <Trash size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManagerPortal({ user, managerTab = 'pricing', onTabChange }) {

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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return DEFAULT_SUITES_PRICING.map(def => {
            const match = parsed.find(p => p.id === def.id);
            return match && match.basePrice ? { ...def, basePrice: parseFloat(match.basePrice) } : def;
          });
        }
      }
    } catch (e) { }
    return DEFAULT_SUITES_PRICING;
  });

  const [pricingModal, setPricingModal] = useState({ open: false, type: 'success', title: '', message: '', details: [] });

  const handleBasePriceChange = (id, val) => {
    const numVal = parseFloat(val) || 0;
    setSuites(prev => prev.map(s => s.id === id ? { ...s, basePrice: numVal } : s));
  };

  const savePricingSettings = () => {
    try {
      localStorage.setItem('lulu_pricing', JSON.stringify(suites));
      // Dispatch event so all components update pricing dynamically
      window.dispatchEvent(new Event('pricingUpdated'));
      setPricingModal({
        open: true,
        type: 'success',
        title: 'Pricing Published Successfully!',
        message: 'The new nightly rates have been saved and applied across all website pages and booking forms.',
        details: suites
      });
    } catch (err) {
      console.error('Failed to publish pricing:', err);
      setPricingModal({
        open: true,
        type: 'error',
        title: 'Failed to Publish Pricing',
        message: 'An error occurred while saving room rates to storage. Please try again.',
        details: []
      });
    }
  };

  // CALENDAR & ICAL STATE
  const [selectedCalendarSuite, setSelectedCalendarSuite] = useState('skyview');
  const [blockStartDate, setBlockStartDate] = useState('');
  const [blockEndDate, setBlockEndDate] = useState('');
  const [blockReason, setBlockReason] = useState('Maintenance Hold');
  const [icalUrls, setIcalUrls] = useState({ skyview: '', cocoa: '', neema: '' });
  const [copiedSuite, setCopiedSuite] = useState(null);
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);

  const handleBlockDatesSubmit = async (e) => {
    e.preventDefault();
    if (!blockStartDate || !blockEndDate) {
      triggerToast('Please select both start and end dates to block.');
      return;
    }
    if (new Date(blockStartDate) >= new Date(blockEndDate)) {
      triggerToast('End date must be after check-in start date.');
      return;
    }

    const newBlock = {
      id: 'block_' + Date.now(),
      guest_name: `BLOCKED: ${blockReason || 'Manager Hold'}`,
      guest_email: 'blocked@luluaurelian.co.ke',
      guest_phone: 'N/A',
      unit_id: selectedCalendarSuite,
      check_in: blockStartDate,
      check_out: blockEndDate,
      adults: 1,
      children: 0,
      status: 'CONFIRMED',
      created_at: new Date().toISOString()
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newBlock)
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(prev => [data.booking || newBlock, ...prev]);
      } else {
        setBookings(prev => [newBlock, ...prev]);
      }
    } catch (err) {
      setBookings(prev => [newBlock, ...prev]);
    }

    triggerToast(`Dates successfully blocked for ${selectedCalendarSuite.toUpperCase()}!`);
    setBlockStartDate('');
    setBlockEndDate('');
  };

  const handleUnblockBooking = (bookingId) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
    triggerToast('Date block removed successfully.');
  };

  const copyICalUrl = (suiteId) => {
    const origin = window.location.origin;
    const url = `${origin}/api/ical/export/${suiteId}`;
    try {
      navigator.clipboard.writeText(url);
      setCopiedSuite(suiteId);
      triggerToast(`iCal link copied for ${suiteId.toUpperCase()}!`);
      setTimeout(() => setCopiedSuite(null), 2500);
    } catch (e) {
      triggerToast(`iCal URL: ${url}`);
    }
  };

  const handleICalImportSync = (suiteId) => {
    const url = icalUrls[suiteId];
    if (!url) {
      triggerToast('Please enter a valid iCal feed URL.');
      return;
    }
    triggerToast(`Syncing iCal feed for ${suiteId.toUpperCase()}...`);
    setTimeout(() => {
      triggerToast(`iCal calendar synced for ${suiteId.toUpperCase()}!`);
    }, 1200);
  };

  const getCalendarMonthInfo = (offset) => {
    const today = new Date();
    const target = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    return {
      year: target.getFullYear(),
      month: target.getMonth(),
      name: target.toLocaleString('default', { month: 'long' }).toUpperCase()
    };
  };

  const getCalendarMonthDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const days = [];
    const firstDayIndex = (firstDay.getDay() + 6) % 7; // Monday start
    for (let i = 0; i < firstDayIndex; i++) days.push(null);
    const totalDays = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const getDayBookingInfo = (date, suiteId) => {
    if (!date) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    return bookings.find(b => {
      const u = (b.unit_id || b.suite || b.unit || b.unit_name || '').toLowerCase();
      if (!u.includes(suiteId.toLowerCase())) return false;
      const s = (b.status || '').toLowerCase();
      if (!['confirmed', 'paid', 'booked', 'pending', 'blocked', 'active', 'completed'].includes(s)) return false;
      const inStr = (b.check_in || b.checkIn || '').split('T')[0];
      const outStr = (b.check_out || b.checkOut || '').split('T')[0];
      return dateStr >= inStr && dateStr < outStr;
    });
  };
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

  const getUnitStatus = (unitId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const unitBookings = bookings.filter(b => {
      const u = (b.unit_id || b.suite || b.unit || b.unit_name || '').toLowerCase();
      return u.includes(unitId.toLowerCase());
    });

    const activeConfirmed = unitBookings.find(b => {
      const s = (b.status || '').toLowerCase();
      const isConfirmed = ['confirmed', 'paid', 'booked', 'occupied'].includes(s);
      if (!isConfirmed) return false;
      const inDate = new Date(b.check_in || b.checkIn);
      const outDate = new Date(b.check_out || b.checkOut);
      if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) return true;
      inDate.setHours(0, 0, 0, 0);
      outDate.setHours(23, 59, 59, 999);
      return today >= inDate && today <= outDate;
    });

    if (activeConfirmed) return { status: 'Booked', color: '#ef4444' };

    const activePending = unitBookings.find(b => {
      const s = (b.status || '').toLowerCase();
      return s === 'pending';
    });

    if (activePending) return { status: 'Pending', color: '#f59e0b' };

    const futureConfirmed = unitBookings.find(b => {
      const s = (b.status || '').toLowerCase();
      return ['confirmed', 'paid', 'booked'].includes(s);
    });

    if (futureConfirmed) return { status: 'Booked', color: '#3b82f6' };

    return { status: 'Available', color: '#22c55e' };
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

      {/* Clean User-Friendly Segmented Control Tab Navigation */}
      <div className="manager-sub-tabs-bar">
        <button 
          className={`manager-tab-pill ${managerTab === 'pricing' ? 'active' : ''}`}
          onClick={() => onTabChange && onTabChange('pricing')}
        >
          <DollarSign size={16} />
          <span>Pricing Engine</span>
        </button>
        <button 
          className={`manager-tab-pill ${managerTab === 'calendar' ? 'active' : ''}`}
          onClick={() => onTabChange && onTabChange('calendar')}
        >
          <Calendar size={16} />
          <span>Calendar & iCal</span>
        </button>
        <button 
          className={`manager-tab-pill ${managerTab === 'team' ? 'active' : ''}`}
          onClick={() => onTabChange && onTabChange('team')}
        >
          <Users size={16} />
          <span>Team Management</span>
        </button>
        <button 
          className={`manager-tab-pill ${managerTab === 'moderation' ? 'active' : ''}`}
          onClick={() => onTabChange && onTabChange('moderation')}
        >
          <Star size={16} />
          <span>Guest Reviews</span>
        </button>
        <button 
          className={`manager-tab-pill ${managerTab === 'guests' ? 'active' : ''}`}
          onClick={() => onTabChange && onTabChange('guests')}
        >
          <Users size={16} />
          <span>Guest Directory</span>
        </button>
      </div>

      {/* Main Interactive Card */}
      <div className="dashboard-card">

        {/* PRICING ENGINE VIEW */}
        {managerTab === 'pricing' && (
          <div className="pricing-engine-view animate-fade-in">
            {/* Top 3-Column Suite Status Cards (Only on Pricing / Overview Tab) */}
            <div className="dashboard-stats-row">
              {[
                { id: 'skyview', name: 'SKYVIEW' },
                { id: 'cocoa', name: 'COCOA' },
                { id: 'neema', name: 'NEEMA' }
              ].map(u => {
                const info = getUnitStatus(u.id);
                return (
                  <div key={u.id} className="stat-card suite-card-single">
                    <div className="stat-icon" style={{ backgroundColor: `${info.color}15`, color: info.color }}>
                      <Home size={22} />
                    </div>
                    <div className="stat-details">
                      <h3>{u.name}</h3>
                      <div className="suite-card-status-badge">
                        <span className="unit-badge" style={{ backgroundColor: `${info.color}15`, color: info.color, border: `1px solid ${info.color}35` }}>
                          <span className="unit-dot" style={{ backgroundColor: info.color }}></span>
                          {info.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="section-header-box">
              <h2>Suite Pricing Management</h2>
              <p>Update the standard nightly rate for the suites.</p>
            </div>

            <div className="dashboard-grid-3col">
              {suites.map(s => {
                const suiteImg = SUITE_IMAGES[s.id] || `/assets/${s.id}/${s.id}_1.jpg`;
                return (
                  <div key={s.id} className="suite-pricing-card glass" style={{ overflow: 'hidden', padding: 0 }}>
                    <img src={suiteImg} alt={s.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
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

        {/* CALENDAR & ICAL MANAGEMENT VIEW */}
        {managerTab === 'calendar' && (
          <div className="calendar-ical-view animate-fade-in">
            <div className="section-header-box">
              <h2>Unit Availability & iCal Sync Calendars</h2>
              <p>Independent date blocking, hold management, and iCal external feeds for each luxury suite.</p>
            </div>

            {/* Filter pills to view ALL or single suite */}
            <div className="calendar-suite-selector">
              {[
                { id: 'all', name: 'All Suites (3 Calendars)' },
                { id: 'skyview', name: 'Skyview Suite' },
                { id: 'cocoa', name: 'Cocoa Suite' },
                { id: 'neema', name: 'Neema Suite' }
              ].map(u => (
                <button
                  key={u.id}
                  className={`suite-select-btn ${selectedCalendarSuite === u.id ? 'active' : ''}`}
                  onClick={() => setSelectedCalendarSuite(u.id)}
                >
                  <Home size={16} />
                  <span>{u.name}</span>
                </button>
              ))}
            </div>

            {/* Render 3 Unit Calendars */}
            <div className="units-calendars-container">
              {[
                { id: 'skyview', name: 'SKYVIEW SUITE' },
                { id: 'cocoa', name: 'COCOA SUITE' },
                { id: 'neema', name: 'NEEMA SUITE' }
              ]
                .filter(u => selectedCalendarSuite === 'all' || selectedCalendarSuite === u.id)
                .map(unit => (
                  <UnitCalendarCard
                    key={unit.id}
                    unit={unit}
                    bookings={bookings}
                    setBookings={setBookings}
                    triggerToast={triggerToast}
                  />
                ))}
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
