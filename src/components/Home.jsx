import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/Auth';
import Dashboard from './Dashboard';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/jobs" replace />;
  if (user.role === 'jobseeker') return <Navigate to="/jobs" replace />;

  return <Dashboard />;
}
