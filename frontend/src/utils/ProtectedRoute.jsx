import { useAuthStore } from '../context/authStore';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
