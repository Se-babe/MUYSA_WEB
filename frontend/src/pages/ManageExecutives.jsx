import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getExecutives, createExecutive, updateExecutive, deleteExecutive } from '../services/firestore';
import { getCurrentAcademicYear, getSortedAcademicYears } from '../utils/executives';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

const EXECUTIVE_POSTS = [
  'President',
  'Vice President',
  'General Secretary',
  'Assistant General Secretary',
  'Treasurer',
  'Publicity Secretary',
  'Speaker',
  'Patron',
  'Other',
];

const emptyForm = {
  full_name: '',
  post: 'President',
  course: '',
  phone: '',
  email: '',
  academic_year: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
  sort_order: '1',
  is_current_term: true,
};

export default function ManageExecutives() {
  const [executives, setExecutives] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [customPost, setCustomPost] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState('all');

  const fetchExecutives = () => {
    setLoading(true);
    getExecutives(false)
      .then(setExecutives)
      .catch(() => setExecutives([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchExecutives(); }, []);

  const years = getSortedAcademicYears(executives);
  const currentYear = getCurrentAcademicYear(executives);
  const filtered = yearFilter === 'all'
    ? executives
    : executives.filter((e) => e.academic_year === yearFilter);

  const resetForm = (pastRecord = false) => {
    setForm({
      ...emptyForm,
      is_current_term: !pastRecord,
      academic_year: pastRecord ? '' : emptyForm.academic_year,
    });
    setCustomPost('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const post = form.post === 'Other' ? customPost : form.post;
    if (!post) {
      setMessage('Please specify the executive post');
      return;
    }
    if (!form.academic_year.trim()) {
      setMessage('Academic year is required for the record');
      return;
    }
    const payload = {
      ...form,
      post,
      is_active: form.is_current_term,
    };

    try {
      if (editingId) {
        await updateExecutive(editingId, payload);
        setMessage('Executive record updated successfully!');
      } else {
        await createExecutive(payload);
        setMessage('Executive record added successfully!');
      }
      resetForm();
      fetchExecutives();
    } catch (err) {
      setMessage(err.message || 'Operation failed');
    }
  };

  const startEdit = (exec) => {
    const isCustom = !EXECUTIVE_POSTS.slice(0, -1).includes(exec.post);
    setForm({
      full_name: exec.full_name,
      post: isCustom ? 'Other' : exec.post,
      course: exec.course || '',
      phone: exec.phone || '',
      email: exec.email || '',
      academic_year: exec.academic_year || '',
      sort_order: String(exec.sort_order ?? 99),
      is_current_term: exec.is_active !== false,
    });
    setCustomPost(isCustom ? exec.post : '');
    setEditingId(exec.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this executive record permanently?')) return;
    try {
      await deleteExecutive(id);
      fetchExecutives();
    } catch {
      alert('Delete failed');
    }
  };


  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Manage Executives</h1>
          <p>Add current executives and historical records by academic year of service</p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn btn-outline" onClick={() => { resetForm(true); setShowForm(true); }}>
            <FiPlus /> Add Past Record
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { resetForm(false); setShowForm(true); }}>
            <FiPlus /> Add Current Executive
          </button>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      {showForm && (
        <form className="card form-card" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Edit Executive Record' : (form.is_current_term ? 'Add Current Executive' : 'Add Past Executive Record')}</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Post / Position</label>
              <select value={form.post} onChange={(e) => setForm({ ...form, post: e.target.value })}>
                {EXECUTIVE_POSTS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
          {form.post === 'Other' && (
            <div className="form-group">
              <label>Custom Post Title</label>
              <input
                value={customPost}
                onChange={(e) => setCustomPost(e.target.value)}
                required
                placeholder="e.g. Welfare Secretary"
              />
            </div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label>Course</label>
              <input
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
                placeholder="Course of study"
              />
            </div>
            <div className="form-group">
              <label>Academic Year of Service</label>
              <input
                value={form.academic_year}
                onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
                placeholder="e.g. 2023/2024"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+256..."
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Display Order (lower = first)</label>
              <input
                type="number"
                min="1"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              />
            </div>
            <div className="form-group form-group-checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.is_current_term}
                  onChange={(e) => setForm({ ...form, is_current_term: e.target.checked })}
                />
                Currently serving (current term)
              </label>
              {!form.is_current_term && (
                <p className="field-hint">Saved to the executive archive for the selected academic year.</p>
              )}
            </div>
          </div>
          <div className="form-actions-row">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Save Changes' : 'Save Record'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => resetForm()}>Cancel</button>
          </div>
        </form>
      )}

      {years.length > 0 && (
        <div className="filter-tabs executive-year-tabs">
          <button
            type="button"
            className={`tab ${yearFilter === 'all' ? 'active' : ''}`}
            onClick={() => setYearFilter('all')}
          >
            All years
          </button>
          {years.map((year) => (
            <button
              key={year}
              type="button"
              className={`tab ${yearFilter === year ? 'active' : ''}`}
              onClick={() => setYearFilter(year)}
            >
              {year}
              {year === currentYear && <span className="tab-badge">Current</span>}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Name</th>
                <th>Post</th>
                <th>Course</th>
                <th>Year</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-text">No executive records yet. Add current or past records above.</td>
                </tr>
              ) : filtered.map((exec) => (
                <tr key={exec.id} className={exec.is_active === false ? 'row-inactive' : ''}>
                  <td>{exec.sort_order ?? '—'}</td>
                  <td className="member-name">{exec.full_name}</td>
                  <td><span className="tag tag-gold">{exec.post}</span></td>
                  <td>{exec.course || '—'}</td>
                  <td>{exec.academic_year || '—'}</td>
                  <td>
                    {exec.is_active !== false ? (
                      <span className="tag tag-green">Current</span>
                    ) : (
                      <span className="tag tag-outline">Archive</span>
                    )}
                  </td>
                  <td className="table-actions">
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => startEdit(exec)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(exec.id)}>
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
