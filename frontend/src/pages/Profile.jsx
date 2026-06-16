import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { updateMemberProfile } from '../services/firestore';

export default function Profile() {
  const { user, updateUser, hasRole } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    course: user?.course || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const updated = await updateMemberProfile(user.id, form);
      updateUser(updated);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Update your name and course so other members can identify you</p>
      </div>

      {!user?.course && (
        <div className="alert alert-error">
          Please add your course — all MUYSA members are listed by name and course.
        </div>
      )}

      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <form className="card form-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Course of Study</label>
          <input
            value={form.course}
            onChange={(e) => setForm({ ...form, course: e.target.value })}
            required
            placeholder="e.g. Bachelor of Medicine and Bachelor of Surgery"
          />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+256..."
          />
        </div>
        <div className="form-group">
          <label>Bio</label>
          <textarea
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="A short introduction..."
          />
        </div>
        <div className="form-row profile-meta-row">
          <span className="meta">Role: <strong>{user?.role}</strong></span>
          <span className="meta">Email: <strong>{user?.email}</strong></span>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      {hasRole('admin') && (
        <p className="auth-footer" style={{ marginTop: '1rem' }}>
          <Link to="/members">View all members</Link>
        </p>
      )}
    </Layout>
  );
}
