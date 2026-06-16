const pool = require('../config/db');

exports.getAllJobs = async (req, res) => {
  try {
    const { job_type, search, active_only } = req.query;
    let query = `
      SELECT j.*, u.full_name AS poster_name
      FROM jobs j JOIN users u ON j.user_id = u.id WHERE 1=1
    `;
    const params = [];

    if (active_only !== 'false') { query += ' AND j.is_active = TRUE'; }
    if (job_type) { query += ' AND j.job_type = ?'; params.push(job_type); }
    if (search) {
      query += ' AND (j.title LIKE ? OR j.company LIKE ? OR j.location LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY j.created_at DESC';
    const [jobs] = await pool.query(query, params);
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const [jobs] = await pool.query(
      `SELECT j.*, u.full_name AS poster_name
       FROM jobs j JOIN users u ON j.user_id = u.id WHERE j.id = ?`,
      [req.params.id]
    );
    if (!jobs.length) return res.status(404).json({ message: 'Job not found' });
    res.json(jobs[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createJob = async (req, res) => {
  try {
    if (!['alumni', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only alumni and admins can post jobs' });
    }

    const {
      title, company, location, job_type, description,
      requirements, application_link, application_email, deadline,
    } = req.body;

    if (!title || !company) {
      return res.status(400).json({ message: 'Title and company are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO jobs (user_id, title, company, location, job_type, description,
        requirements, application_link, application_email, deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, title, company, location, job_type || 'full_time',
        description, requirements, application_link, application_email, deadline || null,
      ]
    );

    const [jobs] = await pool.query('SELECT * FROM jobs WHERE id = ?', [result.insertId]);
    res.status(201).json(jobs[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ message: 'Job not found' });
    if (existing[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const f = req.body;
    await pool.query(
      `UPDATE jobs SET title = ?, company = ?, location = ?, job_type = ?,
       description = ?, requirements = ?, application_link = ?,
       application_email = ?, deadline = ?, is_active = ? WHERE id = ?`,
      [
        f.title || existing[0].title, f.company || existing[0].company,
        f.location ?? existing[0].location, f.job_type || existing[0].job_type,
        f.description ?? existing[0].description, f.requirements ?? existing[0].requirements,
        f.application_link ?? existing[0].application_link,
        f.application_email ?? existing[0].application_email,
        f.deadline ?? existing[0].deadline,
        f.is_active ?? existing[0].is_active, req.params.id,
      ]
    );

    const [jobs] = await pool.query('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    res.json(jobs[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.applyForJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { cover_letter } = req.body;
    const cvUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const [jobs] = await pool.query('SELECT * FROM jobs WHERE id = ? AND is_active = TRUE', [jobId]);
    if (!jobs.length) return res.status(404).json({ message: 'Job not found or inactive' });

    await pool.query(
      'INSERT INTO job_applications (job_id, user_id, cover_letter, cv_url) VALUES (?, ?, ?, ?)',
      [jobId, req.user.id, cover_letter, cvUrl]
    );
    res.status(201).json({ message: 'Application submitted' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Already applied' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const [apps] = await pool.query(
      `SELECT ja.*, j.title, j.company, j.location
       FROM job_applications ja JOIN jobs j ON ja.job_id = j.id
       WHERE ja.user_id = ? ORDER BY ja.applied_at DESC`,
      [req.user.id]
    );
    res.json(apps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ message: 'Job not found' });
    if (existing[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    await pool.query('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
