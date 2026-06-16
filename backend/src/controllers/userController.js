const pool = require('../config/db');

exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, active } = req.query;
    let query = `
      SELECT id, full_name, email, phone, role, profile_photo, is_verified, is_active, created_at
      FROM users WHERE 1=1
    `;
    const params = [];

    if (role) { query += ' AND role = ?'; params.push(role); }
    if (active !== undefined) { query += ' AND is_active = ?'; params.push(active === 'true'); }
    if (search) {
      query += ' AND (full_name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';
    const [users] = await pool.query(query, params);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, is_active, is_verified } = req.body;

    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ message: 'User not found' });

    await pool.query(
      'UPDATE users SET role = COALESCE(?, role), is_active = COALESCE(?, is_active), is_verified = COALESCE(?, is_verified) WHERE id = ?',
      [role, is_active, is_verified, id]
    );

    const [users] = await pool.query(
      'SELECT id, full_name, email, phone, role, is_verified, is_active FROM users WHERE id = ?',
      [id]
    );
    res.json(users[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [[students]] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE role = 'student' AND is_active = TRUE");
    const [[alumni]] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE role = 'alumni' AND is_active = TRUE");
    const [[events]] = await pool.query("SELECT COUNT(*) AS count FROM events WHERE status = 'upcoming'");
    const [[jobs]] = await pool.query('SELECT COUNT(*) AS count FROM jobs WHERE is_active = TRUE');
    const [[posts]] = await pool.query("SELECT COUNT(*) AS count FROM posts WHERE status = 'published'");

    res.json({
      students: students.count,
      alumni: alumni.count,
      upcomingEvents: events.count,
      activeJobs: jobs.count,
      publishedPosts: posts.count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
