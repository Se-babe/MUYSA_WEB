import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { ASSOCIATION_NAME, APP_NAME } from '../constants/branding';

export default function Login() {
  const { login, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!form.email.trim()) {
      setError('Enter your email address first, then click Forgot password.');
      return;
    }
    setError('');
    setInfo('');
    setResetLoading(true);
    try {
      await forgotPassword(form.email.trim());
      setInfo('Password reset email sent. Check your inbox.');
    } catch (err) {
      setError(err.message || 'Could not send reset email');
    } finally {
      setResetLoading(false);
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
              Sign in to access news, events, the job board, executive records,
              and connect with fellow members of the association.
            </p>
          </div>
          <div className="auth-card">
            <h1>Sign In</h1>
            <p className="auth-subtitle">Enter your account credentials</p>

            {error && <div className="alert alert-error">{error}</div>}
            {info && <div className="alert alert-success">{info}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
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
              <div className="form-group">
                <div className="form-label-row">
                  <label htmlFor="password">Password</label>
                  <button
                    type="button"
                    className="link-button"
                    onClick={handleForgotPassword}
                    disabled={resetLoading}
                  >
                    {resetLoading ? 'Sending...' : 'Forgot password?'}
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  placeholder="Enter your password"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="auth-footer">
              Don&apos;t have an account? <Link to="/register">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
