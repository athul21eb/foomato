import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Home } from 'lucide-react';
import { useAuth } from '../../context/use-auth';
import { LoadingScreen } from '../../components/feedback/loading-screen';
import { AddressManager } from '../../features/customer/components/address-manager';
import { toast } from 'sonner';

export const AddressPage: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  // Auth Guard
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast.error('Please sign in to manage your delivery addresses');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  if (isAuthLoading) {
    return (
      <LoadingScreen
        message="Loading your addresses..."
        subtext="Fetching saved delivery locations"
      />
    );
  }

  return (
    <div className="min-h-[85vh] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <Link
              to="/"
              className="inline-flex items-center gap-1 hover:text-orange-500 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              to="/account"
              className="hover:text-orange-500 transition-colors"
            >
              Account
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-zinc-900 dark:text-white font-bold">
              Addresses
            </span>
          </div>

          <Link
            to="/account"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Account</span>
          </Link>
        </div>

        {/* Address Manager Container */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 shadow-sm backdrop-blur-xs">
          <AddressManager showHeader={true} />
        </div>
      </div>
    </div>
  );
};

export default AddressPage;
