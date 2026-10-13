import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/use-auth";
import { LoadingScreen } from "../../../components/feedback/loading-screen";

export interface SellerGuardProps {
  children?: React.ReactNode;
}

export const SellerGuard: React.FC<SellerGuardProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading, isLoggingOut } = useAuth();
  const location = useLocation();

  if (isLoggingOut) {
    return (
      <LoadingScreen
        message="Signing out safely..."
        subtext="Clearing your seller workspace"
      />
    );
  }

  if (isLoading) {
    return (
      <LoadingScreen
        message="Verifying Seller Access..."
        subtext="Connecting to your kitchen and store dashboard"
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== "seller") {
    return <Navigate to="/select-role" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default SellerGuard;
