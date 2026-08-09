import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jobAPI, categoryAPI } from '../services/client';
import { useAuth } from '../context/Auth';
import '../styles/JobForm.css';

export default function JobCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    salary_min: '',
    salary_max: '',
    status: 'open',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    categoryAPI
      .list()
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await jobAPI.create({
        ...form,
        category: form.category || null,
        salary_min: form.salary_min || null,
        salary_max: form.salary_max || null,
      });
      navigate('/');
    } catch (err) {
      const data = err?.response?.data;
      const msg = data ? Object.values(data).flat().join(' ') : 'Could not post the job. Please check your details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="jobform">
        <div className="jobform-card">
          <p>
            <Link to="/login">Sign in</Link> as an employer to post a job.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="jobform">
      <form className="jobform-card" onSubmit={handleSubmit}>
        <Link to="/" className="jobform-back">
          ← Back to dashboard
        </Link>

        <p className="jobform-eyebrow">New posting</p>
        <h1 className="jobform-title">
          Post a <span className="jobform-title-accent">job</span>
        </h1>

        {error && <p className="jobform-error">{error}</p>}

        <label className="jobform-label">
          Job title
          <input
            className="jobform-input"
            type="text"
            name="title"
            placeholder="e.g. Frontend Engineer"
            value={form.title}
            onChange={handleChange}
            required
          />
        </label>

        <label className="jobform-label">
          Description
          <textarea
            className="jobform-input jobform-textarea"
            name="description"
            placeholder="Responsibilities, requirements, what makes this role great…"
            value={form.description}
            onChange={handleChange}
            rows={6}
            required
          />
        </label>

        <div className="jobform-row">
          <label className="jobform-label">
            Location
            <input
              className="jobform-input"
              type="text"
              name="location"
              placeholder="e.g. Colombo / Remote"
              value={form.location}
              onChange={handleChange}
              required
            />
          </label>

          <label className="jobform-label">
            Category
            <select
              className="jobform-input"
              name="category"
              value={form.category}
              onChange={handleChange}
            >
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
            Salary min (optional)
            <input
              className="jobform-input"
              type="number"
              name="salary_min"
              placeholder="e.g. 120000"
              value={form.salary_min}
              onChange={handleChange}
            />
          </label>

          <label className="jobform-label">
            Salary max (optional)
            <input
              className="jobform-input"
              type="number"
              name="salary_max"
              placeholder="e.g. 180000"
              value={form.salary_max}
              onChange={handleChange}
            />
          </label>
        </div>

        <label className="jobform-label">
          Status
          <select
            className="jobform-input"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </label>

        <button className="jobform-submit" type="submit" disabled={loading}>
          {loading ? 'Posting…' : 'Post job'}
        </button>
      </form>
    </div>
  );
}
