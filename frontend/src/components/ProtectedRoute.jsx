import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  // If there is no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}