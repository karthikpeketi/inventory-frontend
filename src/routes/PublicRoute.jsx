import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isInitialLoading } = useAuth();
  const location = useLocation();

  if (isInitialLoading) {
    // Display a loading spinner while checking authentication
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin-slow rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // If user is authenticated and trying to access auth pages, redirect to dashboard
    // Check if there's a 'from' location in state, otherwise default to dashboard
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;