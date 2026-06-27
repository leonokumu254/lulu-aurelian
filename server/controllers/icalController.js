import { db } from '../config/db.js';

function formatICalDate(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export const exportICal = async (req, res, next) => {
  try {
    const { unitId } = req.params;
    
    // Fetch all active bookings for this unit
    const allBookings = await db.bookings.getAll();
    const activeBookings = allBookings.filter(b => 
      b.unit_id === unitId && 
      (b.status === 'APPROVED' || b.status === 'PAID')
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
      const start = new Date(booking.check_in);
      const end = new Date(booking.check_out);
      const created = new Date(booking.created_at);

      ical.push(
        'BEGIN:VEVENT',
        `UID:${booking.id}@luluaurelian.co.ke`,
        `DTSTAMP:${formatICalDate(created)}`,
        `DTSTART;VALUE=DATE:${start.toISOString().split('T')[0].replace(/-/g, '')}`,
        `DTEND;VALUE=DATE:${end.toISOString().split('T')[0].replace(/-/g, '')}`,
        `SUMMARY:Reserved - ${booking.guest_name}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    });

    ical.push('END:VCALENDAR');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="luluaurelian_${unitId}.ics"`);
    
    return res.status(200).send(ical.join('\r\n'));
  } catch (error) {
    next(error);
  }
};
