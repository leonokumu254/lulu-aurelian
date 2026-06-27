import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import './CustomCalendarModal.css';

export default function CustomCalendarModal({ isOpen, initialCheckIn, initialCheckOut, onSelect, onClose, blockedDates = [] }) {

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [checkIn, setCheckIn] = useState(initialCheckIn || '');
  const [checkOut, setCheckOut] = useState(initialCheckOut || '');
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);

  // Parse YYYY-MM-DD string to Date object
  const parseDateString = (str) => {
    if (!str) return null;
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  // Convert Date object to YYYY-MM-DD string (local time)
  const formatDateString = (date) => {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const checkInDate = parseDateString(checkIn);
  const checkOutDate = parseDateString(checkOut);

  // Generate calendar days for a specific year and month
  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    
    // Day of the week for 1st of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
    // Adjust to start week on Monday: (day + 6) % 7
    const firstDayIndex = (date.getDay() + 6) % 7;
    
    // Add empty spacer days for the beginning of the grid
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    
    // Add all actual days of the month
    const totalDays = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }
    
    return days;
  };

  // Get year/month info based on offset from current date
  const getMonthYearByOffset = (offset) => {
    const target = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    return {
      year: target.getFullYear(),
      month: target.getMonth(),
      name: target.toLocaleString('default', { month: 'long' }).toUpperCase()
    };
  };

  const leftMonthInfo = getMonthYearByOffset(currentMonthOffset);
  const rightMonthInfo = getMonthYearByOffset(currentMonthOffset + 1);

  const leftDays = getDaysInMonth(leftMonthInfo.year, leftMonthInfo.month);
  const rightDays = getDaysInMonth(rightMonthInfo.year, rightMonthInfo.month);

  const isDateBlocked = (date) => {
    if (!date) return false;
    return blockedDates.some(range => {
      const start = parseDateString(range.checkIn);
      const end = parseDateString(range.checkOut);
      return date >= start && date < end; // allow checkout on checkin date of another booking
    });
  };

  const handleDateClick = (date) => {
    if (!date || date < today || isDateBlocked(date)) return; // Prevent clicking past or blocked dates

    const dateStr = formatDateString(date);

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr);
      setCheckOut('');
    } else {
      const selectedDate = parseDateString(dateStr);
      const startSelected = parseDateString(checkIn);

      if (selectedDate < startSelected) {
        setCheckIn(dateStr);
      } else {
        setCheckOut(dateStr);
      }
    }
  };

  // Determine classes for date cell
  const getDayClasses = (date) => {
    if (!date) return 'day-cell empty';
    if (date < today || isDateBlocked(date)) return 'day-cell disabled';

    const dateStr = formatDateString(date);
    const classes = ['day-cell'];

    const isStart = dateStr === checkIn;
    const isEnd = dateStr === checkOut;

    if (isStart) classes.push('range-start');
    if (isEnd) classes.push('range-end');
    
    if (checkInDate && checkOutDate && date > checkInDate && date < checkOutDate) {
      classes.push('range-mid');
    }

    return classes.join(' ');
  };

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const diffTime = Math.abs(checkOutDate - checkInDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleSelectClick = () => {
    if (checkIn && checkOut) {
      onSelect(checkIn, checkOut);
      onClose();
    }
  };

  const getStatusText = () => {
    if (!checkIn) return 'Select check-in date.';
    if (!checkOut) return 'Select check-out date.';
    const nights = calculateNights();
    return `${nights} ${nights === 1 ? 'night' : 'nights'} selected (${checkIn} to ${checkOut})`;
  };

  // Disable scroll when calendar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      const activeOverlays = document.querySelectorAll('.mobile-nav-overlay, .calendar-modal-overlay');
      if (activeOverlays.length === 0) {
        document.body.style.overflow = 'unset';
      }
    }
    return () => {
      const activeOverlays = document.querySelectorAll('.mobile-nav-overlay, .calendar-modal-overlay');
      if (activeOverlays.length === 0) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen]);

  // Sync state when calendar opens or inputs change
  useEffect(() => {
    if (isOpen) {
      setCheckIn(initialCheckIn || '');
      setCheckOut(initialCheckOut || '');
    }
  }, [isOpen, initialCheckIn, initialCheckOut]);

  if (!isOpen) return null;


  return (
    <div className="calendar-modal-overlay" onClick={onClose}>
      <div className="calendar-modal-container animate-slide-up" onClick={(e) => e.stopPropagation()}>
        
        {/* Top Header Bar */}
        <div className="calendar-modal-top-bar">
          <span className="calendar-modal-title">Select Dates</span>
          <button className="calendar-close-icon-btn" onClick={onClose} aria-label="Close calendar">
            <X size={18} />
          </button>
        </div>

        {/* Navigation & Month headers */}
        <div className="calendar-grid-header">
          <button 
            className="nav-arrow-btn" 
            onClick={() => setCurrentMonthOffset(prev => prev - 1)}
            disabled={currentMonthOffset <= 0}
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="months-titles">
            <h3 className="month-title">{leftMonthInfo.name} {leftMonthInfo.year}</h3>
            <h3 className="month-title right-only">{rightMonthInfo.name} {rightMonthInfo.year}</h3>
          </div>

          <button 
            className="nav-arrow-btn" 
            onClick={() => setCurrentMonthOffset(prev => prev + 1)}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Days of week and month calendars */}
        <div className="calendar-months-container">
          
          {/* Left Month */}
          <div className="month-view">
            <div className="weeks-header-row">
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
              <span>SUN</span>
            </div>
            <div className="days-grid">
              {leftDays.map((day, idx) => (
                <div 
                  key={`left-${idx}`} 
                  className={getDayClasses(day)}
                  onClick={() => handleDateClick(day)}
                >
                  {day ? day.getDate() : ''}
                </div>
              ))}
            </div>
          </div>

          {/* Right Month */}
          <div className="month-view right-only">
            <div className="weeks-header-row">
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
              <span>SUN</span>
            </div>
            <div className="days-grid">
              {rightDays.map((day, idx) => (
                <div 
                  key={`right-${idx}`} 
                  className={getDayClasses(day)}
                  onClick={() => handleDateClick(day)}
                >
                  {day ? day.getDate() : ''}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="calendar-modal-footer">
          <div className="calendar-status-box">
            <span className="status-label">{getStatusText()}</span>
          </div>
          
          <div className="calendar-action-buttons">
            <button 
              className="calendar-clear-btn"
              onClick={() => {
                setCheckIn('');
                setCheckOut('');
              }}
            >
              Clear dates
            </button>
            
            <button 
              className="btn-primary calendar-select-btn"
              disabled={!checkIn || !checkOut}
              onClick={handleSelectClick}
            >
              SELECT
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
