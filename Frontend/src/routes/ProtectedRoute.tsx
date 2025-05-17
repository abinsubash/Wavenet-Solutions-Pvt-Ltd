import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks/hooks';
import { useMemo } from 'react';

interface AuthGuardProps {
  requireAuth?: boolean;
  allowedRoles?: string[];
}

const AuthGuard = ({ requireAuth = true, allowedRoles = [] }: AuthGuardProps) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Memoize route mappings
  const roleRoutes = useMemo(
    () => ({
      superadmin: '/super-admin/home',
      admin: '/admin/home',
      unitmanager: '/unit-manager/home',
      user: '/user/home'
    }),
    []
  );

  const getLoginPath = (path: string) => {
    return path.includes('super-admin') ? '/super-admin/login' : '/login';
  };

  const getHomePath = (userRole: string) => {
    return roleRoutes[userRole.toLowerCase()] || '/login';
  };

  // Handle authentication check
  if (requireAuth && !isAuthenticated) {
    const loginPath = getLoginPath(window.location.pathname);
    return <Navigate to={loginPath} replace />;
  }

  // Handle already authenticated users
  if (!requireAuth && isAuthenticated && user) {
    const homePath = getHomePath(user.role);
    return <Navigate to={homePath} replace />;
  }

  // Handle role-based access
  if (requireAuth && isAuthenticated && user && allowedRoles.length > 0) {
    const hasAccess = allowedRoles.includes(user.role.toLowerCase());
    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};

export default AuthGuard;