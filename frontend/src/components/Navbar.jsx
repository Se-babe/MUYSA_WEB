import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiUsers, FiCalendar, FiBriefcase, FiMessageSquare,
  FiLogOut, FiMenu, FiX, FiSettings, FiEdit3, FiUser, FiAward,
} from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { ASSOCIATION_NAME, ASSOCIATION_SHORT, APP_NAME } from '../constants/branding';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: FiHome, roles: ['student', 'alumni', 'admin', 'staff'] },
  { path: '/executives', label: 'Executives', icon: FiAward, roles: ['alumni', 'admin', 'staff', 'student'] },
  { path: '/news', label: 'News', icon: FiEdit3, roles: ['student', 'alumni', 'admin', 'staff'] },
  { path: '/events', label: 'Events', icon: FiCalendar, roles: ['student', 'alumni', 'admin', 'staff'] },
  { path: '/jobs', label: 'Jobs', icon: FiBriefcase, roles: ['student', 'alumni', 'admin'] },
  { path: '/messages', label: 'Messages', icon: FiMessageSquare, roles: ['student', 'alumni', 'admin', 'staff'] },
  { path: '/students', label: 'Students', icon: FiUsers, roles: ['alumni', 'admin', 'staff'] },
  { path: '/alumni', label: 'Alumni', icon: FiUsers, roles: ['alumni', 'admin', 'staff'] },
  { path: '/profile', label: 'Profile', icon: FiUser, roles: ['student', 'alumni', 'admin', 'staff'] },
];

const adminItems = [
  { path: '/members', label: 'All Members', icon: FiUsers, roles: ['admin'] },
  { path: '/admin/executives', label: 'Manage Executives', icon: FiAward, roles: ['admin'] },
  { path: '/admin/users', label: 'Manage Users', icon: FiSettings, roles: ['admin'] },
  { path: '/admin/post-news', label: 'Post News', icon: FiEdit3, roles: ['admin', 'staff'] },
];

export default function Navbar() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('nav-open', mobileOpen);
    return () => document.body.classList.remove('nav-open');
  }, [mobileOpen]);

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate('/');
  };

  const visibleItems = navItems.filter((item) => hasRole(...item.roles));
  const visibleAdminItems = adminItems.filter((item) => hasRole(...item.roles));

  return (
    <header className="navbar">
      {mobileOpen && (
        <button
          type="button"
          className="nav-backdrop"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className="navbar-inner">
        <Link to={user ? '/dashboard' : '/'} className="navbar-brand" onClick={() => setMobileOpen(false)} title={ASSOCIATION_NAME}>
          <span className="brand-icon">M</span>
          <span className="brand-text">
            {APP_NAME}
            <small className="brand-full-name">{ASSOCIATION_NAME}</small>
          </span>
        </Link>

        <button
          type="button"
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <FiX /> : <FiMenu />}
        </button>

        <nav className={`navbar-nav ${mobileOpen ? 'open' : ''}`} aria-label="Main navigation">
          {user ? (
            <>
              <div className="nav-section">
                {visibleItems.map(({ path, label, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon /> {label}
                  </NavLink>
                ))}
              </div>
              {visibleAdminItems.length > 0 && (
                <div className="nav-section nav-section-admin">
                  <span className="nav-section-label">Admin</span>
                  {visibleAdminItems.map(({ path, label, icon: Icon }) => (
                    <NavLink
                      key={path}
                      to={path}
                      className={({ isActive }) => `nav-link nav-link-admin${isActive ? ' active' : ''}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon /> {label}
                    </NavLink>
                  ))}
                </div>
              )}
              <div className="nav-user">
                <span className="user-badge">{user.role}</span>
                <span className="user-name">
                  {user.full_name}
                  {user.course && <span className="user-course"> · {user.course}</span>}
                </span>
                <button type="button" className="btn-icon" onClick={handleLogout} title="Logout">
                  <FiLogOut />
                </button>
              </div>
            </>
          ) : (
            <div className="nav-section nav-section-auth">
              <NavLink to="/login" className="nav-link" onClick={() => setMobileOpen(false)}>Login</NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm" onClick={() => setMobileOpen(false)}>
                Join {ASSOCIATION_SHORT}
              </NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
