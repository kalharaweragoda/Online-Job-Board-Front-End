import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobAPI, categoryAPI, applicationAPI } from '../services/client';
import '../styles/JobForm.css';

export default function JobEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);
  const [applicantCount, setApplicantCount] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryAPI.list().then((res) => setCategories(res.data)).catch(() => setCategories([]));

    jobAPI
      .list()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data.results || [];
        const found = list.find((j) => String(j.id) === String(id));
        if (found) setForm(found);
        else setError('Job not found.');
      })
      .catch(() => setError('Could not load this job.'))
      .finally(() => setLoading(false));

    applicationAPI
      .forJob(id)
      .then((res) => setApplicantCount(res.data.length))
      .catch(() => setApplicantCount(null));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await jobAPI.update(id, {
        title: form.title,
        description: form.description,
        location: form.location,
        category: form.category || null,
        salary_min: form.salary_min || null,
        salary_max: form.salary_max || null,
        status: form.status,
      });
      navigate('/');
    } catch (err) {
      const data = err?.response?.data;
      const msg = data ? Object.values(data).flat().join(' ') : 'Could not update this job.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="jobform-status">Loading…</p>;
  if (!form) return <p className="jobform-status">{error || 'Job not found.'}</p>;

  return (
    <div className="jobform">
      <form className="jobform-card" onSubmit={handleSubmit}>
        <Link to="/" className="jobform-back">
          ← Back to dashboard
        </Link>

        <p className="jobform-eyebrow">Edit posting</p>
        <h1 className="jobform-title">
          {form.title}
        </h1>

        {applicantCount !== null && (
          <Link to={`/jobs/${id}/applicants`} className="jobform-applicants-link">
            View {applicantCount} applicant{applicantCount !== 1 ? 's' : ''} →
          </Link>
        )}

        {error && <p className="jobform-error">{error}</p>}

        <label className="jobform-label">
          Job title
          <input className="jobform-input" type="text" name="title" value={form.title} onChange={handleChange} required />
        </label>

        <label className="jobform-label">
          Description
          <textarea
            className="jobform-input jobform-textarea"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={6}
            required
          />
        </label>

        <div className="jobform-row">
          <label className="jobform-label">
            Location
            <input className="jobform-input" type="text" name="location" value={form.location} onChange={handleChange} required />
          </label>

          <label className="jobform-label">
            Category
            <select className="jobform-input" name="category" value={form.category || ''} onChange={handleChange}>
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="jobform-row">
          <label className="jobform-label">
            Salary min
            <input className="jobform-input" type="number" name="salary_min" value={form.salary_min || ''} onChange={handleChange} />
          </label>
          <label className="jobform-label">
            Salary max
            <input className="jobform-input" type="number" name="salary_max" value={form.salary_max || ''} onChange={handleChange} />
          </label>
        </div>

        <label className="jobform-label">
          Status
          <select className="jobform-input" name="status" value={form.status} onChange={handleChange}>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </label>

        <button className="jobform-submit" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
