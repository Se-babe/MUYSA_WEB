import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import MemberTable from '../components/MemberTable';
import { useAuth } from '../context/AuthContext';
import { getAlumni, getOrCreateConversation, getMemberStats } from '../services/firestore';
import { FiSearch } from 'react-icons/fi';

export default function Alumni() {
  const { user, hasRole } = useAuth();
  const [alumni, setAlumni] = useState([]);
  const [memberCount, setMemberCount] = useState(null);
  const [search, setSearch] = useState('');
  const [mentorOnly, setMentorOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAlumni = async (q = '', mentor = false) => {
    setLoading(true);
    try {
      setAlumni(await getAlumni(q, mentor));
    } catch {
      setAlumni([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
    getMemberStats().then((s) => setMemberCount(s.alumniMembers)).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAlumni(search, mentorOnly);
  };

  const startConversation = async (userId) => {
    try {
      const convId = await getOrCreateConversation(user.id, userId);
      navigate(`/messages?conversation=${convId}`);
    } catch {
      alert('Could not start conversation');
    }
  };

  const tableMembers = alumni.map((a) => ({
    id: a.user_id,
    full_name: a.full_name,
    course: a.course,
    role: 'alumni',
  }));

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Alumni Directory</h1>
          <p>
            MUYSA graduates — listed by name and course
            {memberCount !== null && (
              <span className="member-count-badge">{memberCount} alumni</span>
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
        <label className="checkbox-label">
          <input type="checkbox" checked={mentorOnly} onChange={(e) => setMentorOnly(e.target.checked)} />
          Mentors only
        </label>
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
