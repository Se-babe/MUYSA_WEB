import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { createPost } from '../services/firestore';

export default function PostNews() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', content: '', excerpt: '', category: 'news', status: 'published', tags: '',
  });
  const [coverImage, setCoverImage] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await createPost(user.id, form, coverImage);
      setMessage('Post published successfully!');
      setForm({ title: '', content: '', excerpt: '', category: 'news', status: 'published', tags: '' });
      setCoverImage(null);
    } catch (err) {
      setMessage(err.message || 'Failed to publish post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>Post News</h1>
        <p>Create news, announcements, or blog posts</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <form className="card form-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="news">News</option>
              <option value="announcement">Announcement</option>
              <option value="blog">Blog</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Excerpt</label>
          <textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Content</label>
          <textarea rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Tags (comma-separated)</label>
          <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="muysa, events, community" />
        </div>
        <div className="form-group">
          <label>Cover Image (optional — requires Firebase Blaze plan)</label>
          <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files[0])} />
          <p className="form-hint">Posts work without a cover image on the free Spark plan.</p>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Publishing...' : 'Publish Post'}
        </button>
      </form>
    </Layout>
  );
}
