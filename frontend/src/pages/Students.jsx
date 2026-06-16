import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import MemberTable from '../components/MemberTable';
import { useAuth } from '../context/AuthContext';
import { getStudents, getOrCreateConversation, getMemberStats } from '../services/firestore';
import { FiSearch } from 'react-icons/fi';

export default function Students() {
  const { user, hasRole } = useAuth();
  const [students, setStudents] = useState([]);
  const [memberCount, setMemberCount] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStudents = async (q = '') => {
    setLoading(true);
    try {
      setStudents(await getStudents(q));
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    getMemberStats().then((s) => setMemberCount(s.currentStudents)).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents(search);
  };

  const startConversation = async (userId) => {
    try {
      const convId = await getOrCreateConversation(user.id, userId);
      navigate(`/messages?conversation=${convId}`);
    } catch {
      alert('Could not start conversation');
    }
  };

  const tableMembers = students.map((s) => ({
    id: s.user_id,
    full_name: s.full_name,
    course: s.course,
    role: 'student',
  }));

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Student Directory</h1>
          <p>
            Current Yumbe students at Makerere — listed by name and course
            {memberCount !== null && (
              <span className="member-count-badge">{memberCount} student{memberCount !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>
        {hasRole('admin') && (
          <Link to="/members" className="btn btn-outline btn-sm">All Members</Link>
        )}
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
        <MemberTable members={tableMembers} showRole={false} onMessage={startConversation} />
      )}
    </Layout>
  );
}
