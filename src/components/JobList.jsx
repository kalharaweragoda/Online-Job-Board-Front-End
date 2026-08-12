import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { jobAPI, categoryAPI } from '../services/client';
import '../styles/JobList.css';

export default function JobList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const location = searchParams.get('location') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    categoryAPI
      .list()
      .then((res) => {
        // Handles both paginated ({results, count}) and plain array responses
        if (Array.isArray(res.data)) {
          setCategories(res.data);
        } else {
          setCategories(res.data.results || []);
        }
      })
      .catch(() => setCategories([]));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    const params = { page };
    if (search) params.search = search;
    if (category) params.category = category;
    if (location) params.location = location;

    jobAPI
      .list(params)
      .then((res) => {
        // Handles both paginated ({results, count}) and plain array responses
        if (Array.isArray(res.data)) {
          setJobs(res.data);
          setCount(null);
        } else {
          setJobs(res.data.results || []);
          setCount(res.data.count ?? null);
        }
      })
      .catch(() => setError('Could not load job listings. Is the backend running?'))
      .finally(() => setLoading(false));
  }, [search, category, location, page]);

  useEffect(() => {
    load();
  }, [load]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
  };

  const pageSize = 10; // matches typical DRF PageNumberPagination default
  const totalPages = count !== null ? Math.max(1, Math.ceil(count / pageSize)) : null;

  return (
    <div className="joblist">
      <header className="joblist-head">
        <p className="joblist-eyebrow">Open positions</p>
        <h1 className="joblist-title">
          Find your next <span className="joblist-title-accent">role</span>
        </h1>
      </header>

      <div className="joblist-filters">
        <input
          className="joblist-search"
          type="text"
          placeholder="Search title or description…"
          defaultValue={search}
          onKeyDown={(e) => {
            if (e.key === 'Enter') updateParam('search', e.target.value);
          }}
          onBlur={(e) => updateParam('search', e.target.value)}
        />
        <select
          className="joblist-select"
          value={category}
          onChange={(e) => updateParam('category', e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          className="joblist-select"
          type="text"
          placeholder="Location"
          defaultValue={location}
          onKeyDown={(e) => {
            if (e.key === 'Enter') updateParam('location', e.target.value);
          }}
          onBlur={(e) => updateParam('location', e.target.value)}
        />
      </div>

      {loading && <p className="joblist-status">Loading jobs…</p>}
      {error && <p className="joblist-status joblist-status-error">{error}</p>}

      {!loading && !error && (
        <>
          {jobs.length === 0 ? (
            <p className="joblist-status">No jobs match your search right now.</p>
          ) : (
            <ul className="joblist-grid">
              {jobs.map((job) => (
                <li key={job.id} className="jobcard">
                  <Link to={`/jobs/${job.id}`} className="jobcard-link">
                    <div className="jobcard-top">
                      <span className="jobcard-company">{job.company_name || 'Company'}</span>
                      <span className="jobcard-location">{job.location}</span>
                    </div>
                    <h3 className="jobcard-title">{job.title}</h3>
                    {(job.salary_min || job.salary_max) && (
                      <p className="jobcard-salary">
                        {job.salary_min && `Rs. ${Number(job.salary_min).toLocaleString()}`}
                        {job.salary_min && job.salary_max && ' – '}
                        {job.salary_max && `Rs. ${Number(job.salary_max).toLocaleString()}`}
                      </p>
                    )}
                    <span className="jobcard-arrow">View role →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {totalPages && totalPages > 1 && (
            <div className="joblist-pagination">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
                className="joblist-page-btn"
              >
                ← Prev
              </button>
              <span className="joblist-page-info">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
                className="joblist-page-btn"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
