import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { applicationAPI } from '../services/client';
import '../styles/Applications.css';

const STATUSES = ['applied', 'reviewed', 'accepted', 'rejected'];
const STATUS_LABEL = {
  applied: 'Applied',
  reviewed: 'Reviewed',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

export default function JobApplicants() {
  const { jobId } = useParams();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  const load = () => {
    setLoading(true);
    applicationAPI
      .forJob(jobId)
      .then((res) => setApps(res.data))
      .catch(() => setError('Could not load applicants for this job.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [jobId]);

  const handleStatusChange = async (appId, status) => {
    setUpdating(appId);
    try {
      await applicationAPI.updateStatus(appId, status);
      setApps((prev) => prev.map((a) => (a.id === appId ? { ...a, status } : a)));
    } catch {
      setError('Could not update that applicant\'s status.');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="apps">
      <header className="apps-head">
        <Link to="/" className="apps-back">
          ← Back to dashboard
        </Link>
        <p className="apps-eyebrow">Applicant review</p>
        <h1 className="apps-title">
          Job <span className="apps-title-accent">applicants</span>
        </h1>
      </header>

      {loading && <p className="apps-status">Loading applicants…</p>}
      {error && <p className="apps-status apps-status-error">{error}</p>}

      {!loading && !error && (
        apps.length === 0 ? (
          <p className="apps-status">No one has applied to this job yet.</p>
        ) : (
          <ul className="apps-list">
            {apps.map((app) => (
              <li key={app.id} className="apps-row apps-row-wide">
                <div className="apps-row-main">
                  <span className="apps-job-title">{app.applicant_name}</span>
                  <span className="apps-date">Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                  {app.cover_letter && <p className="apps-cover">{app.cover_letter}</p>}
                </div>
                <select
                  className="apps-status-select"
                  value={app.status}
                  disabled={updating === app.id}
                  onChange={(e) => handleStatusChange(app.id, e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}
