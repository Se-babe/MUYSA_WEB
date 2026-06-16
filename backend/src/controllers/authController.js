const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

exports.register = async (req, res) => {
  try {
    const { full_name, email, password, phone, role } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'Full name, email, and password are required' });
    }

    const allowedRoles = ['student', 'alumni'];
    const userRole = allowedRoles.includes(role) ? role : 'student';

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, hashedPassword, phone || null, userRole]
    );

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await pool.query(
      'INSERT INTO user_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [result.insertId, token, expiresAt]
    );

    const user = { id: result.insertId, email, role: userRole, full_name };
    res.status(201).json({
      message: 'Registration successful',
      token: generateToken(user),
      user: { id: user.id, full_name, email, role: userRole, phone },
      verificationToken: token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [users] = await pool.query(
      'SELECT id, full_name, email, password, phone, role, profile_photo, bio, is_verified, is_active FROM users WHERE email = ?',
      [email]
    );

    if (!users.length) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    if (!user.is_active) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    delete user.password;
    res.json({ token: generateToken(user), user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, full_name, email, phone, role, profile_photo, bio, is_verified, is_active, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!users.length) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(users[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { full_name, phone, bio } = req.body;
    const profilePhoto = req.file ? `/uploads/${req.file.filename}` : undefined;

    const fields = [];
    const values = [];
    if (full_name) { fields.push('full_name = ?'); values.push(full_name); }
    if (phone !== undefined) { fields.push('phone = ?'); values.push(phone); }
    if (bio !== undefined) { fields.push('bio = ?'); values.push(bio); }
    if (profilePhoto) { fields.push('profile_photo = ?'); values.push(profilePhoto); }

    if (!fields.length) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(req.user.id);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

    const [users] = await pool.query(
      'SELECT id, full_name, email, phone, role, profile_photo, bio, is_verified FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json(users[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const [tokens] = await pool.query(
      'SELECT * FROM user_verification_tokens WHERE token = ? AND expires_at > NOW()',
      [token]
    );
    if (!tokens.length) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    await pool.query('UPDATE users SET is_verified = TRUE WHERE id = ?', [tokens[0].user_id]);
    await pool.query('DELETE FROM user_verification_tokens WHERE id = ?', [tokens[0].id]);
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
