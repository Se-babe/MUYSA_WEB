import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiCalendar, FiBriefcase, FiArrowRight, FiAward } from 'react-icons/fi';
import Layout from '../components/Layout';
import SeoHead from '../components/SeoHead';
import ExecutiveList from '../components/ExecutiveList';
import { useAuth } from '../context/AuthContext';
import { getMemberStats, getExecutives } from '../services/firestore';
import { ASSOCIATION_NAME, ASSOCIATION_SHORT, APP_NAME, APP_TAGLINE } from '../constants/branding';

export default function Home() {
  const { user, hasRole } = useAuth();
  const [members, setMembers] = useState(null);
  const [executives, setExecutives] = useState([]);

  useEffect(() => {
    document.title = `${ASSOCIATION_NAME} | ${APP_NAME}`;
    getMemberStats().then(setMembers).catch(() => {});
    if (user) {
      getExecutives().then((list) => setExecutives(list.slice(0, 4))).catch(() => {});
    }
  }, [user]);

  return (
    <Layout>
      <SeoHead />
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">Official {ASSOCIATION_SHORT} Platform</span>
          <h1>{ASSOCIATION_NAME}</h1>
          <p className="hero-app-name">{APP_NAME}</p>
          <p>{APP_TAGLINE}. Stay informed, find opportunities, and build lasting connections.</p>
          <div className="hero-actions">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Go to Dashboard <FiArrowRight />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">Join {ASSOCIATION_SHORT}</Link>
                <Link to="/login" className="btn btn-outline btn-lg">Member Sign In</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {!user && (
        <section className="official-notice">
          <p>
            <strong>{ASSOCIATION_NAME}</strong> ({ASSOCIATION_SHORT}) members — register with your name
            and course to access the community directory, executives, news, events, and job board.
          </p>
        </section>
      )}

      {executives.length > 0 && (
        <section className="executives-section">
          <span className="section-label">Leadership</span>
          <div className="section-header">
            <h2><FiAward /> {ASSOCIATION_SHORT} Executive Committee</h2>
            {user && !hasRole('admin') && (
              <Link to="/executives">View executives &amp; archive →</Link>
            )}
            {hasRole('admin') && (
              <Link to="/admin/executives">Manage executives →</Link>
            )}
          </div>
          <ExecutiveList executives={executives} />
        </section>
      )}

      {members && user?.role === 'admin' && (
        <section className="member-stats-section home-members">
          <span className="section-label">Community</span>
          <h2>Our Members</h2>
          <div className="member-stats-grid">
            <div className="member-stat-card member-stat-green">
              <FiUsers className="member-stat-icon" />
              <span className="member-stat-value">{members.totalMembers ?? 0}</span>
              <span className="member-stat-label">All {ASSOCIATION_SHORT} Members</span>
            </div>
            <div className="member-stat-card member-stat-blue">
              <FiUsers className="member-stat-icon" />
              <span className="member-stat-value">{members.currentStudents ?? 0}</span>
              <span className="member-stat-label">Current Students</span>
            </div>
            <div className="member-stat-card member-stat-gold">
              <FiAward className="member-stat-icon" />
              <span className="member-stat-value">{members.alumniMembers ?? 0}</span>
              <span className="member-stat-label">Alumni Members</span>
            </div>
          </div>
        </section>
      )}

      <section className="features-section">
        <span className="section-label" style={{ display: 'block', textAlign: 'center' }}>Platform</span>
        <h2>Everything you need in one place</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><FiAward /></div>
            <h3>Executive Committee</h3>
            <p>Meet the {ASSOCIATION_SHORT} leadership and browse historical executive records by academic year.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FiCalendar /></div>
            <h3>Events & Activities</h3>
            <p>Stay updated on association events, workshops, and community gatherings.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FiBriefcase /></div>
            <h3>Job Board</h3>
            <p>Discover career opportunities posted by alumni and partner organisations.</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
