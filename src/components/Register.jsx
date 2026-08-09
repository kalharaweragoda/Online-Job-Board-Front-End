import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/client';
import { useAuth } from '../context/Auth';
import '../styles/Login.css';

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'jobseeker',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.register(form);
      await login(form.username, form.password);
      navigate('/');
    } catch (err) {
      const data = err?.response?.data;
      const msg = data ? Object.values(data).flat().join(' ') : 'Registration failed. Please check your details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <form className="login-card" onSubmit={handleSubmit}>
        <p className="login-eyebrow">Job Board</p>
        <h1 className="login-title">
          Create an <span className="login-title-accent">account</span>
        </h1>

        {error && <p className="login-error">{error}</p>}

        <label className="login-label">
          I am a
          <div className="role-toggle">
            <button
              type="button"
              className={`role-option ${form.role === 'jobseeker' ? 'role-option-active' : ''}`}
              onClick={() => setForm({ ...form, role: 'jobseeker' })}
            >
              Job Seeker
            </button>
            <button
              type="button"
              className={`role-option ${form.role === 'employer' ? 'role-option-active' : ''}`}
              onClick={() => setForm({ ...form, role: 'employer' })}
            >
              Employer
            </button>
          </div>
        </label>

        <label className="login-label">
          Username
          <input
            className="login-input"
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </label>

        <label className="login-label">
          Email
          <input
            className="login-input"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label className="login-label">
          Phone (optional)
          <input
            className="login-input"
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
        </label>

        <label className="login-label">
          Password
          <input
            className="login-input"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            required
          />
        </label>

        <button className="login-submit" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p className="login-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
