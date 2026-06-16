import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, updateUser, deactivateUser } from '../services/firestore';

export default function ManageUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = (q = '') => {
    setLoading(true);
    getAllUsers(q)
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleUpdate = async (id, data) => {
    try {
      await updateUser(id, data);
      fetchUsers(search);
    } catch {
      alert('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser.id) {
      alert('Cannot deactivate your own account');
      return;
    }
    if (!confirm('Deactivate this user?')) return;
    try {
      await deactivateUser(id);
      fetchUsers(search);
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>Manage Users</h1>
        <p>Admin panel for user management</p>
      </div>

      <form className="search-bar" onSubmit={(e) => { e.preventDefault(); fetchUsers(search); }}>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-sm">Search</button>
      </form>

      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Course</th>
                <th>Email</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.full_name}</td>
                  <td>{u.course || '—'}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdate(u.id, { role: e.target.value })}
                    >
                      {['student', 'alumni', 'admin', 'staff'].map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={u.is_verified}
                      onChange={(e) => handleUpdate(u.id, { is_verified: e.target.checked })}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={u.is_active !== false}
                      onChange={(e) => handleUpdate(u.id, { is_active: e.target.checked })}
                    />
                  </td>
                  <td>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>
                      Deactivate
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
