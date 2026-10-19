import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/navbar';
import { Footer } from '../components/common/footer';
import { useTheme } from '../context/use-theme';
import { useAuth } from '../context/use-auth';
import { useCart } from '../features/cart/hooks/useCart';
import { LoadingScreen } from '../components/feedback/loading-screen';

export const RootLayout: React.FC = () => {
  const { theme } = useTheme();
  const { isAuthenticated, user, isLoading, isLoggingOut } = useAuth();
  const navigate = useNavigate();

  // Automatically hydrates cart for authenticated customer
  useCart();

  useEffect(() => {
    // Any authenticated user who has not chosen a role must stay on the role selection page
    if (!isLoading && isAuthenticated && !user?.role) {
      navigate('/select-role', { replace: true });
    }
  }, [isAuthenticated, user?.role, isLoading, navigate]);

  if (isLoggingOut) {
    return (
      <LoadingScreen
        message="Signing out safely..."
        subtext="Clearing your session and securing your workspace"
      />
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 relative overflow-x-hidden ${
        theme === 'dark' ? 'bg-[#09090b] text-zinc-100' : 'bg-[#fafafa] text-zinc-900'
      }`}
    >
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {theme === 'dark' ? (
          <>
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
          </>
        ) : (
          <>
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
          </>
        )}
      </div>

      <Navbar />

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
