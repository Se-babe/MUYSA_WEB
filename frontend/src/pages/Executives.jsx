import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ExecutiveList from '../components/ExecutiveList';
import ExecutiveRegisterTable from '../components/ExecutiveRegisterTable';
import { useAuth } from '../context/AuthContext';
import { getExecutives } from '../services/firestore';
import { getCurrentAcademicYear, getSortedAcademicYears } from '../utils/executives';

export default function Executives() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [academicYear, setAcademicYear] = useState('');

  useEffect(() => {
    getExecutives(false)
      .then((list) => {
        setExecutives(list);
        setAcademicYear(getCurrentAcademicYear(list) || getSortedAcademicYears(list)[0] || '');
      })
      .catch(() => setExecutives([]))
      .finally(() => setLoading(false));
  }, []);

  const years = getSortedAcademicYears(executives);
  const currentYear = getCurrentAcademicYear(executives);
  const filtered = academicYear
    ? executives.filter((e) => e.academic_year === academicYear)
    : executives;
  const isPastYear = academicYear && academicYear !== currentYear;

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>MUYSA Executives</h1>
          <p>Current leadership and historical records of MUYSA executive committees</p>
        </div>
        {academicYear && (
          <span className={`member-count-badge ${isPastYear ? 'badge-archive' : ''}`}>
            {academicYear}
            {!isPastYear && currentYear && ' · Current'}
          </span>
        )}
      </div>

      {!isAdmin && (
        <p className="read-only-notice">
          View only — current and past executive records are managed by the MUYSA admin.
        </p>
      )}

      {years.length > 0 && (
        <div className="filter-tabs executive-year-tabs">
          {years.map((year) => (
            <button
              key={year}
              type="button"
              className={`tab ${academicYear === year ? 'active' : ''}`}
              onClick={() => setAcademicYear(year)}
            >
              {year}
              {year === currentYear && <span className="tab-badge">Current</span>}
            </button>
          ))}
        </div>
      )}

      {isPastYear && (
        <p className="archive-notice">
          Past executive committee — academic year {academicYear}
        </p>
      )}

      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : (
        <>
          <ExecutiveList executives={filtered} archive={isPastYear} />
          <ExecutiveRegisterTable
            executives={filtered}
            title={isPastYear ? `Archive — ${academicYear}` : 'Executive Register'}
          />
        </>
      )}

      {years.length > 1 && !loading && (
        <p className="archive-summary">
          {years.length} academic years on record
          {currentYear ? ` · Current term: ${currentYear}` : ''}
        </p>
      )}

      {isAdmin && (
        <p className="auth-footer" style={{ marginTop: '1.5rem' }}>
          <Link to="/admin/executives">Manage executives &amp; archive</Link>
        </p>
      )}
    </Layout>
  );
}
