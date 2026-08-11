import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobAPI, applicationAPI } from '../services/client';
import { useAuth } from '../context/Auth';
import '../styles/JobDetail.css';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyState, setApplyState] = useState('idle'); // idle | submitting | done | error
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    jobAPI
      .list()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data.results || [];
        const found = list.find((j) => String(j.id) === String(id));
        if (found) setJob(found);
        else setError('This job could not be found.');
      })
      .catch(() => setError('Could not load this job listing.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setApplyState('submitting');
    setApplyError('');
    try {
      await applicationAPI.apply({ job: id, cover_letter: coverLetter });
      setApplyState('done');
    } catch (err) {
      const data = err?.response?.data;
      const msg = data ? Object.values(data).flat().join(' ') : 'Could not submit your application.';
      setApplyError(msg);
      setApplyState('error');
    }
  };

  if (loading) return <p className="jobdetail-status">Loading job…</p>;
  if (error) return <p className="jobdetail-status jobdetail-status-error">{error}</p>;
  if (!job) return null;

  return (
    <div className="jobdetail">
      <div className="jobdetail-card">
        <Link to="/jobs" className="jobdetail-back">
          ← All jobs
        </Link>

        <div className="jobdetail-headline">
          <span className={`jobdetail-status-pill jobdetail-status-${job.status}`}>{job.status}</span>
          <span className="jobdetail-company">{job.company_name || 'Company'}</span>
        </div>

        <h1 className="jobdetail-title">{job.title}</h1>

        <div className="jobdetail-meta">
          <span>{job.location}</span>
          {(job.salary_min || job.salary_max) && (
            <span className="jobdetail-salary">
              {job.salary_min && `Rs. ${Number(job.salary_min).toLocaleString()}`}
              {job.salary_min && job.salary_max && ' – '}
              {job.salary_max && `Rs. ${Number(job.salary_max).toLocaleString()}`}
            </span>
          )}
        </div>

        <p className="jobdetail-description">{job.description}</p>

        <div className="jobdetail-apply">
          {job.status !== 'open' && <p className="jobdetail-closed">This role is no longer accepting applications.</p>}

          {job.status === 'open' && user?.role === 'employer' && (
            <p className="jobdetail-note">Employers can't apply to job listings.</p>
          )}

          {job.status === 'open' && (!user || user.role === 'jobseeker') && applyState !== 'done' && (
            <form onSubmit={handleApply} className="jobdetail-form">
              <label className="jobdetail-label">
                Cover letter (optional)
                <textarea
                  className="jobdetail-textarea"
                  rows={5}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell them why you're a good fit…"
                />
              </label>

              {applyError && <p className="jobdetail-status jobdetail-status-error">{applyError}</p>}

              <button type="submit" className="jobdetail-apply-btn" disabled={applyState === 'submitting'}>
                {applyState === 'submitting' ? 'Submitting…' : user ? 'Apply now' : 'Sign in to apply'}
              </button>
            </form>
          )}

          {applyState === 'done' && (
            <p className="jobdetail-success">✓ Application submitted. Good luck!</p>
          )}
        </div>
      </div>
    </div>
  );
}
