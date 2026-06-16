import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats, getPosts, getEvents } from '../services/firestore';
import { FiUsers, FiCalendar, FiBriefcase, FiFileText, FiAward, FiArrowRight } from 'react-icons/fi';

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const [stats, setStats] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => {});
    getPosts({ status: 'published' }).then((posts) => setRecentPosts(posts.slice(0, 3))).catch(() => {});
    getEvents('upcoming').then((events) => setUpcomingEvents(events.slice(0, 3))).catch(() => {});
  }, []);

  const memberCards = stats ? [
    { label: 'All MUYSA Members', value: stats.totalMembers, icon: FiUsers, color: 'green', desc: 'Students + Alumni' },
    { label: 'Current Students', value: stats.currentStudents, icon: FiUsers, color: 'blue', desc: 'Active student members' },
    { label: 'Alumni Members', value: stats.alumniMembers, icon: FiAward, color: 'gold', desc: 'Graduated members' },
  ] : [];

  const activityCards = stats ? [
    { label: 'Upcoming Events', value: stats.upcomingEvents, icon: FiCalendar, color: 'blue' },
    { label: 'Active Jobs', value: stats.activeJobs, icon: FiBriefcase, color: 'purple' },
    { label: 'News Posts', value: stats.publishedPosts, icon: FiFileText, color: 'orange' },
  ] : [];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>{isAdmin ? 'Admin Dashboard' : 'Dashboard'}</h1>
          <p>Welcome back, {user?.full_name}</p>
        </div>
        <span className="role-badge">{user?.role}</span>
      </div>

      {isAdmin && stats && (
        <>
          <section className="member-stats-section">
            <h2>MUYSA Membership</h2>
            <div className="member-stats-grid">
              {memberCards.map(({ label, value, icon: Icon, color, desc }) => (
                <div key={label} className={`member-stat-card member-stat-${color}`}>
                  <Icon className="member-stat-icon" />
                  <span className="member-stat-value">{value}</span>
                  <span className="member-stat-label">{label}</span>
                  <span className="member-stat-desc">{desc}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card members-link-card">
            <div className="members-link-content">
              <div>
                <h2>All Members (Name &amp; Course)</h2>
                <p className="members-link-desc">
                  {stats.totalMembers ?? 0} registered members — open the full registry to search, filter, and view details.
                </p>
              </div>
              <Link to="/members" className="btn btn-primary">
                Open member registry <FiArrowRight />
              </Link>
            </div>
          </section>
        </>
      )}

      {stats && (
        <div className="stats-grid">
          {activityCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`stat-card stat-${color}`}>
              <Icon className="stat-icon" />
              <div>
                <span className="stat-value">{value}</span>
                <span className="stat-label">{label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!user?.course && hasRole('student', 'alumni') && (
        <div className="alert alert-error">
          Add your course on your <Link to="/profile">profile page</Link> so admins can identify you in the member registry.
        </div>
      )}

      <div className="dashboard-grid">
        <section className="card">
          <div className="card-header">
            <h2>Latest News</h2>
            <Link to="/news">View all</Link>
          </div>
          {recentPosts.length ? (
            <ul className="list">
              {recentPosts.map((post) => (
                <li key={post.id}>
                  <Link to={`/news/${post.slug}`}>{post.title}</Link>
                  <span className="meta">{post.category}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-text">No news posts yet.</p>
          )}
        </section>

        <section className="card">
          <div className="card-header">
            <h2>Upcoming Events</h2>
            <Link to="/events">View all</Link>
          </div>
          {upcomingEvents.length ? (
            <ul className="list">
              {upcomingEvents.map((event) => (
                <li key={event.id}>
                  <strong>{event.title}</strong>
                  <span className="meta">
                    {event.start_datetime?.toLocaleDateString?.() || '—'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-text">No upcoming events.</p>
          )}
        </section>
      </div>

      {hasRole('student', 'alumni') && (
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-row">
            <Link to="/profile" className="action-btn">Update My Profile</Link>
            <Link to="/executives" className="action-btn">Executives &amp; Archive</Link>
            <Link to="/events" className="action-btn">Browse Events</Link>
            {hasRole('student') && (
              <Link to="/jobs" className="action-btn">Job Board</Link>
            )}
            {hasRole('alumni') && (
              <>
                <Link to="/alumni" className="action-btn">Alumni Directory</Link>
                <Link to="/students" className="action-btn">Student Directory</Link>
                <Link to="/jobs" className="action-btn">Post a Job</Link>
              </>
            )}
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="quick-actions">
          <h2>Admin Actions</h2>
          <div className="actions-row">
            <Link to="/admin/executives" className="action-btn">Manage Executives</Link>
            <Link to="/members" className="action-btn">All Members</Link>
            <Link to="/admin/users" className="action-btn">Manage Users</Link>
            <Link to="/admin/post-news" className="action-btn">Post News</Link>
          </div>
        </div>
      )}
    </Layout>
  );
}
