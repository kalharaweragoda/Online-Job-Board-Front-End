import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI, applicationAPI } from '../api/client';
import { useAuth } from '../context/Auth';
import './Dashboard.css';

const STATUS_META = {
  applied: { label: 'Applied', color: 'var(--stage-applied)' },
  reviewed: { label: 'Reviewed', color: 'var(--stage-reviewed)' },
  accepted: { label: 'Accepted', color: 'var(--stage-accepted)' },
  rejected: { label: 'Rejected', color: 'var(--stage-rejected)' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [pipeline, setPipeline] = useState({ applied: 0, reviewed: 0, accepted: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data: jobList } = await jobAPI.dashboard();

        const withCounts = await Promise.all(
          jobList.map(async (job) => {
            try {
              const { data: apps } = await applicationAPI.forJob(job.id);
              return { ...job, applicants: apps };
            } catch {
              return { ...job, applicants: [] };
            }
          })
        );

        if (cancelled) return;

        const tally = { applied: 0, reviewed: 0, accepted: 0, rejected: 0 };
        withCounts.forEach((job) => {
          job.applicants.forEach((app) => {
            if (tally[app.status] !== undefined) tally[app.status] += 1;
          });
        });

        setJobs(withCounts);
        setPipeline(tally);
      } catch (err) {
        if (!cancelled) setError('Could not load your dashboard. Is the backend running?');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalApplicants = Object.values(pipeline).reduce((a, b) => a + b, 0);
  const openRoles = jobs.filter((j) => j.status === 'open').length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="dash">
      <header className="dash-top">
        <div>
          <p className="dash-eyebrow">Employer dashboard</p>
          <h1 className="dash-title">
            {greeting}, <span className="dash-title-accent">{user?.username || 'there'}</span>
          </h1>
        </div>
        <Link to="/jobs/new" className="dash-cta">
          + Post a job
        </Link>
      </header>

      {loading && <p className="dash-status">Loading your hiring activity…</p>}
      {error && <p className="dash-status dash-status-error">{error}</p>}

      {!loading && !error && (
        <>
          <section className="dash-stats">
            <div className="stat-card">
              <span className="stat-number">{openRoles}</span>
              <span className="stat-label">Open roles</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{jobs.length}</span>
              <span className="stat-label">Total postings</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{totalApplicants}</span>
              <span className="stat-label">Applicants across all jobs</span>
            </div>
          </section>

          <section className="dash-pipeline">
            <div className="dash-section-head">
              <h2>Pipeline snapshot</h2>
              <span className="dash-section-sub">where every applicant stands right now</span>
            </div>

            {totalApplicants === 0 ? (
              <p className="dash-empty">No applicants yet — once candidates apply, their status will show up here.</p>
            ) : (
              <>
                <div className="pipeline-bar" role="img" aria-label="Applicant pipeline breakdown">
                  {Object.entries(pipeline).map(([key, count]) =>
                    count > 0 ? (
                      <div
                        key={key}
                        className="pipeline-segment"
                        style={{
                          width: `${(count / totalApplicants) * 100}%`,
                          background: STATUS_META[key].color,
                        }}
                        title={`${STATUS_META[key].label}: ${count}`}
                      />
                    ) : null
                  )}
                </div>
                <div className="pipeline-legend">
                  {Object.entries(pipeline).map(([key, count]) => (
                    <div className="legend-item" key={key}>
                      <span className="legend-dot" style={{ background: STATUS_META[key].color }} />
                      <span className="legend-label">{STATUS_META[key].label}</span>
                      <span className="legend-count">{count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          <section className="dash-postings">
            <div className="dash-section-head">
              <h2>Your postings</h2>
              <span className="dash-section-sub">{jobs.length} total</span>
            </div>

            {jobs.length === 0 ? (
              <div className="dash-empty-card">
                <p>You haven't posted a job yet.</p>
                <Link to="/jobs/new" className="dash-empty-link">
                  Post your first role →
                </Link>
              </div>
            ) : (
              <ul className="posting-list">
                {jobs.map((job) => (
                  <li key={job.id} className="posting-row">
                    <Link to={`/jobs/${job.id}/edit`} className="posting-link">
                      <div className="posting-main">
                        <span className={`posting-status posting-status-${job.status}`}>
                          {job.status}
                        </span>
                        <span className="posting-title">{job.title}</span>
                        <span className="posting-location">{job.location}</span>
                      </div>
                      <div className="posting-meta">
                        <span className="posting-applicants">
                          {job.applicants.length} applicant{job.applicants.length !== 1 ? 's' : ''}
                        </span>
                        <span className="posting-arrow">→</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
