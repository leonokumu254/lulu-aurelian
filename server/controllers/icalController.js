import crypto from 'crypto';
import { db } from '../config/db.js';

function formatICalDate(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function formatCleanDate(d) {
  if (!d) return '';
  if (d instanceof Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  const clean = String(d).trim();
  const match = clean.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return clean.split('T')[0];
}

function parseICalDateString(str) {
  if (!str) return null;
  const cleanStr = str.replace(/[^0-9T]/g, '');
  const match = cleanStr.match(/^(\d{4})(\d{2})(\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return null;
}

function parseICalData(icsText) {
  if (!icsText) return [];
  // Unfold multi-line folded attributes according to RFC 5545 standard
  const unfoldedText = icsText.replace(/\r?\n[ \t]/g, '');
  const events = [];
  const vevents = unfoldedText.split('BEGIN:VEVENT');

  for (let i = 1; i < vevents.length; i++) {
    const block = vevents[i].split('END:VEVENT')[0];
    
    let dtstart = null;
    let dtend = null;
    let summary = 'External Booking';
    let uid = null;

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
      } else if (line.startsWith('UID')) {
        const parts = line.split(':');
        const val = parts.slice(1).join(':');
        if (val) uid = val.trim();
      }
    }

    if (dtstart && dtend) {
      events.push({ check_in: dtstart, check_out: dtend, summary, uid });
    }
  }

  return events;
}

export const exportICal = async (req, res, next) => {
  try {
    const { unitId } = req.params;
    
    // Fetch all active bookings for this unit
    const allBookings = await db.bookings.getAll();
    const activeBookings = allBookings.filter(b => 
      (b.unit_id || b.suite || b.unit || '').toLowerCase() === unitId.toLowerCase() && 
      ['confirmed', 'paid', 'booked', 'approved', 'blocked'].includes((b.status || '').toLowerCase())
    );

    let ical = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Lulu Aurelian Estate//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:Lulu Aurelian - ${unitId.toUpperCase()}`
    ];

    activeBookings.forEach(booking => {
      const cleanStart = formatCleanDate(booking.check_in || booking.checkIn);
      const cleanEnd = formatCleanDate(booking.check_out || booking.checkOut);
      const created = booking.created_at ? new Date(booking.created_at) : new Date();

      if (cleanStart && cleanEnd) {
        ical.push(
          'BEGIN:VEVENT',
          `UID:${booking.id}@luluaurelian.co.ke`,
          `DTSTAMP:${formatICalDate(created)}`,
          `DTSTART;VALUE=DATE:${cleanStart.replace(/-/g, '')}`,
          `DTEND;VALUE=DATE:${cleanEnd.replace(/-/g, '')}`,
          `SUMMARY:Reserved - Lulu Aurelian Estate`,
          'DESCRIPTION:Reserved stay at Lulu Aurelian Estate',
          'STATUS:CONFIRMED',
          'TRANSP:OPAQUE',
          'X-MICROSOFT-CDO-BUSYSTATUS:BUSY',
          'END:VEVENT'
        );
      }
    });

    ical.push('END:VCALENDAR');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="luluaurelian_${unitId}.ics"`);
    
    return res.status(200).send(ical.join('\r\n'));
  } catch (error) {
    next(error);
  }
};

export const importICalSync = async (req, res, next) => {
  try {
    const { unitId, icalUrl, icsContent } = req.body;
    let content = icsContent;

    if (!content && icalUrl) {
      const fetchRes = await fetch(icalUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 LuluAurelianCalendarSync/1.0',
          'Accept': 'text/calendar, text/plain, */*'
        }
      });
      if (!fetchRes.ok) {
        return res.status(400).json({ error: `Failed to download iCal feed from URL (HTTP ${fetchRes.status}).` });
      }
      content = await fetchRes.text();
    }

    if (!content) {
      return res.status(400).json({ error: 'No iCal feed URL or content provided.' });
    }

    const events = parseICalData(content);
    if (events.length === 0) {
      return res.status(400).json({ error: 'No valid events or dates found in iCal feed.' });
    }

    // Fetch existing active bookings to deduplicate
    const allBookings = await db.bookings.getAll();
    const activeStatuses = ['confirmed', 'paid', 'booked', 'approved', 'blocked', 'pending'];
    const existingUnitBookings = allBookings.filter(b => {
      const u = (b.unit_id || b.suite || b.unit || '').toLowerCase();
      const s = (b.status || '').toLowerCase();
      return u === unitId.toLowerCase() && activeStatuses.includes(s);
    });

    const createdBlocks = [];
    for (const evt of events) {
      // Check if this date range is already blocked/booked
      const alreadyExists = existingUnitBookings.some(b => {
        const bIn = formatCleanDate(b.check_in || b.checkIn);
        const bOut = formatCleanDate(b.check_out || b.checkOut);
        return bIn === evt.check_in && bOut === evt.check_out;
      });

      if (alreadyExists) {
        continue; // Skip duplicate block
      }

      const blockId = 'ical_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      const newBlock = {
        id: blockId,
        guest_name: `BLOCKED: iCal Sync (${evt.summary || 'OTA Booking'})`,
        guest_email: 'ical-sync@luluaurelian.co.ke',
        guest_phone: 'N/A',
        unit_id: unitId.toLowerCase(),
        booking_type: 'entire',
        check_in: evt.check_in,
        check_out: evt.check_out,
        adults: 1,
        children: 0,
        has_peak_surcharge: 0,
        status: 'BLOCKED',
        secure_token: 'sec_ical_' + crypto.randomUUID(),
        created_at: new Date(),
        updated_at: new Date()
      };

      try {
        await db.bookings.create(newBlock);
        createdBlocks.push(newBlock);
      } catch (err) {
        console.warn('Could not persist iCal block:', err.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Synced ${createdBlocks.length} new date block(s) for ${unitId.toUpperCase()} (${events.length - createdBlocks.length} existing/duplicate skipped).`,
      blocks: createdBlocks,
      totalEvents: events.length
    });
  } catch (error) {
    console.error('iCal Sync error:', error);
    next(error);
  }
};

