import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/use-auth';
import { LoadingScreen } from '../../../components/feedback/loading-screen';

export interface RiderGuardProps {
  children?: React.ReactNode;
}

export const RiderGuard: React.FC<RiderGuardProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading, isLoggingOut } = useAuth();
  const location = useLocation();

  if (isLoggingOut) {
    return (
      <LoadingScreen
        message="Signing out safely..."
        subtext="Clearing your rider portal session"
      />
    );
  }

  if (isLoading) {
    return (
      <LoadingScreen
        message="Verifying Rider Access..."
        subtext="Connecting to your delivery fleet console"
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'rider') {
    return <Navigate to="/select-role" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default RiderGuard;
