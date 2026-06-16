import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { ASSOCIATION_NAME, APP_NAME } from '../constants/branding';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', phone: '', role: 'student', course: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="auth-page">
        <div className="auth-layout">
          <div className="auth-brand-panel">
            <span className="auth-brand-icon">M</span>
            <h2>{ASSOCIATION_NAME}</h2>
            <p className="auth-panel-subtitle">{APP_NAME}</p>
            <p>
              Register with your name and course to join the official association platform
              for Yumbe students and alumni at Makerere University.
            </p>
          </div>
          <div className="auth-card">
            <h1>Create Account</h1>
            <p className="auth-subtitle">Fill in your details to get started</p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="full_name">Full Name</label>
                <input
                  id="full_name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  required
                  placeholder="Your full name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder="you@example.com"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone (optional)</label>
                  <input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+256..."
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="role">I am a</label>
                  <select
                    id="role"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="student">Current Student</option>
                    <option value="alumni">Alumni</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="course">Course of Study</label>
                <input
                  id="course"
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  required
                  placeholder="e.g. Bachelor of Laws, BSc Computer Science"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="auth-footer">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
