import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  MapPin,
  Wallet,
  LogOut,
  ShieldCheck,
  AlertCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/use-auth';
import { LoadingScreen } from '../../components/feedback/loading-screen';
import { toast } from 'sonner';
import { AddressManager } from '../../features/customer/components/address-manager';
import { CustomerOrdersTab } from '../../features/customer/components/customer-orders-tab';
import { CustomerWalletTab } from '../../features/customer/components/customer-wallet-tab';
import { useCustomerSocket } from '../../features/customer/hooks/use-customer-socket';

export type CustomerAccountTab = 'orders' | 'addresses' | 'wallet';

export const CustomerAccountPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading, isLoggingOut, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<CustomerAccountTab>('orders');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Initialize customer realtime socket listener for order status updates
  const { isConnected } = useCustomerSocket();

  // Auth Guard
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated && !isLoggingOut) {
      toast.error('Please sign in to view your account dashboard');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, isLoggingOut, navigate]);

  const handlePerformLogout = async () => {
    try {
      setIsLogoutModalOpen(false);
      const logoutTask = logout();
      navigate('/login', { replace: true });
      await logoutTask;
      toast.success('Successfully logged out of your account.');
    } catch {
      toast.error('Logout encountered an issue. Redirecting...');
      navigate('/login', { replace: true });
    }
  };

  if (isAuthLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="hidden md:block w-72 h-80 rounded-3xl bg-zinc-200/50 dark:bg-zinc-800/50" />
          <div className="flex-1 space-y-4">
            <div className="h-12 w-64 rounded-2xl bg-zinc-200/50 dark:bg-zinc-800/50" />
            <div className="h-44 rounded-3xl bg-zinc-200/50 dark:bg-zinc-800/50" />
            <div className="h-44 rounded-3xl bg-zinc-200/50 dark:bg-zinc-800/50" />
          </div>
        </div>
      </div>
    );
  }

  if (isLoggingOut) {
    return (
      <LoadingScreen
        message="Signing out safely..."
        subtext="Clearing your customer account session"
      />
    );
  }

  const TABS = [
    {
      id: 'orders' as const,
      label: 'Orders',
      mobileLabel: 'Orders',
      subtext: 'Live & Past Orders',
      icon: ShoppingBag,
    },
    {
      id: 'addresses' as const,
      label: 'Addresses',
      mobileLabel: 'Addresses',
      subtext: 'Saved Delivery Places',
      icon: MapPin,
    },
    {
      id: 'wallet' as const,
      label: 'Wallet',
      mobileLabel: 'Wallet',
      subtext: 'Foomato Cash & Refunds',
      icon: Wallet,
    },
  ];

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:h-[calc(100vh-4.25rem)] md:overflow-hidden flex flex-col md:flex-row gap-6 lg:gap-8 pt-4 sm:pt-6 pb-2 sm:pb-4">
      {/* Mobile Top Header & Segmented Tabs (< md) */}
      <div className="md:hidden shrink-0 space-y-2.5">
        {/* Mobile User Quick Strip */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-orange-500 to-amber-500 text-white font-black flex items-center justify-center shrink-0 shadow-xs text-sm">
              {userInitial}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-black truncate text-zinc-900 dark:text-white">
                  {user?.name || 'Customer Account'}
                </h4>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              </div>
              <p className="text-[10px] text-zinc-400 truncate">
                {user?.email || 'Logged in user'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="p-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 transition-all shrink-0 cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Column Balanced Segmented Switcher */}
        <div className="p-1 rounded-2xl bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 grid grid-cols-3 gap-1 shadow-inner">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            const isOrders = tab.id === 'orders';

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none relative ${
                  isSelected
                    ? 'bg-linear-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon className="w-4 h-4 shrink-0" />
                  {isOrders && isConnected && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>
                <span className="truncate">{tab.mobileLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* LEFT COLUMN: Fixed width, permanently anchored on Desktop */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 space-y-4 select-none">
        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-3 shadow-xs space-y-1.5">
          {/* User Profile Mini Identity Header */}
          <div className="p-3 mb-2 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-500 to-amber-500 text-white font-black flex items-center justify-center shrink-0 shadow-xs text-base">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-black truncate text-zinc-900 dark:text-white">
                  {user?.name || 'Customer'}
                </h4>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              </div>
              <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                {user?.email || 'Verified Account'}
              </p>
            </div>
          </div>

          {/* Vertical Navigation Tabs */}
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            const isOrders = tab.id === 'orders';

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full p-3 rounded-2xl text-left transition-all flex items-center gap-3 cursor-pointer group ${
                  isSelected
                    ? 'bg-linear-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 font-medium'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors relative ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-orange-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {isOrders && isConnected && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse ring-2 ring-white dark:ring-zinc-900" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs leading-none font-bold truncate">
                    {tab.label}
                  </div>
                  <div
                    className={`text-[10px] mt-1 truncate ${
                      isSelected
                        ? 'text-white/80'
                        : 'text-zinc-400 group-hover:text-zinc-500'
                    }`}
                  >
                    {tab.subtext}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Account Security & Sign Out Widget */}
        <div className="p-3.5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xs space-y-3 mt-auto">
          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
              }`}
            />
            <span>{isConnected ? 'Live Updates' : 'Syncing...'}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full py-2.5 px-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 active:scale-98 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* RIGHT COLUMN: Independently scrollable view container */}
      <main className="flex-1 min-w-0 md:overflow-y-auto custom-scrollbar pr-1 pb-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {activeTab === 'orders' && (
            <CustomerOrdersTab socketConnected={isConnected} />
          )}

          {activeTab === 'addresses' && (
            <div className="rounded-3xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-xl p-5 sm:p-6 shadow-xs">
              <AddressManager showHeader={true} />
            </div>
          )}

          {activeTab === 'wallet' && <CustomerWalletTab />}
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Confirm Sign Out
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Are you sure you want to end your customer session? You can sign back in at any time.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 font-bold text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePerformLogout}
                className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-rose-600 to-red-600 text-white font-bold text-xs shadow-md shadow-rose-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerAccountPage;
