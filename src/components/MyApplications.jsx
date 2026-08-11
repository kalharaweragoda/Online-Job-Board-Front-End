import { useEffect, useState } from 'react';
import { applicationAPI } from '../services/client';
import '../styles/Applications.css';

const STATUS_LABEL = {
  applied: 'Applied',
  reviewed: 'Reviewed',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    applicationAPI
      .mine()
      .then((res) => setApps(res.data))
      .catch(() => setError('Could not load your applications.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="apps">
      <header className="apps-head">
        <p className="apps-eyebrow">Your history</p>
        <h1 className="apps-title">
          My <span className="apps-title-accent">applications</span>
        </h1>
      </header>

      {loading && <p className="apps-status">Loading…</p>}
      {error && <p className="apps-status apps-status-error">{error}</p>}

      {!loading && !error && (
        apps.length === 0 ? (
          <p className="apps-status">You haven't applied to any jobs yet.</p>
        ) : (
          <ul className="apps-list">
            {apps.map((app) => (
              <li key={app.id} className="apps-row">
                <div className="apps-row-main">
                  <span className="apps-job-title">{app.job_title}</span>
                  <span className="apps-date">{new Date(app.applied_at).toLocaleDateString()}</span>
                </div>
                <span className={`apps-badge apps-badge-${app.status}`}>
                  {STATUS_LABEL[app.status] || app.status}
                </span>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}
