import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Auth';
import '../styles/Nav.css';

export default function Nav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="nav">
      <Link to="/" className="nav-brand">
        Job<span className="nav-brand-accent">Board</span>
      </Link>

      <div className="nav-links">
        <Link to="/jobs" className="nav-link">
          Browse jobs
        </Link>

        {user?.role === 'employer' && (
          <>
            <Link to="/company" className="nav-link">
              My company
            </Link>
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
          </>
        )}

        {user?.role === 'jobseeker' && (
          <Link to="/applications" className="nav-link">
            My applications
          </Link>
        )}

        {user ? (
          <button type="button" className="nav-signout" onClick={handleSignOut}>
            Sign out
          </button>
        ) : (
          <Link to="/login" className="nav-cta">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
