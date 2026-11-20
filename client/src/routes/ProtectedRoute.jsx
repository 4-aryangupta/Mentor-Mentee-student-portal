import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';
export default function ProtectedRoute({ roles }) {
  const { user, ready } = useAuth(); const location = useLocation();
  if (!ready) return <Loader label="Restoring your session…"/>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }}/>;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}/dashboard`} replace/>;
  return <Outlet/>;
}
