import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { companyAPI } from '../services/client';
import '../styles/JobForm.css';

export default function CompanySetup() {
  const [company, setCompany] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', website: '', location: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    companyAPI
      .me()
      .then((res) => {
        setCompany(res.data);
        setForm(res.data);
      })
      .catch(() => setCompany(null))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    setSaved(false);
    try {
      await companyAPI.create(form);
      setSaved(true);
    } catch (err) {
      const data = err?.response?.data;
      const msg = data ? Object.values(data).flat().join(' ') : 'Could not save your company profile.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="jobform-status">Loading…</p>;

  return (
    <div className="jobform">
      <form className="jobform-card" onSubmit={handleSubmit}>
        <Link to="/" className="jobform-back">
          ← Back to dashboard
        </Link>

        <p className="jobform-eyebrow">Company profile</p>
        <h1 className="jobform-title">
          {company ? 'Edit your' : 'Set up your'} <span className="jobform-title-accent">company</span>
        </h1>

        {error && <p className="jobform-error">{error}</p>}
        {saved && <p className="jobform-success">✓ Company profile saved.</p>}

        <label className="jobform-label">
          Company name
          <input
            className="jobform-input"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        <label className="jobform-label">
          Description
          <textarea
            className="jobform-input jobform-textarea"
            name="description"
            value={form.description || ''}
            onChange={handleChange}
            rows={4}
          />
        </label>

        <div className="jobform-row">
          <label className="jobform-label">
            Website
            <input
              className="jobform-input"
              type="url"
              name="website"
              placeholder="https://…"
              value={form.website || ''}
              onChange={handleChange}
            />
          </label>

          <label className="jobform-label">
            Location
            <input
              className="jobform-input"
              type="text"
              name="location"
              value={form.location || ''}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <button className="jobform-submit" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save company profile'}
        </button>
      </form>
    </div>
  );
}
