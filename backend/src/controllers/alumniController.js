const pool = require('../config/db');

exports.getProfile = async (req, res) => {
  try {
    const [profiles] = await pool.query(
      `SELECT ap.*, u.full_name, u.email, u.phone, u.profile_photo, u.bio
       FROM alumni_profiles ap
       JOIN users u ON ap.user_id = u.id
       WHERE ap.user_id = ?`,
      [req.user.id]
    );
    res.json(profiles[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createOrUpdateProfile = async (req, res) => {
  try {
    if (req.user.role !== 'alumni') {
      return res.status(403).json({ message: 'Only alumni can create alumni profiles' });
    }

    const {
      student_number, registration_number, course, school, department,
      year_of_entry, year_of_graduation, current_job_title, current_employer,
      current_location, linkedin_url, twitter_url, willing_to_mentor,
    } = req.body;

    const [existing] = await pool.query('SELECT id FROM alumni_profiles WHERE user_id = ?', [req.user.id]);

    if (existing.length) {
      await pool.query(
        `UPDATE alumni_profiles SET
          student_number = ?, registration_number = ?, course = ?, school = ?,
          department = ?, year_of_entry = ?, year_of_graduation = ?,
          current_job_title = ?, current_employer = ?, current_location = ?,
          linkedin_url = ?, twitter_url = ?, willing_to_mentor = ?
         WHERE user_id = ?`,
        [
          student_number, registration_number, course, school, department,
          year_of_entry, year_of_graduation, current_job_title, current_employer,
          current_location, linkedin_url, twitter_url, willing_to_mentor ?? false,
          req.user.id,
        ]
      );
    } else {
      await pool.query(
        `INSERT INTO alumni_profiles
          (user_id, student_number, registration_number, course, school, department,
           year_of_entry, year_of_graduation, current_job_title, current_employer,
           current_location, linkedin_url, twitter_url, willing_to_mentor)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id, student_number, registration_number, course, school, department,
          year_of_entry, year_of_graduation, current_job_title, current_employer,
          current_location, linkedin_url, twitter_url, willing_to_mentor ?? false,
        ]
      );
    }

    const [profiles] = await pool.query(
      `SELECT ap.*, u.full_name, u.email, u.profile_photo
       FROM alumni_profiles ap JOIN users u ON ap.user_id = u.id
       WHERE ap.user_id = ?`,
      [req.user.id]
    );
    res.json(profiles[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllAlumni = async (req, res) => {
  try {
    const { search, course, mentor } = req.query;
    let query = `
      SELECT ap.*, u.full_name, u.email, u.phone, u.profile_photo, u.bio
      FROM alumni_profiles ap
      JOIN users u ON ap.user_id = u.id
      WHERE u.is_active = TRUE
    `;
    const params = [];

    if (search) {
      query += ' AND (u.full_name LIKE ? OR ap.current_employer LIKE ? OR ap.course LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }
    if (course) {
      query += ' AND ap.course LIKE ?';
      params.push(`%${course}%`);
    }
    if (mentor === 'true') {
      query += ' AND ap.willing_to_mentor = TRUE';
    }

    query += ' ORDER BY u.full_name ASC';
    const [alumni] = await pool.query(query, params);
    res.json(alumni);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAlumniById = async (req, res) => {
  try {
    const [alumni] = await pool.query(
      `SELECT ap.*, u.full_name, u.email, u.phone, u.profile_photo, u.bio
       FROM alumni_profiles ap
       JOIN users u ON ap.user_id = u.id
       WHERE ap.user_id = ? AND u.is_active = TRUE`,
      [req.params.id]
    );
    if (!alumni.length) {
      return res.status(404).json({ message: 'Alumni not found' });
    }
    res.json(alumni[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
