import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getJobs, createJob, applyForJob } from '../services/firestore';
import { FiMapPin, FiClock, FiPlus } from 'react-icons/fi';

const jobTypeLabels = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  internship: 'Internship',
  volunteer: 'Volunteer',
};

export default function Jobs() {
  const { user, hasRole } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', company: '', location: '', job_type: 'full_time',
    description: '', requirements: '', application_link: '', application_email: '', deadline: '',
  });

  const fetchJobs = () => {
    setLoading(true);
    getJobs()
      .then(setJobs)
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createJob(user.id, form);
      setShowForm(false);
      setForm({ title: '', company: '', location: '', job_type: 'full_time', description: '', requirements: '', application_link: '', application_email: '', deadline: '' });
      fetchJobs();
    } catch (err) {
      alert(err.message || 'Failed to post job');
    }
  };

  const apply = async (job) => {
    if (job.application_link) {
      window.open(job.application_link, '_blank');
      return;
    }
    const coverLetter = prompt('Enter a brief cover letter:');
    if (!coverLetter) return;
    try {
      await applyForJob(job.id, user.id, coverLetter);
      alert('Application submitted!');
    } catch (err) {
      alert(err.message || 'Application failed');
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Job Board</h1>
          <p>Career opportunities from MUYSA alumni and partners</p>
        </div>
        {hasRole('alumni', 'admin') && (
          <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <FiPlus /> Post Job
          </button>
        )}
      </div>

      {showForm && (
        <form className="card form-card" onSubmit={handleSubmit}>
          <h2>Post a Job</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Job Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Company</label>
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Location</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Job Type</label>
              <select value={form.job_type} onChange={(e) => setForm({ ...form, job_type: e.target.value })}>
                {Object.entries(jobTypeLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Requirements</label>
            <textarea rows={3} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Application Link</label>
              <input value={form.application_link} onChange={(e) => setForm({ ...form, application_link: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Application Email</label>
              <input type="email" value={form.application_email} onChange={(e) => setForm({ ...form, application_email: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Deadline</label>
            <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary">Publish Job</button>
        </form>
      )}

      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : jobs.length ? (
        <div className="jobs-list">
          {jobs.map((job) => (
            <article key={job.id} className="job-card">
              <div className="job-header">
                <div>
                  <h3>{job.title}</h3>
                  <p className="company">{job.company}</p>
                </div>
                <span className="tag">{jobTypeLabels[job.job_type]}</span>
              </div>
              <p className="job-desc">{job.description?.slice(0, 200)}</p>
              <div className="job-meta">
                {job.location && <span><FiMapPin /> {job.location}</span>}
                {job.deadline && <span><FiClock /> Deadline: {new Date(job.deadline).toLocaleDateString()}</span>}
              </div>
              {hasRole('student', 'alumni') && (
                <button type="button" className="btn btn-primary btn-sm" onClick={() => apply(job)}>
                  Apply Now
                </button>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="empty-text">No jobs posted yet.</p>
      )}
    </Layout>
  );
}
