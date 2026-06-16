const pool = require('../config/db');

exports.getProfile = async (req, res) => {
  try {
    const [profiles] = await pool.query(
      `SELECT sp.*, u.full_name, u.email, u.phone, u.profile_photo, u.bio
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.user_id = ?`,
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
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can create student profiles' });
    }

    const {
      student_number, registration_number, course, school, department,
      year_of_entry, expected_graduation, current_year_of_study,
      hometown, nationality, whatsapp_number,
    } = req.body;

    const [existing] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);

    if (existing.length) {
      await pool.query(
        `UPDATE student_profiles SET
          student_number = ?, registration_number = ?, course = ?, school = ?,
          department = ?, year_of_entry = ?, expected_graduation = ?,
          current_year_of_study = ?, hometown = ?, nationality = ?, whatsapp_number = ?
         WHERE user_id = ?`,
        [
          student_number, registration_number, course, school, department,
          year_of_entry, expected_graduation, current_year_of_study,
          hometown, nationality, whatsapp_number, req.user.id,
        ]
      );
    } else {
      await pool.query(
        `INSERT INTO student_profiles
          (user_id, student_number, registration_number, course, school, department,
           year_of_entry, expected_graduation, current_year_of_study, hometown, nationality, whatsapp_number)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id, student_number, registration_number, course, school, department,
          year_of_entry, expected_graduation, current_year_of_study,
          hometown, nationality, whatsapp_number,
        ]
      );
    }

    const [profiles] = await pool.query(
      `SELECT sp.*, u.full_name, u.email, u.profile_photo
       FROM student_profiles sp JOIN users u ON sp.user_id = u.id
       WHERE sp.user_id = ?`,
      [req.user.id]
    );
    res.json(profiles[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const { search, course, year } = req.query;
    let query = `
      SELECT sp.*, u.full_name, u.email, u.phone, u.profile_photo, u.bio
      FROM student_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE u.is_active = TRUE
    `;
    const params = [];

    if (search) {
      query += ' AND (u.full_name LIKE ? OR sp.course LIKE ? OR sp.hometown LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }
    if (course) {
      query += ' AND sp.course LIKE ?';
      params.push(`%${course}%`);
    }
    if (year) {
      query += ' AND sp.current_year_of_study = ?';
      params.push(year);
    }

    query += ' ORDER BY u.full_name ASC';
    const [students] = await pool.query(query, params);
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const [students] = await pool.query(
      `SELECT sp.*, u.full_name, u.email, u.phone, u.profile_photo, u.bio
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.user_id = ? AND u.is_active = TRUE`,
      [req.params.id]
    );
    if (!students.length) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(students[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
