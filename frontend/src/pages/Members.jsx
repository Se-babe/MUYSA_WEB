import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import MemberTable from '../components/MemberTable';
import { useAuth } from '../context/AuthContext';
import { getAllMembers, getOrCreateConversation, getMemberStats } from '../services/firestore';
import { FiSearch } from 'react-icons/fi';

export default function Members() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMembers = async (q = '', role = '') => {
    setLoading(true);
    try {
      setMembers(await getAllMembers(q, role));
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    getMemberStats().then(setStats).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMembers(search, filter);
  };

  const startConversation = async (userId) => {
    try {
      const convId = await getOrCreateConversation(user.id, userId);
      navigate(`/messages?conversation=${convId}`);
    } catch {
      alert('Could not start conversation');
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>All MUYSA Members</h1>
          <p>Every member listed by name and course of study</p>
        </div>
        {stats && (
          <span className="member-count-badge">{stats.totalMembers} total members</span>
        )}
      </div>

      <div className="filter-tabs">
        {[
          { value: '', label: 'All Members' },
          { value: 'student', label: 'Current Students' },
          { value: 'alumni', label: 'Alumni' },
        ].map(({ value, label }) => (
          <button
            key={value || 'all'}
            type="button"
            className={`tab ${filter === value ? 'active' : ''}`}
            onClick={() => { setFilter(value); fetchMembers(search, value); }}
          >
            {label}
          </button>
        ))}
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <FiSearch />
        <input
          type="text"
          placeholder="Search by name or course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-sm">Search</button>
      </form>

      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : (
        <MemberTable members={members} onMessage={startConversation} />
      )}
    </Layout>
  );
}
