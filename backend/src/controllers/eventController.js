const pool = require('../config/db');

exports.getAllEvents = async (req, res) => {
  try {
    const { status, event_type } = req.query;
    let query = `
      SELECT e.*, u.full_name AS organiser_name,
        (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id) AS registration_count
      FROM events e JOIN users u ON e.user_id = u.id WHERE 1=1
    `;
    const params = [];

    if (status) { query += ' AND e.status = ?'; params.push(status); }
    if (event_type) { query += ' AND e.event_type = ?'; params.push(event_type); }

    query += ' ORDER BY e.start_datetime ASC';
    const [events] = await pool.query(query, params);
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const [events] = await pool.query(
      `SELECT e.*, u.full_name AS organiser_name,
        (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.id) AS registration_count
       FROM events e JOIN users u ON e.user_id = u.id WHERE e.id = ?`,
      [req.params.id]
    );
    if (!events.length) return res.status(404).json({ message: 'Event not found' });
    res.json(events[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const {
      title, description, location, venue, event_type,
      start_datetime, end_datetime, registration_required, max_attendees,
    } = req.body;

    if (!title || !start_datetime || !end_datetime) {
      return res.status(400).json({ message: 'Title, start and end datetime are required' });
    }

    const coverImage = req.file ? `/uploads/${req.file.filename}` : null;
    const [result] = await pool.query(
      `INSERT INTO events (user_id, title, description, cover_image, location, venue,
        event_type, start_datetime, end_datetime, registration_required, max_attendees)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, title, description, coverImage, location, venue,
        event_type || 'physical', start_datetime, end_datetime,
        registration_required === 'true' || registration_required === true,
        max_attendees || null,
      ]
    );

    const [events] = await pool.query('SELECT * FROM events WHERE id = ?', [result.insertId]);
    res.status(201).json(events[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM events WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ message: 'Event not found' });
    if (existing[0].user_id !== req.user.id && !['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const fields = req.body;
    const coverImage = req.file ? `/uploads/${req.file.filename}` : existing[0].cover_image;
    await pool.query(
      `UPDATE events SET title = ?, description = ?, cover_image = ?, location = ?,
       venue = ?, event_type = ?, start_datetime = ?, end_datetime = ?,
       registration_required = ?, max_attendees = ?, status = ?
       WHERE id = ?`,
      [
        fields.title || existing[0].title,
        fields.description ?? existing[0].description,
        coverImage,
        fields.location ?? existing[0].location,
        fields.venue ?? existing[0].venue,
        fields.event_type || existing[0].event_type,
        fields.start_datetime || existing[0].start_datetime,
        fields.end_datetime || existing[0].end_datetime,
        fields.registration_required ?? existing[0].registration_required,
        fields.max_attendees ?? existing[0].max_attendees,
        fields.status || existing[0].status,
        id,
      ]
    );

    const [events] = await pool.query('SELECT * FROM events WHERE id = ?', [id]);
    res.json(events[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const [events] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!events.length) return res.status(404).json({ message: 'Event not found' });

    const event = events[0];
    if (event.max_attendees) {
      const [count] = await pool.query(
        'SELECT COUNT(*) AS total FROM event_registrations WHERE event_id = ?',
        [eventId]
      );
      if (count[0].total >= event.max_attendees) {
        return res.status(400).json({ message: 'Event is full' });
      }
    }

    await pool.query(
      'INSERT INTO event_registrations (event_id, user_id) VALUES (?, ?)',
      [eventId, req.user.id]
    );
    res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Already registered' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyRegistrations = async (req, res) => {
  try {
    const [registrations] = await pool.query(
      `SELECT e.*, er.registered_at, er.attended
       FROM event_registrations er
       JOIN events e ON er.event_id = e.id
       WHERE er.user_id = ?
       ORDER BY e.start_datetime DESC`,
      [req.user.id]
    );
    res.json(registrations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ message: 'Event not found' });
    if (existing[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
